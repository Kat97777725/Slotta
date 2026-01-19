"""Email Service Integration

Supports: SendGrid (recommended for ease of setup)

To enable:
1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create API key: Settings > API Keys > Create API Key
3. Add to .env: SENDGRID_API_KEY=your_key_here
4. Verify sender email in SendGrid dashboard
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class EmailService:
    
    def __init__(self):
        self.api_key = os.getenv('SENDGRID_API_KEY')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@timehold.com')
        self.enabled = bool(self.api_key)
        
        if not self.enabled:
            logger.warning("⚠️  Email service disabled: SENDGRID_API_KEY not found in .env")
            logger.info("📧 To enable emails: Get free API key from https://sendgrid.com")
    
    async def send_booking_confirmation(
        self,
        to_email: str,
        client_name: str,
        master_name: str,
        service_name: str,
        booking_date: str,
        booking_time: str,
        timehold_amount: float
    ) -> bool:
        """Send booking confirmation email to client"""
        
        if not self.enabled:
            logger.info(f"[MOCK] Would send booking confirmation to {to_email}")
            return True
        
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=f'Booking Confirmed with {master_name}',
                html_content=f'''
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #8b5cf6;">Booking Confirmed!</h2>
                    <p>Hi {client_name},</p>
                    <p>Your appointment is confirmed:</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Service:</strong> {service_name}</p>
                        <p><strong>With:</strong> {master_name}</p>
                        <p><strong>Date:</strong> {booking_date}</p>
                        <p><strong>Time:</strong> {booking_time}</p>
                        <p style="color: #8b5cf6;"><strong>TimeHold:</strong> €{timehold_amount} (held, not charged)</p>
                    </div>
                    <p>See you soon!</p>
                    <p style="color: #6b7280; font-size: 12px;">TimeHold - Protect your time, fairly.</p>
                </div>
                ''')
            
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            
            logger.info(f"✅ Booking confirmation sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send email: {e}")
            return False
    
    async def send_master_new_booking(
        self,
        to_email: str,
        master_name: str,
        client_name: str,
        service_name: str,
        booking_date: str,
        booking_time: str
    ) -> bool:
        """Notify master of new booking"""
        
        if not self.enabled:
            logger.info(f"[MOCK] Would notify master {to_email} of new booking")
            return True
        
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=f'New Booking: {client_name}',
                html_content=f'''
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #8b5cf6;">New Booking Received</h2>
                    <p>Hi {master_name},</p>
                    <p>You have a new appointment:</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Client:</strong> {client_name}</p>
                        <p><strong>Service:</strong> {service_name}</p>
                        <p><strong>Date:</strong> {booking_date}</p>
                        <p><strong>Time:</strong> {booking_time}</p>
                    </div>
                    <p><a href="https://timehold.com/master/bookings" style="background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Booking</a></p>
                </div>
                ''')
            
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            
            logger.info(f"✅ New booking notification sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send email: {e}")
            return False
    
    async def send_no_show_alert(
        self,
        to_email: str,
        master_name: str,
        client_name: str,
        compensation: float,
        wallet_credit: float
    ) -> bool:
        """Send no-show alert to master"""
        
        if not self.enabled:
            logger.info(f"[MOCK] Would send no-show alert to {to_email}")
            return True
        
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=f'No-Show: {client_name}',
                html_content=f'''
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ef4444;">No-Show Alert</h2>
                    <p>Hi {master_name},</p>
                    <p>{client_name} did not show up for their appointment.</p>
                    <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #10b981;"><strong>Your compensation:</strong> €{compensation}</p>
                        <p style="color: #6b7280;">Client wallet credit: €{wallet_credit}</p>
                    </div>
                    <p>TimeHold has been captured and will be added to your wallet.</p>
                </div>
                ''')
            
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            
            logger.info(f"✅ No-show alert sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send email: {e}")
            return False

# Global instance
email_service = EmailService()
