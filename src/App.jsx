import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Header from './components/Layout/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import MovieDetailsPage from './pages/MovieDetailsPage.jsx';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    
    if (!user) return <Navigate to="/login" />;
    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'admin') return <Navigate to="/admin" />;
      if (user.role === 'staff') return <Navigate to="/staff" />;
      return <Navigate to="/" />;
    }
    
    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Header />
                    <main>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/movies/:id" element={<MovieDetailsPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/profile" element={
                                <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                                    <ProfilePage />
                                </ProtectedRoute>
                            } />
                            <Route path="/booking/:showtimeId" element={
                                <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                                    <BookingPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin" element={
                                <ProtectedRoute allowedRoles={['admin']}>
                                    <AdminPage />
                                </ProtectedRoute>
                            } />
                            <Route path="/staff" element={
                                <ProtectedRoute allowedRoles={['staff']}>
                                    <StaffPage />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;