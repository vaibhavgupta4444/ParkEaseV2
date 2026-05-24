import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Camera, Car, Cog, Plus, Receipt, Trash2, User, Wallet } from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { updateProfile } from "../../services/authService";
import { getPaymentTransactions } from "../../services/paymentService";
import { formatCurrency, formatDate, getApiErrorMessage } from "../../utils/formatters";
import { validateField } from "../../utils/validation";

export default function ProfilePage({ user, token, onUpdateUser }) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile"); // profile, vehicles, wallet, settings
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [transactionsError, setTransactionsError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [vehicleSubmitted, setVehicleSubmitted] = useState(false);
  const [vehicleErrors, setVehicleErrors] = useState({});
  const [vehicleForm, setVehicleForm] = useState({
    nickname: "",
    plateNumber: "",
    type: "",
  });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    smsNotifications: user?.preferences?.smsNotifications ?? false,
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      smsNotifications: user?.preferences?.smsNotifications ?? false,
    });
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (["profile", "vehicles", "wallet", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== "wallet" || !token) return;

    let active = true;
    setTransactionsLoading(true);
    setTransactionsError("");

    getPaymentTransactions(token)
      .then((response) => {
        if (active) setTransactions(response.data || []);
      })
      .catch((err) => {
        const message = getApiErrorMessage(err);
        if (active) setTransactionsError(message);
        toast.error(message);
      })
      .finally(() => {
        if (active) setTransactionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeTab, token]);

  const buildProfilePayload = (overrides = {}) => ({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    preferences: {
      ...(user?.preferences || {}),
      emailNotifications: formData.emailNotifications,
      smsNotifications: formData.smsNotifications,
    },
    vehicles: user?.vehicles || [],
    ...overrides,
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const nextErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone, { required: false }),
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
             ...(user?.preferences || {}),
             emailNotifications: formData.emailNotifications,
             smsNotifications: formData.smsNotifications
         },
         vehicles: user?.vehicles || [],
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

  const updateVehicleForm = (field, value) => {
    const nextValue = field === "plateNumber" ? value.toUpperCase() : value;
    setVehicleForm((prev) => ({ ...prev, [field]: nextValue }));
    if (vehicleSubmitted || vehicleErrors[field]) {
      setVehicleErrors((prev) => ({
        ...prev,
        [field]: validateVehicleField(field, nextValue),
      }));
    }
  };

  const handleAddVehicle = async (event) => {
    event.preventDefault();
    setVehicleSubmitted(true);

    const nextErrors = {
      nickname: validateVehicleField("nickname", vehicleForm.nickname),
      plateNumber: validateVehicleField("plateNumber", vehicleForm.plateNumber),
      type: validateVehicleField("type", vehicleForm.type),
    };
    setVehicleErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      toast.error("Please fix the vehicle form errors");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const nextVehicles = [
        ...(user?.vehicles || []),
        {
          nickname: vehicleForm.nickname.trim(),
          plateNumber: vehicleForm.plateNumber.toUpperCase().replace(/\s+/g, ""),
          type: vehicleForm.type,
        },
      ];

      const res = await updateProfile(buildProfilePayload({ vehicles: nextVehicles }), token);
      onUpdateUser(res.user);
      setVehicleForm({ nickname: "", plateNumber: "", type: "" });
      setVehicleErrors({});
      setVehicleSubmitted(false);
      setShowVehicleForm(false);
      setMessage("Vehicle added successfully!");
      toast.success("Vehicle added successfully");
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (index) => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const nextVehicles = (user?.vehicles || []).filter((_, vehicleIndex) => vehicleIndex !== index);
      const res = await updateProfile(buildProfilePayload({ vehicles: nextVehicles }), token);
      onUpdateUser(res.user);
      setMessage("Vehicle removed successfully!");
      toast.success("Vehicle removed successfully");
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell text-textPrimary">
       <div className="mb-6">
          <div className="flex items-start gap-4">
             <BackButton label="Back to Map" to="/map" />
             <div className="pt-1">
               <h1 className="text-2xl font-bold leading-none text-secondary">Profile</h1>
               <p className="mt-2 text-sm text-textSecondary">Manage your account, vehicles, wallet, and preferences</p>
             </div>
          </div>
       </div>

       <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          
          {/* Sidebar Menu */}
          <div className="h-fit space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
             {[
                { id: "profile", icon: User, label: "My Profile" },
                { id: "vehicles", icon: Car, label: "Saved Vehicles" },
                { id: "wallet", icon: Receipt, label: "Transaction History" },
                { id: "settings", icon: Cog, label: "Security & Settings" }
             ].map(item => {
                const Icon = item.icon;
                return (
                <button
                   key={item.id}
                   onClick={() => { setActiveTab(item.id); setMessage(""); setError(""); }}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-bold transition-all ${
                      activeTab === item.id 
                         ? "bg-blue-50 text-blue-700 border border-blue-100" 
                         : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                   }`}
                >
                   <Icon className="h-5 w-5" />
                   {item.label}
                </button>
             )})}
          </div>

          {/* Main Content Area */}
          <div className="min-w-0">
             
             {message && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl">{message}</div>}
             {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 font-bold rounded-xl">{error}</div>}

             {activeTab === "profile" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                   <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Personal Information</h2>
                   
                   <div className="flex flex-col gap-5 mb-8 sm:flex-row sm:items-center sm:gap-6">
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
                      <div className="min-w-0">
                         <h3 className="truncate font-bold text-xl">{user?.name}</h3>
                         <p className="text-slate-500 text-sm">Member since {formatDate(user?.createdAt || Date.now())}</p>
                      </div>
                   </div>

                   <form onSubmit={handleUpdate} className="space-y-5">
                      <div>
                         <label className="field-label">Full Name</label>
                         <input type="text" required value={formData.name} onChange={e => {
                            const value = e.target.value;
                            setFormData({...formData, name: value});
                            if (submitted || fieldErrors.name) setFieldErrors(prev => ({...prev, name: validateField("name", value)}));
                         }} onBlur={() => setFieldErrors(prev => ({...prev, name: validateField("name", formData.name)}))} className={`field-input ${fieldErrors.name ? "field-input-error" : ""}`} />
                         {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                         <div>
                            <label className="field-label">Email Address</label>
                            <input type="email" required value={formData.email} onChange={e => {
                              const value = e.target.value;
                              setFormData({...formData, email: value});
                              if (submitted || fieldErrors.email) setFieldErrors(prev => ({...prev, email: validateField("email", value)}));
                            }} onBlur={() => setFieldErrors(prev => ({...prev, email: validateField("email", formData.email)}))} className={`field-input ${fieldErrors.email ? "field-input-error" : ""}`} />
                            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                         </div>
                         <div>
                            <label className="field-label">Phone Number</label>
                            <input type="tel" value={formData.phone} onChange={e => {
                              const value = e.target.value;
                              setFormData({...formData, phone: value});
                            if (submitted || fieldErrors.phone) setFieldErrors(prev => ({...prev, phone: validateField("phone", value, { required: false })}));
                            }} onBlur={() => setFieldErrors(prev => ({...prev, phone: validateField("phone", formData.phone, { required: false })}))} className={`field-input ${fieldErrors.phone ? "field-input-error" : ""}`} placeholder="9876543210"/>
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
                      <button
                         type="button"
                         onClick={() => setShowVehicleForm((prev) => !prev)}
                         className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 transition flex items-center gap-2"
                      >
                         <Plus className="h-4 w-4" /> Add Vehicle
                      </button>
                   </div>

                   {showVehicleForm && (
                      <form onSubmit={handleAddVehicle} className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                         <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                               <label className="field-label">Vehicle Nickname</label>
                               <input
                                  type="text"
                                  value={vehicleForm.nickname}
                                  onChange={(e) => updateVehicleForm("nickname", e.target.value)}
                                  onBlur={() => setVehicleErrors((prev) => ({ ...prev, nickname: validateVehicleField("nickname", vehicleForm.nickname) }))}
                                  className={`field-input ${vehicleErrors.nickname ? "field-input-error" : ""}`}
                                  placeholder="Home car"
                                  required
                               />
                               {vehicleErrors.nickname && <p className="field-error">{vehicleErrors.nickname}</p>}
                            </div>
                            <div>
                               <label className="field-label">License Plate</label>
                               <input
                                  type="text"
                                  value={vehicleForm.plateNumber}
                                  onChange={(e) => updateVehicleForm("plateNumber", e.target.value)}
                                  onBlur={() => setVehicleErrors((prev) => ({ ...prev, plateNumber: validateVehicleField("plateNumber", vehicleForm.plateNumber) }))}
                                  className={`field-input uppercase font-semibold tracking-wider ${vehicleErrors.plateNumber ? "field-input-error" : ""}`}
                                  placeholder="MH12AB1234"
                                  required
                               />
                               {vehicleErrors.plateNumber && <p className="field-error">{vehicleErrors.plateNumber}</p>}
                            </div>
                            <div>
                               <label className="field-label">Vehicle Type</label>
                               <select
                                  value={vehicleForm.type}
                                  onChange={(e) => updateVehicleForm("type", e.target.value)}
                                  onBlur={() => setVehicleErrors((prev) => ({ ...prev, type: validateVehicleField("type", vehicleForm.type) }))}
                                  className={`field-input ${vehicleErrors.type ? "field-input-error" : ""}`}
                                  required
                               >
                                  <option value="">Select type</option>
                                  <option value="car">Car</option>
                                  <option value="bike">Bike</option>
                                  <option value="ev">EV</option>
                                  <option value="sedan">Sedan</option>
                                  <option value="suv">SUV</option>
                                  <option value="hatchback">Hatchback</option>
                                  <option value="truck">Truck</option>
                                  <option value="other">Other</option>
                               </select>
                               {vehicleErrors.type && <p className="field-error">{vehicleErrors.type}</p>}
                            </div>
                         </div>
                         <div className="mt-4 flex justify-end gap-3">
                            <button
                               type="button"
                               onClick={() => {
                                  setShowVehicleForm(false);
                                  setVehicleErrors({});
                                  setVehicleSubmitted(false);
                               }}
                               className="btn-ghost"
                            >
                               Cancel
                            </button>
                            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                               {loading && <LoadingSpinner />}
                               Save Vehicle
                            </button>
                         </div>
                      </form>
                   )}
                   
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
                                     <h4 className="font-bold text-slate-900">{v.nickname || "Saved vehicle"}</h4>
                                     <p className="font-mono text-sm font-semibold uppercase tracking-wider text-slate-700">{v.plateNumber}</p>
                                     <p className="text-sm text-slate-500 capitalize">{v.type}</p>
                                  </div>
                               </div>
                               <button
                                  type="button"
                                  onClick={() => handleDeleteVehicle(i)}
                                  disabled={loading}
                                  className="text-slate-400 hover:text-rose-500 transition px-3 py-2 disabled:opacity-50"
                               >
                                  <Trash2 className="h-4 w-4" />
                               </button>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             )}



             {activeTab === "wallet" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                   <h2 className="text-2xl font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Transaction History</h2>
                   {transactionsLoading ? (
                      <div className="flex justify-center py-10">
                         <LoadingSpinner />
                      </div>
                   ) : transactionsError ? (
                      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-600">
                         {transactionsError}
                      </div>
                   ) : transactions.length === 0 ? (
                      <div className="text-center py-10 text-slate-500">
                         <Receipt className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                         <p>No recent transaction activity</p>
                      </div>
                   ) : (
                      <div className="divide-y divide-slate-100">
                         {transactions.map((transaction) => (
                            <div key={transaction._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                               <div className="flex items-center gap-3">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                     transaction.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-primary"
                                  }`}>
                                     <Receipt className="h-5 w-5" />
                                  </div>
                                  <div>
                                     <p className="font-bold text-slate-900">
                                        {transaction.description || "Wallet transaction"}
                                     </p>
                                     <p className="text-xs text-slate-500">
                                        {formatDate(transaction.createdAt)}
                                        {transaction.booking?.bookingRef ? ` - Ref: ${transaction.booking.bookingRef}` : ""}
                                     </p>
                                  </div>
                               </div>
                               <div className="text-left sm:text-right">
                                  <p className={`font-black ${transaction.type === "credit" ? "text-emerald-600" : "text-slate-900"}`}>
                                     {transaction.type === "credit" ? "+" : "-"}{formatCurrency(transaction.amount)}
                                  </p>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                     {transaction.type}
                                  </p>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
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

function validateVehicleField(field, value) {
  if (field === "nickname") return validateField("maxLength", value, { max: 30 });
  if (field === "plateNumber") return validateField("vehicleNumber", value);
  if (field === "type") return String(value ?? "").trim() ? "" : "Please select a vehicle type";
  return "";
}
