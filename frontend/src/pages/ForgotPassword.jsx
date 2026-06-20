import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FaEnvelope,
  FaArrowLeft,
  FaHeartbeat,
  FaShieldAlt,
  FaKey,
} from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
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
                Account Recovery
              </span>

              <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-5">
                Reset your password in a secure way
              </h2>

              <p className="text-cyan-50/85 text-base leading-relaxed">
                Enter your registered email address to receive an OTP and continue
                the password reset process safely.
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-10">
            <div className="flex items-start gap-4 rounded-2xl bg-white/10 border border-white/10 p-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <FaKey className="text-cyan-200" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Quick recovery flow</h3>
                <p className="text-sm text-cyan-50/75">
                  Request OTP, verify your identity, and move to password reset.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-white/10 border border-white/10 p-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <FaShieldAlt className="text-cyan-200" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Protected access</h3>
                <p className="text-sm text-cyan-50/75">
                  Recovery starts only from your registered email address.
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
              <p className="text-slate-500 mt-2">Reset your password</p>
            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 mb-3">
                Forgot Password
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Recover your account
              </h2>
              <p className="text-slate-500">
                Enter your registered email and we'll send you an OTP to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-700 mb-2 font-medium">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 pr-4 text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-lg shadow-teal-200/60 hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition"
              >
                <FaArrowLeft />
                Back to Login
              </Link>
            </div>

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

export default ForgotPassword;