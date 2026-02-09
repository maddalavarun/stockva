import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('token');
                } else {
                    // sub is user_id, username and role are additional claims at the root
                    setUser({
                        id: decoded.sub,
                        username: decoded.username,
                        role: decoded.role
                    });
                }
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/auth/login', { username, password });
        const { access_token } = res.data;
        localStorage.setItem('token', access_token);
        const decoded = jwtDecode(access_token);
        setUser({
            id: decoded.sub,
            username: decoded.username,
            role: decoded.role
        });
        return decoded;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
