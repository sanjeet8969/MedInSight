import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaHeartbeat, FaShieldAlt, FaEnvelopeOpenText, FaCheckCircle } from 'react-icons/fa';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const email = location.state?.email;
  const purpose = location.state?.purpose || 'register';

  useEffect(() => {
    if (!email) navigate('/login');
  }, [email]);

  useEffect(() => {
    if (resendTimer === 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5].focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp: otpValue
      });

      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      toast.success(response.data.message);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/resend-otp', { email });
      toast.success('New OTP sent to your email!');
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0].focus();
    } catch (error) {
      toast.error('Failed to resend OTP');
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
                <h1 className="text-2xl font-bold">Medical AI</h1>
                <p className="text-sm text-cyan-100/80">Smart medical report platform</p>
              </div>
            </div>

            <div className="max-w-md">
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-cyan-200 mb-5">
                <FaShieldAlt />
                Email Verification
              </span>

              <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-5">
                {purpose === 'register'
                  ? 'Verify your account with the OTP'
                  : 'Verify your login with the OTP'}
              </h2>

              <p className="text-cyan-50/85 text-base leading-relaxed">
                Enter the 6-digit code sent to your email to securely continue your
                {purpose === 'register' ? ' account verification' : ' login verification'} process.
              </p>
            </div>
          </div>

          <div className="space-y-4 mt-10">
            <div className="flex items-start gap-4 rounded-2xl bg-white/10 border border-white/10 p-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <FaEnvelopeOpenText className="text-cyan-200" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">OTP sent to your email</h3>
                <p className="text-sm text-cyan-50/75">
                  Check your inbox and enter the 6-digit code in the boxes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-white/10 border border-white/10 p-4">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <FaCheckCircle className="text-cyan-200" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Fast and secure verification</h3>
                <p className="text-sm text-cyan-50/75">
                  Use the OTP to confirm identity and continue safely to your dashboard.
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
              <h1 className="text-3xl font-bold text-slate-900 mt-4">Medical AI</h1>
              <p className="text-slate-500 mt-2">
                {purpose === 'register' ? 'Verify your account' : 'Verify your login'}
              </p>
            </div>

            {/* Desktop heading */}
            <div className="hidden lg:block mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 mb-3">
                Verify OTP
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Enter verification code</h2>
              <p className="text-slate-500 mb-1 text-sm">We sent a 6-digit OTP to</p>
              <p className="text-teal-600 font-semibold break-all">{email}</p>
            </div>

            {/* Mobile email display */}
            <div className="lg:hidden text-center mb-6">
              <p className="text-slate-500 mb-1 text-sm">We sent a 6-digit OTP to</p>
              <p className="text-teal-600 font-semibold break-all">{email}</p>
            </div>

            {/* OTP boxes */}
            <div className="mb-6" onPaste={handlePaste}>
              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border border-slate-300 bg-slate-50 rounded-2xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 outline-none transition text-slate-900"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-lg shadow-teal-200/60 hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            {/* Resend */}
            <div className="text-sm text-slate-500 text-center">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-teal-600 font-medium hover:text-teal-700 transition"
                >
                  Resend OTP
                </button>
              ) : (
                <p>
                  Resend OTP in <span className="text-teal-600 font-semibold">{resendTimer}s</span>
                </p>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center">
              OTP expires in 10 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;