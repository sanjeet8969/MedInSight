import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaLock, FaArrowLeft } from 'react-icons/fa';

const ResetPassword = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) navigate('/forgot-password');
  }, [email]);

  useEffect(() => {
    if (resendTimer === 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1].focus();
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

  const handleResend = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      toast.success('New OTP sent!');
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0].focus();
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp: otpValue,
        password
      });

      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      toast.success('Password reset successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏥 Medical AI</h1>
          <p className="text-gray-600">Reset your password</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
          <p className="text-gray-500 text-sm mb-1">OTP sent to</p>
          <p className="text-primary font-semibold mb-6">{email}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OTP Boxes */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Enter OTP</label>
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-blue-200 outline-none transition"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Resend timer */}
              <div className="text-sm text-gray-500 mt-2 text-right">
                {canResend ? (
                  <button type="button" onClick={handleResend} className="text-primary hover:underline">
                    Resend OTP
                  </button>
                ) : (
                  <span>Resend in <span className="text-primary font-semibold">{resendTimer}s</span></span>
                )}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">New Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="flex items-center justify-center gap-2 text-primary hover:underline">
              <FaArrowLeft /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
