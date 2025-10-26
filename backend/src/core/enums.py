from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pendiente" 
    PAID = "pagado"     
    PROCESSING = "procesando"
    SHIPPED = "enviado"
    DELIVERED = "entregado"
    CANCELLED = "cancelado"

class PaymentMethod(str, Enum):
    CREDIT_CARD = "Tarjeta de crédito"
    CASH = "Efectivo"                 