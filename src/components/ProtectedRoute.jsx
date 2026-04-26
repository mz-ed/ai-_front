import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading, isAuthenticated } = useAuth();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-dark-950">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                    <p className="text-dark-400">Chargement...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role if required
    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div className="flex items-center justify-center h-screen bg-dark-950">
                <div className="card text-center max-w-md">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Accès Refusé</h2>
                    <p className="text-dark-400 mb-6">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="btn-secondary"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;