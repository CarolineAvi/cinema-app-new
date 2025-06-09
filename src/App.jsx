import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Header from './components/Layout/Header.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Header />
                    <main>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/booking/:showtimeId" element={<BookingPage />} />
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/staff" element={<StaffPage />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;