import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import './StaffPage.css';

const StaffPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('sales');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

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
    const [salesStats, setSalesStats] = useState({});

    // Mock dane dla pracownika
    const mockTodayShowtimes = [
        {
            id: 1,
            movieTitle: "Avengers: Endgame",
            time: "18:00",
            hall: "Sala 1",
            price: 25,
            availableSeats: 75,
            totalSeats: 120,
            status: 'upcoming'
        },
        {
            id: 2,
            movieTitle: "Avengers: Endgame",
            time: "21:00",
            hall: "Sala 2",
            price: 25,
            availableSeats: 48,
            totalSeats: 80,
            status: 'upcoming'
        },
        {
            id: 3,
            movieTitle: "Dune",
            time: "19:30",
            hall: "Sala 3",
            price: 28,
            availableSeats: 32,
            totalSeats: 126,
            status: 'selling'
        },
        {
            id: 4,
            movieTitle: "Spider-Man: No Way Home",
            time: "16:00",
            hall: "Sala 1",
            price: 26,
            availableSeats: 0,
            totalSeats: 120,
            status: 'finished'
        }
    ];

    const mockTodayBookings = [
        {
            id: 1001,
            customerName: "Jan Kowalski",
            customerEmail: "jan@example.com",
            movieTitle: "Avengers: Endgame",
            time: "18:00",
            seats: ["F5", "F6"],
            total: 50,
            status: "confirmed",
            bookedAt: "10:30",
            paymentMethod: "online"
        },
        {
            id: 1002,
            customerName: "Anna Nowak",
            customerEmail: "anna@example.com",
            movieTitle: "Dune",
            time: "19:30",
            seats: ["G7"],
            total: 28,
            status: "confirmed",
            bookedAt: "14:15",
            paymentMethod: "online"
        },
        {
            id: 1003,
            customerName: "Piotr Wiśniewski",
            customerEmail: "piotr@example.com",
            movieTitle: "Spider-Man: No Way Home",
            time: "16:00",
            seats: ["A1", "A2"],
            total: 52,
            status: "checked-in",
            bookedAt: "09:45",
            paymentMethod: "cash",
            isWalkIn: true
        }
    ];

    useEffect(() => {
        // Sprawdź uprawnienia
        if (!user || user.accessLevel > 2) {
            navigate('/');
            return;
        }

        // Załaduj dane
        setTodayShowtimes(mockTodayShowtimes);
        setTodayBookings(mockTodayBookings);

        // Oblicz statystyki dnia
        const confirmedBookings = mockTodayBookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in');
        const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.total, 0);
        const cashSales = confirmedBookings.filter(b => b.paymentMethod === 'cash').reduce((sum, b) => sum + b.total, 0);
        const onlineSales = totalRevenue - cashSales;
        const walkInCustomers = confirmedBookings.filter(b => b.isWalkIn).length;

        setSalesStats({
            totalTickets: confirmedBookings.reduce((sum, b) => sum + b.seats.length, 0),
            totalRevenue,
            cashSales,
            onlineSales,
            walkInCustomers,
            onlineBookings: confirmedBookings.filter(b => !b.isWalkIn).length
        });
    }, [user, navigate]);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(''), 3000);
    };

    // Funkcje sprzedaży bezpośredniej
    const handleWalkInSale = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const selectedShowtime = todayShowtimes.find(s => s.id === parseInt(walkInSale.showtimeId));
            const totalPrice = walkInSale.seats.length * selectedShowtime.price;

            const newBooking = {
                id: Date.now(),
                customerName: walkInSale.customerData.name,
                customerEmail: walkInSale.customerData.email,
                movieTitle: selectedShowtime.movieTitle,
                time: selectedShowtime.time,
                seats: [...walkInSale.seats],
                total: totalPrice,
                status: "confirmed",
                bookedAt: new Date().toTimeString().slice(0, 5),
                paymentMethod: "cash",
                isWalkIn: true,
                soldBy: user.name
            };

            setTodayBookings([newBooking, ...todayBookings]);

            // Reset formularza
            setWalkInSale({
                showtimeId: '',
                seats: [],
                customerData: { name: '', email: '', phone: '' }
            });

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
            await new Promise(resolve => setTimeout(resolve, 500));
            setTodayBookings(todayBookings.map(b =>
                b.id === bookingId ? { ...b, status: 'checked-in', checkedInAt: new Date().toTimeString().slice(0, 5) } : b
            ));
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
            await new Promise(resolve => setTimeout(resolve, 500));
            setTodayBookings(todayBookings.map(b =>
                b.id === bookingId ? { ...b, status: 'cancelled', cancelledAt: new Date().toTimeString().slice(0, 5) } : b
            ));
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

    if (!user || user.accessLevel > 2) {
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
                                                    <option key={showtime.id} value={showtime.id}>
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
                                                {generateSeatOptions(todayShowtimes.find(s => s.id === parseInt(walkInSale.showtimeId))).slice(0, 20).map(seat => (
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
                                                            disabled={!e.target.checked && walkInSale.seats.length >= 8}
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
                                                <span>{walkInSale.seats.length * (todayShowtimes.find(s => s.id === parseInt(walkInSale.showtimeId))?.price || 0)} zł</span>
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
                                        <div key={booking.id} className="booking-card">
                                            <div className="booking-header">
                                                <div className="booking-id">#{booking.id}</div>
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
                                                            onClick={() => handleCheckIn(booking.id)}
                                                            disabled={loading}
                                                        >
                                                            ✅ Odprawa
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleCancelBooking(booking.id)}
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
                                    const occupancy = Math.round(((showtime.totalSeats - showtime.availableSeats) / showtime.totalSeats) * 100);

                                    return (
                                        <div key={showtime.id} className="showtime-card">
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
                                                        setWalkInSale({...walkInSale, showtimeId: showtime.id.toString()});
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
                                    <div className="stat-value">{salesStats.totalRevenue?.toLocaleString('pl-PL')} zł</div>
                                    <div className="stat-label">Łączny przychód</div>
                                    <div className="stat-breakdown">
                                        <span>💵 Gotówka: {salesStats.cashSales} zł</span>
                                        <span>💳 Online: {salesStats.onlineSales} zł</span>
                                    </div>
                                </div>

                                <div className="stat-card tickets">
                                    <div className="stat-icon">🎟️</div>
                                    <div className="stat-value">{salesStats.totalTickets}</div>
                                    <div className="stat-label">Sprzedane bilety</div>
                                    <div className="stat-breakdown">
                                        <span>🏪 Kasa: {salesStats.walkInCustomers}</span>
                                        <span>🌐 Online: {salesStats.onlineBookings}</span>
                                    </div>
                                </div>

                                <div className="stat-card customers">
                                    <div className="stat-icon">👥</div>
                                    <div className="stat-value">{salesStats.walkInCustomers + salesStats.onlineBookings}</div>
                                    <div className="stat-label">Liczba klientów</div>
                                    <div className="stat-breakdown">
                                        <span>Średnia: {((salesStats.totalRevenue || 0) / ((salesStats.walkInCustomers || 0) + (salesStats.onlineBookings || 0)) || 0).toFixed(0)} zł/os.</span>
                                    </div>
                                </div>

                                <div className="stat-card performance">
                                    <div className="stat-icon">📈</div>
                                    <div className="stat-value">{Math.round((salesStats.totalTickets / (todayShowtimes.reduce((sum, s) => sum + s.totalSeats, 0)) || 0) * 100)}%</div>
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