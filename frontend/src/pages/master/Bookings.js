import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterLayout } from './Dashboard';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { bookingsAPI } from '@/lib/api';
import { Calendar, Search, Filter } from 'lucide-react';

const MASTER_ID = 'demo-master-123';

const Bookings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getByMaster(MASTER_ID);
      setBookings(response.data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      // Fallback to mock data
      setBookings([
        { id: 1, client_id: 'Emma Wilson', service_id: 'Balayage', booking_date: '2025-02-15T09:00:00', service_price: 150, slotta_amount: 40, status: 'confirmed' },
        { id: 2, client_id: 'Olivia Smith', service_id: 'Haircut', booking_date: '2025-02-15T11:00:00', service_price: 60, slotta_amount: 18, status: 'confirmed' },
        { id: 3, client_id: 'James Parker', service_id: 'Mens Cut', booking_date: '2025-02-15T14:30:00', service_price: 40, slotta_amount: 12, status: 'pending' },
        { id: 4, client_id: 'Sophie Taylor', service_id: 'Keratin', booking_date: '2025-02-16T10:00:00', service_price: 120, slotta_amount: 35, status: 'confirmed' },
        { id: 5, client_id: 'New Client', service_id: 'Color Correction', booking_date: '2025-02-16T14:00:00', service_price: 200, slotta_amount: 60, status: 'pending' },
        { id: 6, client_id: 'Lucy Brown', service_id: 'Balayage', booking_date: '2025-02-12T15:00:00', service_price: 150, slotta_amount: 40, status: 'completed' },
        { id: 7, client_id: 'Michael Chen', service_id: 'Mens Cut', booking_date: '2025-02-11T10:30:00', service_price: 40, slotta_amount: 12, status: 'completed' },
        { id: 8, client_id: 'Sarah Johnson', service_id: 'Color Correction', booking_date: '2025-02-10T13:00:00', service_price: 200, slotta_amount: 60, status: 'no-show' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    confirmed: 'success',
    pending: 'warning',
    completed: 'info',
    'no-show': 'danger',
    rescheduled: 'default',
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  return (
    <MasterLayout active="bookings" title="Bookings">
      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {['all', 'confirmed', 'pending', 'completed', 'no-show'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(status)}
              data-testid={`filter-${status}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </Button>
          ))}
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="p-6 hover:bg-gray-50 transition cursor-pointer flex items-center justify-between"
                onClick={() => navigate(`/master/bookings/${booking.id}`)}
                data-testid={`booking-row-${booking.id}`}
              >
                <div className="flex items-center space-x-6 flex-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center font-semibold text-purple-600">
                    {booking.client.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{booking.client}</div>
                    <div className="text-sm text-gray-500">{booking.service}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="font-semibold">{booking.time}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      €{booking.price} • Slotta: €{booking.slotta}
                    </div>
                  </div>
                  <Badge variant={statusColors[booking.status]} className="min-w-[100px] justify-center">
                    {booking.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-6 mt-8">
        {[
          { label: 'Total Bookings', value: bookings.length },
          { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length },
          { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
          { label: 'No-Shows', value: bookings.filter(b => b.status === 'no-show').length },
        ].map((stat, idx) => (
          <Card key={idx} className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>
    </MasterLayout>
  );
};

export default Bookings;
