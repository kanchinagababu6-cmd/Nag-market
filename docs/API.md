# API

## GET /api/health
Health check.

## GET /api/products
Returns active products with category and inventory.

## POST /api/orders

Request:
```json
{
  "userId": "USER_ID",
  "paymentMethod": "COD",
  "items": [
    { "productId": "PRODUCT_ID", "quantity": 2 }
  ]
}
```

The order transaction validates stock and conditionally decrements inventory so an order cannot reduce stock below zero.

Before public production use, add authenticated identity verification, address validation, coupon validation, delivery slot validation, tax rules, payment verification, rate limiting, idempotency keys, and authorization.
