import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

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

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate('/login');
  }, [email]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer === 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto focus next input
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏥 Medical AI</h1>
          <p className="text-gray-600">
            {purpose === 'register' ? 'Verify your account' : 'Verify your login'}
          </p>
        </div>

        <div className="card text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter OTP</h2>
          <p className="text-gray-500 mb-2 text-sm">
            We sent a 6-digit OTP to
          </p>
          <p className="text-primary font-semibold mb-6">{email}</p>

          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
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
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-blue-200 outline-none transition"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>

          {/* Resend OTP */}
          <div className="text-sm text-gray-500">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-primary font-medium hover:underline"
              >
                Resend OTP
              </button>
            ) : (
              <p>
                Resend OTP in{' '}
                <span className="text-primary font-semibold">{resendTimer}s</span>
              </p>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-4">
            OTP expires in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
