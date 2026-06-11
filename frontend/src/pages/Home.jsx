import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  FaBrain, FaUpload, FaFileAlt, FaShieldAlt,
  FaCheckCircle, FaArrowRight, FaStar, FaHeartbeat,
  FaUserMd, FaMicroscope, FaLock, FaBars, FaTimes
} from 'react-icons/fa';

// Animated counter hook
const useCounter = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
};

// Fade in section
const FadeIn = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 }
  };
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Stat card component
const StatCard = ({ target, suffix, label }) => {
  const { count, ref } = useCounter(target);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
        {count}{suffix}
      </div>
      <div className="text-blue-200 text-sm font-medium">{label}</div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FaUpload className="text-2xl" />,
      title: 'Upload Any Report',
      desc: 'Support for PDF, JPG, PNG medical documents. Lab reports, X-rays, MRI scans all accepted.',
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: <FaBrain className="text-2xl" />,
      title: 'AI Simplification',
      desc: 'Our AI converts complex medical jargon into simple, easy-to-understand language instantly.',
      color: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: <FaUserMd className="text-2xl" />,
      title: 'Smart Recommendations',
      desc: 'Get personalized health recommendations based on your specific report findings.',
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: 'Privacy First',
      desc: 'Your medical data is encrypted, processed securely and never shared with third parties.',
      color: 'from-rose-500 to-rose-600',
      bg: 'bg-rose-50',
    },
    {
      icon: <FaMicroscope className="text-2xl" />,
      title: 'Detailed Analysis',
      desc: 'Deep analysis of lab values, imaging findings and clinical notes with context.',
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: <FaLock className="text-2xl" />,
      title: 'HIPAA Compliant',
      desc: 'Built following HIPAA and GDPR standards to protect your sensitive health information.',
      color: 'from-indigo-500 to-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  const steps = [
    { num: '01', title: 'Create Account', desc: 'Register with your email and verify with OTP', icon: <FaCheckCircle /> },
    { num: '02', title: 'Upload Report', desc: 'Upload your medical report in PDF or image format', icon: <FaUpload /> },
    { num: '03', title: 'AI Analysis', desc: 'Our AI processes and analyzes your report instantly', icon: <FaBrain /> },
    { num: '04', title: 'Get Results', desc: 'Read simplified results and health recommendations', icon: <FaHeartbeat /> },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Patient', text: 'Finally I can understand my blood reports! The AI explained everything so clearly. I used to be confused about my test values but now I know exactly what to do.', rating: 5 },
    { name: 'Rajesh Kumar', role: 'Patient', text: 'My mother is 65 and could never understand her reports. This app changed everything for us. The recommendations are very helpful and easy to follow.', rating: 5 },
    { name: 'Anita Singh', role: 'Patient', text: 'Amazing tool! The way it breaks down complex medical terms into simple Hindi-friendly language is incredible. Very useful for common people like us.', rating: 5 },
  ];

  return (
    <div className="font-sans overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FaHeartbeat className="text-white text-lg" />
            </div>
            <span className={`text-xl font-bold ${scrolled ? 'text-gray-800' : 'text-white'}`}>
              MedAI
            </span>
          </motion.div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Testimonials'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className={`text-sm font-medium hover:text-blue-500 transition ${scrolled ? 'text-gray-600' : 'text-white/90'}`}
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get Started Free
            </button>
          </div>

          {/* Mobile menu */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen
              ? <FaTimes className={scrolled ? 'text-gray-800' : 'text-white'} size={22} />
              : <FaBars className={scrolled ? 'text-gray-800' : 'text-white'} size={22} />
            }
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4"
          >
            {['Features', 'How It Works', 'Testimonials'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="block text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>{item}</a>
            ))}
            <button onClick={() => navigate('/register')} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-full font-semibold">
              Get Started Free
            </button>
          </motion.div>
        )}
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center overflow-hidden">

        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl"
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-blue-200 text-sm font-medium px-4 py-2 rounded-full border border-white/20 mb-6">
                <FaBrain className="text-blue-300" /> AI-Powered Medical Analysis
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                Understand Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                  Medical Reports
                </span>
                Instantly
              </h1>
              <p className="text-blue-200 text-lg leading-relaxed mb-8">
                Upload any medical report and our AI converts complex medical language into simple, clear explanations with personalized health recommendations.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-blue-900 font-bold px-8 py-4 rounded-full shadow-xl shadow-blue-900/50 hover:shadow-2xl transition-all"
                >
                  Start For Free <FaArrowRight />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur text-white font-semibold px-8 py-4 rounded-full border border-white/30 hover:bg-white/20 transition-all"
                >
                  Login
                </motion.button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-6 mt-10">
                {['HIPAA Compliant', 'AI Powered', '100% Secure'].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 text-blue-300 text-sm">
                    <FaCheckCircle className="text-cyan-400" />
                    {badge}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right - Floating card mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:block"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl"
            >
              {/* Mock report card */}
              <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaFileAlt className="text-blue-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Blood Report Analysis</div>
                    <div className="text-xs text-gray-400">Just analyzed</div>
                  </div>
                  <span className="ml-auto bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full">✓ Done</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Hemoglobin', val: 'Normal', color: 'text-green-600 bg-green-50' },
                    { label: 'Blood Sugar', val: 'Slightly High', color: 'text-amber-600 bg-amber-50' },
                    { label: 'Cholesterol', val: 'Normal', color: 'text-green-600 bg-green-50' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.color}`}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation preview */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
                <div className="text-xs font-semibold text-blue-200 mb-2">💡 AI Recommendation</div>
                <p className="text-sm leading-relaxed">Reduce sugar intake and exercise 30 minutes daily to bring blood sugar to normal levels.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 720 0 0 40L0 80Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard target={10000} suffix="+" label="Reports Analyzed" />
            <StatCard target={98} suffix="%" label="Accuracy Rate" />
            <StatCard target={5000} suffix="+" label="Happy Users" />
            <StatCard target={10} suffix="s" label="Processing Time" />
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-blue-500 font-semibold text-sm uppercase tracking-widest">Features</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
                Everything You Need to
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600"> Understand Your Health</span>
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                Powerful AI tools designed to make medical information accessible to everyone.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -8, shadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-blue-500 font-semibold text-sm uppercase tracking-widest">Process</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
                How It Works
              </h2>
              <p className="text-gray-500 text-lg">Get your report analyzed in 4 simple steps</p>
            </div>
          </FadeIn>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-16 right-16 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-300 to-blue-200 z-0" />

            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {steps.map((step, i) => (
                <FadeIn key={i} delay={i * 0.15}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="text-center group"
                  >
                    <div className="relative inline-block mb-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-200 group-hover:shadow-xl group-hover:shadow-blue-300 transition-all duration-300">
                        <span className="text-white text-3xl">{step.icon}</span>
                      </div>
                      <span className="absolute -top-1 -right-1 w-7 h-7 bg-white border-2 border-blue-500 text-blue-600 text-xs font-bold rounded-full flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 text-lg">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </div>

          <FadeIn delay={0.4}>
            <div className="text-center mt-14">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-10 py-4 rounded-full shadow-lg shadow-blue-200 hover:shadow-xl transition-all"
              >
                Get Started Now <FaArrowRight />
              </motion.button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="bg-gradient-to-br from-slate-50 to-blue-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-blue-500 font-semibold text-sm uppercase tracking-widest">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3 mb-4">
                What Our Users Say
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, j) => (
                      <FaStar key={j} className="text-amber-400 text-sm" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{t.name}</div>
                      <div className="text-gray-400 text-xs">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <FaHeartbeat className="text-white text-3xl" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Take Control of Your Health Today
            </h2>
            <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who now understand their medical reports clearly. Start for free, no credit card required.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-10 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all text-lg"
            >
              Get Started Free <FaArrowRight />
            </motion.button>
            <p className="text-blue-300 text-sm mt-4">No credit card required • Free forever</p>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FaHeartbeat className="text-white text-sm" />
            </div>
            <span className="text-white font-bold text-lg">MedAI</span>
          </div>
          <p className="text-sm text-center">
            ⚠️ For educational purposes only. Not a substitute for professional medical advice.
          </p>
          <p className="text-sm">© 2024 MedAI • UCET, VBU Hazaribag</p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
