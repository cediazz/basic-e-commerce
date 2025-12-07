from fastapi import APIRouter, Depends, Request, HTTPException
from ..services.stripe_services import StripeService
from ..services.order_services import OrderService
from ..schemas.order_schemas import OrderPaymentRequestSchema
from sqlalchemy.ext.asyncio import AsyncSession
from ...config import get_async_session

stripe_router = APIRouter(prefix="/stripe", tags=["stripe"])

@stripe_router.post("/create-checkout-session")
async def create_checkout_session(
    order_data: OrderPaymentRequestSchema,
    stripe_service: StripeService = Depends(StripeService)
):
    return await stripe_service.create_checkout_session(order_data)

webhook_router = APIRouter(prefix="/stripe/webhook", tags=["stripe"])

@webhook_router.post("/")
async def webhook_received(
    request: Request,
    stripe_service: StripeService = Depends(StripeService),
    order_service: OrderService = Depends(OrderService),
    session: AsyncSession = Depends(get_async_session)
):
    print("🎯 webhook recibido en la ruta")
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    return await stripe_service.handle_webhook(payload, sig_header,order_service, session)