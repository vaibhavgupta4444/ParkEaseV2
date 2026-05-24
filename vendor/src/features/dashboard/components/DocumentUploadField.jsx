import { useState } from "react";
import { FileText, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function DocumentUploadField({ label, value, onChange, endpoint = "/api/upload/document", token }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Please select a PDF, JPG, or PNG file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Document must be less than 10MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const uploadUrl = endpoint.startsWith("/api")
        ? `${apiBase.replace(/\/api$/, "")}${endpoint}`
        : `${apiBase}${endpoint}`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Upload failed");
      }

      const data = await res.json();
      onChange(data.url);
      toast.success("Document uploaded successfully");
    } catch (err) {
      toast.error(err.message || "Document upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = null; // Reset input
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold text-slate-400">{label}</label>
      
      {value ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2 overflow-hidden text-emerald-700">
            <CheckCircle2 size={18} className="shrink-0" />
            <span className="truncate text-sm font-medium">Document uploaded</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={value} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-700 hover:underline">
              View
            </a>
            <button type="button" onClick={handleRemove} className="text-emerald-700 hover:text-emerald-900" aria-label="Remove document">
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <label className="relative flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 transition hover:bg-slate-100">
          <input
            type="file"
            accept="application/pdf, image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-600">
              <FileText size={16} />
              <span className="text-sm font-medium">Upload Document</span>
            </div>
          )}
        </label>
      )}
    </div>
  );
}
