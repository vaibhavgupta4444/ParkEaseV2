export default function ProfileTab({ profile, setProfile, onSave }) {
  const docs = profile.documents || [];
  const updateDoc = (type, url) => {
    const existing = docs.findIndex(d => d.type === type);
    const newDocs = [...docs];
    if (existing >= 0) newDocs[existing] = { type, url, uploadedAt: new Date() };
    else newDocs.push({ type, url, uploadedAt: new Date() });
    setProfile(p => ({ ...p, documents: newDocs }));
  };

  return (
    <form onSubmit={onSave} className="mt-6 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
        <h3 className="text-lg font-bold">Business Information</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {["businessName", "ownerName", "phone", "email", "businessAddress", "gstNumber"].map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              <input value={profile[key] || ""} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))} placeholder={key} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
        <h3 className="text-lg font-bold">Bank Details (for Payouts)</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {["accountHolder", "accountNumber", "ifsc", "bankName"].map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase">{key}</label>
              <input value={profile.bankDetails?.[key] || ""} onChange={(e) => setProfile((p) => ({ ...p, bankDetails: { ...(p.bankDetails || {}), [key]: e.target.value } }))} placeholder={key} className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
        <h3 className="text-lg font-bold">Verification Documents</h3>
        <p className="text-xs text-slate-500 mb-4">Upload document proofs (via URL) for verification.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400">Business Registration Certificate (URL)</label>
            <input 
              value={docs.find(d => d.type === "business_reg")?.url || ""} 
              onChange={(e) => updateDoc("business_reg", e.target.value)} 
              placeholder="https://..." 
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm" 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400">Owner ID Proof (URL)</label>
            <input 
              value={docs.find(d => d.type === "id_proof")?.url || ""} 
              onChange={(e) => updateDoc("id_proof", e.target.value)} 
              placeholder="https://..." 
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm" 
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
        <div>
          <span className="text-xs font-bold text-slate-500 block uppercase">Verification Status</span>
          <span className={`text-sm font-bold ${profile.verificationStatus === "verified" ? "text-emerald-600" : "text-amber-600"}`}>
            {profile.verificationStatus || "unverified"}
          </span>
        </div>
        <button className="rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 px-8 py-3 font-bold text-white shadow-lg shadow-blue-500/20">
          Save Profile & Documents
        </button>
      </div>
    </form>
  );
}
