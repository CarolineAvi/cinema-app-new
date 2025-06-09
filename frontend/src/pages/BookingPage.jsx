import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './BookingPage.css';

const BookingPage = () => {
    const { showtimeId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [showtime, setShowtime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [customerData, setCustomerData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: ''
    });
    const [step, setStep] = useState(1); // 1: seats, 2: customer data, 3: payment, 4: confirmation
    const [loading, setLoading] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);

    // Mock dane seansu i sali
    const mockShowtimes = {
        1: {
            id: 1,
            movieTitle: "Avengers: Endgame",
            date: "2024-01-15",
            time: "18:00",
            hall: "Sala 1",
            price: 25,
            poster: "https://via.placeholder.com/300x450/1a1a2e/ffd700?text=Avengers",
            hallLayout: {
                rows: 10,
                seatsPerRow: 12,
                occupiedSeats: ['A1', 'A2', 'C5', 'D7', 'F10', 'G3', 'H8', 'H9'],
                vipRows: [7, 8, 9], // Rzędy G, H, I to VIP (+5zł)
                disabledSeats: ['E6', 'E7'] // Uszkodzone miejsca
            }
        },
        2: {
            id: 2,
            movieTitle: "Avengers: Endgame",
            date: "2024-01-15",
            time: "21:00",
            hall: "Sala 2",
            price: 25,
            poster: "https://via.placeholder.com/300x450/1a1a2e/ffd700?text=Avengers",
            hallLayout: {
                rows: 8,
                seatsPerRow: 10,
                occupiedSeats: ['B3', 'B4', 'D6', 'F2', 'F8'],
                vipRows: [6, 7],
                disabledSeats: []
            }
        },
        // Dodaj więcej seansów...
        4: {
            id: 4,
            movieTitle: "Dune",
            date: "2024-01-15",
            time: "17:00",
            hall: "Sala 3",
            price: 28,
            poster: "https://via.placeholder.com/300x450/2c3e50/ffd700?text=Dune",
            hallLayout: {
                rows: 9,
                seatsPerRow: 14,
                occupiedSeats: ['A7', 'B8', 'B9', 'E5', 'E6', 'E7'],
                vipRows: [7, 8],
                disabledSeats: ['C10']
            }
        }
    };

    useEffect(() => {
        const foundShowtime = mockShowtimes[showtimeId];
        if (foundShowtime) {
            setShowtime(foundShowtime);
        } else {
            navigate('/');
        }
    }, [showtimeId, navigate]);

    const getSeatId = (row, seatNumber) => {
        const rowLetter = String.fromCharCode(65 + row); // A, B, C...
        return `${rowLetter}${seatNumber}`;
    };

    const getSeatStatus = (seatId) => {
        if (!showtime) return 'available';

        const { occupiedSeats, disabledSeats } = showtime.hallLayout;

        if (disabledSeats.includes(seatId)) return 'disabled';
        if (occupiedSeats.includes(seatId)) return 'occupied';
        if (selectedSeats.includes(seatId)) return 'selected';
        return 'available';
    };

    const getSeatPrice = (row) => {
        if (!showtime) return showtime?.price || 0;

        const isVip = showtime.hallLayout.vipRows.includes(row);
        return showtime.price + (isVip ? 5 : 0);
    };

    const handleSeatClick = (seatId, row) => {
        const status = getSeatStatus(seatId);

        if (status === 'occupied' || status === 'disabled') return;

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            if (selectedSeats.length < 8) { // Max 8 biletów
                setSelectedSeats([...selectedSeats, seatId]);
            }
        }
    };

    const calculateTotal = () => {
        return selectedSeats.reduce((total, seatId) => {
            const row = seatId.charCodeAt(0) - 65; // A=0, B=1, etc.
            return total + getSeatPrice(row);
        }, 0);
    };

    const handleCustomerDataChange = (e) => {
        setCustomerData({
            ...customerData,
            [e.target.name]: e.target.value
        });
    };

    const handleBooking = async () => {
        setLoading(true);

        try {
            // Symulacja API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            const booking = {
                id: Date.now(),
                movieTitle: showtime.movieTitle,
                date: showtime.date,
                time: showtime.time,
                hall: showtime.hall,
                seats: selectedSeats,
                total: calculateTotal(),
                customerData,
                bookingDate: new Date().toISOString().split('T')[0]
            };

            setBookingResult(booking);
            setStep(4);

        } catch (error) {
            alert('Wystąpił błąd podczas rezerwacji. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    const renderSeatMap = () => {
        if (!showtime) return null;

        const { rows, seatsPerRow } = showtime.hallLayout;
        const seatMap = [];

        for (let row = 0; row < rows; row++) {
            const rowSeats = [];
            const rowLetter = String.fromCharCode(65 + row);
            const isVipRow = showtime.hallLayout.vipRows.includes(row);

            for (let seat = 1; seat <= seatsPerRow; seat++) {
                const seatId = getSeatId(row, seat);
                const status = getSeatStatus(seatId);

                rowSeats.push(
                    <button
                        key={seatId}
                        className={`seat ${status} ${isVipRow ? 'vip' : ''}`}
                        onClick={() => handleSeatClick(seatId, row)}
                        disabled={status === 'occupied' || status === 'disabled'}
                        title={`${seatId} - ${getSeatPrice(row)}zł${isVipRow ? ' (VIP)' : ''}`}
                    >
                        {seat}
                    </button>
                );
            }

            seatMap.push(
                <div key={row} className="seat-row">
                    <span className="row-label">{rowLetter}</span>
                    <div className="seats">
                        {rowSeats}
                    </div>
                </div>
            );
        }

        return seatMap;
    };

    if (!showtime) {
        return <div className="booking-page loading">Ładowanie...</div>;
    }

    return (
        <div className="booking-page">
            <div className="booking-container">
                {/* Progress Bar */}
                <div className="booking-progress">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                        <span className="step-number">1</span>
                        <span className="step-label">Wybór miejsc</span>
                    </div>
                    <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                        <span className="step-number">2</span>
                        <span className="step-label">Dane kontaktowe</span>
                    </div>
                    <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                        <span className="step-number">3</span>
                        <span className="step-label">Płatność</span>
                    </div>
                    <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
                        <span className="step-number">4</span>
                        <span className="step-label">Potwierdzenie</span>
                    </div>
                </div>

                {/* Movie Info */}
                <div className="movie-info-bar">
                    <img src={showtime.poster} alt={showtime.movieTitle} />
                    <div className="movie-details">
                        <h2>{showtime.movieTitle}</h2>
                        <p>📅 {showtime.date} o {showtime.time}</p>
                        <p>🏛️ {showtime.hall}</p>
                    </div>
                </div>

                {/* Step 1: Seat Selection */}
                {step === 1 && (
                    <div className="booking-step">
                        <h3>Wybierz miejsca</h3>

                        <div className="seat-legend">
                            <div className="legend-item">
                                <div className="seat available small"></div>
                                <span>Dostępne</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat selected small"></div>
                                <span>Wybrane</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat occupied small"></div>
                                <span>Zajęte</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat vip available small"></div>
                                <span>VIP (+5zł)</span>
                            </div>
                            <div className="legend-item">
                                <div className="seat disabled small"></div>
                                <span>Niedostępne</span>
                            </div>
                        </div>

                        <div className="cinema-hall">
                            <div className="screen">EKRAN</div>
                            <div className="seat-map">
                                {renderSeatMap()}
                            </div>
                        </div>

                        {selectedSeats.length > 0 && (
                            <div className="selection-summary">
                                <h4>Wybrane miejsca:</h4>
                                <div className="selected-seats">
                                    {selectedSeats.map(seatId => {
                                        const row = seatId.charCodeAt(0) - 65;
                                        const price = getSeatPrice(row);
                                        const isVip = showtime.hallLayout.vipRows.includes(row);

                                        return (
                                            <div key={seatId} className="selected-seat-item">
                                                <span>{seatId}</span>
                                                <span>{price}zł {isVip && '(VIP)'}</span>
                                                <button
                                                    className="remove-seat"
                                                    onClick={() => handleSeatClick(seatId, row)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="total-price">
                                    <strong>Suma: {calculateTotal()}zł</strong>
                                </div>
                                <button
                                    className="btn btn-primary next-step"
                                    onClick={() => setStep(2)}
                                >
                                    Dalej →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Customer Data */}
                {step === 2 && (
                    <div className="booking-step">
                        <h3>Dane kontaktowe</h3>

                        <div className="customer-form">
                            <div className="form-group">
                                <label htmlFor="name">Imię i nazwisko *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={customerData.name}
                                    onChange={handleCustomerDataChange}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={customerData.email}
                                    onChange={handleCustomerDataChange}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Telefon</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={customerData.phone}
                                    onChange={handleCustomerDataChange}
                                    className="form-input"
                                    placeholder="+48 123 456 789"
                                />
                            </div>
                        </div>

                        <div className="booking-summary">
                            <h4>Podsumowanie rezerwacji:</h4>
                            <div className="summary-item">
                                <span>Film:</span>
                                <span>{showtime.movieTitle}</span>
                            </div>
                            <div className="summary-item">
                                <span>Data i godzina:</span>
                                <span>{showtime.date} o {showtime.time}</span>
                            </div>
                            <div className="summary-item">
                                <span>Sala:</span>
                                <span>{showtime.hall}</span>
                            </div>
                            <div className="summary-item">
                                <span>Miejsca:</span>
                                <span>{selectedSeats.join(', ')}</span>
                            </div>
                            <div className="summary-item total">
                                <span>Do zapłaty:</span>
                                <span>{calculateTotal()}zł</span>
                            </div>
                        </div>

                        <div className="step-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setStep(1)}
                            >
                                ← Wstecz
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => setStep(3)}
                                disabled={!customerData.name || !customerData.email}
                            >
                                Przejdź do płatności →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                    <div className="booking-step">
                        <h3>Płatność</h3>

                        <div className="payment-methods">
                            <div className="payment-method active">
                                <input type="radio" id="card" name="payment" defaultChecked />
                                <label htmlFor="card">
                                    <span className="payment-icon">💳</span>
                                    Karta płatnicza
                                </label>
                            </div>
                            <div className="payment-method">
                                <input type="radio" id="blik" name="payment" />
                                <label htmlFor="blik">
                                    <span className="payment-icon">📱</span>
                                    BLIK
                                </label>
                            </div>
                            <div className="payment-method">
                                <input type="radio" id="transfer" name="payment" />
                                <label htmlFor="transfer">
                                    <span className="payment-icon">🏦</span>
                                    Przelew online
                                </label>
                            </div>
                        </div>

                        <div className="card-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Numer karty</label>
                                    <input
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Data ważności</label>
                                    <input
                                        type="text"
                                        placeholder="MM/RR"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        className="form-input"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Imię i nazwisko na karcie</label>
                                <input
                                    type="text"
                                    placeholder="Jan Kowalski"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="final-summary">
                            <div className="summary-total">
                                <span>Kwota do zapłaty:</span>
                                <span className="amount">{calculateTotal()}zł</span>
                            </div>
                        </div>

                        <div className="step-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setStep(2)}
                            >
                                ← Wstecz
                            </button>
                            <button
                                className="btn btn-primary payment-btn"
                                onClick={handleBooking}
                                disabled={loading}
                            >
                                {loading ? 'Przetwarzanie...' : `Zapłać ${calculateTotal()}zł`}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && bookingResult && (
                    <div className="booking-step confirmation">
                        <div className="success-icon">✅</div>
                        <h3>Rezerwacja potwierdzona!</h3>

                        <div className="booking-details">
                            <p>Numer rezerwacji: <strong>#{bookingResult.id}</strong></p>
                            <p>Na adres <strong>{bookingResult.customerData.email}</strong> został wysłany e-mail z potwierdzeniem.</p>
                        </div>

                        <div className="ticket-preview">
                            <h4>Szczegóły biletu:</h4>
                            <div className="ticket">
                                <div className="ticket-header">
                                    <span>🎬 CinemaApp</span>
                                    <span>#{bookingResult.id}</span>
                                </div>
                                <div className="ticket-content">
                                    <div className="ticket-movie">{bookingResult.movieTitle}</div>
                                    <div className="ticket-details">
                                        <span>📅 {bookingResult.date} {bookingResult.time}</span>
                                        <span>🏛️ {bookingResult.hall}</span>
                                        <span>💺 {bookingResult.seats.join(', ')}</span>
                                        <span>💰 {bookingResult.total}zł</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="confirmation-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/')}
                            >
                                Powrót do strony głównej
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate('/profile')}
                            >
                                Zobacz moje rezerwacje
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;