export default function AuthSuccess({ user, onLogout }) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
      <h1 className="text-2xl font-bold text-slate-900">Logged in</h1>
      <p className="mt-2 text-sm text-slate-500">You are authenticated successfully.</p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p>
          <strong>Name:</strong> {user?.name}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 font-semibold text-white shadow-lg shadow-blue-500/20"
        onClick={onLogout}
      >
        Logout
      </button>
    </div>
  );
}
