"""Stripe Connect Integration

Stripe Connect allows TimeHold to:
1. Authorize payment holds (not charges)
2. Capture holds on no-show
3. Release holds on completion
4. Pay out masters automatically

To enable:
1. Create Stripe account at https://stripe.com
2. Go to Developers > API Keys
3. Add to .env:
   - STRIPE_SECRET_KEY=sk_test_...
   - STRIPE_PUBLISHABLE_KEY=pk_test_...
4. Enable Connect: https://dashboard.stripe.com/connect/overview
"""

import os
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)

class StripeService:
    
    def __init__(self):
        self.secret_key = os.getenv('STRIPE_SECRET_KEY')
        self.enabled = bool(self.secret_key)
        
        if self.enabled:
            import stripe
            stripe.api_key = self.secret_key
            logger.info("✅ Stripe enabled")
        else:
            logger.warning("⚠️  Stripe disabled: STRIPE_SECRET_KEY not found in .env")
            logger.info("💳 To enable Stripe: Get test keys from https://dashboard.stripe.com/test/apikeys")
    
    async def create_payment_intent(
        self,
        amount: float,
        customer_email: str,
        metadata: dict
    ) -> Optional[Dict]:
        """Create a payment intent with authorization hold"""
        
        if not self.enabled:
            logger.info(f"[MOCK] Would create payment intent for €{amount}")
            return {
                'id': 'pi_mock_123456',
                'client_secret': 'pi_mock_123456_secret_mock',
                'status': 'requires_payment_method'
            }
        
        try:
            import stripe
            
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency='eur',
                capture_method='manual',  # CRITICAL: Hold, don't charge
                receipt_email=customer_email,
                metadata=metadata
            )
            
            logger.info(f"✅ Payment intent created: {intent.id}")
            return {
                'id': intent.id,
                'client_secret': intent.client_secret,
                'status': intent.status
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to create payment intent: {e}")
            return None
    
    async def capture_payment(
        self,
        payment_intent_id: str,
        amount: Optional[float] = None
    ) -> bool:
        """Capture a held payment (on no-show)"""
        
        if not self.enabled:
            logger.info(f"[MOCK] Would capture payment {payment_intent_id}")
            return True
        
        try:
            import stripe
            
            capture_args = {}
            if amount:
                capture_args['amount_to_capture'] = int(amount * 100)
            
            intent = stripe.PaymentIntent.capture(
                payment_intent_id,
                **capture_args
            )
            
            logger.info(f"✅ Payment captured: {payment_intent_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to capture payment: {e}")
            return False
    
    async def cancel_payment(
        self,
        payment_intent_id: str
    ) -> bool:
        """Cancel/release a payment hold (on completion)"""
        
        if not self.enabled:
            logger.info(f"[MOCK] Would cancel payment {payment_intent_id}")
            return True
        
        try:
            import stripe
            
            intent = stripe.PaymentIntent.cancel(payment_intent_id)
            
            logger.info(f"✅ Payment cancelled (hold released): {payment_intent_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to cancel payment: {e}")
            return False
    
    async def create_payout(
        self,
        connected_account_id: str,
        amount: float
    ) -> bool:
        """Create payout to master's connected account"""
        
        if not self.enabled:
            logger.info(f"[MOCK] Would create payout of €{amount} to {connected_account_id}")
            return True
        
        try:
            import stripe
            
            payout = stripe.Payout.create(
                amount=int(amount * 100),
                currency='eur',
                stripe_account=connected_account_id
            )
            
            logger.info(f"✅ Payout created: {payout.id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to create payout: {e}")
            return False

# Global instance
stripe_service = StripeService()
