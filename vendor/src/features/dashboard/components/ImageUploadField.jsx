import { useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ImageUploadField({ value, onChange, endpoint = "/api/upload/image", token }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
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
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error(err.message || "Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = null; // Reset input
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="sm:col-span-2">
      <p className="mb-2 text-sm font-semibold text-slate-700">Facility Image</p>
      
      {value ? (
        <div className="relative inline-block overflow-hidden rounded-xl border border-slate-200">
          <img src={value} alt="Facility preview" className="h-40 w-full object-cover sm:w-64" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/70"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-8 transition hover:border-blue-400 hover:bg-blue-50/50">
          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading ? (
            <div className="flex flex-col items-center text-blue-500">
              <Loader2 className="mb-2 h-8 w-8 animate-spin" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-500">
              <UploadCloud className="mb-2 h-8 w-8" />
              <span className="text-sm font-medium">Click to upload or drag and drop</span>
              <span className="mt-1 text-xs">JPG, PNG, WEBP (Max 5MB)</span>
            </div>
          )}
        </label>
      )}
    </div>
  );
}
