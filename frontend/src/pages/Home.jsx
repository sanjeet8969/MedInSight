import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  FaBrain,
  FaUpload,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaStar,
  FaLock,
  FaBars,
  FaTimes,
  FaFilePdf,
  FaEye,
  FaHeartbeat,
  FaUserCircle,
  FaNotesMedical,
  FaCloudUploadAlt,
} from 'react-icons/fa';

const FadeIn = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

const floatingY = {
  y: [0, -10, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

const floatingYSlow = {
  y: [0, -14, 0],
  transition: {
    duration: 5.5,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

const Home = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FaUpload className="text-xl" />,
      title: 'Upload Medical Reports',
      desc: 'Users can sign in and upload their medical report PDFs safely from any device.',
    },
    {
      icon: <FaEye className="text-xl" />,
      title: 'View PDF Online',
      desc: 'Read uploaded reports directly inside the platform without searching files again.',
    },
    {
      icon: <FaBrain className="text-xl" />,
      title: 'Simple Explanations',
      desc: 'Medical report details can be shown in a more readable and patient-friendly way.',
    },
    {
      icon: <FaNotesMedical className="text-xl" />,
      title: 'Important Highlights',
      desc: 'Focus on the major findings and report sections that need attention first.',
    },
    {
      icon: <FaUserCircle className="text-xl" />,
      title: 'Personal Dashboard',
      desc: 'Each user gets a dedicated space to manage uploaded reports in one place.',
    },
    {
      icon: <FaShieldAlt className="text-xl" />,
      title: 'Secure Access',
      desc: 'Sensitive report documents remain private and accessible only to the user.',
    },
  ];

  const steps = [
  {
    number: "01",
    icon: <FaCloudUploadAlt />,
    title: "Upload Medical Report",
    description:
      "Upload blood tests, radiology scans, or health reports securely in PDF or image format.",
  },
  {
    number: "02",
    icon: <FaFilePdf />,
    title: "AI Reads Your Report",
    description:
      "Our AI extracts medical values, findings, and important observations automatically.",
  },
  {
    number: "03",
    icon: <FaBrain />,
    title: "Simple Explanation",
    description:
      "Complex medical terms are converted into easy-to-understand language for patients.",
  },
  {
    number: "04",
    icon: <FaHeartbeat />,
    title: "Get Health Insights",
    description:
      "Receive summaries, recommendations, and questions to discuss with your doctor.",
  },
];

  const benefits = [
    'Designed for easy medical report access',
    'Helpful for checking reports anytime online',
    'Built around secure upload and user privacy',
    'Clear and simple interface for better usability',
  ];

  const testimonials = [
    {
      name: 'Ravi Kumar',
      role: 'Student User',
      text: 'The platform is easy to use. I can upload my report and check the PDF whenever I need it.',
      rating: 5,
    },
    {
      name: 'Neha Singh',
      role: 'Patient',
      text: 'I liked the clean design. It makes report upload and viewing feel simple and organized.',
      rating: 5,
    },
    {
      name: 'Aman Raj',
      role: 'User',
      text: 'This homepage clearly explains the platform. The medical report flow feels much better now.',
      rating: 5,
    },
  ];

  return (
    <div className="font-sans overflow-x-hidden bg-[#f6f8f6] text-gray-800">
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl shadow-sm py-3 border-b border-white/50'
            : 'bg-white/70 backdrop-blur-lg py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-sm">
              <FaHeartbeat className="text-white text-lg" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-gray-900">MedInsight</div>
              <div className="text-xs text-gray-500">
                AI Medical Report Viewer
              </div>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Why Choose Us', 'Testimonials'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-emerald-700"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition"
            >
              Get Started
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <FaTimes className="text-gray-800" size={22} />
            ) : (
              <FaBars className="text-gray-800" size={22} />
            )}
          </button>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-4"
          >
            {['Features', 'How It Works', 'Why Choose Us', 'Testimonials'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="block text-gray-700 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => navigate('/register')}
              className="w-full bg-emerald-600 text-white py-3 rounded-full font-semibold"
            >
              Get Started
            </button>
          </motion.div>
        )}
      </nav>

      {/* HERO */}
      {/* HERO */}
<section className="relative pt-28 pb-14 bg-[#f6f8f6]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6">
    <div className="relative min-h-[88vh] overflow-hidden rounded-[34px] shadow-[0_25px_90px_rgba(0,0,0,0.18)]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://www.healthnivaran.in/_next/image?url=%2Fnivaran-hero2.webp&w=1920&q=90"
          alt="AI medical report analysis background"
          className="w-full h-full object-cover scale-[1.03]"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,27,20,0.5)_0%,rgba(14,38,31,0.5)_36%,rgba(16,42,37,0.2)_10%,rgba(0,0,0,0.16)_100%)]" />
      <div className="absolute inset-0 bg-black/10" />

      {/* Soft blur accents */}
      <div className="absolute left-[-40px] top-[18%] w-72 h-72 bg-emerald-400/10 blur-3xl rounded-full" />
      <div className="absolute right-[8%] top-[10%] w-52 h-52 bg-amber-200/10 blur-3xl rounded-full" />

      <div className="relative z-10 flex items-center min-h-[88vh] px-6 sm:px-10 lg:px-14 py-14">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-emerald-50 text-sm font-medium px-4 py-2 rounded-full border border-white/15 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Medical Report Analysis
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.96] tracking-[-0.03em] mb-6">
            Understand your
            <span className="block text-emerald-300">
              medical reports
            </span>
            before your next visit
          </h1>

          <p className="text-lg md:text-xl text-slate-200 leading-relaxed max-w-xl mb-8">
            Upload your report after login, view your PDF securely, and
            understand important findings in a simpler and clearer way.
          </p>

          <div className="flex flex-wrap gap-4 mb-10">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              className="flex items-center gap-3 bg-white hover:bg-emerald-50 text-slate-900 font-bold pl-7 pr-3 py-3 rounded-full shadow-xl transition-all"
            >
              Get Started
              <span className="w-11 h-11 rounded-full bg-slate-950 text-white flex items-center justify-center">
                <FaArrowRight />
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-full border border-white/20 hover:bg-white/15 transition-all"
            >
              Login
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            {['Secure PDF upload', 'View reports online', 'Simple health insights'].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-3 text-sm text-slate-100"
              >
                <FaCheckCircle className="text-emerald-300 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </div>
</section>

      {/* QUICK TRUST */}
      <section className="py-8 border-y border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">PDF</div>
            <div className="text-sm text-gray-500 mt-1">Upload Support</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">Online</div>
            <div className="text-sm text-gray-500 mt-1">Report Viewing</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">Private</div>
            <div className="text-sm text-gray-500 mt-1">User Access</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">Simple</div>
            <div className="text-sm text-gray-500 mt-1">Better Understanding</div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-[0.2em]">
                Features
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-5">
                Everything needed to manage medical reports more easily
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                The platform is designed for users who want a simple place to upload,
                view, and understand medical report PDFs without confusion.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  className="h-full rounded-3xl border border-slate-100 bg-slate-50 p-7 hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-[0.2em]">
                How It Works
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-5">
                Start in four simple steps
              </h2>
              <p className="text-gray-500 text-lg">
                A straightforward user flow makes your product easier to understand and use.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  className="h-full bg-white rounded-3xl border border-slate-100 p-7 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl">
                      {step.icon}
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why-choose-us" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <div>
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-[0.2em]">
                Why Choose Us
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-5">
                Built for clarity, simplicity, and secure report access
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-2xl">
                Medical reports often feel technical and difficult to revisit later.
                This platform gives users a cleaner way to upload reports, open PDFs,
                and stay organized from one place.
              </p>

              <div className="space-y-4">
                {benefits.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4"
                  >
                    <FaCheckCircle className="text-emerald-600 mt-1 shrink-0" />
                    <p className="text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="left" delay={0.1}>
            <div className="rounded-[32px] bg-gradient-to-br from-slate-900 to-emerald-900 p-8 md:p-10 text-white shadow-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 text-sm text-emerald-100 mb-6">
                <FaShieldAlt />
                Private Medical Report Space
              </div>

              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Keep reports organized and available whenever you need them
              </h3>

              <p className="text-slate-200 leading-relaxed mb-8">
                A better report experience starts with simple upload, instant access,
                secure storage, and cleaner visibility into your medical PDFs.
              </p>

              <div className="space-y-4">
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-sm text-slate-200">Report Upload</span>
                  <span className="text-xs font-semibold bg-emerald-400/20 text-emerald-200 px-3 py-1 rounded-full">
                    Ready
                  </span>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-sm text-slate-200">PDF View</span>
                  <span className="text-xs font-semibold bg-cyan-400/20 text-cyan-200 px-3 py-1 rounded-full">
                    Available
                  </span>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-sm text-slate-200">Secure Access</span>
                  <span className="text-xs font-semibold bg-emerald-400/20 text-emerald-200 px-3 py-1 rounded-full">
                    Protected
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-emerald-600 font-semibold text-sm uppercase tracking-[0.2em]">
                Testimonials
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3 mb-5">
                What users say about the experience
              </h2>
              <p className="text-gray-500 text-lg">
                Clean structure and better usability make the platform feel more useful and professional.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                  className="h-full bg-white rounded-3xl border border-slate-100 p-7 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(item.rating)].map((_, j) => (
                      <FaStar key={j} className="text-amber-400 text-sm" />
                    ))}
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    "{item.text}"
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-slate-400 text-xs">{item.role}</div>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaLock className="text-white text-3xl" />
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5">
              Start managing your medical reports with confidence
            </h2>

            <p className="text-cyan-50 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Register now to upload report PDFs, view them anytime online, and make your medical records easier to access and understand.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-10 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all text-lg"
            >
              Get Started <FaArrowRight />
            </motion.button>

            <p className="text-cyan-100 text-sm mt-4">
              Secure login • PDF upload • Private access
            </p>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <FaHeartbeat className="text-white text-sm" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">MedInsight</div>
              <div className="text-xs text-slate-500">AI Medical Report Viewer</div>
            </div>
          </div>

          <p className="text-sm text-center max-w-xl">
            This platform helps users upload, view, and organize medical reports, but it does not replace professional medical advice or diagnosis.
          </p>

          <p className="text-sm">© 2026 MedInsight</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;