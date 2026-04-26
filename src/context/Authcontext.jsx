import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authService.getCurrentUser();
            if (response.success) {
                setUser(response.user);
            }
        } catch (err) {
            // Silently fail - user is just not authenticated
            console.log('Not authenticated');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.login(credentials);

            if (response.success) {
                setUser(response.user);
                return {
                    success: true,
                    message: response.message,
                    user: response.user // Return user data
                };
            }
        } catch (err) {
            const errorMessage = err.message || 'Login failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Register
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.register(userData);

            if (response.success) {
                return { success: true, message: response.message };
            }
        } catch (err) {
            const errorMessage = err.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        try {
            setLoading(true);
            await authService.logout();
            setUser(null);
            return { success: true };
        } catch (err) {
            console.error('Logout error:', err);
            // Still clear user on frontend even if backend fails
            setUser(null);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    // Verify email
    const verifyEmail = async (token) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.verifyEmail(token);
            return { success: true, message: response.message };
        } catch (err) {
            const errorMessage = err.message || 'Email verification failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Forgot password
    const forgotPassword = async (email) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.forgotPassword(email);
            return { success: true, message: response.message };
        } catch (err) {
            const errorMessage = err.message || 'Failed to send reset email';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Reset password
    const resetPassword = async (token, password) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.resetPassword(token, password);
            return { success: true, message: response.message };
        } catch (err) {
            const errorMessage = err.message || 'Password reset failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        verifyEmail,
        forgotPassword,
        resetPassword,
        checkAuth,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;