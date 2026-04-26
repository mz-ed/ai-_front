import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
// User Pages
import UserDashboard from '../pages/Users/UDashboard';
import BuyingPage from '../pages/Users/Suppliers';
import Productpage from '../pages/Users/Dashboard';


// 404 Not Found
const NotFound = () => (
    <div className="flex items-center justify-center h-screen bg-light-100 dark:bg-dark-950">
        <div className="text-center">
            <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xl mb-8">Page non trouvée</p>
            <a href="/" className="btn-primary">
                Retour à l'accueil
            </a>
        </div>
    </div>
);

// Smart redirect based on role
const SmartRedirect = () => {
    const { isAdmin } = useAuth();

    if (isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Redirect all regular users to UserDashboard
    return <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={isAuthenticated ? <SmartRedirect /> : <Login />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <SmartRedirect /> : <Register />}
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected Routes - Regular Users */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        {isAdmin ? <Navigate to="/admin/dashboard" replace /> : <UserDashboard />}
                    </ProtectedRoute>
                }
            />
         

            {/* Admin Routes */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminUsers />
                    </ProtectedRoute>
                }
            />

            {/* Default route based on authentication */}
            <Route
                path="/"
                element={
                    isAuthenticated ? <SmartRedirect /> : <Navigate to="/login" />
                }
            />
            <Route path="/suppliers"
            element={ <ProtectedRoute requiredRole="admin_fournisseur">
                <BuyingPage />
               </ProtectedRoute>
            } />
             <Route path="/products"
            element={
                <ProtectedRoute requiredRole="admin_fournisseur">
                <Productpage />
                </ProtectedRoute>
            } />
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRoutes;