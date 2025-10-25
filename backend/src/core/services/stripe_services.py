import stripe
from fastapi import HTTPException, status
from typing import Dict, Any
from ...config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
from ..schemas.order_schemas import OrderPaymentRequestSchema
from decouple import config
from .order_services import OrderService
from sqlalchemy.ext.asyncio import AsyncSession
from ..schemas.order_schemas import OrderUpdateStatus
from ..enums import OrderStatus

stripe.api_key = STRIPE_SECRET_KEY

class StripeService:
    
    async def create_checkout_session(
        self, 
       order_data: OrderPaymentRequestSchema
    ) -> Dict[str, Any]:
        try:
            line_items = []
            for item in order_data.items:
                line_items.append({
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': item.product.name,
                            'description': item.product.description,
                            'images': [item.product.image_url] if item.product.image_url else [],
                        },
                        'unit_amount': int(item.product.price * 100),  # Stripe usa centavos
                    },
                    'quantity': item.quantity,
                })
            
            session = stripe.checkout.Session.create(
                customer_email=order_data.customer_email,
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=order_data.success_url,
                cancel_url=order_data.cancel_url,
                metadata={
                    'order_id': str(order_data.id)
                }
            )
            
            return {
                'session_id': session.id,
                'url': session.url
            }
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error creating Stripe session: {str(e)}"
            )
    
    async def handle_webhook(self, payload: bytes, sig_header: str,order_service: OrderService, session:AsyncSession) -> Dict[str, Any]:
        try:
            print("🎯 Webhook recibido")
            
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
            print(f"📧 Event type: {event['type'] if 'event' in locals() else 'Unknown'}")
            if event['type'] == 'checkout.session.completed':
                event_session = event['data']['object']
                await self.handle_successful_payment(event_session,order_service, session)
                
            return {'status': 'success', 'event': event['type']}
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid payload: {str(e)}"
            )
    
    async def handle_successful_payment(self, event_session: Dict[str, Any],order_service: OrderService,session:AsyncSession):
        order_id = int(event_session['metadata']['order_id'])
        await order_service.update_order_status(
            order_id, 
            OrderUpdateStatus(status=OrderStatus.PAID),
            session
        )