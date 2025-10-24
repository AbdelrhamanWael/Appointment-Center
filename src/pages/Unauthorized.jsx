import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default function Unauthorized() {
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || '/';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h1>
                <p className="mt-2 text-gray-600">
                    You don't have permission to access this page.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                    Please contact an administrator if you believe this is an error.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}