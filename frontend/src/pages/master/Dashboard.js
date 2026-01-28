import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  LayoutDashboard, Calendar, Briefcase, Users, Wallet, 
  Settings, TrendingUp, Clock, Shield, DollarSign, AlertCircle, Menu
} from 'lucide-react';

const Sidebar = ({ active }) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/master/dashboard' },
    { id: 'bookings', label: 'Bookings', icon: Briefcase, path: '/master/bookings' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/master/calendar' },
    { id: 'services', label: 'Services', icon: Shield, path: '/master/services' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/master/clients' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/master/wallet' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/master/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/master/settings' },
  ];

  return (
    <div className="w-64 bg-white border-r min-h-screen p-6">
      <div className="flex items-center space-x-2 mb-8">
        <Clock className="w-8 h-8 text-purple-600" />
        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Slotta
        </span>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              active === item.id
                ? 'bg-purple-50 text-purple-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            data-testid={`nav-${item.id}`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const MasterLayout = ({ children, active, title }) => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar active={active} />
      <div className="flex-1">
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold" data-testid="page-title">{title}</h1>
          <div className="flex items-center space-x-4">
            <Badge variant="success">Active</Badge>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                SB
              </div>
              <div>
                <div className="text-sm font-semibold">Sophia Brown</div>
                <div className="text-xs text-gray-500">Hair Stylist</div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  
  const stats = [
    { label: 'Today\'s Bookings', value: '5', icon: Briefcase, color: 'purple', trend: '+2 from yesterday' },
    { label: 'Time Protected', value: '€2,450', icon: Shield, color: 'green', trend: 'This month' },
    { label: 'No-Shows Avoided', value: '12', icon: TrendingUp, color: 'blue', trend: 'Last 30 days' },
    { label: 'Wallet Balance', value: '€840', icon: Wallet, color: 'pink', trend: 'Available for payout' },
  ];

  const todayBookings = [
    { id: 1, client: 'Emma Wilson', service: 'Balayage', time: '09:00', aurasync: 40, status: 'confirmed' },
    { id: 2, client: 'Olivia Smith', service: 'Haircut & Style', time: '11:00', aurasync: 18, status: 'confirmed' },
    { id: 3, client: 'James Parker', service: 'Men\'s Cut', time: '14:30', aurasync: 12, status: 'pending' },
    { id: 4, client: 'Sophie Taylor', service: 'Keratin Treatment', time: '16:00', aurasync: 35, status: 'confirmed' },
    { id: 5, client: 'New Client', service: 'Color Correction', time: '18:00', aurasync: 60, status: 'high-risk' },
  ];

  const statusColors = {
    confirmed: 'success',
    pending: 'warning',
    'high-risk': 'danger',
  };

  return (
    <MasterLayout active="dashboard" title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx} className="hover:shadow-lg transition">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1" data-testid={`stat-${idx}`}>{stat.value}</div>
              <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
              <div className="text-xs text-gray-500">{stat.trend}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Bookings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Today's Bookings</span>
            <button 
              onClick={() => navigate('/master/bookings')}
              className="text-sm font-normal text-purple-600 hover:text-purple-700"
            >
              View All
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer"
                onClick={() => navigate(`/master/bookings/${booking.id}`)}
                data-testid={`booking-${booking.id}`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-semibold text-purple-600">
                    {booking.client.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold">{booking.client}</div>
                    <div className="text-sm text-gray-500">{booking.service}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="font-semibold">{booking.time}</div>
                    <div className="text-sm text-gray-500">€{booking.aurasync} protected</div>
                  </div>
                  <Badge variant={statusColors[booking.status]}>
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/master/calendar')}>
          <Calendar className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold mb-2">Manage Calendar</h3>
          <p className="text-sm text-gray-600">Block time, set availability</p>
        </Card>
        <Card className="p-6 cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/master/services')}>
          <Shield className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold mb-2">Adjust Slotta</h3>
          <p className="text-sm text-gray-600">Update service protection</p>
        </Card>
        <Card className="p-6 cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/master/analytics')}>
          <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold mb-2">View Analytics</h3>
          <p className="text-sm text-gray-600">See your protection stats</p>
        </Card>
      </div>
    </MasterLayout>
  );
};

export default Dashboard;
export { MasterLayout };
