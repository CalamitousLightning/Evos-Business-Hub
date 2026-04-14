from fastapi import FastAPI, Request, HTTPException, Query
import requests
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import BaseModel
import hmac
import hashlib
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()  # ✅ MUST COME FIRST

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://evosdata.netlify.app",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
class RegisterRequest(BaseModel):
    username: str
    full_name: str
    email: str
    phone: str
    password: str
    referred_by: str | None = None


class LoginRequest(BaseModel):
    username: str
    password: str

# =========================
# HELPERS
# =========================
NETWORK_MAP = {
    "MTN": "YELLO",
    "TELECEL": "TELECEL",
    "AIRTELTIGO": "AT_PREMIUM"
}


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
@app.post("/auth/register")
def register(data: RegisterRequest):

    # check username exists
    existing = supabase.table("users") \
        .select("*") \
        .eq("username", data.username) \
        .execute()

    if existing.data:
        return {"status": "username_taken"}

    # insert user
    supabase.table("users").insert({
        "username": data.username,
        "full_name": data.full_name,
        "email": data.email,
        "phone": data.phone,
        "password": data.password,
        "referred_by": data.referred_by,
        "order_count": 0,
        "rank": 1
    }).execute()

    return {"status": "created"}

@app.post("/auth/login")
def login(data: LoginRequest):

    username = data.username.strip()

    user_res = supabase.table("users") \
        .select("*") \
        .ilike("username", username) \
        .execute()

    if not user_res.data:
        return {
            "status": "user_not_found",
            "debug": username
        }

    user = user_res.data[0]

    if str(data.password).strip() != str(user["password"]).strip():
        return {
            "status": "wrong_password"
        }

    return {
        "status": "ok",
        "user": user
    }