import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "Back", to }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-primary shadow-sm ring-1 ring-blue-100 transition-all hover:-translate-x-0.5 hover:bg-blue-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      <ArrowLeft size={22} strokeWidth={2.4} />
      <span className="sr-only">{label}</span>
    </button>
  );
}
