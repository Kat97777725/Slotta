import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Clock, Calendar, Wallet, User, Home, Edit, X, CheckCircle } from 'lucide-react';

const ClientPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');

  const bookings = [
    { 
      id: 1, 
      master: 'Sophia Brown', 
      service: 'Balayage Hair Color', 
      date: '2025-02-15', 
      time: '09:00', 
      price: 150, 
      aurasync: 40, 
      status: 'confirmed',
      location: 'London, UK'
    },
    { 
      id: 2, 
      master: 'Sophia Brown', 
      service: 'Keratin Treatment', 
      date: '2025-03-10', 
      time: '14:00', 
      price: 120, 
      aurasync: 35, 
      status: 'confirmed',
      location: 'London, UK'
    },
    { 
      id: 3, 
      master: 'Sophia Brown', 
      service: 'Women\'s Haircut', 
      date: '2025-01-20', 
      time: '11:00', 
      price: 60, 
      aurasync: 18, 
      status: 'completed',
      location: 'London, UK'
    },
  ];

  const walletBalance = 15;
  const walletTransactions = [
    { id: 1, type: 'credit', amount: 15, reason: 'No-show compensation - Refunded to wallet', date: '2025-02-01' },
  ];

  const statusColors = {
    confirmed: 'success',
    completed: 'info',
    cancelled: 'danger',
  };

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
                JD
              </div>
              <span className="text-sm font-medium">Jane Doe</span>
            </div>
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

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {[
                { label: 'Upcoming', value: bookings.filter(b => b.status === 'confirmed').length, color: 'purple' },
                { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: 'green' },
              ].map((stat, idx) => (
                <Card key={idx} className="p-6">
                  <div className={`text-4xl font-bold text-${stat.color}-600 mb-2`}>{stat.value}</div>
                  <div className="text-gray-600">{stat.label} Bookings</div>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-6 border rounded-lg hover:bg-gray-50 transition"
                      data-testid={`client-booking-${booking.id}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{booking.service}</h3>
                          <p className="text-sm text-gray-600">with {booking.master}</p>
                        </div>
                        <Badge variant={statusColors[booking.status]}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(booking.date).toLocaleDateString('en-GB', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{booking.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <div className="text-sm text-gray-600">Service Price: €{booking.price}</div>
                          <div className="text-sm text-purple-600 font-medium">
                            Slotta: €{booking.aurasync} (held, not charged)
                          </div>
                        </div>
                        {booking.status === 'confirmed' && (
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Reschedule
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-600">
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && (
          <div>
            <Card className="mb-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-purple-100 mb-2">Available Balance</div>
                    <div className="text-5xl font-bold mb-2" data-testid="wallet-balance">€{walletBalance}</div>
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
                        Your wallet balance is automatically applied to your next booking, reducing the amount charged.
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

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {walletTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {walletTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Credit Added</span>
                          <span className="text-lg font-bold text-green-600">+€{transaction.amount}</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{transaction.reason}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No transactions yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue="Jane"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="jane.doe@email.com"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+44 7700 900001"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>
                <Button>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;
