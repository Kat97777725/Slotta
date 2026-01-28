import React, { useState, useEffect } from 'react';
import { MasterLayout } from './Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { walletAPI, authAPI } from '@/lib/api';
import { DollarSign, TrendingUp, ArrowDownCircle, ArrowUpCircle, Download } from 'lucide-react';

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState({
    wallet_balance: 0,
    pending_payouts: 0,
    lifetime_earnings: 0,
    transactions: []
  });
  const master = authAPI.getMaster();
  const masterId = master?.id;

  useEffect(() => {
    if (masterId) {
      loadWalletData();
    }
  }, [masterId]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getWallet(masterId);
      setWalletData(response.data);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const { wallet_balance, pending_payouts, lifetime_earnings, transactions } = walletData;

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
            <div className="text-4xl font-bold mb-2" data-testid="wallet-balance">
              €{loading ? '...' : wallet_balance}
            </div>
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
            <div className="text-4xl font-bold mb-2 text-yellow-600">
              €{loading ? '...' : pending_payouts}
            </div>
            <div className="text-gray-600">Pending Payouts</div>
            <div className="text-sm text-gray-500 mt-2">From ongoing bookings</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <ArrowUpCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-4xl font-bold mb-2 text-green-600">
              €{loading ? '...' : lifetime_earnings}
            </div>
            <div className="text-gray-600">Lifetime Earnings</div>
            <div className="text-sm text-gray-500 mt-2">Total from Slotta</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Payouts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upcoming Automatic Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          {pending_payouts > 0 ? (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <div className="font-semibold text-lg">Next Payout</div>
                <div className="text-sm text-gray-600">Processing when bookings complete</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">€{pending_payouts}</div>
                <div className="text-sm text-gray-500">Estimated</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No pending payouts</div>
          )}
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
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions yet</div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, idx) => (
                <div
                  key={transaction.id || idx}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                  data-testid={`transaction-${transaction.id || idx}`}
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
                        {transaction.type === 'payout' ? 'Payout' : 'Slotta Credit'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.description || transaction.type}
                      </div>
                      <div className="text-xs text-gray-400">
                        {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString('en-GB') : ''}
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
                      completed
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
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
