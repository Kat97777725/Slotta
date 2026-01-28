"""Google Calendar Integration with Two-Way Sync

Allows masters to:
1. Push Slotta bookings to Google Calendar
2. Import Google Calendar events as blocked time

To enable:
1. Go to https://console.cloud.google.com
2. Create new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add to .env:
   - GOOGLE_CLIENT_ID=your_client_id
   - GOOGLE_CLIENT_SECRET=your_client_secret
   - GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/oauth/callback
"""

import os
import logging
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

class GoogleCalendarService:
    
    def __init__(self):
        self.client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:3000/api/google/oauth/callback')
        self.enabled = bool(self.client_id and self.client_secret)
        
        if not self.enabled:
            logger.warning("⚠️  Google Calendar disabled: OAuth credentials not found in .env")
            logger.info("📅 To enable Calendar: Set up OAuth at https://console.cloud.google.com")
        else:
            logger.info("✅ Google Calendar enabled")
    
    def get_auth_url(self, state: str = "") -> str:
        """Generate OAuth authorization URL"""
        
        if not self.enabled:
            return ""
        
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
            'access_type': 'offline',
            'prompt': 'consent',
            'state': state
        }
        
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    
    async def exchange_code(self, code: str) -> Optional[Dict]:
        """Exchange authorization code for tokens"""
        
        if not self.enabled:
            return {"access_token": "mock_token", "refresh_token": "mock_refresh"}
        
        try:
            import httpx
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        'client_id': self.client_id,
                        'client_secret': self.client_secret,
                        'code': code,
                        'grant_type': 'authorization_code',
                        'redirect_uri': self.redirect_uri
                    }
                )
                response.raise_for_status()
                tokens = response.json()
                
                logger.info("✅ Google OAuth tokens obtained")
                return tokens
                
        except Exception as e:
            logger.error(f"❌ Failed to exchange OAuth code: {e}")
            return None
    
    async def refresh_token(self, refresh_token: str) -> Optional[str]:
        """Refresh access token"""
        
        if not self.enabled:
            return "mock_refreshed_token"
        
        try:
            import httpx
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        'client_id': self.client_id,
                        'client_secret': self.client_secret,
                        'refresh_token': refresh_token,
                        'grant_type': 'refresh_token'
                    }
                )
                response.raise_for_status()
                tokens = response.json()
                return tokens.get('access_token')
                
        except Exception as e:
            logger.error(f"❌ Failed to refresh token: {e}")
            return None
    
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
    
    async def get_events(
        self,
        access_token: str,
        time_min: datetime,
        time_max: datetime
    ) -> List[Dict]:
        """Get calendar events in a time range (for two-way sync)"""
        
        if not self.enabled:
            logger.info(f"[MOCK] Would fetch calendar events")
            return []
        
        try:
            import httpx
            
            url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
            params = {
                'timeMin': time_min.isoformat() + 'Z',
                'timeMax': time_max.isoformat() + 'Z',
                'singleEvents': 'true',
                'orderBy': 'startTime',
                'maxResults': 250
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    params=params,
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                response.raise_for_status()
                
                data = response.json()
                events = data.get('items', [])
                
                logger.info(f"✅ Fetched {len(events)} calendar events")
                return events
            
        except Exception as e:
            logger.error(f"❌ Failed to fetch calendar events: {e}")
            return []
    
    async def import_events_as_blocks(
        self,
        access_token: str,
        master_id: str,
        db  # Pass database connection
    ) -> int:
        """Import Google Calendar events as blocked time slots (two-way sync)"""
        
        # Fetch events for the next 30 days
        time_min = datetime.utcnow()
        time_max = time_min + timedelta(days=30)
        
        events = await self.get_events(access_token, time_min, time_max)
        
        imported_count = 0
        for event in events:
            # Skip all-day events
            if 'dateTime' not in event.get('start', {}):
                continue
            
            # Skip events created by Slotta (they have Slotta in description)
            if event.get('description', '').startswith('Client:'):
                continue
            
            start_str = event['start']['dateTime']
            end_str = event['end']['dateTime']
            
            # Parse datetime strings
            start_time = datetime.fromisoformat(start_str.replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(end_str.replace('Z', '+00:00'))
            
            # Check if block already exists
            existing = await db.calendar_blocks.find_one({
                "master_id": master_id,
                "google_event_id": event['id']
            })
            
            if not existing:
                import uuid
                block = {
                    "id": str(uuid.uuid4()),
                    "master_id": master_id,
                    "start_datetime": start_time,
                    "end_datetime": end_time,
                    "reason": event.get('summary', 'Google Calendar Event'),
                    "google_event_id": event['id'],
                    "created_at": datetime.utcnow()
                }
                await db.calendar_blocks.insert_one(block)
                imported_count += 1
        
        logger.info(f"✅ Imported {imported_count} events as blocked time")
        return imported_count

# Global instance
google_calendar_service = GoogleCalendarService()
