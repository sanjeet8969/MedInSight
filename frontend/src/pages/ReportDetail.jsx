import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  FaArrowLeft,
  FaLightbulb,
  FaComments,
  FaPaperPlane,
  FaSpinner,
  FaFileMedical,
  FaClock,
  FaExclamationTriangle,
  FaShieldAlt,
  FaBolt,
  FaCalendarAlt,
  FaUtensils,
  FaHeartbeat,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';

const mdComponents = (dotColor = 'bg-teal-400') => ({
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-slate-900 mb-3 mt-1">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-slate-900 mb-3 mt-5 pb-2 border-b border-slate-100">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-slate-800 mb-2 mt-4">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-slate-600 leading-8 mb-3 text-[15px]">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  ul: ({ children }) => <ul className="space-y-2.5 mb-3 ml-1">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-2.5 mb-3 ml-1">{children}</ol>,
  li: ({ children }) => (
    <li className="flex items-start gap-3 text-slate-600 text-[15px] leading-7">
      <span className={`mt-2 w-2 h-2 rounded-full ${dotColor} flex-shrink-0`}></span>
      <span>{children}</span>
    </li>
  ),
});

const SectionCard = ({
  icon,
  title,
  subtitle,
  tone = 'teal',
  children
}) => {
  const toneMap = {
    amber: {
      wrapper: 'from-amber-50 to-yellow-50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-400',
    },
    teal: {
      wrapper: 'from-teal-50 to-cyan-50',
      border: 'border-teal-100',
      iconBg: 'bg-teal-500',
    },
    emerald: {
      wrapper: 'from-emerald-50 to-green-50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-500',
    },
    violet: {
      wrapper: 'from-violet-50 to-purple-50',
      border: 'border-violet-100',
      iconBg: 'bg-violet-500',
    },
    rose: {
      wrapper: 'from-rose-50 to-red-50',
      border: 'border-rose-100',
      iconBg: 'bg-rose-500',
    },
    orange: {
      wrapper: 'from-orange-50 to-amber-50',
      border: 'border-orange-100',
      iconBg: 'bg-orange-500',
    },
  };

  const style = toneMap[tone] || toneMap.teal;

  return (
    <div className="rounded-[28px] bg-white/85 backdrop-blur-xl border border-white/70 shadow-xl shadow-slate-200/60 overflow-hidden">
      <div className={`bg-gradient-to-r ${style.wrapper} ${style.border} border-b px-6 sm:px-8 py-5 flex items-center gap-3`}>
        <div className={`${style.iconBg} rounded-2xl p-3 text-white shadow-sm`}>
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
      </div>
      <div className="px-6 sm:px-8 py-6">{children}</div>
    </div>
  );
};

const SimpleList = ({ items, dotColor, emptyMsg }) => {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-4">
        <p className="text-slate-400 text-sm">{emptyMsg}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className={`mt-1.5 w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`}></span>
          <span className="text-slate-700 text-[15px] leading-7">{item}</span>
        </li>
      ))}
    </ul>
  );
};

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(response.data.data);
    } catch (error) {
      toast.error('Failed to load report');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setIsAsking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/reports/${id}/ask`,
        { question },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnswer(response.data.data.answer);
    } catch (error) {
      toast.error('Failed to get answer');
    } finally {
      setIsAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-teal-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 border-r-cyan-400 animate-spin"></div>
            <FaFileMedical className="absolute inset-0 m-auto text-teal-500 text-2xl" />
          </div>
          <p className="text-slate-700 font-semibold text-lg">Loading your report...</p>
          <p className="text-slate-500 text-sm mt-2">
            Preparing your medical summary and details
          </p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-teal-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-cyan-200/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-2 text-sm text-slate-600 shadow-sm">
              <FaClock className="text-teal-500" />
              {new Date(report.uploadDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-semibold border border-emerald-100">
              <FaCheckCircle />
              Analyzed
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Hero banner */}
        <section className="rounded-[32px] bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 text-white p-6 sm:p-8 md:p-10 shadow-2xl shadow-teal-900/10 mb-8">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100 mb-5">
                <FaHeartbeat />
                AI Medical Report Analysis
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/10 flex items-center justify-center shrink-0">
                  <FaFileMedical className="text-white text-2xl" />
                </div>

                <div className="min-w-0">
                  <p className="text-cyan-100 text-sm font-medium mb-1">Medical report</p>
                  <h1 className="text-2xl sm:text-3xl font-bold break-words">
                    {report.fileName}
                  </h1>
                  <p className="text-cyan-50/75 text-sm mt-2">
                    Processed in {report.processingTime}s using AI-assisted analysis
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white/10 border border-white/10 p-4">
                <p className="text-sm text-cyan-50/85 leading-7">
                  This page gives you a simplified explanation of your report,
                  likely precautions, possible effects, diet-related guidance,
                  and a question box to help you prepare for consultation.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-cyan-100/70 mb-1">
                  Report date
                </p>
                <p className="font-semibold">
                  {new Date(report.uploadDate).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
                <p className="text-xs uppercase tracking-wide text-cyan-100/70 mb-1">
                  Processing time
                </p>
                <p className="font-semibold">{report.processingTime}s</p>
              </div>

              <div className="rounded-2xl bg-amber-400/15 border border-amber-300/20 p-4">
                <p className="text-sm text-amber-50 leading-7">
                  <FaExclamationTriangle className="inline mr-2 text-amber-300" />
                  <strong>Disclaimer:</strong> This AI analysis is for educational
                  purposes only and is not a substitute for professional medical advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Info strip */}
        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-[24px] bg-white/85 backdrop-blur-xl border border-white/70 shadow-lg shadow-slate-200/50 p-5">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <FaLightbulb />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Plain-language summary</h3>
            <p className="text-sm text-slate-500">
              Understand key report points without difficult medical jargon.
            </p>
          </div>

          <div className="rounded-[24px] bg-white/85 backdrop-blur-xl border border-white/70 shadow-lg shadow-slate-200/50 p-5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
              <FaShieldAlt />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Precautions and risks</h3>
            <p className="text-sm text-slate-500">
              Review practical care points and possible effects if ignored.
            </p>
          </div>

          <div className="rounded-[24px] bg-white/85 backdrop-blur-xl border border-white/70 shadow-lg shadow-slate-200/50 p-5">
            <div className="w-11 h-11 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
              <FaComments />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Ask follow-up questions</h3>
            <p className="text-sm text-slate-500">
              Get simple answers that can help prepare for your doctor visit.
            </p>
          </div>
        </section>

        <div className="space-y-6">
          {/* Summary */}
          <SectionCard
            icon={<FaLightbulb className="text-lg" />}
            title="What Your Report Says"
            subtitle="Simplified into plain language"
            tone="amber"
          >
            <ReactMarkdown components={mdComponents('bg-teal-400')}>
              {report.simplifiedText}
            </ReactMarkdown>
          </SectionCard>

          {/* Precautions */}
          <SectionCard
            icon={<FaShieldAlt className="text-lg" />}
            title="Precautions"
            subtitle="Important care points to keep in mind"
            tone="teal"
          >
            <SimpleList
              items={report.precautions}
              dotColor="bg-teal-400"
              emptyMsg="No specific precautions found."
            />
          </SectionCard>

          {/* Consequences */}
          <div className="grid lg:grid-cols-2 gap-6">
            <SectionCard
              icon={<FaBolt className="text-lg" />}
              title="Short-Term Effects"
              subtitle="Possible effects in days or weeks if ignored"
              tone="orange"
            >
              <SimpleList
                items={report.shortTermConsequences}
                dotColor="bg-orange-400"
                emptyMsg="No short-term effects noted."
              />
            </SectionCard>

            <SectionCard
              icon={<FaCalendarAlt className="text-lg" />}
              title="Long-Term Effects"
              subtitle="Possible effects over months or years if untreated"
              tone="rose"
            >
              <SimpleList
                items={report.longTermConsequences}
                dotColor="bg-rose-400"
                emptyMsg="No long-term effects noted."
              />
            </SectionCard>
          </div>

          {/* Diet */}
          <SectionCard
            icon={<FaUtensils className="text-lg" />}
            title="Diet Advice"
            subtitle="Food and nutrition guidance based on your report"
            tone="emerald"
          >
            <SimpleList
              items={report.dietAdvice}
              dotColor="bg-emerald-400"
              emptyMsg="No specific diet changes needed."
            />
          </SectionCard>

          {/* Ask section */}
          <SectionCard
            icon={<FaComments className="text-lg" />}
            title="Ask About Your Report"
            subtitle="Get simple answers related to your report"
            tone="violet"
          >
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-5">
              <div className="flex items-center gap-2 text-slate-700 mb-3">
                <FaInfoCircle className="text-violet-500" />
                <p className="text-sm font-medium">Suggested questions</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'What does this report mean?',
                  'Are my results normal?',
                  'What should I do next?',
                  'What are the risks?'
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestion(q)}
                    className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-violet-700 hover:border-violet-200 hover:bg-violet-50 text-sm transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition text-sm"
                placeholder="Ask anything about your report..."
              />

              <button
                onClick={handleAskQuestion}
                disabled={isAsking}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:from-violet-600 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
              >
                {isAsking ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Ask
                  </>
                )}
              </button>
            </div>

            {answer && (
              <div className="mt-5 rounded-[24px] bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    AI
                  </div>
                  <div>
                    <p className="font-semibold text-violet-900">Answer</p>
                    <p className="text-xs text-violet-600">
                      Simplified explanation for your question
                    </p>
                  </div>
                </div>

                <ReactMarkdown components={mdComponents('bg-violet-400')}>
                  {answer}
                </ReactMarkdown>

                <div className="mt-4 pt-4 border-t border-violet-100">
                  <p className="text-xs text-slate-500 leading-6">
                    ⚠️ For informational purposes only. Always confirm important
                    health decisions with a qualified healthcare professional.
                  </p>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </main>
    </div>
  );
};

export default ReportDetail;