import stripe
from fastapi import HTTPException, status
from typing import Dict, Any
from ...config import STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
from ..schemas.order_schemas import OrderPaymentRequestSchema
from decouple import config

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
    
    async def handle_webhook(self, payload: bytes, sig_header: str) -> Dict[str, Any]:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
            )
            
            if event['type'] == 'checkout.session.completed':
                session = event['data']['object']
                await self.handle_successful_payment(session)
                
            return {'status': 'success', 'event': event['type']}
            
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid payload: {str(e)}"
            )
        except stripe.error.SignatureVerificationError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid signature: {str(e)}"
            )
    
    async def handle_successful_payment(self, session: Dict[str, Any]):
        order_id = int(session['metadata']['order_id'])
        # Actualizar el estado de la orden en tu base de datos
        # order_service.update_order_status(order_id, 'paid')