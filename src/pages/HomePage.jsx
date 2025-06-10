import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/movies')
            .then(res => res.json())
            .then(setMovies);
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