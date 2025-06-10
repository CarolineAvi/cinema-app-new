import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        birthDate: '',
        preferences: {
            notifications: true,
            newsletter: false,
            favoriteGenres: []
        }
    });
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const genreOptions = [
        'Akcja', 'Komedia', 'Dramat', 'Horror', 'Sci-Fi',
        'Fantasy', 'Thriller', 'Romans', 'Animacja', 'Dokumentalny'
    ];

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setProfileData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            birthDate: user.birthDate || '',
            preferences: {
                notifications: user.preferences?.notifications ?? true,
                newsletter: user.preferences?.newsletter ?? false,
                favoriteGenres: user.preferences?.favoriteGenres || []
            }
        });
        fetch(`http://localhost:5000/api/bookings/user/${user._id}`)
            .then(res => res.json())
            .then(setBookings);
    }, [user, navigate]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('preferences.')) {
            const prefKey = name.split('.')[1];
            setProfileData(prev => ({
                ...prev,
                preferences: {
                    ...prev.preferences,
                    [prefKey]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleGenreChange = (genre) => {
        setProfileData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                favoriteGenres: prev.preferences.favoriteGenres.includes(genre)
                    ? prev.preferences.favoriteGenres.filter(g => g !== genre)
                    : [...prev.preferences.favoriteGenres, genre]
            }
        }));
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            if (!res.ok) throw new Error('Błąd podczas zapisywania profilu.');
            const updatedUser = await res.json();
            localStorage.setItem('cinema_user', JSON.stringify(updatedUser));
            setEditMode(false);
            setMessage('Profil został zaktualizowany pomyślnie!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Wystąpił błąd podczas zapisywania profilu.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            confirmed: { text: 'Potwierdzona', class: 'status-confirmed' },
            completed: { text: 'Zakończona', class: 'status-completed' },
            cancelled: { text: 'Anulowana', class: 'status-cancelled' }
        };
        return statusMap[status] || { text: 'Nieznany', class: 'status-unknown' };
    };

    const calculateTotalSpent = () => {
        return bookings
            .filter(booking => booking.status !== 'cancelled')
            .reduce((total, booking) => total + (booking.total || booking.price || 0), 0);
    };

    if (!user) {
        return null;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <div className="user-avatar">
                        <span className="avatar-text">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="user-info">
                        <h1>Witaj, {user.name}!</h1>
                        <p className="user-role">
                            {user.role === 'admin' ? '👑 Administrator' :
                                user.role === 'staff' ? '👨‍💼 Pracownik' :
                                    '🎭 Kinoman'}
                        </p>
                    </div>
                </div>

                {message && (
                    <div className="alert alert-success">
                        {message}
                    </div>
                )}

                <div className="profile-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profil
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        🎟️ Moje Rezerwacje
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        📊 Statystyki
                    </button>
                </div>

                <div className="profile-content">
                    {activeTab === 'profile' && (
                        <div className="profile-section">
                            <div className="section-header">
                                <h2>Dane osobowe</h2>
                                <button
                                    className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? 'Anuluj' : 'Edytuj'}
                                </button>
                            </div>

                            <div className="profile-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name">Imię i nazwisko</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="phone">Telefon</label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className="form-input"
                                            placeholder="+48 123 456 789"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="birthDate">Data urodzenia</label>
                                        <input
                                            type="date"
                                            id="birthDate"
                                            name="birthDate"
                                            value={profileData.birthDate}
                                            onChange={handleInputChange}
                                            disabled={!editMode}
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="preferences-section">
                                    <h3>Preferencje</h3>

                                    <div className="checkbox-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="preferences.notifications"
                                                checked={profileData.preferences.notifications}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                            />
                                            <span>Powiadomienia o nowych filmach</span>
                                        </label>
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                name="preferences.newsletter"
                                                checked={profileData.preferences.newsletter}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                            />
                                            <span>Newsletter z promocjami</span>
                                        </label>
                                    </div>

                                    <div className="genre-preferences">
                                        <label>Ulubione gatunki:</label>
                                        <div className="genre-grid">
                                            {genreOptions.map(genre => (
                                                <label key={genre} className="genre-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={profileData.preferences.favoriteGenres.includes(genre)}
                                                        onChange={() => handleGenreChange(genre)}
                                                        disabled={!editMode}
                                                    />
                                                    <span>{genre}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {editMode && (
                                    <div className="form-actions">
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSaveProfile}
                                            disabled={loading}
                                        >
                                            {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div className="bookings-section">
                            <h2>Historia rezerwacji</h2>
                            {bookings.length === 0 ? (
                                <div className="empty-state">
                                    <p>Nie masz jeszcze żadnych rezerwacji.</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => navigate('/')}
                                    >
                                        Przeglądaj filmy
                                    </button>
                                </div>
                            ) : (
                                <div className="bookings-grid">
                                    {bookings.map(booking => {
                                        const status = getStatusBadge(booking.status);
                                        return (
                                            <div key={booking._id} className="booking-card">
                                                <div className="booking-poster">
                                                    <img src={booking.poster} alt={booking.movieTitle} />
                                                </div>
                                                <div className="booking-details">
                                                    <h3>{booking.movieTitle}</h3>
                                                    <div className="booking-info">
                                                        <span>📅 {booking.date} o {booking.time}</span>
                                                        <span>🏛️ {booking.hall}</span>
                                                        <span>💺 Miejsca: {booking.seats.join(', ')}</span>
                                                        <span>💰 {booking.total || booking.price} zł</span>
                                                    </div>
                                                    <div className="booking-meta">
                                                        <span className={`status-badge ${status.class}`}>
                                                            {status.text}
                                                        </span>
                                                        <span className="booking-date">
                                                            Zarezerwowano: {booking.bookingDate}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="stats-section">
                            <h2>Twoje statystyki</h2>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon">🎬</div>
                                    <div className="stat-value">{bookings.length}</div>
                                    <div className="stat-label">Wszystkich rezerwacji</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-value">{calculateTotalSpent()} zł</div>
                                    <div className="stat-label">Wydano łącznie</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">⭐</div>
                                    <div className="stat-value">
                                        {bookings.filter(b => b.status === 'completed').length}
                                    </div>
                                    <div className="stat-label">Obejrzanych filmów</div>
                                </div>

                                <div className="stat-card">
                                    <div className="stat-icon">📅</div>
                                    <div className="stat-value">
                                        {bookings.filter(b => b.status === 'confirmed').length}
                                    </div>
                                    <div className="stat-label">Nadchodzących seansów</div>
                                </div>
                            </div>

                            <div className="member-since">
                                <h3>🎭 Status członkostwa</h3>
                                <div className="membership-info">
                                    <p>Jesteś z nami od: <strong>Styczeń 2024</strong></p>
                                    <p>Poziom: <strong>Kinoman</strong></p>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{width: '60%'}}></div>
                                    </div>
                                    <p>Do następnego poziomu: 4 filmy</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;