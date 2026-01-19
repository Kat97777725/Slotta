"""Google Calendar Integration

Allows masters to sync bookings with Google Calendar

To enable:
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add to .env:
   - GOOGLE_CLIENT_ID=your_client_id
   - GOOGLE_CLIENT_SECRET=your_client_secret
   - GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
"""

import os
import logging
from typing import Optional, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

class GoogleCalendarService:
    
    def __init__(self):
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        self.enabled = bool(self.client_id and self.client_secret)
        
        if not self.enabled:
            logger.warning("⚠️  Google Calendar disabled: OAuth credentials not found in .env")
            logger.info("📅 To enable Calendar: Set up OAuth at https://console.cloud.google.com")
    
    async def create_event(
        self,
        access_token: str,
        summary: str,
        start_time: datetime,
        end_time: datetime,
        description: Optional[str] = None
    ) -> Optional[str]:
        """Create a calendar event"""
        
        if not self.enabled:
            logger.info(f"[MOCK] Would create calendar event: {summary}")
            return "mock_event_id_123"
        
        try:
            import httpx
            
            url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
            
            event_data = {
                'summary': summary,
                'description': description,
                'start': {
                    'dateTime': start_time.isoformat(),
                    'timeZone': 'UTC'
                },
                'end': {
                    'dateTime': end_time.isoformat(),
                    'timeZone': 'UTC'
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},
                        {'method': 'popup', 'minutes': 60}
                    ]
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=event_data,
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                response.raise_for_status()
                
                event = response.json()
                logger.info(f"✅ Calendar event created: {event['id']}")
                return event['id']
            
        except Exception as e:
            logger.error(f"❌ Failed to create calendar event: {e}")
            return None
    
    async def delete_event(
        self,
        access_token: str,
        event_id: str
    ) -> bool:
        """Delete a calendar event"""
        
        if not self.enabled:
            logger.info(f"[MOCK] Would delete calendar event: {event_id}")
            return True
        
        try:
            import httpx
            
            url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events/{event_id}"
            
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    url,
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                response.raise_for_status()
            
            logger.info(f"✅ Calendar event deleted: {event_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to delete calendar event: {e}")
            return False

# Global instance
google_calendar_service = GoogleCalendarService()
