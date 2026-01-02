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
    
    """
    No funciona bien el manejo de webhooks con Stripe al desplegar en render.com
    async def handle_webhook(self, payload: bytes, sig_header: str, order_service: OrderService, session: AsyncSession) -> Dict[str, Any]:
        try:
            # 1. Verifica la firma de Stripe INMEDIATAMENTE
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
            
            if event['type'] == 'checkout.session.completed':
                event_session = event['data']['object']
                from fastapi import BackgroundTasks
                background_tasks = BackgroundTasks()
                background_tasks.add_task(self.handle_successful_payment, event_session, order_service, session)
                return {'status': 'success', 'event': event['type']}
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")
        
        return {'status': 'success', 'event': event['type']}"""
    
    async def check_payment(self, 
                            session_id:str, 
                            order_service: OrderService, 
                            session: AsyncSession
    ) -> Dict[str, Any]:
        """Verificar estado de pago directamente con Stripe"""
        try:
            # 1. Obtener sesión de Stripe
            stripe_session = stripe.checkout.Session.retrieve(session_id)
            # 2. Verificar estado
            if stripe_session.payment_status == 'paid':
                order_id = int(stripe_session.metadata.get('order_id'))
                # 3. Actualizar orden
                await order_service.update_order_status(
                    order_id, 
                    OrderUpdateStatus(status=OrderStatus.PAID),
                    session
                )
                return {
                    "status": "pagado",
                    "order_id": order_id,
                    "session_id": session_id
                }
            elif stripe_session.payment_status == 'unpaid':
                return {"status": "pendiente", "session_id": session_id}
            else:
                return {"status": stripe_session.payment_status, "session_id": session_id}
            
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        
        
    
    async def handle_successful_payment(self, event_session: Dict[str, Any],order_service: OrderService,session:AsyncSession):
        order_id = int(event_session['metadata']['order_id'])
        await order_service.update_order_status(
            order_id, 
            OrderUpdateStatus(status=OrderStatus.PAID),
            session
        )