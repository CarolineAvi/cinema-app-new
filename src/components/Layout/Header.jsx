import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    🎬 CinemaApp
                </Link>

                <nav className="nav">
                    <Link to="/" className="nav-link">Strona Główna</Link>

                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="nav-link">Panel Admin</Link>
                            )}
                            {user.role === 'staff' && (
                                <Link to="/staff" className="nav-link">Panel Pracownika</Link>
                            )}
                            {user.role === 'customer' && (
                                <Link to="/profile" className="nav-link">Mój Profil</Link>
                            )}
                            <button onClick={handleLogout} className="logout-btn">
                                Wyloguj ({user.email})
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-link">Zaloguj się</Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;