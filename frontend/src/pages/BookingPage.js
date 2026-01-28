import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, MapPin, Star, Shield, CheckCircle, Calendar, Info } from 'lucide-react';

const BookingPage = () => {
  const { mastername } = useParams();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  // Mock master data
  const master = {
    name: 'Sophia Brown',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    specialty: 'Hair Stylist & Colorist',
    rating: 4.9,
    reviews: 127,
    location: 'London, UK',
    bio: 'Specializing in balayage, color correction, and precision cuts. 10+ years experience.',
  };

  const services = [
    { id: 1, name: 'Balayage Hair Color', duration: '3 hours', price: 150, timehold: 40 },
    { id: 2, name: 'Women\'s Haircut & Style', duration: '1 hour', price: 60, timehold: 18 },
    { id: 3, name: 'Color Correction', duration: '4 hours', price: 200, timehold: 60 },
    { id: 4, name: 'Keratin Treatment', duration: '2.5 hours', price: 120, timehold: 35 },
    { id: 5, name: 'Men\'s Haircut', duration: '45 min', price: 40, timehold: 12 },
  ];

  const timeSlots = [
    { date: '2025-02-15', slots: ['09:00', '10:30', '14:00', '16:30'] },
    { date: '2025-02-16', slots: ['09:00', '11:00', '13:30', '15:00'] },
    { date: '2025-02-17', slots: ['10:00', '14:00', '16:00'] },
  ];

  const handleBooking = () => {
    if (!selectedService || !selectedSlot) return;
    setShowPayment(true);
  };

  const handlePaymentAuth = () => {
    // Simulate payment authorization
    setTimeout(() => {
      setBookingComplete(true);
    }, 1000);
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4" data-testid="booking-confirmed-title">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            You're all set! A confirmation has been sent to your email.
          </p>
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Service</span>
              <span className="font-semibold">{services.find(s => s.id === selectedService)?.name}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-semibold">{selectedSlot}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-gray-600">With</span>
              <span className="font-semibold">{master.name}</span>
            </div>
            <div className="flex justify-between pt-3 border-t">
              <span className="text-gray-600">AuraSync Amount</span>
              <span className="font-semibold text-purple-600">
                €{services.find(s => s.id === selectedService)?.timehold} (held, not charged)
              </span>
            </div>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button className="flex-1" onClick={() => navigate('/client/portal')}>
              View My Bookings
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showPayment) {
    const service = services.find(s => s.id === selectedService);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6" data-testid="payment-title">Authorize Payment</h2>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-3 mb-4">
                <Shield className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">How AuraSync Works</h3>
                  <p className="text-sm text-purple-700 leading-relaxed">
                    We'll authorize <strong>€{service?.timehold}</strong> on your card to protect {master.name}'s time.
                    This amount is <strong>held, not charged</strong>. If you show up, it's released immediately.
                    If you can't make it, please reschedule before the deadline to avoid charges.
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold">{service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{service?.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-semibold">{selectedSlot}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-600">Full Price</span>
                  <span className="text-lg font-bold">€{service?.price}</span>
                </div>
                <div className="flex justify-between text-purple-600">
                  <span className="font-medium">AuraSync Amount</span>
                  <span className="text-lg font-bold">€{service?.timehold}</span>
                </div>
                <p className="text-xs text-gray-500 pt-2">
                  Full payment of €{service?.price} due at appointment. AuraSync released when you arrive.
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-4">Payment Information</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Card Number"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowPayment(false)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handlePaymentAuth} data-testid="authorize-payment-btn">
                Authorize €{service?.timehold}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AuraSync
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Master Profile */}
        <Card className="mb-8 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img src={master.photo} alt={master.name} className="w-full h-64 md:h-full object-cover" />
            </div>
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold mb-2" data-testid="master-name">{master.name}</h1>
              <p className="text-purple-600 font-medium mb-4">{master.specialty}</p>
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{master.rating}</span>
                  <span className="text-gray-500">({master.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{master.location}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{master.bio}</p>
              <Badge variant="purple">
                <Shield className="w-3 h-3 mr-1" />
                AuraSync Protected
              </Badge>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Services */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold mb-4" data-testid="services-title">Select a Service</h2>
            {services.map((service) => (
              <Card
                key={service.id}
                className={`p-6 cursor-pointer transition ${
                  selectedService === service.id
                    ? 'ring-2 ring-purple-600 bg-purple-50'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedService(service.id)}
                data-testid={`service-${service.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{service.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration}</span>
                      </div>
                      <div className="font-semibold text-lg text-gray-900">€{service.price}</div>
                    </div>
                    <div className="inline-flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
                      <Shield className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700">
                        AuraSync: €{service.timehold}
                      </span>
                    </div>
                  </div>
                  {selectedService === service.id && (
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  )}
                </div>
              </Card>
            ))}

            {/* Time Slots */}
            {selectedService && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4" data-testid="timeslots-title">Select Date & Time</h2>
                {timeSlots.map((day, idx) => (
                  <Card key={idx} className="p-6 mb-4">
                    <h3 className="font-semibold mb-3">
                      {new Date(day.date).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      {day.slots.map((slot) => {
                        const slotKey = `${day.date} ${slot}`;
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slotKey)}
                            className={`px-4 py-2 rounded-lg border transition ${
                              selectedSlot === slotKey
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'border-gray-300 hover:border-purple-600'
                            }`}
                            data-testid={`slot-${slotKey}`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="p-6 sticky top-6">
              <h3 className="font-semibold mb-4">Booking Summary</h3>
              {!selectedService ? (
                <p className="text-gray-500 text-sm">Select a service to continue</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Service</div>
                    <div className="font-semibold">
                      {services.find(s => s.id === selectedService)?.name}
                    </div>
                  </div>
                  {selectedSlot && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Date & Time</div>
                      <div className="font-semibold">{selectedSlot}</div>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Price</span>
                      <span className="font-semibold">
                        €{services.find(s => s.id === selectedService)?.price}
                      </span>
                    </div>
                    <div className="flex justify-between text-purple-600">
                      <span className="font-medium">AuraSync</span>
                      <span className="font-bold">
                        €{services.find(s => s.id === selectedService)?.timehold}
                      </span>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-purple-700">
                        Only AuraSync amount will be authorized. Released when you arrive.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    disabled={!selectedService || !selectedSlot}
                    onClick={handleBooking}
                    data-testid="continue-booking-btn"
                  >
                    Continue to Payment
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
