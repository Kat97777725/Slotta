import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterLayout } from './Dashboard';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Search, Filter } from 'lucide-react';

const Bookings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const bookings = [
    { id: 1, client: 'Emma Wilson', service: 'Balayage', date: '2025-02-15', time: '09:00', price: 150, slotta: 40, status: 'confirmed' },
    { id: 2, client: 'Olivia Smith', service: 'Haircut & Style', date: '2025-02-15', time: '11:00', price: 60, slotta: 18, status: 'confirmed' },
    { id: 3, client: 'James Parker', service: 'Men\'s Cut', date: '2025-02-15', time: '14:30', price: 40, slotta: 12, status: 'pending' },
    { id: 4, client: 'Sophie Taylor', service: 'Keratin Treatment', date: '2025-02-16', time: '10:00', price: 120, slotta: 35, status: 'confirmed' },
    { id: 5, client: 'New Client', service: 'Color Correction', date: '2025-02-16', time: '14:00', price: 200, slotta: 60, status: 'pending' },
    { id: 6, client: 'Lucy Brown', service: 'Balayage', date: '2025-02-12', time: '15:00', price: 150, slotta: 40, status: 'completed' },
    { id: 7, client: 'Michael Chen', service: 'Men\'s Cut', date: '2025-02-11', time: '10:30', price: 40, slotta: 12, status: 'completed' },
    { id: 8, client: 'Sarah Johnson', service: 'Color Correction', date: '2025-02-10', time: '13:00', price: 200, slotta: 60, status: 'no-show' },
  ];

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
