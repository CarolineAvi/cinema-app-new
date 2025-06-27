import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MovieDetailsPage.css';

const MovieDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const movieRes = await fetch(`http://localhost:5000/api/movies/${id}`);
                if (!movieRes.ok) throw new Error('Nie znaleziono filmu');
                const movieData = await movieRes.json();
                setMovie(movieData);

                const showtimesRes = await fetch(`http://localhost:5000/api/showtimes`);
                if (showtimesRes.ok) {
                    const showtimesData = await showtimesRes.json();
                    setShowtimes(showtimesData.filter(s => s.movieId._id === id));
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div>Błąd: {error}</div>;
    if (!movie) return <div>Nie znaleziono filmu</div>;

    return (
        <div className="movie-details-page">
            <div className="movie-details-header">
                <img src={movie.poster} alt={movie.title} className="movie-poster" />
                <div className="movie-info">
                    <h1>{movie.title}</h1>
                    <div className="movie-meta">
                        <span>⏱️ {movie.duration} min</span>
                        <span>🎭 {movie.genre}</span>
                        <span>📅 {movie.year}</span>
                        <span>⭐ {movie.rating}/10</span>
                    </div>
                    <p className="movie-description">{movie.description}</p>
                    <p className="movie-director">Reżyseria: {movie.director}</p>
                </div>
            </div>

            <div className="movie-showtimes">
                <h2>Dostępne seanse</h2>
                <div className="showtimes-grid">
                    {showtimes.map(showtime => (
                        <div key={showtime._id} className="showtime-card">
                            <div className="showtime-info">
                                <span className="showtime-date">
                                    {new Date(showtime.date).toLocaleDateString('pl-PL')}
                                </span>
                                <span className="showtime-time">{showtime.time}</span>
                                <span className="showtime-hall">Sala: {showtime.hallName}</span>
                            </div>
                            <div className="showtime-price">{showtime.price} zł</div>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate(`/tickets/${showtime._id}`)}
                            >
                                Kup bilet
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MovieDetailsPage;
