import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  FaArrowLeft, FaLightbulb, FaComments, FaPaperPlane,
  FaSpinner, FaFileMedical, FaClock, FaExclamationTriangle,
  FaShieldAlt, FaBolt, FaCalendarAlt, FaUtensils
} from 'react-icons/fa';

const mdComponents = (dotColor = 'bg-blue-400') => ({
  h1: ({ children }) => <h1 className="text-xl font-bold text-gray-800 mb-3 mt-1">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-bold text-gray-800 mb-2 mt-4 pb-1 border-b border-gray-100">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold text-gray-700 mb-2 mt-3">{children}</h3>,
  p: ({ children }) => <p className="text-gray-600 leading-8 mb-3 text-[15px]">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
  ul: ({ children }) => <ul className="space-y-2 mb-3 ml-1">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-2 mb-3 ml-1">{children}</ol>,
  li: ({ children }) => (
    <li className="flex items-start gap-3 text-gray-600 text-[15px] leading-7">
      <span className={`mt-2 w-2 h-2 rounded-full ${dotColor} flex-shrink-0`}></span>
      <span>{children}</span>
    </li>
  ),
});

// Section card component
const SectionCard = ({ icon, title, subtitle, gradientFrom, gradientTo, iconBg, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} border-b border-gray-100 px-8 py-5 flex items-center gap-3`}>
      <div className={`${iconBg} rounded-xl p-2.5`}>
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    </div>
    <div className="px-8 py-6">{children}</div>
  </div>
);

// Simple list renderer for precautions/consequences/diet
const SimpleList = ({ items, dotColor, emptyMsg }) => {
  if (!items || items.length === 0) {
    return <p className="text-gray-400 text-sm">{emptyMsg}</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className={`mt-1.5 w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`}></span>
          <span className="text-gray-700 text-[15px] leading-7">{item}</span>
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

  useEffect(() => { fetchReport(); }, [id]);

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
    if (!question.trim()) { toast.error('Please enter a question'); return; }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
            <FaFileMedical className="absolute inset-0 m-auto text-blue-500 text-2xl" />
          </div>
          <p className="text-gray-600 font-medium text-lg">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Sticky Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all duration-200 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <FaClock className="text-gray-400 text-sm" />
            <span className="text-sm text-gray-400">
              {new Date(report.uploadDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">✓ Analyzed</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-blue-200">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
              <FaFileMedical className="text-white text-2xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-blue-200 text-sm font-medium mb-1">Medical Report Analysis</p>
              <h1 className="text-2xl font-bold truncate">{report.fileName}</h1>
              <p className="text-blue-200 text-sm mt-1">Processed in {report.processingTime}s using AI</p>
            </div>
          </div>
          <div className="mt-5 bg-white/10 rounded-xl p-4 border border-white/20">
            <p className="text-blue-100 text-xs leading-relaxed">
              <FaExclamationTriangle className="inline mr-1 text-yellow-300" />
              <strong>Disclaimer:</strong> This AI analysis is for educational purposes only.
              NOT a substitute for professional medical advice. Always consult a healthcare professional.
            </p>
          </div>
        </div>

        {/* 1. What Your Report Says */}
        <SectionCard
          icon={<FaLightbulb className="text-white text-lg" />}
          title="What Your Report Says"
          subtitle="Simplified in plain language"
          gradientFrom="from-amber-50"
          gradientTo="to-yellow-50"
          iconBg="bg-yellow-400"
        >
          <ReactMarkdown components={mdComponents('bg-blue-400')}>
            {report.simplifiedText}
          </ReactMarkdown>
        </SectionCard>

        {/* 2. Precautions */}
        <SectionCard
          icon={<FaShieldAlt className="text-white text-lg" />}
          title="Precautions"
          subtitle="What you should be careful about"
          gradientFrom="from-blue-50"
          gradientTo="to-cyan-50"
          iconBg="bg-blue-500"
        >
          <SimpleList
            items={report.precautions}
            dotColor="bg-blue-400"
            emptyMsg="No specific precautions found."
          />
        </SectionCard>

        {/* 3. Short & Long Term Consequences side by side */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Short Term */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 px-6 py-5 flex items-center gap-3">
              <div className="bg-orange-400 rounded-xl p-2.5">
                <FaBolt className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Short-Term Effects</h2>
                <p className="text-gray-500 text-xs">If condition is ignored (days/weeks)</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <SimpleList
                items={report.shortTermConsequences}
                dotColor="bg-orange-400"
                emptyMsg="No short-term effects noted."
              />
            </div>
          </div>

          {/* Long Term */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100 px-6 py-5 flex items-center gap-3">
              <div className="bg-rose-500 rounded-xl p-2.5">
                <FaCalendarAlt className="text-white text-lg" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">Long-Term Effects</h2>
                <p className="text-gray-500 text-xs">If untreated (months/years)</p>
              </div>
            </div>
            <div className="px-6 py-5">
              <SimpleList
                items={report.longTermConsequences}
                dotColor="bg-rose-400"
                emptyMsg="No long-term effects noted."
              />
            </div>
          </div>
        </div>

        {/* 4. Diet Advice */}
        <SectionCard
          icon={<FaUtensils className="text-white text-lg" />}
          title="Diet Advice"
          subtitle="Food and nutrition guidance based on your report"
          gradientFrom="from-emerald-50"
          gradientTo="to-green-50"
          iconBg="bg-emerald-500"
        >
          <SimpleList
            items={report.dietAdvice}
            dotColor="bg-emerald-400"
            emptyMsg="No specific diet changes needed."
          />
        </SectionCard>

        {/* 5. Ask a Question */}
        <SectionCard
          icon={<FaComments className="text-white text-lg" />}
          title="Ask About Your Report"
          subtitle="Get answers in simple language"
          gradientFrom="from-violet-50"
          gradientTo="to-purple-50"
          iconBg="bg-violet-500"
        >
          {/* Suggested Questions */}
          <div className="flex flex-wrap gap-2 mb-5">
            {[
              'What does this report mean?',
              'Are my results normal?',
              'What should I do next?',
              'What are the risks?'
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q)}
                className="px-4 py-2 bg-gray-50 hover:bg-violet-50 text-gray-600 hover:text-violet-700 border border-gray-200 hover:border-violet-200 rounded-full text-sm transition-all duration-200"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition text-sm"
              placeholder="Ask anything about your report..."
            />
            <button
              onClick={handleAskQuestion}
              disabled={isAsking}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-violet-200"
            >
              {isAsking ? <><FaSpinner className="animate-spin" /> Thinking...</> : <><FaPaperPlane /> Ask</>}
            </button>
          </div>

          {/* Answer */}
          {answer && (
            <div className="mt-5 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
                <span className="font-semibold text-violet-800 text-sm">Answer</span>
              </div>
              <ReactMarkdown components={mdComponents('bg-violet-400')}>
                {answer}
              </ReactMarkdown>
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-violet-100">
                ⚠️ For informational purposes only. Always consult a healthcare professional.
              </p>
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  );
};

export default ReportDetail;
