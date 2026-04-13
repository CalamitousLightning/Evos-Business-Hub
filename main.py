from fastapi import FastAPI, Request, HTTPException, Query
import requests
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import BaseModel
import hmac
import hashlib

load_dotenv()

app = FastAPI()

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
class CreateOrderRequest(BaseModel):
    network: str
    bundle: str
    phone: str
    email: str


class AuthRequest(BaseModel):
    email: str


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
def get_user_orders(email: str = Query(...)):

    orders = supabase.table("orders") \
        .select("*") \
        .eq("email", email) \
        .execute()

    return {
        "status": "success",
        "orders": orders.data or []
    }


@app.post("/orders/create")
def create_order(data: CreateOrderRequest):

    # prevent duplicate pending
    existing = supabase.table("orders") \
        .select("*") \
        .eq("email", data.email) \
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

    # paystack init
    paystack = requests.post(
        "https://api.paystack.co/transaction/initialize",
        headers={
            "Authorization": f"Bearer {PAYSTACK_SECRET}",
            "Content-Type": "application/json"
        },
        json={
            "email": data.email,
            "amount": int(price * 100),
            "callback_url": "http://localhost:5173/orders"
        }
    ).json()

    if not paystack.get("status"):
        raise HTTPException(400, "Payment init failed")

    ref = paystack["data"]["reference"]

    # save order
    supabase.table("orders").insert({
        "network": data.network,
        "bundle": data.bundle,
        "price": price,
        "phone_number": data.phone,
        "email": data.email,
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
def register(data: AuthRequest):

    user = supabase.table("users") \
        .select("*") \
        .eq("email", data.email) \
        .execute()

    if user.data:
        return {"status": "exists"}

    supabase.table("users").insert({
        "email": data.email
    }).execute()

    return {"status": "created"}


@app.post("/auth/login")
def login(data: AuthRequest):

    user = supabase.table("users") \
        .select("*") \
        .eq("email", data.email) \
        .execute()

    if not user.data:
        return {"status": "not found"}

    return {"status": "ok", "email": data.email}