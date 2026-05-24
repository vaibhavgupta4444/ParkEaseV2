import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { toast } from "react-hot-toast";
import { Send, LifeBuoy, X, CheckCircle, MessageSquare, Clock, User } from "lucide-react";

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchTickets = async () => {
    try {
      const res = await api.getSupportTickets();
      setTickets(res.data);
    } catch (err) {
      toast.error("Failed to load tickets");
    }
  };

  const initData = async () => {
    setLoading(true);
    await fetchTickets();
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setChatLoading(true);
    try {
      const res = await api.getTicketDetails(ticket._id);
      setSelectedTicket(res.data);
    } catch (err) {
      toast.error("Failed to fetch support thread history");
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const res = await api.replyToTicket(selectedTicket._id, replyText);
      toast.success("Response added to ticket thread");
      setReplyText("");
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChangeStatus = async (id, status) => {
    try {
      const res = await api.updateTicketStatus(id, status);
      toast.success(`Ticket status marked as ${status}`);
      setSelectedTicket(res.data);
      fetchTickets();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    return statusFilter === "all" || t.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">Customer Support Ticket Hub</h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Respond to user and merchant enquiries, resolve dispute threads, and modify ticket states
        </p>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Tickets Sidebar column */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-700">Enquiries Enrolled</h3>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-500 bg-white"
              >
                <option value="all">All Enquiries</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="divide-y divide-slate-150 max-h-[50vh] overflow-y-auto pr-1">
              {filteredTickets.map((t) => (
                <button
                  key={t._id}
                  onClick={() => handleSelectTicket(t)}
                  className={`w-full text-left py-3 px-3.5 rounded-xl block transition-all mt-1 cursor-pointer ${
                    selectedTicket?._id === t._id
                      ? "bg-blue-50 border border-blue-100 text-blue-900"
                      : "hover:bg-slate-50 text-slate-700 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-xs truncate max-w-40 font-mono text-slate-800">
                      ID: {t.ticketId || t._id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        t.status === "open"
                          ? "bg-red-50 text-red-650"
                          : t.status === "in_progress"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <span className="block text-xs font-semibold text-slate-700 mt-1.5 truncate">
                    {t.issueType}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1 truncate">
                    {t.description}
                  </span>
                </button>
              ))}
              {filteredTickets.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  No support tickets resolved here yet.
                </div>
              )}
            </div>
          </div>

          {/* Interactive Chat details pane */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 min-h-[58vh] flex flex-col justify-between overflow-hidden">
            {selectedTicket ? (
              <>
                {/* Chat Top Banner */}
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Ticket: {selectedTicket.issueType}
                    </h3>
                    <span className="block text-xs text-slate-400 mt-0.5 font-mono">
                      Ref ID: {selectedTicket.ticketId || selectedTicket._id}
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2 text-xs">
                    {selectedTicket.status !== "resolved" && (
                      <button
                        onClick={() => handleChangeStatus(selectedTicket._id, "resolved")}
                        className="inline-flex items-center gap-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolve Enquiry
                      </button>
                    )}
                    {selectedTicket.status !== "closed" && (
                      <button
                        onClick={() => handleChangeStatus(selectedTicket._id, "closed")}
                        className="inline-flex items-center gap-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        Close Thread
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages feeds list */}
                <div className="flex-1 p-6 space-y-4 max-h-[35vh] overflow-y-auto bg-slate-50/50">
                  {/* Customer issue entry */}
                  <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                      {selectedTicket.submittedBy?.name?.slice(0, 2).toUpperCase() || "CU"}
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1">
                      <span className="block text-[10px] font-black text-slate-400">
                        {selectedTicket.submittedBy?.name || "Customer enquiry submission"}
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {selectedTicket.description}
                      </p>
                    </div>
                  </div>

                  {/* Message thread loops */}
                  {(selectedTicket.messages || []).map((msg, idx) => {
                    const isAdmin = msg.senderRole === "admin";
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 max-w-[80%] ${
                          isAdmin ? "ml-auto flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isAdmin
                              ? "bg-slate-900 text-white"
                              : "bg-blue-50 border border-blue-100 text-blue-600"
                          }`}
                        >
                          {isAdmin ? "AD" : msg.sender?.slice(0, 2).toUpperCase()}
                        </div>
                        <div
                          className={`p-3 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                            isAdmin
                              ? "bg-slate-900 border-slate-800 text-white"
                              : "bg-white border-slate-200 text-slate-700"
                          }`}
                        >
                          <span
                            className={`block text-[9px] font-black ${
                              isAdmin ? "text-slate-400" : "text-slate-400"
                            }`}
                          >
                            {msg.sender}
                          </span>
                          <p>{msg.message}</p>
                          <span
                            className={`block text-[8px] mt-1 ${
                              isAdmin ? "text-slate-500" : "text-slate-400"
                            }`}
                          >
                            {new Date(msg.sentAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Reply submission */}
                <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 flex gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Type your response to enquiry thread..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 p-3 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <button
                    type="submit"
                    className="py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Reply
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
                <LifeBuoy className="w-12 h-12 text-slate-300 mb-3 animate-spin" style={{ animationDuration: '4s' }} />
                <h4 className="font-bold text-slate-600">Select Enquiries Log</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs text-center leading-normal">
                  Click on a support card to inspect messages history and submit administrative answers
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
