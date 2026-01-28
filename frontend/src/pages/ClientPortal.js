import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { bookingsAPI, clientsAPI } from '@/lib/api';
import { Clock, Calendar, Wallet, User, Home, Edit, X, CheckCircle, Loader2, Mail, AlertCircle } from 'lucide-react';

const ClientPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [clientEmail, setClientEmail] = useState('');
  const [client, setClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  // Check if client email is stored
  useEffect(() => {
    const storedEmail = localStorage.getItem('slotta_client_email');
    if (storedEmail) {
      setClientEmail(storedEmail);
      setIsAuthenticated(true);
      loadClientData(storedEmail);
    }
  }, []);

  const loadClientData = async (email) => {
    try {
      setLoading(true);
      setError('');
      
      // Get client info
      const clientResponse = await clientsAPI.getByEmail(email);
      setClient(clientResponse.data);
      
      // Get bookings
      const bookingsResponse = await bookingsAPI.getByClientEmail(email);
      setBookings(bookingsResponse.data || []);
      
    } catch (err) {
      console.error('Failed to load client data:', err);
      if (err.response?.status === 404) {
        setError('No bookings found for this email.');
      } else {
        setError('Failed to load your bookings. Please try again.');
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!clientEmail.trim()) return;
    
    localStorage.setItem('slotta_client_email', clientEmail);
    setIsAuthenticated(true);
    loadClientData(clientEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem('slotta_client_email');
    setIsAuthenticated(false);
    setClient(null);
    setBookings([]);
    setClientEmail('');
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Your payment hold will be released.')) {
      return;
    }
    
    try {
      await bookingsAPI.cancel(bookingId);
      alert('✅ Booking cancelled successfully!');
      loadClientData(clientEmail);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel booking');
    }
  };

  const statusColors = {
    confirmed: 'success',
    pending: 'warning',
    completed: 'info',
    cancelled: 'danger',
    'no-show': 'danger',
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-6 h-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Slotta
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-20">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Client Portal</h1>
              <p className="text-gray-600">Enter your email to view your bookings</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="your@email.com"
                    required
                    data-testid="client-email-input"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full py-3" data-testid="client-login-btn">
                View My Bookings
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  const walletBalance = client?.wallet_balance || 0;
  const upcomingCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Slotta
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {client?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium">{client?.name || clientEmail}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8" data-testid="client-portal-title">My Account</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b">
          {[
            { id: 'bookings', label: 'My Bookings', icon: Calendar },
            { id: 'wallet', label: 'Wallet', icon: Wallet },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-purple-600'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && !loading && (
          <div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">{upcomingCount}</div>
                <div className="text-gray-600">Upcoming Bookings</div>
              </Card>
              <Card className="p-6">
                <div className="text-4xl font-bold text-green-600 mb-2">{completedCount}</div>
                <div className="text-gray-600">Completed Bookings</div>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No bookings yet</p>
                    <Button className="mt-4" onClick={() => navigate('/')}>
                      Book an Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-6 border rounded-lg hover:bg-gray-50 transition"
                        data-testid={`client-booking-${booking.id}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              {booking.service_name || 'Service'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              with {booking.master_name || 'Professional'}
                            </p>
                          </div>
                          <Badge variant={statusColors[booking.status] || 'default'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-GB', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                              }) : 'Date TBD'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {booking.booking_date ? new Date(booking.booking_date).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit',
                              }) : 'Time TBD'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <div className="text-sm text-gray-600">
                              Service Price: €{booking.service_price || 0}
                            </div>
                            <div className="text-sm text-purple-600 font-medium">
                              Slotta: €{booking.slotta_amount || 0} (held, not charged)
                            </div>
                          </div>
                          {(booking.status === 'confirmed' || booking.status === 'pending') && (
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleCancelBooking(booking.id)}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && !loading && (
          <div>
            <Card className="mb-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-purple-100 mb-2">Available Balance</div>
                    <div className="text-5xl font-bold mb-2" data-testid="wallet-balance">
                      €{walletBalance}
                    </div>
                    <p className="text-sm text-purple-100">
                      Use this credit for your next booking
                    </p>
                  </div>
                  <Wallet className="w-20 h-20 text-purple-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>How Wallet Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Fair No-Show Policy</h4>
                      <p className="text-sm text-gray-600">
                        If you miss an appointment, part of the Slotta goes to compensate the master, 
                        and the rest is credited to your wallet for future use.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Automatic Application</h4>
                      <p className="text-sm text-gray-600">
                        Your wallet balance is automatically applied to your next booking.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Never Expires</h4>
                      <p className="text-sm text-gray-600">
                        Your credits don't expire. Use them whenever you're ready.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={client?.name || ''}
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={client?.email || clientEmail}
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={client?.phone || 'Not provided'}
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                    <input
                      type="text"
                      value={client?.created_at ? new Date(client.created_at).toLocaleDateString('en-GB') : 'N/A'}
                      readOnly
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-4">Booking Stats</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{client?.total_bookings || 0}</div>
                      <div className="text-sm text-gray-600">Total Bookings</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{client?.completed_bookings || 0}</div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{client?.reliability || 'new'}</div>
                      <div className="text-sm text-gray-600">Status</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;
