import React from 'react';
import { MasterLayout } from './Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DollarSign, TrendingUp, ArrowDownCircle, ArrowUpCircle, Download } from 'lucide-react';

const Wallet = () => {
  const walletBalance = 840;
  const pendingPayouts = 450;
  const lifetimeEarnings = 12450;

  const transactions = [
    { id: 1, type: 'payout', amount: 520, date: '2025-02-10', status: 'completed', method: 'Bank Transfer' },
    { id: 2, type: 'credit', amount: 25, date: '2025-02-08', status: 'completed', reason: 'No-show: Sarah Johnson' },
    { id: 3, type: 'credit', amount: 35, date: '2025-02-06', status: 'completed', reason: 'No-show: Michael Chen' },
    { id: 4, type: 'payout', amount: 680, date: '2025-02-03', status: 'completed', method: 'Bank Transfer' },
    { id: 5, type: 'credit', amount: 40, date: '2025-02-01', status: 'completed', reason: 'No-show: New Client' },
    { id: 6, type: 'payout', amount: 420, date: '2025-01-27', status: 'completed', method: 'Bank Transfer' },
  ];

  const upcomingPayouts = [
    { date: '2025-02-17', amount: 450, bookings: 8 },
  ];

  return (
    <MasterLayout active="wallet" title="Wallet & Payouts">
      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8" />
              <Badge variant="success">Available</Badge>
            </div>
            <div className="text-4xl font-bold mb-2" data-testid="wallet-balance">€{walletBalance}</div>
            <div className="text-purple-100">Current Balance</div>
            <Button className="w-full mt-4 bg-white text-purple-600 hover:bg-gray-100" data-testid="payout-now-btn">
              Request Payout
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-4xl font-bold mb-2 text-yellow-600">€{pendingPayouts}</div>
            <div className="text-gray-600">Pending Payouts</div>
            <div className="text-sm text-gray-500 mt-2">From ongoing bookings</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <ArrowUpCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-4xl font-bold mb-2 text-green-600">€{lifetimeEarnings}</div>
            <div className="text-gray-600">Lifetime Earnings</div>
            <div className="text-sm text-gray-500 mt-2">Total from AuraSync</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payouts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upcoming Automatic Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingPayouts.map((payout, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="font-semibold text-lg">Next Payout</div>
                <div className="text-sm text-gray-600">
                  {new Date(payout.date).toLocaleDateString('en-GB', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-1">From {payout.bookings} completed bookings</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">€{payout.amount}</div>
                <div className="text-sm text-gray-500">Estimated</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                data-testid={`transaction-${transaction.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'payout' 
                      ? 'bg-red-100' 
                      : 'bg-green-100'
                  }`}>
                    {transaction.type === 'payout' ? (
                      <ArrowDownCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {transaction.type === 'payout' ? 'Payout' : 'AuraSync Credit'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.reason || transaction.method}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(transaction.date).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    transaction.type === 'payout' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'payout' ? '-' : '+'}€{transaction.amount}
                  </div>
                  <Badge variant="success" className="text-xs">
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payout Settings */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Payout Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-semibold">Payout Method</div>
                <div className="text-sm text-gray-600">Bank Transfer (Stripe Connect)</div>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-semibold">Payout Schedule</div>
                <div className="text-sm text-gray-600">Weekly (Every Saturday)</div>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-semibold">Minimum Payout</div>
                <div className="text-sm text-gray-600">€50 (can request instantly above this)</div>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MasterLayout>
  );
};

export default Wallet;
