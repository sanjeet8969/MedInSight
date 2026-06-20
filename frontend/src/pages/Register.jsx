import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUser, FaEnvelope, FaLock, FaHeartbeat, FaShieldAlt, FaFileMedical } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      toast.success('OTP sent to your email!');
      navigate('/verify-otp', { state: { email: formData.email, purpose: 'register' } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-100 flex items-center justify-center px-4 py-10">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.65),transparent_30%)]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/70 border border-white/60 bg-white/70 backdrop-blur-xl">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 p-10 xl:p-12 text-white">
          <div>
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/15 flex items-center justify-center">
                <FaHeartbeat className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">MedInSight</h1>
                <p className="text-sm text-cyan-100/80">Smart medical report platform</p>
              </div>
            </div>

            <div className="max-w-md">
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-cyan-200 mb-5">
                <FaShieldAlt />
                Secure Registration
              </span>

              <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-5">
                Create your account and get started safely
              </h2>

              <p className="text-cyan-50/85 text-base leading-relaxed">
                Register to access your medical dashboard, upload reports securely,
                and continue with OTP verification in a clean and simple workflow.
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-10">
            <div className="flex items-start gap-4 rounded-2xl bg-white/10 border border-white/10 p-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <FaFileMedical className="text-cyan-200" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Medical-focused experience</h3>
                <p className="text-sm text-cyan-50/75">
                  Clean healthcare-style UI with simple and understandable flow.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-white/10 border border-white/10 p-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <FaShieldAlt className="text-cyan-200" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">OTP-based signup flow</h3>
                <p className="text-sm text-cyan-50/75">
                  Register first, verify by email, and continue securely.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full bg-white/85 backdrop-blur-xl p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="max-w-md mx-auto">
            {/* Mobile brand */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-200">
                <FaHeartbeat className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mt-4">MedInSight</h1>
              <p className="text-slate-500 mt-2">Create an account to get started</p>
            </div>

            {/* Desktop form heading */}
            <div className="hidden lg:block mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 mb-3">
                Register
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Create your account
              </h2>
              <p className="text-slate-500">
                Enter your details below to begin the registration process.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-700 mb-2 font-medium">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-2 font-medium">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-2 font-medium">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-2 font-medium">Confirm Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full h-13 rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-lg shadow-teal-200/60 hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending OTP...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-slate-600 mt-7">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700 transition">
                Login here
              </Link>
            </p>

            <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
              <p>⚠️ For educational purposes only</p>
              <p>Not a substitute for professional medical advice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;