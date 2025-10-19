from fastapi import APIRouter, Depends, Request, HTTPException
from ..services.stripe_services import StripeService
from ..schemas.order_schemas import OrderPaymentRequestSchema

stripe_router = APIRouter(prefix="/stripe", tags=["stripe"])

@stripe_router.post("/create-checkout-session")
async def create_checkout_session(
    order_data: OrderPaymentRequestSchema,
    stripe_service: StripeService = Depends(StripeService)
):
    return await stripe_service.create_checkout_session(order_data)

"""@stripe_router.post("/webhook")
async def webhook_received(
    request: Request,
    stripe_service: StripeService = Depends(StripeService)
):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    return await stripe_service.handle_webhook(payload, sig_header)"""