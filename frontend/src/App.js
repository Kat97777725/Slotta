import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';

// Pages
import LandingPage from '@/pages/LandingPage';
import BookingPage from '@/pages/BookingPage';
import MasterDashboard from '@/pages/master/Dashboard';
import MasterBookings from '@/pages/master/Bookings';
import MasterBookingDetail from '@/pages/master/BookingDetail';
import MasterCalendar from '@/pages/master/Calendar';
import MasterServices from '@/pages/master/Services';
import MasterClients from '@/pages/master/Clients';
import MasterWallet from '@/pages/master/Wallet';
import MasterSettings from '@/pages/master/Settings';
import MasterAnalytics from '@/pages/master/Analytics';
import ClientPortal from '@/pages/ClientPortal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:mastername" element={<BookingPage />} />
        <Route path="/master/dashboard" element={<MasterDashboard />} />
        <Route path="/master/bookings" element={<MasterBookings />} />
        <Route path="/master/bookings/:id" element={<MasterBookingDetail />} />
        <Route path="/master/calendar" element={<MasterCalendar />} />
        <Route path="/master/services" element={<MasterServices />} />
        <Route path="/master/clients" element={<MasterClients />} />
        <Route path="/master/wallet" element={<MasterWallet />} />
        <Route path="/master/settings" element={<MasterSettings />} />
        <Route path="/master/analytics" element={<MasterAnalytics />} />
        <Route path="/client/portal" element={<ClientPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
