import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './LoginPage.css';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Przekierowanie po zalogowaniu
    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Wyczyść błąd przy zmianie
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                // Logowanie
                await login(formData.email, formData.password);
                navigate(from, { replace: true });
            } else {
                // Rejestracja
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Hasła nie są identyczne');
                }
                if (formData.password.length < 6) {
                    throw new Error('Hasło musi mieć co najmniej 6 znaków');
                }

                await register({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name
                });
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            email: '',
            password: '',
            name: '',
            confirmPassword: ''
        });
        setError('');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h1>🎬 CinemaApp</h1>
                        <h2>{isLogin ? 'Zaloguj się' : 'Utwórz konto'}</h2>
                        <p>
                            {isLogin
                                ? 'Witaj ponownie! Zaloguj się do swojego konta.'
                                : 'Dołącz do nas i zarezerwuj swój pierwszy bilet!'
                            }
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    <form className="login-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="name" className="form-label">
                                    Imię i nazwisko
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Jan Kowalski"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="twoj@email.com"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Hasło
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">
                                    Potwierdź hasło
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="••••••••"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary login-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading-text">
                                    {isLogin ? 'Logowanie...' : 'Rejestracja...'}
                                </span>
                            ) : (
                                isLogin ? 'Zaloguj się' : 'Utwórz konto'
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            {isLogin ? 'Nie masz jeszcze konta?' : 'Masz już konto?'}
                            <button
                                type="button"
                                className="toggle-btn"
                                onClick={toggleMode}
                            >
                                {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
                            </button>
                        </p>

                        <Link to="/" className="back-home">
                            ← Powrót do strony głównej
                        </Link>
                    </div>

                    {/* Demo konta */}
                    <div className="demo-accounts">
                        <h3>🧪 Konta testowe:</h3>
                        <div className="demo-list">
                            <div className="demo-account">
                                <strong>Admin:</strong> admin@cinema.com / admin123
                            </div>
                            <div className="demo-account">
                                <strong>Pracownik:</strong> staff@cinema.com / staff123
                            </div>
                            <div className="demo-account">
                                <strong>Klient:</strong> user@cinema.com / user123
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;