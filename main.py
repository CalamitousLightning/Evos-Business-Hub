from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import os
import re
import requests
import hmac
import hashlib
from datetime import datetime, timedelta

from dotenv import load_dotenv
from supabase import create_client, Client

from pydantic import BaseModel, Field, EmailStr
from typing import Optional

from jose import jwt
from passlib.context import CryptContext

from datetime import datetime, timedelta
import uuid


load_dotenv()

app = FastAPI()

# =========================
# PRODUCTION CORS (CLEAN)
# =========================

ALLOWED_ORIGINS = [
    "https://evosdata.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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
# SAFETY CHECK (PRODUCTION SAFE)
# =========================
required_envs = {
    "SUPABASE_URL": SUPABASE_URL,
    "SUPABASE_KEY": SUPABASE_KEY,
    "PAYSTACK_SECRET_KEY": PAYSTACK_SECRET,
    "DATAMART_API_KEY": DATAMART_API_KEY,
}

missing = [k for k, v in required_envs.items() if not v]
if missing:
    raise Exception(f"Missing environment variables: {', '.join(missing)}")

# =========================
# SUPABASE INIT
# =========================
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# =========================
# GLOBAL TIMEOUT CONFIG
# =========================
REQUEST_TIMEOUT = 10



# =========================
# MODELS
# =========================

class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=20)
    full_name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    phone: str = Field(min_length=10, max_length=15)
    password: str = Field(min_length=6)
    referred_by: Optional[str] = None


class LoginRequest(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=6)

from pydantic import BaseModel, EmailStr
from typing import Optional

class CreateOrderRequest(BaseModel):
    user_id: Optional[int] = None
    network: str
    bundle: str
    phone: str
    email: Optional[EmailStr] = None
    
# =========================
# HELPERS
# =========================

NETWORK_MAP = {
    "MTN": "YELLO",
    "TELECEL": "TELECEL",
    "AIRTELTIGO": "AT_PREMIUM"
}

# =========================
# PASSWORD SECURITY
# =========================
pwd_context = CryptContext(
    schemes=["bcrypt"],
    bcrypt__rounds=12,
    deprecated="auto"
)


def hash_password(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception as e:
        print("HASH ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Password hashing failed"
        )


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except Exception as e:
        print("VERIFY ERROR:", str(e))
        return False


# =========================
# UTILITIES
# =========================
def extract_capacity(bundle: str) -> str:
    if not bundle:
        return ""

    return (
        bundle.upper()
        .replace("GB", "")
        .replace("MB", "")
        .strip()
    )

# =========================
# PAYSTACK SIGNATURE
# Uses SHA512
# =========================
def verify_paystack_signature(
    body: bytes,
    signature: str,
    secret: str
) -> bool:
    try:
        if not signature:
            print("PAYSTACK SIGNATURE ERROR: missing signature")
            return False

        computed = hmac.new(
            secret.encode("utf-8"),
            body,
            hashlib.sha512
        ).hexdigest()

        return hmac.compare_digest(computed, signature)

    except Exception as e:
        print("PAYSTACK SIGNATURE ERROR:", str(e))
        return False


# =========================
# DATAMART SIGNATURE
# Uses SHA256 + WEBHOOK SECRET
# =========================
def verify_datamart_signature(
    body: bytes,
    signature: str,
    secret: str
) -> bool:
    try:
        if not signature:
            print("DATAMART SIGNATURE ERROR: missing signature")
            return False

        computed = hmac.new(
            secret.encode("utf-8"),
            body,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(computed, signature)

    except Exception as e:
        print("DATAMART SIGNATURE ERROR:", str(e))
        return False


# =========================
# LEGACY WRAPPER (OPTIONAL)
# Defaults to Paystack
# =========================
def verify_signature(
    body: bytes,
    signature: str,
    secret: str
) -> bool:
    return verify_paystack_signature(
        body,
        signature,
        secret
    )

# =========================
# PRICES
# =========================
@app.get("/prices")
def get_prices():
    try:
        data = supabase.table("prices").select("*").execute().data
        return {"status": "success", "data": data or []}
    except Exception as e:
        print("PRICES ERROR:", str(e))
        raise HTTPException(status_code=500, detail="Failed to load prices")



# =========================
# ORDERS
# =========================

@app.get("/orders/me")
def get_user_orders(user_id: int = Query(...)):
    try:
        orders = supabase.table("orders") \
            .select("*") \
            .eq("user_id", user_id) \
            .execute()

        return {
            "status": "success",
            "orders": orders.data or []
        }

    except Exception as e:
        print("GET ORDERS ERROR:", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch orders")


# =========================
# CREATE ORDER (PRODUCTION SAFE)
# =========================
# =========================
# CREATE ORDER (GUEST + USER SAFE)
# =========================
@app.post("/orders/create")
def create_order(data: CreateOrderRequest):

    try:
        import uuid
        from datetime import datetime, timedelta

        # =========================
        # USE USER ID OR EMAIL FOR DUPLICATE CHECK
        # =========================
        buyer_key = data.user_id if data.user_id else data.email

        if buyer_key:
            query = supabase.table("orders") \
                .select("id, created_at")

            if data.user_id:
                query = query.eq("user_id", data.user_id)
            else:
                query = query.eq("guest_email", data.email)

            existing = query \
                .eq("network", data.network) \
                .eq("bundle", data.bundle) \
                .eq("status", "pending_payment") \
                .order("created_at", desc=True) \
                .limit(1) \
                .execute()

            if existing.data:
                order = existing.data[0]

                created_at = datetime.fromisoformat(
                    order["created_at"].replace("Z", "")
                )

                if datetime.utcnow() - created_at < timedelta(minutes=10):
                    raise HTTPException(
                        400,
                        "Pending order already exists"
                    )

        # =========================
        # GET PRICE
        # =========================
        price_res = supabase.table("prices") \
            .select("price") \
            .eq("network", data.network) \
            .eq("bundle", data.bundle) \
            .limit(1) \
            .execute()

        if not price_res.data:
            raise HTTPException(400, "Invalid bundle")

        price = float(price_res.data[0]["price"])

        # =========================
        # GET EMAIL
        # =========================
        customer_email = None

        # Logged in user
        if data.user_id:
            user_res = supabase.table("users") \
                .select("email") \
                .eq("id", data.user_id) \
                .limit(1) \
                .execute()

            if not user_res.data:
                raise HTTPException(404, "User not found")

            customer_email = user_res.data[0]["email"]

        # Guest user
        else:
            customer_email = data.email

        if not customer_email:
            customer_email = "guest@evoshub.com"

        # =========================
        # PAYSTACK INIT
        # =========================
        try:
            paystack = requests.post(
                "https://api.paystack.co/transaction/initialize",
                headers={
                    "Authorization": f"Bearer {PAYSTACK_SECRET}",
                    "Content-Type": "application/json"
                },
                json={
                    "email": customer_email,
                    "amount": int(price * 100),
                    "callback_url": "https://evosdata.netlify.app/success"
                },
                timeout=REQUEST_TIMEOUT
            ).json()

        except requests.exceptions.RequestException:
            raise HTTPException(
                500,
                "Payment service error"
            )

        if not paystack.get("status"):
            raise HTTPException(
                400,
                "Payment init failed"
            )

        ref = paystack["data"]["reference"]

        # =========================
        # GENERATE ORDER REF
        # =========================
        evos_ref = f"EVOS-{uuid.uuid4().hex[:8].upper()}"

        # =========================
        # SAVE ORDER
        # =========================
        payload = {
            "user_id": data.user_id,
            "guest_email": None if data.user_id else customer_email,
            "network": data.network,
            "bundle": data.bundle,
            "price": price,
            "phone_number": data.phone,
            "paystack_ref": ref,
            "evosdata_ref": evos_ref,
            "status": "pending_payment"
        }

        supabase.table("orders").insert(payload).execute()

        # =========================
        # RESPONSE
        # =========================
        return {
            "status": True,
            "payment_url": paystack["data"]["authorization_url"],
            "reference": ref
        }

    except HTTPException:
        raise

    except Exception as e:
        print("CREATE ORDER ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail="Server error"
        )
# =========================
# PAYSTACK HELPERS
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
    try:
        user = supabase.table("users") \
            .select("order_count") \
            .eq("id", user_id) \
            .limit(1) \
            .execute()

        if not user.data:
            return

        current = user.data[0].get("order_count") or 0
        new_count = current + 1

        supabase.table("users") \
            .update({
                "order_count": new_count,
                "rank": calculate_rank(new_count)
            }) \
            .eq("id", user_id) \
            .execute()

    except Exception as e:
        print("INCREMENT USER ERROR:", str(e))


# =========================
# PAYSTACK WEBHOOK
# =========================
@app.post("/webhook/paystack")
async def paystack_webhook(request: Request):

    try:
        body = await request.body()
        signature = request.headers.get("x-paystack-signature")

        if not signature or not verify_signature(body, signature, PAYSTACK_SECRET):
            return {"status": "invalid signature"}

        payload = await request.json()

        if payload.get("event") != "charge.success":
            return {"status": "ignored"}

        reference = payload["data"]["reference"]

        # =========================
        # GET ORDER
        # =========================
        order_res = supabase.table("orders") \
            .select("*") \
            .eq("paystack_ref", reference) \
            .limit(1) \
            .execute()

        if not order_res.data:
            return {"status": "not found"}

        order = order_res.data[0]

        if order["status"] != "pending_payment":
            return {"status": "already processed"}

        # =========================
        # MARK PAID
        # =========================
        supabase.table("orders") \
            .update({"status": "paid"}) \
            .eq("paystack_ref", reference) \
            .execute()

        # =========================
        # UPDATE USER STATS (SAFE)
        # =========================
        if order.get("user_id"):
            increment_user_orders(order["user_id"])

        # =========================
        # CALL DATAMART (SAFE + TIMEOUT)
        # =========================
        try:
            dm_response = requests.post(
                f"{DATAMART_BASE}/purchase",
                headers={"X-API-Key": DATAMART_API_KEY},
                json={
                    "phoneNumber": order["phone_number"],
                    "network": NETWORK_MAP.get(order["network"]),
                    "capacity": extract_capacity(order["bundle"]),
                    "gateway": "wallet"
                },
                timeout=REQUEST_TIMEOUT
            )

            dm = dm_response.json()

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
            print("DATAMART ERROR:", str(e))

            supabase.table("orders") \
                .update({"status": "failed"}) \
                .eq("paystack_ref", reference) \
                .execute()

            return {"status": "datamart failed"}

    except Exception as e:
        print("PAYSTACK WEBHOOK ERROR:", str(e))
        return {"status": "error"}


# =========================
# DATAMART WEBHOOK
# =========================
@app.post("/webhook/datamart")
async def datamart_webhook(request: Request):

    try:
        body = await request.body()
        signature = request.headers.get("X-DataMart-Signature")
        event = request.headers.get("X-DataMart-Event", "")

        # IMPORTANT:
        # Use your DATAMART_WEBHOOK_SECRET here
        if not signature or not verify_datamart_signature(
            body,
            signature,
            DATAMART_WEBHOOK_SECRET
        ):
            raise HTTPException(401, "Invalid signature")

        payload = await request.json()

        data = payload.get("data", {})
        order_ref = data.get("orderReference") or data.get("reference")
        status = str(data.get("status", "")).lower()

        print("DATAMART EVENT:", event)
        print("DATAMART REF:", order_ref)
        print("DATAMART STATUS:", status)

        if not order_ref:
            return {"received": True}

        final_status = (
            "successful"
            if status in ["completed", "success", "delivered"]
            else "processing"
            if status in ["created", "processing", "pending"]
            else "failed"
            if status in ["failed", "cancelled", "refunded"]
            else "processing"
        )

        supabase.table("orders") \
            .update({"status": final_status}) \
            .eq("datamart_ref", order_ref) \
            .execute()

        return {"received": True}

    except HTTPException as e:
        print("DATAMART WEBHOOK AUTH ERROR:", str(e.detail))
        raise e

    except Exception as e:
        print("DATAMART WEBHOOK ERROR:", str(e))
        return {"received": False}


# =========================
# SYNC ORDER
# =========================
@app.post("/orders/sync/{reference}")
def sync_order(reference: str):

    try:
        order_res = supabase.table("orders") \
            .select("*") \
            .eq("paystack_ref", reference) \
            .limit(1) \
            .execute()

        if not order_res.data:
            raise HTTPException(404, "Order not found")

        order = order_res.data[0]

        if not order.get("datamart_ref"):
            return {"status": "not processed yet"}

        dm = requests.get(
            f"{DATAMART_BASE}/order-status/{order['datamart_ref']}",
            headers={"X-API-Key": DATAMART_API_KEY},
            timeout=REQUEST_TIMEOUT
        )

        dm.raise_for_status()

        payload = dm.json()

        status = str(
            payload.get("data", {}).get("orderStatus", "")
        ).lower()

        final_status = (
            "successful"
            if status in ["completed", "success", "delivered"]
            else "failed"
            if status in ["failed", "cancelled", "refunded"]
            else "processing"
        )

        supabase.table("orders") \
            .update({"status": final_status}) \
            .eq("paystack_ref", reference) \
            .execute()

        return {"status": final_status}

    except HTTPException as e:
        raise e

    except Exception as e:
        print("SYNC ERROR:", str(e))
        raise HTTPException(500, "Sync failed")


# =========================
# USER PROFILE
# =========================
@app.get("/users/me")
def get_user(user_id: int):

    try:
        user = supabase.table("users") \
            .select("*") \
            .eq("id", user_id) \
            .limit(1) \
            .execute()

        if not user.data:
            raise HTTPException(404, "User not found")

        return {
            "status": "success",
            "user": user.data[0]
        }

    except Exception as e:
        print("GET USER ERROR:", str(e))
        raise HTTPException(500, "Failed to fetch user")


# =========================
# AUTH (PRODUCTION SAFE)
# =========================


# =========================
# REGISTER ROUTE
# =========================
@app.post("/auth/register")
def register(data: RegisterRequest):

    try:
        import re

        # =========================
        # NORMALIZE INPUT
        # =========================
        username = (data.username or "").strip().lower()
        email = (data.email or "").strip().lower()
        phone = re.sub(r"\D", "", data.phone or "")

        if len(phone) < 10:
            raise HTTPException(status_code=400, detail="Invalid phone number")

        # =========================
        # CHECK USER EXISTS (FAST)
        # =========================
        existing_user = supabase.table("users") \
            .select("id") \
            .eq("username", username) \
            .limit(1) \
            .execute()

        if existing_user.data:
            return {"status": "username_taken"}

        existing_email = supabase.table("users") \
            .select("id") \
            .eq("email", email) \
            .limit(1) \
            .execute()

        if existing_email.data:
            return {"status": "email_taken"}

        # =========================
        # HASH PASSWORD (SAFE)
        # =========================
        try:
            hashed_password = pwd_context.hash(str(data.password))
        except Exception as e:
            print("HASH ERROR:", repr(e))
            raise HTTPException(status_code=500, detail="Password hashing failed")

        # =========================
        # REFERRAL CODE
        # =========================
        referral_code = f"{username}_{phone[-4:]}" if len(phone) >= 4 else username

        # =========================
        # INSERT USER
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
        username = (data.username or "").strip().lower()

        if not username:
            raise HTTPException(status_code=400, detail="Username required")

        # =========================
        # FIND USER (OPTIMIZED)
        # =========================
        user_res = supabase.table("users") \
            .select("id,username,email,full_name,password,referral_code,rank") \
            .or_(f"username.eq.{username},email.eq.{username}") \
            .limit(1) \
            .execute()

        if not user_res.data:
            return {"status": "invalid_credentials"}

        user = user_res.data[0]

        # =========================
        # PASSWORD CHECK (SAFE)
        # =========================
        stored_password = user.get("password")

        if not stored_password:
            return {"status": "invalid_credentials"}

        try:
            if not pwd_context.verify(data.password, stored_password):
                return {"status": "invalid_credentials"}

        except Exception as e:
            print("PASSWORD VERIFY ERROR:", str(e))
            return {"status": "invalid_credentials"}

        # =========================
        # SUCCESS
        # =========================
        return {
            "status": "ok",
            "user": {
                "id": user.get("id"),   # ✅ ADDED ID
                "username": user.get("username"),
                "email": user.get("email"),
                "full_name": user.get("full_name"),
                "referral_code": user.get("referral_code"),
                "rank": user.get("rank", 1)
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        print("LOGIN ERROR:", str(e))
        raise HTTPException(status_code=500, detail="Server error")
from fastapi import HTTPException



@app.get("/today/{user_id}")
def today_dashboard(user_id: int):

    try:
        # GLOBAL TOTAL ORDERS
        global_orders = supabase.table("orders") \
            .select("id", count="exact") \
            .execute()

        total_orders = global_orders.count or 0

        # USER ORDERS
        user_orders = supabase.table("orders") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

        my_orders = user_orders.data or []

        # SUCCESSFUL USER ORDERS
        success_status = [
            "processing",
            "successful",
            "delivered",
            "initiated"
        ]

        my_successful_orders = [
            order for order in my_orders
            if order["status"] in success_status
        ]

        # TRANSACTIONS
        transactions = [
            {
                "network": row["network"],
                "amount": f'{row["bundle"]} - GHS {row["price"]}',
                "phone_number": row["phone_number"],
                "evosdata_ref": row["evosdata_ref"],
                "paystack_ref": row["paystack_ref"],
                "datamart_ref": row["datamart_ref"],
                "status": row["status"],
                "created_at": row["created_at"]
            }
            for row in my_orders
        ]

        return {
            "global": {
                "total_orders": total_orders
            },
            "user": {
                "my_orders": len(my_orders),
                "my_successful_orders": len(my_successful_orders),
                "transactions": transactions
            }
        }

    except Exception as e:
        print("TODAY ERROR:", str(e))
        raise HTTPException(500, "Server error")




from fastapi import FastAPI, Request

# =========================
# EVOS USSD ENGINE
# =========================
@app.post("/ussd")
async def ussd(request: Request):
    data = await request.json()

    phone = data.get("phoneNumber")
    text = data.get("text", "")
    service_code = data.get("serviceCode", "*1590#")

    # split user input path
    user_input = text.split("*") if text else []

    # =========================
    # MAIN MENU
    # =========================
    if text == "":
        response = (
            "CON Welcome to EVOS Business Hub\n"
            "1. Buy Data\n"
            "2. My Orders\n"
            "3. Support\n"
        )
        return response

    # =========================
    # OPTION 1: BUY DATA
    # =========================
    if user_input[0] == "1":

        # STEP 1: network selection
        if len(user_input) == 1:
            return (
                "CON Select Network\n"
                "1. MTN\n"
                "2. Telecel\n"
                "3. AirtelTigo"
            )

        # STEP 2: map network
        network_map = {
            "1": "MTN",
            "2": "TELECEL",
            "3": "AIRTELTIGO"
        }

        network = network_map.get(user_input[1])

        if not network:
            return "END Invalid network selected"

        # STEP 3: bundle selection
        if len(user_input) == 2:
            return (
                f"CON {network} Bundles\n"
                "1. 1GB - GH₵5\n"
                "2. 2GB - GH₵10\n"
                "3. 5GB - GH₵20"
            )

        # STEP 4: map bundle
        bundle_map = {
            "1": ("1GB", 5),
            "2": ("2GB", 10),
            "3": ("5GB", 20)
        }

        bundle_data = bundle_map.get(user_input[2])

        if not bundle_data:
            return "END Invalid bundle selected"

        bundle, price = bundle_data

        # =========================
        # CREATE ORDER VIA YOUR EXISTING SYSTEM
        # =========================
        import requests

        try:
            res = requests.post(
                "https://evos-business-hub.onrender.com/orders/create",
                json={
                    "user_id": None,  # guest USSD user
                    "network": network,
                    "bundle": bundle,
                    "phone": phone
                },
                timeout=10
            )

            result = res.json()

            if res.status_code != 200:
                return "END Order failed. Try again."

            return (
                f"END Order Created Successfully\n"
                f"Network: {network}\n"
                f"Bundle: {bundle}\n"
                f"Pay via link sent to SMS or app"
            )

        except Exception as e:
            print("USSD ERROR:", str(e))
            return "END Service temporarily unavailable"

    # =========================
    # OPTION 2: MY ORDERS
    # =========================
    if user_input[0] == "2":
        return (
            "END Check your orders on EVOS App or Website:\n"
            "https://evosdata.netlify.app"
        )

    # =========================
    # OPTION 3: SUPPORT
    # =========================
    if user_input[0] == "3":
        return (
            "END EVOS Support:\n"
            "WhatsApp: +233208718943"
        )

    return "END Invalid request"




from fastapi import FastAPI, Request



# =========================
# EVOS DATA WHATSAPP BOT
# =========================
@app.post("/whatsapp/webhook")
async def whatsapp_webhook(request: Request):

    data = await request.json()

    message = data.get("message", "").lower()
    phone = data.get("from")

    # =========================
    # MAIN MENU
    # =========================
    if message in ["hi", "hello", "start"]:
        return {
            "reply": (
                "👋 Welcome to EVOS Data\n\n"
                "1. Buy Data\n"
                "2. Track Order\n"
                "3. Support"
            )
        }

    # =========================
    # BUY DATA FLOW
    # =========================
    if message == "1":
        return {
            "reply": (
                "📡 Select Network:\n"
                "1. MTN\n"
                "2. Telecel\n"
                "3. AirtelTigo"
            )
        }

    # Example simple shortcut (you will expand later)
    if "mtn" in message:
        return {
            "reply": "📦 Send bundle (e.g. 1GB, 2GB, 5GB)"
        }

    # =========================
    # SUPPORT
    # =========================
    if message == "3":
        return {
            "reply": "💬 Support: https://wa.me/233208718943"
        }

    return {
        "reply": "❌ Invalid option. Send 'hi' to start."
    }
