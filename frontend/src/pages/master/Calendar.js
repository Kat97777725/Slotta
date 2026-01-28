import React, { useState, useEffect } from 'react';
import { MasterLayout } from './Dashboard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { calendarAPI, bookingsAPI, authAPI } from '@/lib/api';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const master = authAPI.getMaster();
  const masterId = master?.id;
  
  const [blockForm, setBlockForm] = useState({
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    reason: ''
  });

  useEffect(() => {
    if (masterId) {
      loadCalendarData();
    }
  }, [masterId, currentDate]);

  const loadCalendarData = async () => {
    try {
      const [bookingsRes, blocksRes] = await Promise.all([
        bookingsAPI.getByMaster(masterId),
        calendarAPI.getBlocksByMaster(masterId)
      ]);
      setBookings(bookingsRes.data || []);
      setBlocks(blocksRes.data || []);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  };

  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const handleBlockTime = async () => {
    try {
      setLoading(true);
      const startDateTime = new Date(`${blockForm.date}T${blockForm.start_time}:00`);
      const endDateTime = new Date(`${blockForm.date}T${blockForm.end_time}:00`);
      
      await calendarAPI.createBlock({
        master_id: masterId,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        reason: blockForm.reason
      });
      
      alert('✅ Time blocked successfully!');
      setShowBlockModal(false);
      setBlockForm({ date: '', start_time: '09:00', end_time: '17:00', reason: '' });
      loadCalendarData(); // Refresh data
    } catch (error) {
      console.error('Failed to block time:', error);
      alert('❌ Failed to block time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MasterLayout active="calendar" title="Calendar">
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
            {currentDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <Button size="sm" onClick={() => setShowBlockModal(true)} data-testid="block-time-btn">
          <Plus className="w-4 h-4 mr-2" />
          Block Time
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 border-b bg-gray-50">
              <div className="p-4 border-r text-sm text-gray-500">Time</div>
              {weekDays.map((day, idx) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div key={idx} className={`p-4 border-r text-center ${isToday ? 'bg-purple-50' : ''}`}>
                    <div className="text-sm text-gray-500">
                      {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg font-semibold ${isToday ? 'text-purple-600' : ''}`}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-8">
              {hours.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="p-4 border-r border-b text-sm text-gray-500">{hour}:00</div>
                  {weekDays.map((day, dayIdx) => {
                    const dateStr = day.toISOString().split('T')[0];
                    const dayBookings = bookings.filter(b => b.date === dateStr);
                    const hourBookings = dayBookings.filter(b => {
                      const startHour = parseInt(b.start.split(':')[0]);
                      return startHour === hour;
                    });

                    return (
                      <div key={dayIdx} className="border-r border-b p-2 min-h-[80px] hover:bg-gray-50 cursor-pointer relative" data-testid={`slot-${dateStr}-${hour}`}>
                        {hourBookings.map((booking) => (
                          <div key={booking.id} className={`bg-${booking.color}-100 border-l-4 border-${booking.color}-600 rounded p-2 mb-2 text-xs`}>
                            <div className="font-semibold">{booking.start}</div>
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

      {/* Block Time Modal */}
      <Modal isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} title="Block Time">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Block time on your calendar to prevent bookings during specific periods.</p>
          
          <Input
            label="Date"
            type="date"
            value={blockForm.date}
            onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={blockForm.start_time}
              onChange={(e) => setBlockForm({ ...blockForm, start_time: e.target.value })}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={blockForm.end_time}
              onChange={(e) => setBlockForm({ ...blockForm, end_time: e.target.value })}
              required
            />
          </div>

          <Input
            label="Reason (optional)"
            placeholder="e.g., Lunch break, Personal appointment"
            value={blockForm.reason}
            onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
          />

          <div className="flex space-x-4 pt-4">
            <Button variant="outline" onClick={() => setShowBlockModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleBlockTime} className="flex-1" disabled={loading || !blockForm.date} data-testid="submit-block-time">
              {loading ? 'Blocking...' : 'Block Time'}
            </Button>
          </div>
        </div>
      </Modal>

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
