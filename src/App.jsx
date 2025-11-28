import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { BookingCalendar } from './components/BookingCalendar';
import { BookingForm } from './components/BookingForm';
import { BookingList } from './components/BookingList';
import { Login } from './pages/Login';
import { Trees, LogOut } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [selectedRange, setSelectedRange] = useState();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*');
      
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
      fetchBookings();
    };
    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleBookingSuccess = () => {
    fetchBookings();
    setSelectedRange(undefined);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-canvas-default">
          {/* Header */}
          <header className="border-b border-border-default bg-canvas-default sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Trees className="h-6 w-6 sm:h-8 sm:w-8 text-fg-default" />
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-fg-default">Skogkrogen</h1>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-fg-muted hover:text-fg-default px-2 py-1"
                  title="Log ud"
                >
                  <span className="hidden sm:inline">Log ud</span>
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
              {/* Left Column: Calendar + Booking List (8 cols on desktop) */}
              <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                {/* Calendar */}
                <div className="bg-canvas-default border border-border-default rounded-lg shadow-sm overflow-hidden">
                  <div className="border-b border-border-muted px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <h2 className="text-base sm:text-lg font-semibold text-fg-default">Kalender</h2>
                  </div>
                  <div className="p-2 sm:p-4 lg:p-6 overflow-x-auto">
                    <BookingCalendar
                      bookings={bookings}
                      onSelectDate={setSelectedRange}
                      selectedRange={selectedRange}
                    />
                  </div>
                </div>

                {/* Booking Form - Show on mobile after calendar */}
                <div className="lg:hidden bg-canvas-default border border-border-default rounded-lg shadow-sm">
                  <div className="border-b border-border-muted px-3 sm:px-4 py-3 sm:py-4">
                    <h2 className="text-base sm:text-lg font-semibold text-fg-default">Ny booking</h2>
                  </div>
                  <div className="p-3 sm:p-4">
                    <BookingForm
                      selectedRange={selectedRange}
                      onSuccess={handleBookingSuccess}
                      userEmail={user.email}
                    />
                  </div>
                </div>

                {/* Booking List */}
                <div className="bg-canvas-default border border-border-default rounded-lg shadow-sm overflow-hidden">
                  <div className="border-b border-border-muted px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-canvas-subtle">
                    <h2 className="text-base sm:text-lg font-semibold text-fg-default">Bookinger</h2>
                  </div>
                  <BookingList bookings={bookings} onUpdate={fetchBookings} userEmail={user.email} />
                </div>
              </div>

              {/* Right Column: Booking Form (4 cols on desktop, hidden on mobile) */}
              <div className="hidden lg:block lg:col-span-4">
                <div className="bg-canvas-default border border-border-default rounded-lg shadow-sm sticky top-20">
                  <div className="border-b border-border-muted px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                    <h2 className="text-base sm:text-lg font-semibold text-fg-default">Ny booking</h2>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-6">
                    <BookingForm
                      selectedRange={selectedRange}
                      onSuccess={handleBookingSuccess}
                      userEmail={user.email}
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
