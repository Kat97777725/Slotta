import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth Pages
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Public Pages
import LandingPage from '@/pages/LandingPage';
import BookingPage from '@/pages/BookingPage';
import ClientPortal from '@/pages/ClientPortal';

// Master Dashboard Pages
import MasterDashboard from '@/pages/master/Dashboard';
import MasterBookings from '@/pages/master/Bookings';
import MasterBookingDetail from '@/pages/master/BookingDetail';
import MasterCalendar from '@/pages/master/Calendar';
import MasterServices from '@/pages/master/Services';
import MasterClients from '@/pages/master/Clients';
import MasterWallet from '@/pages/master/Wallet';
import MasterSettings from '@/pages/master/Settings';
import MasterAnalytics from '@/pages/master/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/client/portal" element={<ClientPortal />} />
        
        {/* Protected Master Dashboard Routes */}
        <Route path="/master/dashboard" element={
          <ProtectedRoute><MasterDashboard /></ProtectedRoute>
        } />
        <Route path="/master/bookings" element={
          <ProtectedRoute><MasterBookings /></ProtectedRoute>
        } />
        <Route path="/master/bookings/:id" element={
          <ProtectedRoute><MasterBookingDetail /></ProtectedRoute>
        } />
        <Route path="/master/calendar" element={
          <ProtectedRoute><MasterCalendar /></ProtectedRoute>
        } />
        <Route path="/master/services" element={
          <ProtectedRoute><MasterServices /></ProtectedRoute>
        } />
        <Route path="/master/clients" element={
          <ProtectedRoute><MasterClients /></ProtectedRoute>
        } />
        <Route path="/master/wallet" element={
          <ProtectedRoute><MasterWallet /></ProtectedRoute>
        } />
        <Route path="/master/settings" element={
          <ProtectedRoute><MasterSettings /></ProtectedRoute>
        } />
        <Route path="/master/analytics" element={
          <ProtectedRoute><MasterAnalytics /></ProtectedRoute>
        } />
        
        {/* Public Booking Page - Must be last as it catches /:mastername */}
        <Route path="/:mastername" element={<BookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
