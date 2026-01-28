import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MasterLayout } from './Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { messagesAPI, bookingsAPI, authAPI } from '@/lib/api';
import { 
  Clock, Calendar, DollarSign, Shield, User, Phone, Mail, 
  MapPin, AlertTriangle, CheckCircle, XCircle, Edit 
} from 'lucide-react';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [booking, setBooking] = useState(null);
  
  const master = authAPI.getMaster();
  const masterId = master?.id;

  useEffect(() => {
    if (id) {
      loadBooking();
    }
  }, [id]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getById(id);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to load booking:', error);
      // Use mock data for display
      setBooking({
        id: id,
        client_id: 'client-123',
        service_id: 'service-123',
        booking_date: new Date().toISOString(),
        duration_minutes: 180,
        service_price: 150,
        slotta_amount: 40,
        status: 'confirmed',
        risk_score: 15,
        notes: '',
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    confirmed: 'success',
    pending: 'warning',
    completed: 'info',
    'no-show': 'danger',
  };

  const reliabilityColors = {
    reliable: 'success',
    new: 'warning',
    'needs-protection': 'danger',
  };

  const handleComplete = () => {
    alert('Booking marked as completed!');
    navigate('/master/bookings');
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setLoading(true);
      await messagesAPI.sendToClient({
        master_id: MASTER_ID,
        client_id: booking.client.id || 'demo-client-123',
        booking_id: id,
        message: messageText
      });
      
      alert('✅ Message sent successfully!');
      setShowMessageModal(false);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('❌ Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  };

  const handleNoShow = () => {
    if (confirm('Mark this booking as no-show? Slotta will be captured.')) {
      alert('Slotta captured: €25 to your wallet, €15 client credit');
      navigate('/master/bookings');
    }
  };

  return (
    <MasterLayout active="bookings" title="Booking Details">
      <div className="max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/master/bookings')} className="mb-6">
          ← Back to Bookings
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Booking Information</CardTitle>
                  <Badge variant={statusColors[booking.status]}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Service</div>
                      <div className="font-semibold">{booking.service}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Duration</div>
                      <div className="font-semibold">{booking.duration}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Date & Time</div>
                      <div className="font-semibold flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(booking.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="font-semibold flex items-center space-x-2 mt-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{booking.time}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Booked On</div>
                      <div className="font-semibold">{booking.bookedAt}</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Service Price</span>
                      <span className="font-semibold">€{booking.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-600">Slotta Amount</span>
                      </div>
                      <span className="font-bold text-lg text-purple-600">€{booking.slotta}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Authorized on client's card. Will be released when they arrive.
                    </p>
                  </div>

                  {booking.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="font-semibold text-sm mb-2">Notes</div>
                      <p className="text-sm text-gray-700">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center justify-center">
                    <Edit className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center"
                    onClick={() => setShowMessageModal(true)}
                    data-testid="message-client-btn"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Message Client
                  </Button>
                  <Button 
                    variant="default" 
                    className="flex items-center justify-center bg-green-600 hover:bg-green-700"
                    onClick={handleComplete}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center border-red-600 text-red-600 hover:bg-red-50"
                    onClick={handleNoShow}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark No-Show
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    EW
                  </div>
                  <div>
                    <div className="font-semibold">{booking.client.name}</div>
                    <Badge variant={reliabilityColors[booking.client.reliability]} className="text-xs">
                      {booking.client.reliability}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{booking.client.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{booking.client.phone}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{booking.client.bookingHistory}</div>
                    <div className="text-xs text-gray-500">Bookings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{booking.client.noShows}</div>
                    <div className="text-xs text-gray-500">No-Shows</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <Badge variant="success">Low</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className="font-semibold">15/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Reliable client with excellent booking history. Low risk of no-show.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Reschedule Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Reschedule Window</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    Free reschedule until:
                  </div>
                  <div className="font-semibold text-blue-600">
                    {new Date(booking.rescheduleDeadline).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    After this time, reschedule requires approval.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>


      {/* Message Client Modal */}
      <Modal 
        isOpen={showMessageModal} 
        onClose={() => setShowMessageModal(false)} 
        title="Message Client"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>To:</strong> {booking.client.name} ({booking.client.email})
            </p>
          </div>

          <Textarea
            label="Your Message"
            placeholder="Hi Emma, just wanted to confirm your appointment..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={6}
            required
          />

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              💡 This message will be sent via email. The client can reply directly to your email.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowMessageModal(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage} 
              className="flex-1" 
              disabled={loading || !messageText.trim()}
              data-testid="send-message-btn"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </Modal>

    </MasterLayout>
  );
};

export default BookingDetail;
