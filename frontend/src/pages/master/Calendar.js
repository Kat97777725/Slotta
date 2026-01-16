import React, { useState } from 'react';
import { MasterLayout } from './Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 15)); // Feb 15, 2025
  const [view, setView] = useState('week'); // week or day

  const bookings = [
    { id: 1, client: 'Emma Wilson', service: 'Balayage', date: '2025-02-15', start: '09:00', end: '12:00', color: 'purple' },
    { id: 2, client: 'Olivia Smith', service: 'Haircut', date: '2025-02-15', start: '11:00', end: '12:00', color: 'blue' },
    { id: 3, client: 'James Parker', service: 'Men\'s Cut', date: '2025-02-15', start: '14:30', end: '15:15', color: 'green' },
    { id: 4, client: 'Sophie Taylor', service: 'Keratin', date: '2025-02-16', start: '10:00', end: '12:30', color: 'pink' },
  ];

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <MasterLayout active="calendar" title="Calendar">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() - 7);
              setCurrentDate(newDate);
            }}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setDate(newDate.getDate() + 7);
              setCurrentDate(newDate);
            }}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button variant={view === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setView('week')}>
              Week
            </Button>
            <Button variant={view === 'day' ? 'default' : 'outline'} size="sm" onClick={() => setView('day')}>
              Day
            </Button>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Block Time
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* Week Header */}
            <div className="grid grid-cols-8 border-b bg-gray-50">
              <div className="p-4 border-r text-sm text-gray-500">Time</div>
              {weekDays.map((day, idx) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={idx}
                    className={`p-4 border-r text-center ${
                      isToday ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="text-sm text-gray-500">
                      {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-semibold ${
                      isToday ? 'text-purple-600' : ''
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-8">
              {hours.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="p-4 border-r border-b text-sm text-gray-500">
                    {hour}:00
                  </div>
                  {weekDays.map((day, dayIdx) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const dayBookings = bookings.filter(b => b.date === dateStr);
                    const hourBookings = dayBookings.filter(b => {
                      const startHour = parseInt(b.start.split(':')[0]);
                      return startHour === hour;
                    });

                    return (
                      <div
                        key={dayIdx}
                        className="border-r border-b p-2 min-h-[80px] hover:bg-gray-50 cursor-pointer relative"
                        data-testid={`slot-${dateStr}-${hour}`}
                      >
                        {hourBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className={`bg-${booking.color}-100 border-l-4 border-${booking.color}-600 rounded p-2 mb-2 text-xs`}
                          >
                            <div className="font-semibold text-${booking.color}-900">{booking.start}</div>
                            <div className="font-medium">{booking.client}</div>
                            <div className="text-gray-600">{booking.service}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6 mt-6">
        {[
          { label: 'This Week', value: '18 bookings' },
          { label: 'Available Slots', value: '42' },
          { label: 'Blocked Time', value: '6 hours' },
          { label: 'Utilization', value: '68%' },
        ].map((stat, idx) => (
          <Card key={idx} className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        ))}
      </div>
    </MasterLayout>
  );
};

export default Calendar;
