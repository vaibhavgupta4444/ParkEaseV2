import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "Back", to }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className="mb-6 flex items-center gap-2 text-sm font-medium text-textSecondary transition-colors hover:text-primary"
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
