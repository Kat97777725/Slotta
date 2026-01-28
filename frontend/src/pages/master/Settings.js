import React, { useState, useEffect } from 'react';
import { MasterLayout } from './Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mastersAPI, authAPI, googleCalendarAPI } from '@/lib/api';
import { 
  User, Bell, Clock, Link as LinkIcon, CreditCard, Shield, Save, 
  Calendar, Upload, CheckCircle, AlertCircle, RefreshCw, Loader2, Camera
} from 'lucide-react';

const Settings = () => {
  const master = authAPI.getMaster();
  const masterId = master?.id;
  const [loading, setLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: master?.name || '',
    email: master?.email || '',
    phone: master?.phone || '',
    specialty: master?.specialty || '',
    bio: master?.bio || '',
    location: master?.location || '',
    photo_url: master?.photo_url || ''
  });
  
  const [settings, setSettings] = useState({
    daily_summary_enabled: master?.settings?.daily_summary_enabled !== false,
    summary_time: master?.settings?.summary_time || '08:00',
    timezone: master?.settings?.timezone || 'Europe/London'
  });
  
  const bookingLink = master?.booking_slug ? `slotta.app/${master.booking_slug}` : '';

  useEffect(() => {
    if (masterId) {
      checkCalendarStatus();
    }
  }, [masterId]);

  const checkCalendarStatus = async () => {
    try {
      const response = await googleCalendarAPI.syncStatus(masterId);
      setCalendarConnected(response.data.connected);
    } catch (error) {
      console.error('Failed to check calendar status:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await mastersAPI.update(masterId, {
        ...profileData,
        settings: settings
      });
      authAPI.setMaster({ ...master, ...profileData, settings });
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('❌ Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      setCalendarLoading(true);
      const response = await googleCalendarAPI.getAuthUrl();
      // Redirect to Google OAuth
      window.location.href = `${response.data.auth_url}&state=${masterId}`;
    } catch (error) {
      console.error('Failed to connect calendar:', error);
      alert('❌ Failed to connect Google Calendar.');
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    if (!window.confirm('Disconnect Google Calendar? Your bookings will no longer sync.')) {
      return;
    }
    
    try {
      setCalendarLoading(true);
      await googleCalendarAPI.disconnect(masterId);
      setCalendarConnected(false);
      alert('✅ Google Calendar disconnected.');
    } catch (error) {
      console.error('Failed to disconnect calendar:', error);
      alert('❌ Failed to disconnect.');
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleImportCalendarEvents = async () => {
    try {
      setCalendarLoading(true);
      const response = await googleCalendarAPI.importEvents(masterId);
      alert(`✅ Imported ${response.data.imported_count} events as blocked time!`);
    } catch (error) {
      console.error('Failed to import events:', error);
      alert('❌ Failed to import calendar events.');
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    try {
      setImageUploading(true);
      
      // Convert to base64 for storage (simple approach)
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setProfileData({ ...profileData, photo_url: base64 });
        
        // Save to backend
        await mastersAPI.update(masterId, { photo_url: base64 });
        authAPI.setMaster({ ...master, photo_url: base64 });
        
        alert('✅ Profile photo updated!');
        setImageUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('❌ Failed to upload image.');
      setImageUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://${bookingLink}`);
    alert('✅ Link copied to clipboard!');
  };

  return (
    <MasterLayout active="settings" title="Settings">
      {/* Profile Photo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profileData.photo_url ? (
                <img 
                  src={profileData.photo_url} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-100"
                />
              ) : (
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-2xl font-bold border-4 border-purple-200">
                  {profileData.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageUploading}
                />
              </label>
            </div>
            <div>
              <h3 className="font-semibold">{profileData.name || 'Your Name'}</h3>
              <p className="text-sm text-gray-600">{profileData.specialty || 'Add your specialty'}</p>
              {imageUploading && (
                <div className="flex items-center space-x-2 text-purple-600 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
              <input
                type="text"
                value={profileData.specialty}
                onChange={(e) => setProfileData({...profileData, specialty: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="e.g., London, UK"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows="3"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Tell clients about yourself and your services..."
              ></textarea>
            </div>
          </div>
          <Button className="mt-6" onClick={handleSaveProfile} disabled={loading} data-testid="save-profile-btn">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Booking Link */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Booking Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <div className="flex-1 flex items-center space-x-3 bg-gray-50 px-4 py-3 rounded-lg border">
              <LinkIcon className="w-5 h-5 text-gray-400" />
              <span className="font-mono text-purple-600" data-testid="booking-link">{bookingLink}</span>
            </div>
            <Button variant="outline" onClick={copyToClipboard}>Copy Link</Button>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Share this link with clients for easy booking. It's your unique Slotta booking page.
          </p>
        </CardContent>
      </Card>

      {/* Google Calendar Sync */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Google Calendar Sync</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${calendarConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {calendarConnected ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Calendar className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-semibold">Google Calendar</div>
                  <div className="text-sm text-gray-600">
                    {calendarConnected ? 'Connected - Two-way sync enabled' : 'Not connected'}
                  </div>
                </div>
              </div>
              {calendarConnected ? (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleImportCalendarEvents}
                    disabled={calendarLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${calendarLoading ? 'animate-spin' : ''}`} />
                    Import Events
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 border-red-600"
                    onClick={handleDisconnectCalendar}
                    disabled={calendarLoading}
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button onClick={handleConnectCalendar} disabled={calendarLoading}>
                  {calendarLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Calendar className="w-4 h-4 mr-2" />}
                  Connect Calendar
                </Button>
              )}
            </div>
            
            {calendarConnected && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <strong>Two-way sync:</strong> Your Slotta bookings automatically appear in Google Calendar. 
                    Click "Import Events" to bring your existing Google Calendar events as blocked time in Slotta.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Daily Summary Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Quick Stats Email</div>
                <div className="text-sm text-gray-600">
                  Receive a daily summary with your bookings, time protected, and pending payouts
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.daily_summary_enabled}
                  onChange={(e) => setSettings({...settings, daily_summary_enabled: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {settings.daily_summary_enabled && (
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send Time</label>
                  <select 
                    value={settings.summary_time}
                    onChange={(e) => setSettings({...settings, summary_time: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="06:00">6:00 AM</option>
                    <option value="07:00">7:00 AM</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select 
                    value={settings.timezone}
                    onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Europe/Berlin">Berlin (CET)</option>
                    <option value="America/New_York">New York (EST)</option>
                    <option value="America/Los_Angeles">Los Angeles (PST)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 'new-booking', label: 'New Booking', desc: 'Get notified when someone books' },
              { id: 'reschedule', label: 'Reschedule Requests', desc: 'Client wants to change their appointment' },
              { id: 'no-show', label: 'No-Show Alerts', desc: 'Client didn\'t show up for appointment' },
              { id: 'payout', label: 'Payout Confirmations', desc: 'Money transferred to your account' },
            ].map((notif) => (
              <div key={notif.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{notif.label}</div>
                  <div className="text-sm text-gray-600">{notif.desc}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-purple-600" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-purple-600" />
                    <span className="text-sm">Telegram</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">Stripe Connect</div>
                  <div className="text-sm text-gray-600">Connected</div>
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Your Stripe account is connected for payment processing and payouts.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">Account Status</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">Member Since</span>
                <span className="font-semibold">
                  {master?.created_at ? new Date(master.created_at).toLocaleDateString('en-GB', {
                    month: 'short',
                    year: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Button variant="outline" className="text-red-600 border-red-600" onClick={() => authAPI.logout()}>
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MasterLayout>
  );
};

export default Settings;
