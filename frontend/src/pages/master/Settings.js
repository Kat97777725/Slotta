import React, { useState } from 'react';
import { MasterLayout } from './Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { mastersAPI } from '@/lib/api';
import { User, Bell, Clock, Link as LinkIcon, CreditCard, Shield, Save } from 'lucide-react';

const MASTER_ID = 'demo-master-123';

const Settings = () => {
  const [bookingLink] = useState('slotta.app/sophiabrown');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Sophia Brown',
    email: 'sophia.brown@email.com',
    phone: '+44 7700 900000',
    specialty: 'Hair Stylist & Colorist',
    bio: 'Specializing in balayage, color correction, and precision cuts. 10+ years experience.'
  });

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await mastersAPI.update(MASTER_ID, profileData);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('❌ Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MasterLayout active="settings" title="Settings">
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
                defaultValue="Sophia Brown"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="sophia.brown@email.com"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="+44 7700 900000"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
              <input
                type="text"
                defaultValue="Hair Stylist & Colorist"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows="3"
                defaultValue="Specializing in balayage, color correction, and precision cuts. 10+ years experience."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              ></textarea>
            </div>
          </div>
          <Button className="mt-6">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
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
            <Button variant="outline">Copy Link</Button>
            <Button>Share</Button>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Share this link with clients for easy booking. It's your unique Slotta booking page.
          </p>
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
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">SMS</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">Telegram</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reschedule Rules */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Reschedule Window</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Reschedule Deadline
              </label>
              <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
                <option>24 hours before appointment</option>
                <option>48 hours before appointment</option>
                <option>72 hours before appointment</option>
              </select>
              <p className="text-sm text-gray-600 mt-2">
                Clients can reschedule for free before this deadline. After that, they need your approval.
              </p>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <div className="font-medium text-purple-900">Allow Same-Day Reschedule for Reliable Clients</div>
                <div className="text-sm text-purple-700">Clients with 0 no-shows can reschedule anytime</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
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
                <span className="text-gray-700">Subscription Status</span>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700">Current Plan</span>
                <span className="font-semibold">€29/month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Next Billing Date</span>
                <span className="font-semibold">Mar 15, 2025</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Button variant="outline">Manage Subscription</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MasterLayout>
  );
};

export default Settings;
