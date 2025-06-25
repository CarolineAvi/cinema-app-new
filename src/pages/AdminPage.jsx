import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

const AdminPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // State dla różnych sekcji
    const [movies, setMovies] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [halls, setHalls] = useState([]);
    const [stats, setStats] = useState({});

    // State dla formularzy
    const [newMovie, setNewMovie] = useState({
        title: '',
        duration: '',
        description: '',
        genre: '',
        year: '',
        director: '',
        rating: '',
        poster: ''
    });

    const [newShowtime, setNewShowtime] = useState({
        movieId: '',
        date: '',
        time: '',
        hallId: '',
        price: ''
    });

    // State for new hall
    const [newHall, setNewHall] = useState({
        name: '',
        capacity: '',
        rows: '',
        seatsPerRow: '',
        status: 'active'
    });
    const [editingHall, setEditingHall] = useState(null);

    // State for new staff
    const [newStaff, setNewStaff] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });

    useEffect(() => {
        // Sprawdź uprawnienia
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        // Załaduj dane
        fetch('http://localhost:5000/api/movies')
            .then(res => res.json())
            .then(setMovies);
        fetch('http://localhost:5000/api/showtimes')
            .then(res => res.json())
            .then(setShowtimes);
        fetch('http://localhost:5000/api/bookings')
            .then(res => res.json())
            .then(setBookings);
        fetch('http://localhost:5000/api/users')
            .then(res => res.json())
            .then(setUsers);
        fetch('http://localhost:5000/api/halls')
            .then(res => res.json())
            .then(setHalls);
    }, [user, navigate]);

    useEffect(() => {
        // Oblicz statystyki tylko gdy dane są załadowane
        if (!movies.length || !bookings.length || !showtimes.length || !users.length) return;
        const today = new Date().toISOString().split('T')[0];
        const totalRevenue = bookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + b.total, 0);

        const todayBookings = bookings.filter(b => b.bookingDate === today);

        setStats({
            totalMovies: movies.length,
            totalBookings: bookings.filter(b => b.status === 'confirmed').length,
            totalRevenue,
            todayBookings: todayBookings.length,
            todayRevenue: todayBookings.reduce((sum, b) => sum + b.total, 0),
            activeUsers: users.filter(u => u.role === 'customer').length,
            occupancyRate: showtimes.reduce((sum, s) => sum + s.totalSeats, 0) > 0 ? Math.round((showtimes.reduce((sum, s) => sum + s.soldTickets, 0) / showtimes.reduce((sum, s) => sum + s.totalSeats, 0)) * 100) : 0
        });
    }, [movies, bookings, showtimes, users]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    // Zarządzanie filmami
    const handleAddMovie = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newMovie,
                    duration: newMovie.duration ? parseInt(newMovie.duration) : 0,
                    year: newMovie.year ? parseInt(newMovie.year) : 0,
                    rating: newMovie.rating ? parseFloat(newMovie.rating) : 0
                })
            });
            if (!res.ok) throw new Error('Błąd podczas dodawania filmu');
            const movie = await res.json();
            setMovies([...movies, movie]);
            setNewMovie({
                title: '', duration: '', description: '', genre: '', year: '', director: '', rating: '', poster: ''
            });
            showMessage('Film został dodany pomyślnie!');
        } catch (error) {
            showMessage('Wystąpił błąd podczas dodawania filmu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMovie = async (movieId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten film?')) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/movies/${movieId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Błąd podczas usuwania filmu');
            setMovies(movies.filter(m => m._id !== movieId));
            showMessage('Film został usunięty.');
        } catch (error) {
            showMessage('Wystąpił błąd podczas usuwania filmu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Zarządzanie seansami
    const handleAddShowtime = async (e) => {
        e.preventDefault();
        if (!user || !user.token) {
            showMessage('Brak ważnego tokena uwierzytelniającego. Zaloguj się ponownie.', 'error');
            return;
        }
        setLoading(true);
        try {
            const selectedMovie = movies.find(m => m._id === newShowtime.movieId);
            const selectedHall = halls.find(h => h._id === newShowtime.hallId);
            const totalSeats = selectedHall
                ? (selectedHall.seatingLayout?.rows || 0) * (selectedHall.seatingLayout?.seatsPerRow || 0)
                : 0;

            const res = await fetch('http://localhost:5000/api/showtimes', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    movieId: newShowtime.movieId,
                    movieTitle: selectedMovie?.title,
                    hallId: newShowtime.hallId,
                    hall: selectedHall?.name,
                    date: newShowtime.date,
                    time: newShowtime.time,
                    price: parseInt(newShowtime.price),
                    totalSeats,
                    soldTickets: 0,
                    poster: selectedMovie?.poster
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Błąd podczas dodawania seansu');
            }
            const showtime = await res.json();
            setShowtimes([...showtimes, showtime]);
            setNewShowtime({ movieId: '', date: '', time: '', hallId: '', price: '' });
            showMessage('Seans został dodany pomyślnie!');
        } catch (error) {
            showMessage(error.message || 'Wystąpił błąd podczas dodawania seansu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteShowtime = async (showtimeId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten seans?')) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/showtimes/${showtimeId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Błąd podczas usuwania seansu');
            setShowtimes(showtimes.filter(s => s._id !== showtimeId));
            showMessage('Seans został usunięty.');
        } catch (error) {
            showMessage('Wystąpił błąd podczas usuwania seansu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Zarządzanie rezerwacjami
    const handleUpdateBookingStatus = async (bookingId, newStatus) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error('Błąd podczas zmiany statusu rezerwacji');
            const updated = await res.json();
            setBookings(bookings.map(b => b._id === bookingId ? updated : b));
            showMessage(`Status rezerwacji został zmieniony na "${newStatus}".`);
        } catch (error) {
            showMessage('Wystąpił błąd podczas zmiany statusu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            confirmed: { text: 'Potwierdzona', class: 'status-confirmed' },
            cancelled: { text: 'Anulowana', class: 'status-cancelled' },
            completed: { text: 'Zakończona', class: 'status-completed' }
        };
        return statusMap[status] || { text: 'Nieznany', class: 'status-unknown' };
    };

    // Hall CRUD handlers
    const handleAddHall = async (e) => {
        e.preventDefault();
        if (!user || !user.token) {
            showMessage('Brak ważnego tokena uwierzytelniającego. Zaloguj się ponownie.', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/halls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify({
                    name: newHall.name,
                    capacity: newHall.capacity ? parseInt(newHall.capacity) : 0,
                    status: newHall.status,
                    seatingLayout: {
                        rows: newHall.rows ? parseInt(newHall.rows) : 0,
                        seatsPerRow: newHall.seatsPerRow ? parseInt(newHall.seatsPerRow) : 0
                    }
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Błąd podczas dodawania sali');
            }
            const hall = await res.json();
            setHalls([...halls, hall]);
            setNewHall({ name: '', capacity: '', rows: '', seatsPerRow: '', status: 'active' });
            showMessage('Sala została dodana!');
        } catch (error) {
            showMessage(error.message || 'Wystąpił błąd podczas dodawania sali.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHall = async (hallId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tę salę?')) return;
        if (!user || !user.token) {
            showMessage('Brak ważnego tokena uwierzytelniającego. Zaloguj się ponownie.', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/halls/${hallId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Błąd podczas usuwania sali');
            }
            setHalls(halls.filter(h => h._id !== hallId));
            showMessage('Sala została usunięta.');
        } catch (error) {
            showMessage(error.message || 'Wystąpił błąd podczas usuwania sali.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditHall = (hall) => {
        setEditingHall(hall);
    };

    const handleUpdateHall = async (e) => {
        e.preventDefault();
        if (!user || !user.token) {
            showMessage('Brak ważnego tokena uwierzytelniającego. Zaloguj się ponownie.', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/halls/${editingHall._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
                body: JSON.stringify({
                    name: editingHall.name,
                    capacity: editingHall.capacity ? parseInt(editingHall.capacity) : 0,
                    status: editingHall.status,
                    seatingLayout: {
                        rows: editingHall.seatingLayout.rows ? parseInt(editingHall.seatingLayout.rows) : 0,
                        seatsPerRow: editingHall.seatingLayout.seatsPerRow ? parseInt(editingHall.seatingLayout.seatsPerRow) : 0
                    }
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Błąd podczas edycji sali');
            }
            const updated = await res.json();
            setHalls(halls.map(h => h._id === updated._id ? updated : h));
            setEditingHall(null);
            showMessage('Sala została zaktualizowana!');
        } catch (error) {
            showMessage(error.message || 'Wystąpił błąd podczas edycji sali.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMovieClick = (movieId) => {
        navigate(`/movies/${movieId}`);
    };

    // Add staff management tab
    const handleAddStaff = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...newStaff,
                    role: 'staff',
                    accessLevel: 2
                })
            });
            if (!res.ok) throw new Error('Błąd podczas dodawania pracownika');
            const data = await res.json();
            setUsers([...users, data.user]);
            setNewStaff({ name: '', email: '', password: '', phone: '' });
            showMessage('Pracownik został dodany pomyślnie!');
        } catch (error) {
            showMessage('Wystąpił błąd podczas dodawania pracownika.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć tego użytkownika?')) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Błąd podczas usuwania użytkownika');
            }
            setUsers(users.filter(u => u._id !== userId));
            showMessage('Użytkownik został usunięty.');
        } catch (error) {
            showMessage(error.message || 'Wystąpił błąd podczas usuwania użytkownika.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="admin-page">
            <div className="admin-container">
                <div className="admin-header">
                    <h1>👑 Panel Administratora</h1>
                    <p>Zarządzaj całym systemem kinowym</p>
                </div>

                {message && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('movies')}
                    >
                        🎬 Filmy
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'showtimes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('showtimes')}
                    >
                        🕐 Seanse
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        🎟️ Rezerwacje
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        👥 Użytkownicy
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'halls' ? 'active' : ''}`}
                        onClick={() => setActiveTab('halls')}
                    >
                        🏛️ Sale
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                        onClick={() => setActiveTab('staff')}
                    >
                        👥 Pracownicy
                    </button>
                </div>

                <div className="admin-content">
                    {/* Dashboard */}
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-section">
                            <h2>Statystyki ogólne</h2>

                            <div className="stats-grid">
                                <div className="stat-card revenue">
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-value">{stats.totalRevenue?.toLocaleString('pl-PL')} zł</div>
                                    <div className="stat-label">Łączne przychody</div>
                                    <div className="stat-change">+{stats.todayRevenue} zł dzisiaj</div>
                                </div>

                                <div className="stat-card bookings">
                                    <div className="stat-icon">🎟️</div>
                                    <div className="stat-value">{stats.totalBookings}</div>
                                    <div className="stat-label">Łączne rezerwacje</div>
                                    <div className="stat-change">+{stats.todayBookings} dzisiaj</div>
                                </div>

                                <div className="stat-card movies">
                                    <div className="stat-icon">🎬</div>
                                    <div className="stat-value">{stats.totalMovies}</div>
                                    <div className="stat-label">Aktywne filmy</div>
                                    <div className="stat-change">w repertuarze</div>
                                </div>

                                <div className="stat-card users">
                                    <div className="stat-icon">👥</div>
                                    <div className="stat-value">{stats.activeUsers}</div>
                                    <div className="stat-label">Zarejestrowani klienci</div>
                                    <div className="stat-change">aktywni użytkownicy</div>
                                </div>
                            </div>

                            <div className="dashboard-charts">
                                <div className="chart-card">
                                    <h3>Wypełnienie sal</h3>
                                    <div className="occupancy-chart">
                                        <div className="occupancy-bar">
                                            <div className="occupancy-fill" style={{width: `${stats.occupancyRate}%`}}></div>
                                        </div>
                                        <div className="occupancy-text">{stats.occupancyRate}% średnie wypełnienie</div>
                                    </div>
                                </div>

                                <div className="chart-card">
                                    <h3>Najpopularniejsze filmy</h3>
                                    <div className="popular-movies">
                                        {[...movies]
                                            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                                            .slice(0, 3)
                                            .map((movie, index) => (
                                            <div key={movie._id} className="popular-movie">
                                                <span className="movie-rank">#{index + 1}</span>
                                                <span className="movie-title">{movie.title}</span>
                                                <span className="movie-rating">⭐ {movie.rating}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="recent-activity">
                                <h3>Ostatnia aktywność</h3>
                                <div className="activity-list">
                                    {/* Recent bookings */}
                                    {bookings.length > 0 && bookings
                                        .slice()
                                        .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
                                        .slice(0, 3)
                                        .map((booking) => (
                                            <div className="activity-item" key={booking._id}>
                                                <span className="activity-icon">🎟️</span>
                                                <span className="activity-text">
                                                    Nowa rezerwacja: {booking.customerName || '-'} - {booking.movieTitle || '-'}
                                                </span>
                                                <span className="activity-time">
                                                    {booking.bookingDate || booking.date || '-'}
                                                </span>
                                            </div>
                                        ))
                                    }
                                    {/* Recent users */}
                                    {users.length > 0 && users
                                        .slice()
                                        .sort((a, b) => new Date(b.createdAt || b.joinDate) - new Date(a.createdAt || a.joinDate))
                                        .slice(0, 1)
                                        .map((user) => (
                                            <div className="activity-item" key={user._id}>
                                                <span className="activity-icon">👤</span>
                                                <span className="activity-text">
                                                    Nowy użytkownik: {user.email}
                                                </span>
                                                <span className="activity-time">
                                                    {user.joinDate || '-'}
                                                </span>
                                            </div>
                                        ))
                                    }
                                    {/* Recent showtimes */}
                                    {showtimes.length > 0 && showtimes
                                        .slice()
                                        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                                        .slice(0, 1)
                                        .map((showtime) => (
                                            <div className="activity-item" key={showtime._id}>
                                                <span className="activity-icon">🎬</span>
                                                <span className="activity-text">
                                                    Dodano nowy seans: {movies.find(m => m._id === showtime.movieId)?.title || '-'} - {showtime.time}
                                                </span>
                                                <span className="activity-time">
                                                    {showtime.date || '-'}
                                                </span>
                                            </div>
                                        ))
                                    }
                                    {/* If no activity */}
                                    {bookings.length === 0 && users.length === 0 && showtimes.length === 0 && (
                                        <div className="activity-item">
                                            <span className="activity-text">Brak aktywności</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filmy */}
                    {activeTab === 'movies' && (
                        <div className="movies-section">
                            <div className="section-header">
                                <h2>Zarządzanie filmami</h2>
                            </div>

                            <div className="add-movie-form">
                                <h3>Dodaj nowy film</h3>
                                <form onSubmit={handleAddMovie}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Tytuł filmu</label>
                                            <input
                                                type="text"
                                                value={newMovie.title}
                                                onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Czas trwania (min)</label>
                                            <input
                                                type="number"
                                                value={newMovie.duration}
                                                onChange={(e) => setNewMovie({...newMovie, duration: parseInt(e.target.value)})}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Gatunek</label>
                                            <input
                                                type="text"
                                                value={newMovie.genre}
                                                onChange={(e) => setNewMovie({...newMovie, genre: e.target.value})}
                                                required
                                                className="form-input"
                                                placeholder="np. Akcja, Sci-Fi"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Rok produkcji</label>
                                            <input
                                                type="number"
                                                value={newMovie.year}
                                                onChange={(e) => setNewMovie({...newMovie, year: parseInt(e.target.value)})}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Reżyser</label>
                                            <input
                                                type="text"
                                                value={newMovie.director}
                                                onChange={(e) => setNewMovie({...newMovie, director: e.target.value})}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Ocena (1-10)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="1"
                                                max="10"
                                                value={newMovie.rating}
                                                onChange={(e) => setNewMovie({...newMovie, rating: parseFloat(e.target.value)})}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Opis filmu</label>
                                        <textarea
                                            value={newMovie.description}
                                            onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                                            required
                                            className="form-textarea"
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>URL plakatu</label>
                                        <input
                                            type="url"
                                            value={newMovie.poster}
                                            onChange={(e) => setNewMovie({...newMovie, poster: e.target.value})}
                                            className="form-input"
                                            placeholder="https://example.com/poster.jpg"
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Dodawanie...' : 'Dodaj film'}
                                    </button>
                                </form>
                            </div>

                            <div className="movies-list">
                                <h3>Lista filmów ({movies.length})</h3>
                                <div className="movies-table">
                                    {movies.map(movie => (
                                        <div
                                            key={movie._id}
                                            className="movie-row"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleMovieClick(movie._id)}
                                        >
                                            <div className="movie-poster">
                                                <img src={movie.poster} alt={movie.title} />
                                            </div>
                                            <div className="movie-info">
                                                <h4>{movie.title}</h4>
                                                <p>{movie.year} • {movie.duration} min • {movie.genre}</p>
                                                <p>Reż.: {movie.director}</p>
                                                <div className="movie-rating">⭐ {movie.rating}/10</div>
                                            </div>
                                            <div className="movie-actions" onClick={e => e.stopPropagation()}>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteMovie(movie._id)}
                                                    disabled={loading}
                                                >
                                                    Usuń
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Seanse */}
                    {activeTab === 'showtimes' && (
                        <div className="showtimes-section">
                            <div className="section-header">
                                <h2>Zarządzanie seansami</h2>
                            </div>
                            <div className="add-showtime-form">
                                <h3>Dodaj nowy seans</h3>
                                <form onSubmit={handleAddShowtime}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Film</label>
                                            <select value={newShowtime.movieId} onChange={e => setNewShowtime({...newShowtime, movieId: e.target.value})} required className="form-select">
                                                <option value="">Wybierz film</option>
                                                {movies.map(movie => (
                                                    <option key={movie._id} value={movie._id}>{movie.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Sala</label>
                                            <select value={newShowtime.hallId} onChange={e => setNewShowtime({...newShowtime, hallId: e.target.value})} required className="form-select">
                                                <option value="">Wybierz salę</option>
                                                {halls.map(hall => (
                                                    <option key={hall._id} value={hall._id}>{hall.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Data</label>
                                            <input type="date" value={newShowtime.date} onChange={e => setNewShowtime({...newShowtime, date: e.target.value})} required className="form-input" />
                                        </div>
                                        <div className="form-group">
                                            <label>Godzina</label>
                                            <input type="time" value={newShowtime.time} onChange={e => setNewShowtime({...newShowtime, time: e.target.value})} required className="form-input" />
                                        </div>
                                        <div className="form-group">
                                            <label>Cena biletu</label>
                                            <input type="number" value={newShowtime.price} onChange={e => setNewShowtime({...newShowtime, price: e.target.value})} required className="form-input" />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Dodawanie...' : 'Dodaj seans'}</button>
                                </form>
                            </div>
                            <div className="showtimes-list">
                                <h3>Lista seansów</h3>
                                <div className="showtimes-table">
                                    <div className="table-header">
                                        <span>Film</span>
                                        <span>Sala</span>
                                        <span>Data</span>
                                        <span>Godzina</span>
                                        <span>Cena</span>
                                        <span>Miejsca</span>
                                        <span>Akcje</span>
                                    </div>
                                    {showtimes.map(showtime => {
                                        const movie = movies.find(m => m._id === showtime.movieId);
                                        const hall = halls.find(h => h._id === showtime.hallId);
                                        const formattedDate = new Date(showtime.date).toLocaleDateString('pl-PL');
                                        const occupancyRate = Math.round((showtime.soldTickets / showtime.totalSeats) * 100) || 0;
                                        
                                        return (
                                            <div key={showtime._id} className="table-row">
                                                <span className="showtime-movie">
                                                    {movie?.title || showtime.movieTitle || '—'}
                                                    {movie?.poster && (
                                                        <img src={movie.poster} alt={movie.title} className="showtime-poster" />
                                                    )}
                                                </span>
                                                <span>{hall?.name || showtime.hall || '—'}</span>
                                                <span>{formattedDate}</span>
                                                <span>{showtime.time}</span>
                                                <span>{showtime.price} zł</span>
                                                <span>
                                                    <div className="occupancy-mini">
                                                        <div 
                                                            className="occupancy-mini-fill" 
                                                            style={{width: `${occupancyRate}%`}}
                                                        />
                                                        <span className="occupancy-text">
                                                            {showtime.soldTickets}/{showtime.totalSeats}
                                                        </span>
                                                    </div>
                                                </span>
                                                <span>
                                                    <div className="showtime-actions">
                                                        <button 
                                                            className="btn btn-primary btn-sm" 
                                                            onClick={() => navigate(`/movies/${movie?._id}`)}
                                                        >
                                                            Szczegóły
                                                        </button>
                                                        <button 
                                                            className="btn btn-danger btn-sm" 
                                                            onClick={() => handleDeleteShowtime(showtime._id)} 
                                                            disabled={loading}
                                                        >
                                                            Usuń
                                                        </button>
                                                    </div>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rezerwacje */}
                    {activeTab === 'bookings' && (
                        <div className="bookings-section">
                            <div className="section-header">
                                <h2>Zarządzanie rezerwacjami</h2>
                            </div>

                            <div className="bookings-stats">
                                <div className="booking-stat">
                                    <span className="stat-number">{bookings.filter(b => b.status === 'confirmed').length}</span>
                                    <span className="stat-label">Potwierdzone</span>
                                </div>
                                <div className="booking-stat">
                                    <span className="stat-number">{bookings.filter(b => b.status === 'cancelled').length}</span>
                                    <span className="stat-label">Anulowane</span>
                                </div>
                                <div className="booking-stat">
                                    <span className="stat-number">{bookings.filter(b => b.status === 'completed').length}</span>
                                    <span className="stat-label">Zakończone</span>
                                </div>
                            </div>

                            <div className="bookings-list">
                                <div className="bookings-table">
                                    <div className="table-header">
                                        <span>ID</span>
                                        <span>Klient</span>
                                        <span>Film</span>
                                        <span>Data/Godzina</span>
                                        <span>Miejsca</span>
                                        <span>Kwota</span>
                                        <span>Status</span>
                                        <span>Akcje</span>
                                    </div>
                                    {bookings.map(booking => {
                                        const status = getStatusBadge(booking.status);
                                        return (
                                            <div key={booking._id} className="table-row">
                                                <span>#{booking._id}</span>
                                                <span>
                                                    <div className="customer-info">
                                                        <div>{booking.customerName || '-'}</div>
                                                        <div className="customer-email">{booking.customerEmail || '-'}</div>
                                                    </div>
                                                </span>
                                                <span>{booking.movieTitle || '-'}</span>
                                                <span>{booking.date} {booking.time}</span>
                                                <span>{Array.isArray(booking.seats) ? booking.seats.join(', ') : '-'}</span>
                                                <span>{booking.total} zł</span>
                                                <span>
                                                    <span className={`status-badge ${status.class}`}>
                                                        {status.text}
                                                    </span>
                                                </span>
                                                <span>
                                                    <div className="booking-actions">
                                                        {booking.status === 'confirmed' && (
                                                            <button
                                                                className="btn btn-warning btn-sm"
                                                                onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                                                                disabled={loading}
                                                            >
                                                                Anuluj
                                                            </button>
                                                        )}
                                                        {booking.status === 'cancelled' && (
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                                                                disabled={loading}
                                                            >
                                                                Przywróć
                                                            </button>
                                                        )}
                                                    </div>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Użytkownicy */}
                    {activeTab === 'users' && (
                        <div className="users-section">
                            <div className="section-header">
                                <h2>Zarządzanie użytkownikami</h2>
                            </div>

                            <div className="users-stats">
                                <div className="user-stat">
                                    <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
                                    <span className="stat-label">Administratorzy</span>
                                </div>
                                <div className="user-stat">
                                    <span className="stat-number">{users.filter(u => u.role === 'staff').length}</span>
                                    <span className="stat-label">Pracownicy</span>
                                </div>
                                <div className="user-stat">
                                    <span className="stat-number">{users.filter(u => u.role === 'customer').length}</span>
                                    <span className="stat-label">Klienci</span>
                                </div>
                            </div>

                            <div className="users-list">
                                <div className="users-table">
                                    <div className="table-header">
                                        <span>Imię i nazwisko</span>
                                        <span>Email</span>
                                        <span>Rola</span>
                                        <span>Data dołączenia</span>
                                        <span>Ostatnie logowanie</span>
                                        <span>Status</span>
                                    </div>
                                    {users.map(user => {
                                        const roleMap = {
                                            admin: { text: 'Administrator', class: 'role-admin' },
                                            staff: { text: 'Pracownik', class: 'role-staff' },
                                            customer: { text: 'Klient', class: 'role-customer' }
                                        };
                                        const roleInfo = roleMap[user.role] || { text: user.role, class: '' };

                                        return (
                                            <div key={user._id} className="table-row">
                                                <span>{user.name || '-'}</span>
                                                <span>{user.email || '-'}</span>
                                                <span>
                                                    <span className={`role-badge ${roleInfo.class}`}>
                                                        {roleInfo.text}
                                                    </span>
                                                </span>
                                                <span>{user.joinDate || '-'}</span>
                                                <span>{user.lastLogin || '-'}</span>
                                                <span>
                                                    <span className="status-badge status-active">Aktywny</span>
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sale */}
                    {activeTab === 'halls' && (
                        <div className="halls-section">
                            <div className="section-header">
                                <h2>Zarządzanie salami</h2>
                            </div>
                            <div className="add-movie-form">
                                <h3>Dodaj nową salę</h3>
                                <form onSubmit={handleAddHall}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Nazwa sali</label>
                                            <input type="text" value={newHall.name} onChange={e => setNewHall({...newHall, name: e.target.value})} required className="form-input" />
                                        </div>
                                        <div className="form-group">
                                            <label>Pojemność</label>
                                            <input type="number" value={newHall.capacity} onChange={e => setNewHall({...newHall, capacity: e.target.value})} required className="form-input" />
                                        </div>
                                        <div className="form-group">
                                            <label>Liczba rzędów</label>
                                            <input type="number" value={newHall.rows} onChange={e => setNewHall({...newHall, rows: e.target.value})} required className="form-input" />
                                        </div>
                                        <div className="form-group">
                                            <label>Miejsc w rzędzie</label>
                                            <input type="number" value={newHall.seatsPerRow} onChange={e => setNewHall({...newHall, seatsPerRow: e.target.value})} required className="form-input" />
                                        </div>
                                        <div className="form-group">
                                            <label>Status</label>
                                            <select value={newHall.status} onChange={e => setNewHall({...newHall, status: e.target.value})} className="form-select">
                                                <option value="active">Aktywna</option>
                                                <option value="maintenance">Konserwacja</option>
                                                <option value="inactive">Nieaktywna</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Dodawanie...' : 'Dodaj salę'}</button>
                                </form>
                            </div>
                            {editingHall && (
                                <div className="add-movie-form">
                                    <h3>Edytuj salę</h3>
                                    <form onSubmit={handleUpdateHall}>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Nazwa sali</label>
                                                <input type="text" value={editingHall.name} onChange={e => setEditingHall({...editingHall, name: e.target.value})} required className="form-input" />
                                            </div>
                                            <div className="form-group">
                                                <label>Pojemność</label>
                                                <input type="number" value={editingHall.capacity} onChange={e => setEditingHall({...editingHall, capacity: e.target.value})} required className="form-input" />
                                            </div>
                                            <div className="form-group">
                                                <label>Liczba rzędów</label>
                                                <input type="number" value={editingHall.seatingLayout.rows} onChange={e => setEditingHall({...editingHall, seatingLayout: {...editingHall.seatingLayout, rows: e.target.value}})} required className="form-input" />
                                            </div>
                                            <div className="form-group">
                                                <label>Miejsc w rzędzie</label>
                                                <input type="number" value={editingHall.seatingLayout.seatsPerRow} onChange={e => setEditingHall({...editingHall, seatingLayout: {...editingHall.seatingLayout, seatsPerRow: e.target.value}})} required className="form-input" />
                                            </div>
                                            <div className="form-group">
                                                <label>Status</label>
                                                <select value={editingHall.status} onChange={e => setEditingHall({...editingHall, status: e.target.value})} className="form-select">
                                                    <option value="active">Aktywna</option>
                                                    <option value="maintenance">Konserwacja</option>
                                                    <option value="inactive">Nieaktywna</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button type="submit" className="btn btn-success" disabled={loading}>{loading ? 'Aktualizowanie...' : 'Zapisz zmiany'}</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setEditingHall(null)}>Anuluj</button>
                                    </form>
                                </div>
                            )}
                            <div className="halls-grid">
                                {halls.map(hall => (
                                    <div key={hall._id} className="hall-card">
                                        <div className="hall-header">
                                            <h3>{hall.name}</h3>
                                            <span className={`hall-status ${hall.status}`}>{hall.status === 'active' ? 'Aktywna' : hall.status === 'maintenance' ? 'Konserwacja' : 'Nieaktywna'}</span>
                                        </div>
                                        <div className="hall-details">
                                            <div className="hall-info">
                                                <span>💺 {hall.capacity} miejsc</span>
                                                <span>📐 {hall.seatingLayout?.rows} x {hall.seatingLayout?.seatsPerRow}</span>
                                            </div>
                                        </div>
                                        <div className="hall-actions">
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleEditHall(hall)}>Edytuj</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteHall(hall._id)} disabled={loading}>Usuń</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pracownicy */}
                    {activeTab === 'staff' && (
                        <div className="staff-section">
                            <div className="section-header">
                                <h2>Zarządzanie Pracownikami</h2>
                            </div>
                            <div className="add-staff-form">
                                <h3>Dodaj nowego pracownika</h3>
                                <form onSubmit={handleAddStaff}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Imię i nazwisko</label>
                                            <input
                                                type="text"
                                                value={newStaff.name}
                                                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={newStaff.email}
                                                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Hasło</label>
                                            <input
                                                type="password"
                                                value={newStaff.password}
                                                onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Telefon</label>
                                            <input
                                                type="tel"
                                                value={newStaff.phone}
                                                onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Dodawanie...' : 'Dodaj pracownika'}
                                    </button>
                                </form>
                            </div>
                            
                            <div className="staff-list">
                                <h3>Lista pracowników</h3>
                                <div className="staff-table">
                                    {users.filter(u => u.role === 'staff').map(staff => (
                                        <div key={staff._id} className="staff-row">
                                            <div className="staff-info">
                                                <h4>{staff.name}</h4>
                                                <p>{staff.email}</p>
                                                <p>{staff.phone || 'Brak telefonu'}</p>
                                            </div>
                                            <div className="staff-actions">
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteUser(staff._id)}
                                                    disabled={loading}
                                                >
                                                    Usuń
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;