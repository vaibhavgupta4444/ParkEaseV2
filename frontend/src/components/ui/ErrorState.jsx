import { AlertCircle } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-error">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="font-bold">Unable to load data</h3>
          <p className="mt-1 text-sm">{message || "Something went wrong. Please try again."}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn-danger mt-4">
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
