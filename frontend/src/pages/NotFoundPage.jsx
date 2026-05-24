import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-6 rounded-full bg-slate-100 p-6">
        <AlertTriangle size={64} className="text-slate-400" />
      </div>
      <h1 className="mb-2 text-6xl font-black text-slate-900">404</h1>
      <h2 className="mb-6 text-2xl font-bold text-slate-700">Page Not Found</h2>
      <p className="mb-8 max-w-md text-slate-500">
        We couldn't find the page you were looking for. It might have been removed, renamed, or didn't exist in the first place.
      </p>
      <Link to="/" className="btn-primary flex items-center gap-2">
        <Home size={18} />
        Back to Home
      </Link>
    </div>
  );
}
