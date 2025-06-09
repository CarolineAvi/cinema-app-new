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

    // Mock dane
    const mockMovies = [
        {
            id: 1,
            title: "Avengers: Endgame",
            duration: 181,
            description: "Epickie zakończenie sagi Avengers. Superbohaterowie muszą cofnąć się w czasie, aby powstrzymać Thanosa.",
            genre: "Akcja, Sci-Fi",
            year: 2019,
            director: "Anthony Russo, Joe Russo",
            rating: 8.4,
            poster: "https://via.placeholder.com/300x450/1a1a2e/ffd700?text=Avengers",
            status: 'active'
        },
        {
            id: 2,
            title: "Dune",
            duration: 155,
            description: "Adaptacja kultowej powieści sci-fi o młodym Paula Atreides i jego przeznaczeniu na planecie Arrakis.",
            genre: "Sci-Fi, Dramat",
            year: 2021,
            director: "Denis Villeneuve",
            rating: 8.0,
            poster: "https://via.placeholder.com/300x450/2c3e50/ffd700?text=Dune",
            status: 'active'
        },
        {
            id: 3,
            title: "Spider-Man: No Way Home",
            duration: 148,
            description: "Peter Parker staje się celem wszystkich, gdy jego tożsamość zostaje ujawniona.",
            genre: "Akcja, Przygoda",
            year: 2021,
            director: "Jon Watts",
            rating: 8.2,
            poster: "https://via.placeholder.com/300x450/c0392b/ffd700?text=Spider-Man",
            status: 'active'
        }
    ];

    const mockShowtimes = [
        { id: 1, movieId: 1, movieTitle: "Avengers: Endgame", date: "2024-01-15", time: "18:00", hallId: 1, hallName: "Sala 1", price: 25, soldTickets: 45, totalSeats: 120 },
        { id: 2, movieId: 1, movieTitle: "Avengers: Endgame", date: "2024-01-15", time: "21:00", hallId: 2, hallName: "Sala 2", price: 25, soldTickets: 32, totalSeats: 80 },
        { id: 3, movieId: 2, movieTitle: "Dune", date: "2024-01-16", time: "17:00", hallId: 3, hallName: "Sala 3", price: 28, soldTickets: 67, totalSeats: 126 },
        { id: 4, movieId: 3, movieTitle: "Spider-Man: No Way Home", date: "2024-01-16", time: "19:45", hallId: 1, hallName: "Sala 1", price: 26, soldTickets: 89, totalSeats: 120 }
    ];

    const mockBookings = [
        { id: 1001, customerName: "Jan Kowalski", customerEmail: "jan@example.com", movieTitle: "Avengers: Endgame", date: "2024-01-15", time: "18:00", seats: ["F5", "F6"], total: 50, status: "confirmed", bookingDate: "2024-01-10" },
        { id: 1002, customerName: "Anna Nowak", customerEmail: "anna@example.com", movieTitle: "Dune", date: "2024-01-16", time: "17:00", seats: ["G7"], total: 28, status: "confirmed", bookingDate: "2024-01-12" },
        { id: 1003, customerName: "Piotr Wiśniewski", customerEmail: "piotr@example.com", movieTitle: "Spider-Man: No Way Home", date: "2024-01-16", time: "19:45", seats: ["A1", "A2"], total: 52, status: "cancelled", bookingDate: "2024-01-11" }
    ];

    const mockUsers = [
        { id: 1, name: "Administrator", email: "admin@cinema.com", role: "admin", accessLevel: 1, joinDate: "2023-01-01", lastLogin: "2024-01-15" },
        { id: 2, name: "Pracownik Kasy", email: "staff@cinema.com", role: "staff", accessLevel: 2, joinDate: "2023-06-15", lastLogin: "2024-01-14" },
        { id: 3, name: "Jan Kowalski", email: "user@cinema.com", role: "customer", accessLevel: 3, joinDate: "2023-12-01", lastLogin: "2024-01-13" }
    ];

    const mockHalls = [
        { id: 1, name: "Sala 1", rows: 10, seatsPerRow: 12, totalSeats: 120, technology: "4K Digital", sound: "Dolby Atmos", status: "active" },
        { id: 2, name: "Sala 2", rows: 8, seatsPerRow: 10, totalSeats: 80, technology: "4K Digital", sound: "DTS", status: "active" },
        { id: 3, name: "Sala 3", rows: 9, seatsPerRow: 14, totalSeats: 126, technology: "IMAX", sound: "IMAX Enhanced", status: "maintenance" }
    ];

    useEffect(() => {
        // Sprawdź uprawnienia
        if (!user || user.accessLevel > 2) {
            navigate('/');
            return;
        }

        // Załaduj dane
        setMovies(mockMovies);
        setShowtimes(mockShowtimes);
        setBookings(mockBookings);
        setUsers(mockUsers);
        setHalls(mockHalls);

        // Oblicz statystyki
        const today = new Date().toISOString().split('T')[0];
        const totalRevenue = mockBookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + b.total, 0);

        const todayBookings = mockBookings.filter(b => b.bookingDate === today);

        setStats({
            totalMovies: mockMovies.length,
            totalBookings: mockBookings.filter(b => b.status === 'confirmed').length,
            totalRevenue,
            todayBookings: todayBookings.length,
            todayRevenue: todayBookings.reduce((sum, b) => sum + b.total, 0),
            activeUsers: mockUsers.filter(u => u.role === 'customer').length,
            occupancyRate: Math.round((mockShowtimes.reduce((sum, s) => sum + s.soldTickets, 0) / mockShowtimes.reduce((sum, s) => sum + s.totalSeats, 0)) * 100)
        });
    }, [user, navigate]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(''), 3000);
    };

    // Zarządzanie filmami
    const handleAddMovie = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const movie = {
                ...newMovie,
                id: Date.now(),
                status: 'active'
            };

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
            await new Promise(resolve => setTimeout(resolve, 500));
            setMovies(movies.filter(m => m.id !== movieId));
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
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const selectedMovie = movies.find(m => m.id === parseInt(newShowtime.movieId));
            const selectedHall = halls.find(h => h.id === parseInt(newShowtime.hallId));

            const showtime = {
                ...newShowtime,
                id: Date.now(),
                movieTitle: selectedMovie?.title,
                hallName: selectedHall?.name,
                soldTickets: 0,
                totalSeats: selectedHall?.totalSeats || 0
            };

            setShowtimes([...showtimes, showtime]);
            setNewShowtime({ movieId: '', date: '', time: '', hallId: '', price: '' });
            showMessage('Seans został dodany pomyślnie!');
        } catch (error) {
            showMessage('Wystąpił błąd podczas dodawania seansu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteShowtime = async (showtimeId) => {
        if (!window.confirm('Czy na pewno chcesz usunąć ten seans?')) return;

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setShowtimes(showtimes.filter(s => s.id !== showtimeId));
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
            await new Promise(resolve => setTimeout(resolve, 500));
            setBookings(bookings.map(b =>
                b.id === bookingId ? { ...b, status: newStatus } : b
            ));
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

    if (!user || user.accessLevel > 2) {
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
                                        {movies.slice(0, 3).map((movie, index) => (
                                            <div key={movie.id} className="popular-movie">
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
                                    <div className="activity-item">
                                        <span className="activity-icon">🎟️</span>
                                        <span className="activity-text">Nowa rezerwacja: Jan Kowalski - Avengers: Endgame</span>
                                        <span className="activity-time">5 min temu</span>
                                    </div>
                                    <div className="activity-item">
                                        <span className="activity-icon">👤</span>
                                        <span className="activity-text">Nowy użytkownik: anna.nowak@email.com</span>
                                        <span className="activity-time">2 godz. temu</span>
                                    </div>
                                    <div className="activity-item">
                                        <span className="activity-icon">🎬</span>
                                        <span className="activity-text">Dodano nowy seans: Dune - 20:00</span>
                                        <span className="activity-time">1 dzień temu</span>
                                    </div>
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
                                        <div key={movie.id} className="movie-row">
                                            <div className="movie-poster">
                                                <img src={movie.poster} alt={movie.title} />
                                            </div>
                                            <div className="movie-info">
                                                <h4>{movie.title}</h4>
                                                <p>{movie.year} • {movie.duration} min • {movie.genre}</p>
                                                <p>Reż.: {movie.director}</p>
                                                <div className="movie-rating">⭐ {movie.rating}/10</div>
                                            </div>
                                            <div className="movie-actions">
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteMovie(movie.id)}
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
                                            <select
                                                value={newShowtime.movieId}
                                                onChange={(e) => setNewShowtime({...newShowtime, movieId: e.target.value})}
                                                required
                                                className="form-select"
                                            >
                                                <option value="">Wybierz film</option>
                                                {movies.map(movie => (
                                                    <option key={movie.id} value={movie.id}>
                                                        {movie.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Sala</label>
                                            <select
                                                value={newShowtime.hallId}
                                                onChange={(e) => setNewShowtime({...newShowtime, hallId: e.target.value})}
                                                required
                                                className="form-select"
                                            >
                                                <option value="">Wybierz salę</option>
                                                {halls.filter(h => h.status === 'active').map(hall => (
                                                    <option key={hall.id} value={hall.id}>
                                                        {hall.name} ({hall.totalSeats} miejsc)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Data</label>
                                            <input
                                                type="date"
                                                value={newShowtime.date}
                                                onChange={(e) => setNewShowtime({...newShowtime, date: e.target.value})}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Godzina</label>
                                            <input
                                                type="time"
                                                value={newShowtime.time}
                                                onChange={(e) => setNewShowtime({...newShowtime, time: e.target.value})}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Cena biletu (zł)</label>
                                            <input
                                                type="number"
                                                value={newShowtime.price}
                                                onChange={(e) => setNewShowtime({...newShowtime, price: parseInt(e.target.value)})}
                                                required
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Dodawanie...' : 'Dodaj seans'}
                                    </button>
                                </form>
                            </div>

                            <div className="showtimes-list">
                                <h3>Lista seansów ({showtimes.length})</h3>
                                <div className="showtimes-table">
                                    <div className="table-header">
                                        <span>Film</span>
                                        <span>Data/Godzina</span>
                                        <span>Sala</span>
                                        <span>Cena</span>
                                        <span>Sprzedane/Wszystkie</span>
                                        <span>Wypełnienie</span>
                                        <span>Akcje</span>
                                    </div>
                                    {showtimes.map(showtime => {
                                        const occupancy = Math.round((showtime.soldTickets / showtime.totalSeats) * 100);
                                        return (
                                            <div key={showtime.id} className="table-row">
                                                <span className="showtime-movie">{showtime.movieTitle}</span>
                                                <span>{showtime.date} {showtime.time}</span>
                                                <span>{showtime.hallName}</span>
                                                <span>{showtime.price} zł</span>
                                                <span>{showtime.soldTickets}/{showtime.totalSeats}</span>
                                                <span>
                                                    <div className="occupancy-mini">
                                                        <div className="occupancy-mini-fill" style={{width: `${occupancy}%`}}></div>
                                                        <span className="occupancy-text">{occupancy}%</span>
                                                    </div>
                                                </span>
                                                <span>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDeleteShowtime(showtime.id)}
                                                        disabled={loading}
                                                    >
                                                        Usuń
                                                    </button>
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
                                            <div key={booking.id} className="table-row">
                                                <span>#{booking.id}</span>
                                                <span>
                                                    <div className="customer-info">
                                                        <div>{booking.customerName}</div>
                                                        <div className="customer-email">{booking.customerEmail}</div>
                                                    </div>
                                                </span>
                                                <span>{booking.movieTitle}</span>
                                                <span>{booking.date} {booking.time}</span>
                                                <span>{booking.seats.join(', ')}</span>
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
                                                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                                                                disabled={loading}
                                                            >
                                                                Anuluj
                                                            </button>
                                                        )}
                                                        {booking.status === 'cancelled' && (
                                                            <button
                                                                className="btn btn-success btn-sm"
                                                                onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
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
                                        <span>ID</span>
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
                                        const roleInfo = roleMap[user.role];

                                        return (
                                            <div key={user.id} className="table-row">
                                                <span>#{user.id}</span>
                                                <span>{user.name}</span>
                                                <span>{user.email}</span>
                                                <span>
                                                    <span className={`role-badge ${roleInfo.class}`}>
                                                        {roleInfo.text}
                                                    </span>
                                                </span>
                                                <span>{user.joinDate}</span>
                                                <span>{user.lastLogin}</span>
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

                            <div className="halls-grid">
                                {halls.map(hall => (
                                    <div key={hall.id} className="hall-card">
                                        <div className="hall-header">
                                            <h3>{hall.name}</h3>
                                            <span className={`hall-status ${hall.status}`}>
                                                {hall.status === 'active' ? 'Aktywna' : 'Konserwacja'}
                                            </span>
                                        </div>
                                        <div className="hall-details">
                                            <div className="hall-info">
                                                <span>💺 {hall.totalSeats} miejsc</span>
                                                <span>📐 {hall.rows} x {hall.seatsPerRow}</span>
                                            </div>
                                            <div className="hall-tech">
                                                <span>🎥 {hall.technology}</span>
                                                <span>🔊 {hall.sound}</span>
                                            </div>
                                        </div>
                                        <div className="hall-actions">
                                            <button className="btn btn-secondary btn-sm">
                                                Edytuj
                                            </button>
                                            <button className={`btn btn-sm ${hall.status === 'active' ? 'btn-warning' : 'btn-success'}`}>
                                                {hall.status === 'active' ? 'Konserwacja' : 'Aktywuj'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;