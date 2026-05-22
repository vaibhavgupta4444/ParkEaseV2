import { useState } from "react";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import AuthForm from "./AuthForm";
import { loginUser, registerUser } from "../../services/authService";
import { getApiErrorMessage } from "../../utils/formatters";
import { validateField } from "../../utils/validation";

export default function AuthModal({ mode: initialMode, onClose, onSuccess, onSwitchMode }) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (submitted || errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateAuthField(name, value, mode) }));
    }
  };

  const onBlur = (event) => {
    const { name, value } = event.target;
    setErrors((prev) => ({ ...prev, [name]: validateAuthField(name, value, mode) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitted(true);

    const nextErrors = {
      ...(mode === "register" ? { name: validateAuthField("name", formValues.name, mode) } : {}),
      email: validateAuthField("email", formValues.email, mode),
      password: validateAuthField("password", formValues.password, mode),
    };
    setErrors(nextErrors);

    const firstError = Object.values(nextErrors).find(Boolean);
    if (firstError) {
      toast.error(firstError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: formValues.email,
        password: formValues.password,
      };

      const data =
        mode === "register"
          ? await registerUser({ ...payload, name: formValues.name, role: formValues.role })
          : await loginUser(payload);
          
      onSuccess(data.token, data.user);
    } catch (submitError) {
      const message = getApiErrorMessage(submitError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setError("");
    setErrors({});
    setSubmitted(false);
    setMode((prev) => (prev === "login" ? "register" : "login"));
    onSwitchMode();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-slate-900/20">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-textMuted shadow-sm transition hover:bg-gray-50 hover:text-textPrimary"
        >
          <X size={16} />
        </button>
        <AuthForm
          mode={mode}
          values={formValues}
          onChange={onChange}
          onBlur={onBlur}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          errors={errors}
          onSwitchMode={switchMode}
        />
      </div>
    </div>
  );
}

function validateAuthField(name, value, mode) {
  if (name === "name" && mode === "register") return validateField("name", value);
  if (name === "email") return validateField("email", value);
  if (name === "password" && mode === "login") {
    return String(value ?? "").trim() ? "" : "Please enter your password";
  }
  if (name === "password") return validateField("password", value);
  return "";
}
