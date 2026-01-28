import React from 'react';
import { MasterLayout } from './Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TrendingUp, TrendingDown, Shield, Clock, DollarSign, Users, AlertTriangle } from 'lucide-react';

const Analytics = () => {
  const stats = [
    { label: 'Time Protected', value: '€2,450', change: '+12%', trend: 'up', icon: Shield },
    { label: 'No-Shows Avoided', value: '12', change: '-3', trend: 'down', icon: AlertTriangle },
    { label: 'Avg Slotta', value: '€35', change: '+€5', trend: 'up', icon: DollarSign },
    { label: 'Active Clients', value: '48', change: '+8', trend: 'up', icon: Users },
  ];

  const monthlyData = [
    { month: 'Sep', protected: 1850, noShows: 8 },
    { month: 'Oct', protected: 2100, noShows: 6 },
    { month: 'Nov', protected: 2250, noShows: 9 },
    { month: 'Dec', protected: 2400, noShows: 7 },
    { month: 'Jan', protected: 2350, noShows: 5 },
    { month: 'Feb', protected: 2450, noShows: 4 },
  ];

  const slotDemand = [
    { time: '9-11 AM', demand: 'high', bookings: 42 },
    { time: '11-1 PM', demand: 'medium', bookings: 28 },
    { time: '1-3 PM', demand: 'low', bookings: 15 },
    { time: '3-5 PM', demand: 'high', bookings: 38 },
    { time: '5-7 PM', demand: 'medium', bookings: 25 },
  ];

  const reliabilityDist = [
    { category: 'Reliable', count: 32, percentage: 67 },
    { category: 'New', count: 12, percentage: 25 },
    { category: 'Needs Protection', count: 4, percentage: 8 },
  ];

  return (
    <MasterLayout active="analytics" title="Analytics">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-purple-600" />
                <Badge variant={stat.trend === 'up' ? 'success' : 'warning'}>
                  {stat.change}
                </Badge>
              </div>
              <div className="text-3xl font-bold mb-1" data-testid={`stat-${idx}`}>{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart: Time Protected Over Time */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Time Protected (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end space-x-4">
            {monthlyData.map((data, idx) => {
              const maxValue = Math.max(...monthlyData.map(d => d.protected));
              const height = (data.protected / maxValue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: '200px' }}>
                    <div className="text-xs font-semibold text-purple-600 mb-2">€{data.protected}</div>
                    <div 
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                  <div className="text-sm font-medium text-gray-600 mt-3">{data.month}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Slot Demand Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Booking Times</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {slotDemand.map((slot, idx) => {
                const demandColors = {
                  high: 'bg-red-500',
                  medium: 'bg-yellow-500',
                  low: 'bg-green-500',
                };
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{slot.time}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={slot.demand === 'high' ? 'danger' : slot.demand === 'medium' ? 'warning' : 'success'}>
                          {slot.demand}
                        </Badge>
                        <span className="text-sm text-gray-600">{slot.bookings} bookings</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${demandColors[slot.demand]}`}
                        style={{ width: `${(slot.bookings / 42) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Insight:</strong> 9-11 AM and 3-5 PM slots have highest demand. Consider increasing Slotta for these peak times.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Client Reliability Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Client Reliability Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reliabilityDist.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-sm text-gray-600">{item.count} clients</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-8 flex items-center">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      style={{ width: `${item.percentage}%` }}
                    >
                      {item.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>Great news!</strong> 67% of your clients are reliable, reducing your overall risk.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No-Show Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>No-Show Prevention Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
              <div className="text-sm text-gray-600">No-Shows Last Month</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">€300</div>
              <div className="text-sm text-gray-600">Recovered from No-Shows</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">36 hrs</div>
              <div className="text-sm text-gray-600">Time Protected</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 mb-2">4.8%</div>
              <div className="text-sm text-gray-600">No-Show Rate</div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Industry Comparison:</strong> Average no-show rate in beauty industry is 15-20%. 
              Your rate of 4.8% shows Slotta is working effectively!
            </p>
          </div>
        </CardContent>
      </Card>
    </MasterLayout>
  );
};

export default Analytics;
