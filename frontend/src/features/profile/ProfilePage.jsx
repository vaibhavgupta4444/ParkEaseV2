import { useState } from "react";
import { toast } from "react-hot-toast";
import { Camera, Car, Cog, Plus, Receipt, Trash2, User, Wallet } from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { updateProfile } from "../../services/authService";
import { formatCurrency, formatDate, getApiErrorMessage } from "../../utils/formatters";
import { validateField } from "../../utils/validation";

export default function ProfilePage({ user, token, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState("profile"); // profile, vehicles, wallet, settings
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    smsNotifications: user?.preferences?.smsNotifications ?? false,
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
    };
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
         name: formData.name,
         email: formData.email,
         phone: formData.phone,
         preferences: {
             ...user.preferences,
             emailNotifications: formData.emailNotifications,
             smsNotifications: formData.smsNotifications
         }
      };
      
      const res = await updateProfile(payload, token);
      onUpdateUser(res.user);
      setMessage("Profile updated successfully!");
      toast.success("Profile updated successfully");
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fadeIn">
       <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-4 gap-8">
          
          {/* Sidebar Menu */}
          <div className="space-y-2">
             {[
                { id: "profile", icon: User, label: "My Profile" },
                { id: "vehicles", icon: Car, label: "Saved Vehicles" },
                { id: "wallet", icon: Wallet, label: "ParkEase Wallet" },
                { id: "settings", icon: Cog, label: "Security & Settings" }
             ].map(item => {
                const Icon = item.icon;
                return (
                <button
                   key={item.id}
                   onClick={() => { setActiveTab(item.id); setMessage(""); setError(""); }}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                      activeTab === item.id 
                         ? "bg-white text-blue-600 shadow-sm border border-slate-200" 
                         : "text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                   }`}
                >
                   <Icon className="h-5 w-5" />
                   {item.label}
                </button>
             )})}
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
             
             {message && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl">{message}</div>}
             {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-xl">{error}</div>}

             {activeTab === "profile" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                   <div className="mb-6">
                      <BackButton label="Back to Home" to="/" />
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Personal Information</h2>
                   
                   <div className="flex items-center gap-6 mb-8">
                      <div className="relative group">
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blue-100 text-primary shadow-lg">
                            {user?.profilePhoto ? (
                               <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                               <User className="h-10 w-10" />
                            )}
                         </div>
                         <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primaryHover">
                            <Camera className="h-4 w-4" />
                         </button>
                      </div>
                      <div>
                         <h3 className="font-bold text-xl">{user?.name}</h3>
                         <p className="text-slate-500 text-sm">Member since {formatDate(user?.createdAt || Date.now())}</p>
                      </div>
                   </div>

                   <form onSubmit={handleUpdate} className="space-y-5 max-w-xl">
                      <div>
                         <label className="field-label">Full Name</label>
                         <input type="text" value={formData.name} onChange={e => {
                            const value = e.target.value;
                            setFormData({...formData, name: value});
                            if (submitted || fieldErrors.name) setFieldErrors(prev => ({...prev, name: validateField("name", value)}));
                         }} onBlur={() => setFieldErrors(prev => ({...prev, name: validateField("name", formData.name)}))} className={`border border-border rounded-lg px-4 py-2.5 text-sm text-textPrimary bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all ${fieldErrors.name ? "border-error focus:border-error focus:ring-red-100" : ""}`} />
                         {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="field-label">Email Address</label>
                            <input type="email" value={formData.email} onChange={e => {
                              const value = e.target.value;
                              setFormData({...formData, email: value});
                              if (submitted || fieldErrors.email) setFieldErrors(prev => ({...prev, email: validateField("email", value)}));
                            }} onBlur={() => setFieldErrors(prev => ({...prev, email: validateField("email", formData.email)}))} className={`border border-border rounded-lg px-4 py-2.5 text-sm text-textPrimary bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all ${fieldErrors.email ? "border-error focus:border-error focus:ring-red-100" : ""}`} />
                            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                         </div>
                         <div>
                            <label className="field-label">Phone Number</label>
                            <input type="tel" value={formData.phone} onChange={e => {
                              const value = e.target.value;
                              setFormData({...formData, phone: value});
                              if (submitted || fieldErrors.phone) setFieldErrors(prev => ({...prev, phone: validateField("phone", value)}));
                            }} onBlur={() => setFieldErrors(prev => ({...prev, phone: validateField("phone", formData.phone)}))} className={`border border-border rounded-lg px-4 py-2.5 text-sm text-textPrimary bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all ${fieldErrors.phone ? "border-error focus:border-error focus:ring-red-100" : ""}`} placeholder="9876543210"/>
                            {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
                         </div>
                      </div>
                      <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end">
                         <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                            {loading && <LoadingSpinner />}
                            {loading ? "Saving..." : "Save Changes"}
                         </button>
                      </div>
                   </form>
                </div>
             )}

             {activeTab === "vehicles" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                   <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                      <h2 className="text-2xl font-black text-slate-900">Saved Vehicles</h2>
                      <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition flex items-center gap-2">
                         <Plus className="h-4 w-4" /> Add Vehicle
                      </button>
                   </div>
                   
                   {(!user?.vehicles || user.vehicles.length === 0) ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                         <Car className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                         <p className="font-bold text-slate-700">No vehicles saved yet</p>
                         <p className="text-sm text-slate-500">Save your vehicle details to speed up checkout</p>
                      </div>
                   ) : (
                      <div className="grid gap-4">
                         {user.vehicles.map((v, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                               <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                     <Car className="h-5 w-5" />
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-slate-900">{v.plateNumber}</h4>
                                     <p className="text-sm text-slate-500 capitalize">{v.type} • {v.make} {v.model}</p>
                                  </div>
                               </div>
                               <button className="text-slate-400 hover:text-rose-500 transition px-3 py-2">
                                  <Trash2 className="h-4 w-4" />
                               </button>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             )}

             {activeTab === "wallet" && (
                <div className="space-y-6">
                   <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden text-center">
                     <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Wallet className="h-24 w-24" />
                     </div>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2 relative z-10">Available Balance</p>
                     <h2 className="text-5xl font-black relative z-10 mb-6">{formatCurrency(user?.walletBalance || 0)}</h2>
                     <div className="flex gap-4 relative z-10 justify-center">
                        <button className="bg-primary text-white rounded-lg px-5 py-2.5 font-semibold text-sm hover:bg-primaryHover transition-all">
                           Add Funds
                        </button>
                        <button className="bg-white text-primary border border-primary rounded-lg px-5 py-2.5 font-semibold text-sm hover:bg-blue-50 transition-all">
                           Withdraw
                        </button>
                     </div>
                   </div>

                   <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Recent Transactions</h3>
                      <div className="text-center py-10 text-slate-500">
                         <Receipt className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                         <p>No recent activity</p>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === "settings" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                   <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Settings</h2>
                   
                   <div className="space-y-8">
                      <div>
                         <h3 className="font-bold text-lg mb-4">Notifications</h3>
                         <div className="space-y-3 max-w-xl">
                            <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                               <div>
                                  <p className="font-bold text-slate-800">Email Alerts</p>
                                  <p className="text-xs text-slate-500">Booking confirmations and receipts</p>
                               </div>
                               <input type="checkbox" checked={formData.emailNotifications} onChange={e => setFormData({...formData, emailNotifications: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                            </label>
                            <label className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer transition">
                               <div>
                                  <p className="font-bold text-slate-800">Push Notifications</p>
                                  <p className="text-xs text-slate-500">Time reminders and wallet updates</p>
                               </div>
                               <input type="checkbox" checked={formData.smsNotifications} onChange={e => setFormData({...formData, smsNotifications: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                            </label>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100">
                         <h3 className="font-bold text-lg text-rose-600 mb-2">Danger Zone</h3>
                         <p className="text-sm text-slate-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                         <button className="border-2 border-rose-600 text-rose-600 font-bold px-6 py-2 rounded-lg hover:bg-rose-50 transition">
                            Delete Account
                         </button>
                      </div>
                   </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
