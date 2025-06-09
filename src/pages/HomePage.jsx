import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);

    // Symulowane dane filmów
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
            showtimes: [
                { id: 1, date: "2024-01-15", time: "18:00", hall: "Sala 1", price: 25 },
                { id: 2, date: "2024-01-15", time: "21:00", hall: "Sala 2", price: 25 },
                { id: 3, date: "2024-01-16", time: "19:30", hall: "Sala 1", price: 25 }
            ]
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
            showtimes: [
                { id: 4, date: "2024-01-15", time: "17:00", hall: "Sala 3", price: 28 },
                { id: 5, date: "2024-01-16", time: "20:00", hall: "Sala 2", price: 28 }
            ]
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
            showtimes: [
                { id: 6, date: "2024-01-15", time: "16:30", hall: "Sala 1", price: 26 },
                { id: 7, date: "2024-01-15", time: "19:45", hall: "Sala 3", price: 26 }
            ]
        }
    ];

    useEffect(() => {
        // Symulacja ładowania danych
        setTimeout(() => {
            setMovies(mockMovies);
        }, 500);
    }, []);

    const handleMovieSelect = (movie) => {
        setSelectedMovie(movie);
    };

    return (
        <div className="home-page">
            <section className="hero">
                <div className="hero-content">
                    <h1>🎬 Witaj w CinemaApp</h1>
                    <p>Odkryj najlepsze filmy i zarezerwuj bilety online</p>
                </div>
            </section>

            <section className="movies-section">
                <div className="container">
                    <h2>Aktualny Repertuar</h2>

                    <div className="movies-grid">
                        {movies.map(movie => (
                            <div key={movie.id} className="movie-card" onClick={() => handleMovieSelect(movie)}>
                                <img src={movie.poster} alt={movie.title} className="movie-poster" />
                                <div className="movie-info">
                                    <h3>{movie.title}</h3>
                                    <p className="movie-meta">{movie.year} • {movie.duration} min</p>
                                    <p className="movie-genre">{movie.genre}</p>
                                    <div className="movie-rating">⭐ {movie.rating}/10</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {selectedMovie && (
                <div className="movie-modal" onClick={() => setSelectedMovie(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedMovie(null)}>×</button>
                        <div className="modal-body">
                            <img src={selectedMovie.poster} alt={selectedMovie.title} className="modal-poster" />
                            <div className="modal-info">
                                <h2>{selectedMovie.title}</h2>
                                <p className="modal-meta">
                                    {selectedMovie.year} • {selectedMovie.duration} min • {selectedMovie.genre}
                                </p>
                                <p className="modal-director">Reżyseria: {selectedMovie.director}</p>
                                <div className="modal-rating">⭐ {selectedMovie.rating}/10</div>
                                <p className="modal-description">{selectedMovie.description}</p>

                                <div className="showtimes">
                                    <h3>Dostępne seanse:</h3>
                                    {selectedMovie.showtimes.map(showtime => (
                                        <div key={showtime.id} className="showtime">
                                            <span>{showtime.date} {showtime.time}</span>
                                            <span>{showtime.hall}</span>
                                            <span>{showtime.price} zł</span>
                                            <Link to={`/booking/${showtime.id}`} className="book-btn">
                                                Kup bilet
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;