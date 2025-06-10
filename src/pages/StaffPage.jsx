import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import './StaffPage.css';

const StaffPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('sales');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // State dla różnych sekcji
    const [todayShowtimes, setTodayShowtimes] = useState([]);
    const [todayBookings, setTodayBookings] = useState([]);
    const [walkInSale, setWalkInSale] = useState({
        showtimeId: '',
        seats: [],
        customerData: {
            name: '',
            email: '',
            phone: ''
        }
    });
    const [salesStats, setSalesStats] = useState({
        totalRevenue: 0,
        cashSales: 0,
        onlineSales: 0,
        totalTickets: 0,
        walkInCustomers: 0,
        onlineBookings: 0
    });

    useEffect(() => {
        if (!user || user.role !== 'staff') {
            navigate('/');
            return;
        }

        // Fetch today's showtimes from backend
        fetch('http://localhost:5000/api/showtimes/today')
            .then(res => res.json())
            .then(setTodayShowtimes);
        // Fetch today's bookings from backend
        fetch('http://localhost:5000/api/bookings/today')
            .then(res => res.json())
            .then(setTodayBookings);

        // Fetch sales stats if available (optional)
        fetch('http://localhost:5000/api/bookings/stats/today')
            .then(res => res.ok ? res.json() : {})
            .then(data => setSalesStats(data || {}));
    }, [user, navigate]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    // Funkcje sprzedaży bezpośredniej
    const handleWalkInSale = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const selectedShowtime = todayShowtimes.find(s => s._id === walkInSale.showtimeId);
            if (!selectedShowtime) throw new Error('Nie wybrano seansu');
            const totalPrice = walkInSale.seats.length * selectedShowtime.price;
            const newBooking = {
                showtimeId: walkInSale.showtimeId,
                seats: walkInSale.seats,
                customerName: walkInSale.customerData.name,
                customerEmail: walkInSale.customerData.email,
                customerPhone: walkInSale.customerData.phone,
                movieTitle: selectedShowtime.movieTitle,
                time: selectedShowtime.time,
                hall: selectedShowtime.hall,
                total: totalPrice,
                status: 'confirmed',
                paymentMethod: 'cash',
                isWalkIn: true,
                soldBy: user.name
            };
            const res = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBooking)
            });
            if (!res.ok) throw new Error('Błąd podczas sprzedaży');
            const savedBooking = await res.json();
            setTodayBookings([savedBooking, ...todayBookings]);
            setWalkInSale({ showtimeId: '', seats: [], customerData: { name: '', email: '', phone: '' } });
            showMessage(`Sprzedano ${walkInSale.seats.length} biletów za ${totalPrice}zł`);
        } catch (error) {
            showMessage('Wystąpił błąd podczas sprzedaży.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Funkcje zarządzania rezerwacjami
    const handleCheckIn = async (bookingId) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'checked-in', checkedInAt: new Date().toTimeString().slice(0, 5) })
            });
            if (!res.ok) throw new Error('Błąd podczas odprawy');
            const updated = await res.json();
            setTodayBookings(todayBookings.map(b => b._id === bookingId ? updated : b));
            showMessage('Klient został odprawiony pomyślnie!');
        } catch (error) {
            showMessage('Wystąpił błąd podczas odprawy.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Czy na pewno chcesz anulować tę rezerwację?')) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled', cancelledAt: new Date().toTimeString().slice(0, 5) })
            });
            if (!res.ok) throw new Error('Błąd podczas anulowania');
            const updated = await res.json();
            setTodayBookings(todayBookings.map(b => b._id === bookingId ? updated : b));
            showMessage('Rezerwacja została anulowana.');
        } catch (error) {
            showMessage('Wystąpił błąd podczas anulowania.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Funkcje pomocnicze
    const getStatusBadge = (status) => {
        const statusMap = {
            confirmed: { text: 'Potwierdzona', class: 'status-confirmed' },
            'checked-in': { text: 'Odprawiona', class: 'status-checked-in' },
            cancelled: { text: 'Anulowana', class: 'status-cancelled' }
        };
        return statusMap[status] || { text: 'Nieznany', class: 'status-unknown' };
    };

    const getShowtimeStatus = (showtime) => {
        const now = new Date();
        const showtimeDate = new Date(`2024-01-15 ${showtime.time}`);

        if (showtimeDate < now) return { text: 'Zakończony', class: 'showtime-finished' };
        if (showtimeDate - now < 30 * 60 * 1000) return { text: 'Sprzedaż', class: 'showtime-selling' };
        return { text: 'Nadchodzący', class: 'showtime-upcoming' };
    };

    const generateSeatOptions = (showtime) => {
        if (!showtime) return [];

        const seats = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatsPerRow = 12;

        for (let row of rows) {
            for (let seat = 1; seat <= seatsPerRow; seat++) {
                seats.push(`${row}${seat}`);
            }
        }

        return seats.slice(0, showtime.availableSeats);
    };

    if (!user || user.role !== 'staff') {
        return null;
    }

    return (
        <div className="staff-page">
            <div className="staff-container">
                <div className="staff-header">
                    <h1>🎫 Panel Pracownika</h1>
                    <div className="staff-info">
                        <span>👤 {user.name}</span>
                        <span>📅 {new Date().toLocaleDateString('pl-PL')}</span>
                        <span>🕐 {new Date().toTimeString().slice(0, 5)}</span>
                    </div>
                </div>

                {message && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="staff-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                        onClick={() => setActiveTab('sales')}
                    >
                        💰 Sprzedaż bezpośrednia
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        🎟️ Rezerwacje
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'showtimes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('showtimes')}
                    >
                        📺 Dzisiejsze seanse
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        📊 Statystyki dnia
                    </button>
                </div>

                <div className="staff-content">
                    {/* Sprzedaż bezpośrednia */}
                    {activeTab === 'sales' && (
                        <div className="sales-section">
                            <h2>Sprzedaż biletów przy kasie</h2>

                            <div className="walk-in-form">
                                <h3>Nowa sprzedaż</h3>
                                <form onSubmit={handleWalkInSale}>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Seans</label>
                                            <select
                                                value={walkInSale.showtimeId}
                                                onChange={(e) => setWalkInSale({...walkInSale, showtimeId: e.target.value, seats: []})}
                                                required
                                                className="form-select"
                                            >
                                                <option value="">Wybierz seans</option>
                                                {todayShowtimes.filter(s => s.availableSeats > 0).map(showtime => (
                                                    <option key={showtime._id} value={showtime._id}>
                                                        {showtime.movieTitle} - {showtime.time} ({showtime.availableSeats} wolnych miejsc)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Imię i nazwisko klienta</label>
                                            <input
                                                type="text"
                                                value={walkInSale.customerData.name}
                                                onChange={(e) => setWalkInSale({
                                                    ...walkInSale,
                                                    customerData: {...walkInSale.customerData, name: e.target.value}
                                                })}
                                                required
                                                className="form-input"
                                                placeholder="Jan Kowalski"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Email (opcjonalnie)</label>
                                            <input
                                                type="email"
                                                value={walkInSale.customerData.email}
                                                onChange={(e) => setWalkInSale({
                                                    ...walkInSale,
                                                    customerData: {...walkInSale.customerData, email: e.target.value}
                                                })}
                                                className="form-input"
                                                placeholder="jan@example.com"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Telefon (opcjonalnie)</label>
                                            <input
                                                type="tel"
                                                value={walkInSale.customerData.phone}
                                                onChange={(e) => setWalkInSale({
                                                    ...walkInSale,
                                                    customerData: {...walkInSale.customerData, phone: e.target.value}
                                                })}
                                                className="form-input"
                                                placeholder="+48 123 456 789"
                                            />
                                        </div>
                                    </div>

                                    {walkInSale.showtimeId && (
                                        <div className="seat-selection">
                                            <label>Wybierz miejsca (maks. 8)</label>
                                            <div className="seat-grid">
                                                {generateSeatOptions(todayShowtimes.find(s => s._id === walkInSale.showtimeId)).slice(0, 20).map(seat => (
                                                    <label key={seat} className="seat-option">
                                                        <input
                                                            type="checkbox"
                                                            value={seat}
                                                            checked={walkInSale.seats.includes(seat)}
                                                            onChange={(e) => {
                                                                if (e.target.checked && walkInSale.seats.length < 8) {
                                                                    setWalkInSale({
                                                                        ...walkInSale,
                                                                        seats: [...walkInSale.seats, seat]
                                                                    });
                                                                } else if (!e.target.checked) {
                                                                    setWalkInSale({
                                                                        ...walkInSale,
                                                                        seats: walkInSale.seats.filter(s => s !== seat)
                                                                    });
                                                                }
                                                            }}
                                                            disabled={
                                                                (!walkInSale.seats.includes(seat) && walkInSale.seats.length >= 8)
                                                            }
                                                        />
                                                        <span className="seat-label">{seat}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {walkInSale.seats.length > 0 && (
                                        <div className="sale-summary">
                                            <div className="summary-item">
                                                <span>Wybrane miejsca:</span>
                                                <span>{walkInSale.seats.join(', ')}</span>
                                            </div>
                                            <div className="summary-item">
                                                <span>Liczba biletów:</span>
                                                <span>{walkInSale.seats.length}</span>
                                            </div>
                                            <div className="summary-item total">
                                                <span>Do zapłaty:</span>
                                                <span>
                                                    {walkInSale.seats.length *
                                                        (todayShowtimes.find(s => s._id === walkInSale.showtimeId)?.price || 0)
                                                    } zł
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-large"
                                        disabled={loading || walkInSale.seats.length === 0}
                                    >
                                        {loading ? 'Przetwarzanie...' : 'Sprzedaj bilety'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Rezerwacje */}
                    {activeTab === 'bookings' && (
                        <div className="bookings-section">
                            <h2>Zarządzanie rezerwacjami ({todayBookings.length})</h2>

                            <div className="bookings-filters">
                                <button className="filter-btn active">Wszystkie</button>
                                <button className="filter-btn">Potwierdzone</button>
                                <button className="filter-btn">Odprawione</button>
                                <button className="filter-btn">Online</button>
                                <button className="filter-btn">Przy kasie</button>
                            </div>

                            <div className="bookings-list">
                                {todayBookings.map(booking => {
                                    const status = getStatusBadge(booking.status);
                                    return (
                                        <div key={booking._id} className="booking-card">
                                            <div className="booking-header">
                                                <div className="booking-id">#{booking._id}</div>
                                                <div className={`booking-status ${status.class}`}>
                                                    {status.text}
                                                </div>
                                                {booking.isWalkIn && (
                                                    <div className="walk-in-badge">Przy kasie</div>
                                                )}
                                            </div>

                                            <div className="booking-content">
                                                <div className="booking-customer">
                                                    <strong>{booking.customerName}</strong>
                                                    {booking.customerEmail && (
                                                        <div className="customer-email">{booking.customerEmail}</div>
                                                    )}
                                                </div>

                                                <div className="booking-details">
                                                    <div className="booking-movie">{booking.movieTitle}</div>
                                                    <div className="booking-time">🕐 {booking.time}</div>
                                                    <div className="booking-seats">💺 {booking.seats.join(', ')}</div>
                                                    <div className="booking-price">💰 {booking.total} zł</div>
                                                    <div className="booking-method">
                                                        {booking.paymentMethod === 'cash' ? '💵 Gotówka' : '💳 Online'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="booking-actions">
                                                {booking.status === 'confirmed' && (
                                                    <>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleCheckIn(booking._id)}
                                                            disabled={loading}
                                                        >
                                                            ✅ Odprawa
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleCancelBooking(booking._id)}
                                                            disabled={loading}
                                                        >
                                                            ❌ Anuluj
                                                        </button>
                                                    </>
                                                )}
                                                {booking.status === 'checked-in' && (
                                                    <div className="checked-in-info">
                                                        ✅ Odprawiono o {booking.checkedInAt}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Seanse */}
                    {activeTab === 'showtimes' && (
                        <div className="showtimes-section">
                            <h2>Dzisiejsze seanse ({todayShowtimes.length})</h2>

                            <div className="showtimes-grid">
                                {todayShowtimes.map(showtime => {
                                    const status = getShowtimeStatus(showtime);
                                    const occupancy = showtime.totalSeats
                                        ? Math.round(((showtime.totalSeats - showtime.availableSeats) / showtime.totalSeats) * 100)
                                        : 0;
                                    return (
                                        <div key={showtime._id} className="showtime-card">
                                            <div className="showtime-header">
                                                <h3>{showtime.movieTitle}</h3>
                                                <div className={`showtime-status ${status.class}`}>
                                                    {status.text}
                                                </div>
                                            </div>

                                            <div className="showtime-details">
                                                <div className="showtime-info">
                                                    <span>🕐 {showtime.time}</span>
                                                    <span>🏛️ {showtime.hall}</span>
                                                    <span>💰 {showtime.price} zł</span>
                                                </div>

                                                <div className="occupancy-info">
                                                    <div className="occupancy-bar">
                                                        <div
                                                            className="occupancy-fill"
                                                            style={{width: `${occupancy}%`}}
                                                        ></div>
                                                    </div>
                                                    <div className="occupancy-text">
                                                        {showtime.totalSeats - showtime.availableSeats}/{showtime.totalSeats} ({occupancy}%)
                                                    </div>
                                                </div>
                                            </div>

                                            {showtime.availableSeats > 0 && status.class !== 'showtime-finished' && (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => {
                                                        setActiveTab('sales');
                                                        setWalkInSale({...walkInSale, showtimeId: showtime._id});
                                                    }}
                                                >
                                                    Sprzedaj bilety
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Statystyki */}
                    {activeTab === 'stats' && (
                        <div className="stats-section">
                            <h2>Statystyki sprzedaży - {new Date().toLocaleDateString('pl-PL')}</h2>

                            <div className="stats-grid">
                                <div className="stat-card revenue">
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-value">{(salesStats.totalRevenue || 0).toLocaleString('pl-PL')} zł</div>
                                    <div className="stat-label">Łączny przychód</div>
                                    <div className="stat-breakdown">
                                        <span>💵 Gotówka: {salesStats.cashSales || 0} zł</span>
                                        <span>💳 Online: {salesStats.onlineSales || 0} zł</span>
                                    </div>
                                </div>

                                <div className="stat-card tickets">
                                    <div className="stat-icon">🎟️</div>
                                    <div className="stat-value">{salesStats.totalTickets || 0}</div>
                                    <div className="stat-label">Sprzedane bilety</div>
                                    <div className="stat-breakdown">
                                        <span>🏪 Kasa: {salesStats.walkInCustomers || 0}</span>
                                        <span>🌐 Online: {salesStats.onlineBookings || 0}</span>
                                    </div>
                                </div>

                                <div className="stat-card customers">
                                    <div className="stat-icon">👥</div>
                                    <div className="stat-value">{(salesStats.walkInCustomers || 0) + (salesStats.onlineBookings || 0)}</div>
                                    <div className="stat-label">Liczba klientów</div>
                                    <div className="stat-breakdown">
                                        <span>Średnia: {((salesStats.totalRevenue || 0) / (((salesStats.walkInCustomers || 0) + (salesStats.onlineBookings || 0)) || 1)).toFixed(0)} zł/os.</span>
                                    </div>
                                </div>

                                <div className="stat-card performance">
                                    <div className="stat-icon">📈</div>
                                    <div className="stat-value">
                                        {todayShowtimes.length > 0
                                            ? Math.round(((salesStats.totalTickets || 0) / (todayShowtimes.reduce((sum, s) => sum + (s.totalSeats || 0), 0) || 1)) * 100)
                                            : 0
                                        }%
                                    </div>
                                    <div className="stat-label">Wypełnienie sal</div>
                                    <div className="stat-breakdown">
                                        <span>Cel dzienny: 75%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hourly-sales">
                                <h3>Sprzedaż w ciągu dnia</h3>
                                <div className="hourly-chart">
                                    {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(hour => {
                                        const sales = Math.floor(Math.random() * 15) + 1;
                                        return (
                                            <div key={hour} className="hour-bar">
                                                <div className="bar" style={{height: `${sales * 4}px`}}></div>
                                                <div className="hour-label">{hour}:00</div>
                                                <div className="sales-count">{sales}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StaffPage;