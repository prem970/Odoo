import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.state.errorInfo = errorInfo;
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                    <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong.</h1>
                        <p className="text-neutral-600 mb-6">
                            The application encountered an error while processing your request.
                        </p>

                        <div className="bg-neutral-100 p-4 rounded-lg overflow-auto max-h-64 mb-6">
                            <p className="font-mono text-sm text-red-500 font-semibold">{this.state.error && this.state.error.toString()}</p>
                            <pre className="font-mono text-xs text-neutral-500 mt-2 whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>

                        <button
                            onClick={() => window.location.href = '/login'}
                            className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
