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
      <header className="bg-canvas-subtle border-b border-border-default">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trees className="h-8 w-8 text-fg-default" />
            <h1 className="text-xl font-semibold text-fg-default">
              Skogkrogen
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-fg-muted">Logget ind som {user.email}</span>
            <button 
              onClick={handleLogout}
              className="btn text-fg-default hover:text-danger-fg"
              title="Log ud"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Calendar (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="card">
              <div className="card-header">
                Kalender
              </div>
              <div className="p-4">
                <BookingCalendar 
                  bookings={bookings} 
                  onSelectDate={setSelectedRange} 
                  selectedRange={selectedRange} 
                />
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                Bookinger
              </div>
              <div className="p-0">
                <BookingList bookings={bookings} onUpdate={fetchBookings} userEmail={user.email} />
              </div>
            </div>
          </div>

          {/* Right Column: Booking Form (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card">
              <div className="card-header">
                Ny Booking
              </div>
              <div className="p-4">
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
