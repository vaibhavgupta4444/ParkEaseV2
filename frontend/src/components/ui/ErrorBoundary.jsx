import React from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
          <div className="mb-6 rounded-full bg-red-100 p-6 text-red-600">
            <AlertOctagon size={64} />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-slate-900">Oops, something went wrong</h1>
          <p className="mb-8 max-w-md text-slate-500">
            An unexpected error occurred in the application. We've logged the issue and are looking into it.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-800"
          >
            <RefreshCw size={18} />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
