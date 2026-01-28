import React, { useState } from 'react';
import { MasterLayout } from './Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash, Shield, Clock, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([
    { id: 1, name: 'Balayage Hair Color', duration: '3 hours', price: 150, aurasync: 40, active: true, newClientsOnly: false },
    { id: 2, name: 'Women\'s Haircut & Style', duration: '1 hour', price: 60, aurasync: 18, active: true, newClientsOnly: false },
    { id: 3, name: 'Color Correction', duration: '4 hours', price: 200, aurasync: 60, active: true, newClientsOnly: true },
    { id: 4, name: 'Keratin Treatment', duration: '2.5 hours', price: 120, aurasync: 35, active: true, newClientsOnly: false },
    { id: 5, name: 'Men\'s Haircut', duration: '45 min', price: 40, aurasync: 12, active: true, newClientsOnly: false },
    { id: 6, name: 'Hair Extensions', duration: '5 hours', price: 350, aurasync: 90, active: false, newClientsOnly: true },
  ]);

  return (
    <MasterLayout active="services" title="Services & Slotta Rules">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Manage Your Services</h2>
          <p className="text-gray-600">Set prices, duration, and Slotta protection for each service</p>
        </div>
        <Button data-testid="add-service-btn">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services List */}
      <div className="space-y-4 mb-8">
        {services.map((service) => (
          <Card key={service.id} className={!service.active ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold" data-testid={`service-name-${service.id}`}>
                      {service.name}
                    </h3>
                    {!service.active && <Badge variant="default">Inactive</Badge>}
                    {service.newClientsOnly && <Badge variant="warning">New Clients Only</Badge>}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <div className="font-semibold">{service.duration}</div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-gray-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Price</span>
                      </div>
                      <div className="font-semibold text-lg">€{service.price}</div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 text-purple-600 mb-1">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">Slotta</span>
                      </div>
                      <div className="font-bold text-lg text-purple-600">€{service.aurasync}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((service.aurasync / service.price) * 100).toFixed(0)}% of price
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" data-testid={`edit-service-${service.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Slotta Rules Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>How Slotta is Calculated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Base Formula</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Short services (&lt; 1 hour)</span>
                  <span className="font-semibold">25-30% of price</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medium (1-3 hours)</span>
                  <span className="font-semibold">30-35% of price</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Long (3+ hours)</span>
                  <span className="font-semibold">35-45% of price</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Adjustments</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">New client</span>
                  <Badge variant="warning">+20%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reliable client</span>
                  <Badge variant="success">-20%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Peak slot demand</span>
                  <Badge variant="info">+15%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cancellation history</span>
                  <Badge variant="danger">+30%</Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-900">
              <strong>Note:</strong> Slotta never exceeds 70% of service price or drops below €10 for long services.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        {[
          { label: 'Active Services', value: services.filter(s => s.active).length },
          { label: 'Average Slotta', value: `€${Math.round(services.reduce((acc, s) => acc + s.aurasync, 0) / services.length)}` },
          { label: 'Total Protection', value: `€${services.reduce((acc, s) => acc + s.aurasync, 0)}` },
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

export default Services;
