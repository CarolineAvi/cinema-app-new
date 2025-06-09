import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Symulowane dane użytkowników
    const mockUsers = [
        {
            id: 1,
            email: 'admin@cinema.com',
            password: 'admin123',
            accessLevel: 1,
            name: 'Administrator',
            role: 'admin'
        },
        {
            id: 2,
            email: 'staff@cinema.com',
            password: 'staff123',
            accessLevel: 2,
            name: 'Pracownik',
            role: 'staff'
        },
        {
            id: 3,
            email: 'user@cinema.com',
            password: 'user123',
            accessLevel: 3,
            name: 'Jan Kowalski',
            role: 'customer'
        }
    ];

    useEffect(() => {
        // Sprawdź czy użytkownik jest zalogowany (localStorage)
        const savedUser = localStorage.getItem('cinema_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Symulacja API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const foundUser = mockUsers.find(
                    u => u.email === email && u.password === password
                );

                if (foundUser) {
                    const { password: _, ...userWithoutPassword } = foundUser;
                    setUser(userWithoutPassword);
                    localStorage.setItem('cinema_user', JSON.stringify(userWithoutPassword));
                    resolve(userWithoutPassword);
                } else {
                    reject(new Error('Nieprawidłowe dane logowania'));
                }
            }, 1000);
        });
    };

    const register = async (userData) => {
        // Symulacja rejestracji
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const newUser = {
                    id: Date.now(),
                    ...userData,
                    accessLevel: 3, // Domyślnie klient
                    role: 'customer'
                };

                const { password: _, ...userWithoutPassword } = newUser;
                setUser(userWithoutPassword);
                localStorage.setItem('cinema_user', JSON.stringify(userWithoutPassword));
                resolve(userWithoutPassword);
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('cinema_user');
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.accessLevel <= 1,
        isStaff: user?.accessLevel <= 2,
        isCustomer: user?.accessLevel === 3
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};