import AuthInput from "./components/AuthInput";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function AuthForm({
  mode,
  values,
  onChange,
  onBlur,
  onSubmit,
  loading,
  error,
  errors = {},
  onSwitchMode,
}) {
  const isRegister = mode === "register";

  return (
    <div className="w-full">
      <div className="border-b border-border bg-blue-50 px-6 py-7 text-center sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">PARKEASE</p>
        <h2 className="mt-3 text-2xl font-bold text-textPrimary">
          {isRegister ? "Join the mobility revolution" : "Welcome back to ParkEase"}
        </h2>
        <p className="mt-2 text-sm text-textSecondary">
          {isRegister ? "Create your account to start parking smarter" : "Login to access your personalized parking dashboard"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 px-6 py-6 sm:px-8">
        {isRegister && (
          <AuthInput
            label="Full Name"
            name="name"
            value={values.name}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="John Doe"
            error={errors.name}
          />
        )}

        <AuthInput
          label="Email Address"
          type="email"
          name="email"
          value={values.email}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="you@example.com"
          error={errors.email}
        />

        <AuthInput
          label="Password"
          type="password"
          name="password"
          value={values.password}
          onChange={onChange}
          onBlur={onBlur}
          placeholder="••••••••"
          minLength={8}
          error={errors.password}
        />

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-1 flex w-full items-center justify-center gap-2 py-3"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Authenticating...
            </>
          ) : (
            isRegister ? "Create Free Account" : "Access Dashboard"
          )}
        </button>
      </form>

      <div className="relative px-6 sm:px-8">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="mx-6 w-full border-t border-border sm:mx-8"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-surface px-4 text-xs font-semibold uppercase text-textMuted">or</span>
        </div>
      </div>

      <div className="px-6 pb-6 pt-5 sm:px-8">
        <button
          type="button"
          onClick={onSwitchMode}
          className="btn-secondary w-full py-3"
        >
          {isRegister ? "Already have an account? Login" : "New to ParkEase? Register Now"}
        </button>
      </div>
    </div>
  );
}
