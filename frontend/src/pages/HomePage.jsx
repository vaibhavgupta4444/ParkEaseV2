import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CalendarCheck, Car, Clock, Database, MapPin, Menu, Shield, Star, TriangleAlert, Wallet, X, Zap } from "lucide-react";
import Navbar from "../components/navigation/Navbar";

const HomePage = ({ onLogin, onSignup }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Navbar onLogin={onLogin} onSignup={onSignup} />

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full mb-6">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                <span className="text-sm font-semibold text-blue-700">Smart City Solution</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
                Smart Parking,
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"> Simplified</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Eliminate the everyday frustration of finding parking. Real-time availability, smart booking, and seamless digital payments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onSignup}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Parking Smart 🚀
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all"
                >
                  Watch Demo ▶
                </button>
              </div>
              <div className="flex items-center gap-8 mt-8 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 border-2 border-white flex items-center justify-center text-white font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-slate-500">Join 10,000+ happy parkers</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-4 mb-4">
                  <div className="flex justify-between text-white">
                    <span>📍 Available Spots</span>
                    <span className="font-bold">24/32</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>Spot {String.fromCharCode(64 + i)}-{i}2</span>
                      </div>
                      <span className={`text-sm font-semibold ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {i % 2 === 0 ? 'Available' : 'Occupied'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Core Features</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need for a seamless parking experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-slate-100"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">The Urban Parking Predicament</h2>
              <div className="space-y-6">
                {problems.map((problem, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-white/50 rounded-xl">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <problem.icon className="h-5 w-5 text-error" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{problem.title}</h3>
                      <p className="text-slate-600">{problem.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-red-600">15-20</div>
                  <div className="text-slate-600">minutes wasted daily</div>
                </div>
                <div className="h-2 bg-slate-200 rounded-full mb-4">
                  <div className="w-3/4 h-2 bg-red-500 rounded-full"></div>
                </div>
                <p className="text-center text-slate-600">Drivers spend 15-20 minutes searching for parking, wasting fuel and productivity</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How ParkEase Works</h2>
            <p className="text-xl text-slate-600">Simple, smart, and seamless parking in 4 steps</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 relative">
                  {idx + 1}
                  {idx < 3 && <div className="hidden md:block absolute -right-10 top-1/2 w-16 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400"></div>}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-slate-600">Trusted by thousands of drivers across the city</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-slate-600 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="download" className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Park Smarter?</h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of drivers who have simplified their parking experience with ParkEase
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onSignup}
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Get Started Free
              </button>
              <button
                onClick={onLogin}
                className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
                <span className="text-xl font-bold">ParkEase</span>
              </div>
              <p className="text-slate-400">Smart parking for smart cities</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => scrollToSection("features")} className="hover:text-white">Features</button></li>
                <li><button onClick={() => scrollToSection("how-it-works")} className="hover:text-white">How it works</button></li>
                <li><button onClick={onSignup} className="hover:text-white">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 ParkEase. All rights reserved. Smart Parking, Simplified.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Data arrays
const features = [
  { icon: MapPin, title: "Real-Time Slot Availability", description: "Live updates about available, occupied, and EV-enabled slots" },
  { icon: CalendarCheck, title: "Smart Booking", description: "Reserve your space before you arrive for guaranteed availability" },
  { icon: Wallet, title: "Cashless Payments", description: "Supports UPI, cards, digital wallets, and Razorpay" },
  { icon: Bell, title: "Alerts & Notifications", description: "Slot availability, booking expiry, new offers, EV charging updates" },
  { icon: Shield, title: "Anti-Theft Security", description: "Instant alerts for unauthorized vehicle movement" },
  { icon: Zap, title: "EV Readiness", description: "Find and reserve EV charging stations in real-time" }
];

const problems = [
  { icon: Car, title: "Traffic Congestion", description: "Urban centers face massive traffic jams caused by unorganized parking systems" },
  { icon: Clock, title: "Wasted Time & Fuel", description: "Drivers spend 15-20 minutes daily searching for parking" },
  { icon: Database, title: "Lack of Real-Time Info", description: "Most locations offer no live parking updates, causing chaos" },
  { icon: TriangleAlert, title: "Disorder & Penalties", description: "Unauthorized parking obstructs traffic and results in fines" }
];

const steps = [
  { title: "Find", description: "Search for available parking spots near your destination" },
  { title: "Book", description: "Reserve your spot instantly with one click" },
  { title: "Park", description: "Navigate directly to your reserved spot" },
  { title: "Pay", description: "Seamless digital payment after your parking session" }
];

const testimonials = [
  { name: "Rahul Sharma", role: "Daily Commuter", text: "ParkEase has completely changed my daily commute. No more circling around for parking!" },
  { name: "Priya Patel", role: "Business Owner", text: "The real-time availability feature is a lifesaver. I always find parking near my office." },
  { name: "Amit Kumar", role: "EV Owner", text: "Love the EV charging station integration. Now I can charge while I park!" }
];

export default HomePage;
