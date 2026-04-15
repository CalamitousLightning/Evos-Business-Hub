from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import os
import requests
import hmac
import hashlib
from datetime import datetime, timedelta

from dotenv import load_dotenv
from supabase import create_client, Client

from pydantic import BaseModel, Field

from jose import jwt
from passlib.hash import bcrypt
from passlib.context import CryptContext

load_dotenv()

app = FastAPI()

# =========================
# PRODUCTION CORS (SECURE)
# =========================
ALLOWED_ORIGINS = [
    "https://evosdata.netlify.app"
]

# Optional: allow localhost ONLY if explicitly needed (remove in final lock)
if os.getenv("ENVIRONMENT") != "production":
    ALLOWED_ORIGINS.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept"
    ],
)

# =========================
# ENV
# =========================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

PAYSTACK_SECRET = os.getenv("PAYSTACK_SECRET_KEY")

DATAMART_API_KEY = os.getenv("DATAMART_API_KEY")
DATAMART_BASE = "https://api.datamartgh.shop/api/developer"

# =========================
# SUPABASE
# =========================
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# =========================
# MODELS
# =========================


# =========================
# REQUEST MODEL
# =========================
class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    full_name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    phone: str = Field(min_length=10, max_length=15)
    password: str = Field(min_length=6)
    referred_by: str | None = None




# =========================
# REQUEST MODEL
# =========================
class LoginRequest(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=6)


# =========================
# HELPERS
# =========================
NETWORK_MAP = {
    "MTN": "YELLO",
    "TELECEL": "TELECEL",
    "AIRTELTIGO": "AT_PREMIUM"
}


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def extract_capacity(bundle: str):
    return bundle.replace("GB", "").strip()


def verify_signature(body: bytes, signature: str, secret: str):
    computed = hmac.new(
        secret.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(computed, signature)


# =========================
# PRICES
# =========================
@app.get("/prices")
def get_prices():
    return supabase.table("prices").select("*").execute().data


# =========================
# ORDERS
# =========================
@app.get("/orders/me")
def get_user_orders(user_id: int = Query(...)):

    orders = supabase.table("orders") \
        .select("*") \
        .eq("user_id", user_id) \
        .execute()

    return {
        "status": "success",
        "orders": orders.data or []
    }


@app.post("/orders/create")
def create_order(data: CreateOrderRequest):

    # prevent duplicate pending orders
    existing = supabase.table("orders") \
        .select("*") \
        .eq("user_id", data.user_id) \
        .eq("network", data.network) \
        .eq("bundle", data.bundle) \
        .eq("status", "pending_payment") \
        .execute()

    if existing.data:
        raise HTTPException(400, "Pending order already exists")

    # get price
    price_res = supabase.table("prices") \
        .select("*") \
        .eq("network", data.network) \
        .eq("bundle", data.bundle) \
        .execute()

    if not price_res.data:
        raise HTTPException(400, "Invalid bundle")

    price = price_res.data[0]["price"]

    # get user email (needed for Paystack)
    user_res = supabase.table("users") \
        .select("*") \
        .eq("id", data.user_id) \
        .execute()

    if not user_res.data:
        raise HTTPException(404, "User not found")

    user = user_res.data[0]

    # paystack init
    paystack = requests.post(
        "https://api.paystack.co/transaction/initialize",
        headers={
            "Authorization": f"Bearer {PAYSTACK_SECRET}",
            "Content-Type": "application/json"
        },
        json={
            "email": user["email"],
            "amount": int(price * 100),
            "callback_url": "http://localhost:5173/orders"
        }
    ).json()

    if not paystack.get("status"):
        raise HTTPException(400, "Payment init failed")

    ref = paystack["data"]["reference"]

    # save order (NOW PROPERLY LINKED TO USER)
    supabase.table("orders").insert({
        "user_id": data.user_id,
        "network": data.network,
        "bundle": data.bundle,
        "price": price,
        "phone_number": data.phone,
        "paystack_ref": ref,
        "status": "pending_payment"
    }).execute()

    return {
        "payment_url": paystack["data"]["authorization_url"],
        "reference": ref
    }

# =========================
# PAYSTACK WEBHOOK
# =========================
def calculate_rank(order_count: int):
    if order_count >= 50:
        return 5
    elif order_count >= 20:
        return 4
    elif order_count >= 10:
        return 3
    elif order_count >= 5:
        return 2
    return 1

def increment_user_orders(user_id: int):
    user = supabase.table("users") \
        .select("order_count") \
        .eq("id", user_id) \
        .execute()

    if not user.data:
        return

    current = user.data[0]["order_count"] or 0
    new_count = current + 1

    supabase.table("users") \
        .update({
            "order_count": new_count,
            "rank": calculate_rank(new_count)
        }) \
        .eq("id", user_id) \
        .execute()

# PAYSTACK WEBHOOK
# =========================
@app.post("/webhook/paystack")
async def paystack_webhook(request: Request):

    body = await request.body()
    signature = request.headers.get("x-paystack-signature")

    if not verify_signature(body, signature, PAYSTACK_SECRET):
        return {"status": "invalid signature"}

    payload = await request.json()

    if payload.get("event") != "charge.success":
        return {"status": "ignored"}

    reference = payload["data"]["reference"]

    order_res = supabase.table("orders") \
        .select("*") \
        .eq("paystack_ref", reference) \
        .execute()

    if not order_res.data:
        return {"status": "not found"}

    order = order_res.data[0]

    if order["status"] != "pending_payment":
        return {"status": "already processed"}

    # mark paid
    supabase.table("orders") \
        .update({"status": "paid"}) \
        .eq("paystack_ref", reference) \
        .execute()

    # =========================
    # 🔥 NEW: update user stats
    # =========================
    try:
        if order.get("user_id"):
            increment_user_orders(order["user_id"])
    except Exception:
        pass

    # call datamart
    try:
        dm = requests.post(
            f"{DATAMART_BASE}/purchase",
            headers={"X-API-Key": DATAMART_API_KEY},
            json={
                "phoneNumber": order["phone_number"],
                "network": NETWORK_MAP[order["network"]],
                "capacity": extract_capacity(order["bundle"]),
                "gateway": "wallet"
            },
            timeout=15
        ).json()

        dm_ref = dm.get("data", {}).get("orderReference")

        supabase.table("orders") \
            .update({
                "status": "processing",
                "datamart_ref": dm_ref
            }) \
            .eq("paystack_ref", reference) \
            .execute()

        return {"status": "success"}

    except Exception as e:

        supabase.table("orders") \
            .update({"status": "failed"}) \
            .eq("paystack_ref", reference) \
            .execute()

        return {"status": "datamart failed", "error": str(e)}


@app.get("/users/me")
def get_user(user_id: int):

    user = supabase.table("users") \
        .select("*") \
        .eq("id", user_id) \
        .execute()

    if not user.data:
        raise HTTPException(404, "User not found")

    return {
        "status": "success",
        "user": user.data[0]
    }


# =========================
# DATAMART WEBHOOK
# =========================
@app.post("/webhook/datamart")
async def datamart_webhook(request: Request):

    body = await request.body()
    signature = request.headers.get("X-DataMart-Signature")

    if not verify_signature(body, signature, DATAMART_API_KEY):
        raise HTTPException(401, "Invalid signature")

    payload = await request.json()

    data = payload["data"]
    order_ref = data["orderReference"]
    status = data["status"]

    final_status = (
        "successful" if status in ["completed", "success", "delivered"]
        else "processing" if status in ["processing", "pending"]
        else "failed"
    )

    supabase.table("orders") \
        .update({"status": final_status}) \
        .eq("datamart_ref", order_ref) \
        .execute()

    return {"received": True}


# =========================
# SYNC ORDER
# =========================
@app.post("/orders/sync/{reference}")
def sync_order(reference: str):

    order = supabase.table("orders") \
        .select("*") \
        .eq("paystack_ref", reference) \
        .execute().data

    if not order:
        raise HTTPException(404, "Not found")

    order = order[0]

    if not order.get("datamart_ref"):
        return {"status": "not processed yet"}

    dm = requests.get(
        f"{DATAMART_BASE}/order-status/{order['datamart_ref']}",
        headers={"X-API-Key": DATAMART_API_KEY}
    ).json()

    status = dm["data"]["orderStatus"]

    final = "successful" if status == "completed" else "processing"

    supabase.table("orders") \
        .update({"status": final}) \
        .eq("paystack_ref", reference) \
        .execute()

    return {"status": final}


# =========================
# AUTH (SIMPLE)
# =========================

# =========================
# REGISTER ROUTE
# =========================
@app.post("/auth/register")
def register(data: RegisterRequest):

    try:
        # =========================
        # 🔧 NORMALIZE INPUT
        # =========================
        username = data.username.strip().lower()
        email = data.email.strip().lower()
        phone = re.sub(r"\D", "", data.phone)  # remove non-digits

        if len(phone) < 10:
            raise HTTPException(status_code=400, detail="Invalid phone number")

        # =========================
        # 🔍 CHECK USERNAME
        # =========================
        existing_user = supabase.table("users") \
            .select("id") \
            .eq("username", username) \
            .limit(1) \
            .execute()

        if existing_user.data:
            return {"status": "username_taken"}

        # =========================
        # 🔍 CHECK EMAIL
        # =========================
        existing_email = supabase.table("users") \
            .select("id") \
            .eq("email", email) \
            .limit(1) \
            .execute()

        if existing_email.data:
            return {"status": "email_taken"}

        # =========================
        # 🔐 HASH PASSWORD
        # =========================
        hashed_password = hash_password(data.password)

        # =========================
        # 🎟️ REFERRAL CODE
        # =========================
        referral_code = f"{username}_{phone[-4:]}" if len(phone) >= 4 else username

        # =========================
        # 💾 INSERT USER
        # =========================
        insert = supabase.table("users").insert({
            "username": username,
            "full_name": data.full_name.strip(),
            "email": email,
            "phone": phone,
            "password": hashed_password,
            "referred_by": data.referred_by,
            "referral_code": referral_code,
            "order_count": 0,
            "rank": 1
        }).execute()

        if not insert.data:
            raise HTTPException(status_code=500, detail="User creation failed")

        return {
            "status": "created",
            "email": email,
            "username": username,
            "referral_code": referral_code
        }

    except HTTPException:
        raise

    except Exception as e:
        print("REGISTER ERROR:", str(e))
        raise HTTPException(status_code=500, detail="Server error")


# =========================
# LOGIN ROUTE
# =========================
@app.post("/auth/login")
def login(data: LoginRequest):

    try:
        # =========================
        # 🔧 NORMALIZE INPUT
        # =========================
        username = data.username.strip().lower()

        # =========================
        # 🔍 FIND USER
        # =========================
        user_res = supabase.table("users") \
            .select("*") \
            .or_(f"username.eq.{username},email.eq.{username}") \
            .limit(1) \
            .execute()
       
        if not user_res.data:
            # do NOT reveal if user exists
            return {"status": "invalid_credentials"}

        user = user_res.data[0]

        # =========================
        # 🔐 VERIFY PASSWORD
        # =========================
        stored_password = user.get("password")

        if not stored_password or not verify_password(data.password, stored_password):
            return {"status": "invalid_credentials"}

        # =========================
        # ✅ SUCCESS RESPONSE
        # =========================
        return {
            "status": "ok",
            "user": {
                "username": user["username"],
                "email": user["email"],
                "full_name": user["full_name"],
                "referral_code": user.get("referral_code"),
                "rank": user.get("rank", 1)
            }
        }

    except Exception as e:
        print("LOGIN ERROR:", str(e))
        raise HTTPException(status_code=500, detail="Server error")



