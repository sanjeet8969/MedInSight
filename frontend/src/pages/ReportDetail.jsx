import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  FaArrowLeft, FaLightbulb, FaComments,
  FaPaperPlane, FaSpinner, FaCheckCircle,
  FaExclamationTriangle, FaClock, FaFileMedical
} from 'react-icons/fa';

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
          <p className="text-gray-600 font-medium text-lg">Analyzing your report...</p>
          <p className="text-gray-400 text-sm mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const suggestedQuestions = [
    'What does this report mean?',
    'Are my results normal?',
    'What should I do next?',
    'What are the risks?'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-all duration-200 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-3">
            <FaClock className="text-gray-400 text-sm" />
            <span className="text-sm text-gray-400">
              {new Date(report.uploadDate).toLocaleDateString('en-US', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              ✓ Analyzed
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Hero Section - Report Title */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl shadow-blue-200">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
              <FaFileMedical className="text-white text-2xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-blue-200 text-sm font-medium mb-1">Medical Report Analysis</p>
              <h1 className="text-2xl font-bold truncate">{report.fileName}</h1>
              <p className="text-blue-200 text-sm mt-2">
                Processed in {report.processingTime}s using AI
              </p>
            </div>
          </div>

          {/* Disclaimer inside hero */}
          <div className="mt-6 bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
            <p className="text-blue-100 text-xs leading-relaxed">
              <FaExclamationTriangle className="inline mr-1 text-yellow-300" />
              <strong>Disclaimer:</strong> This AI analysis is for educational purposes only and is NOT a substitute
              for professional medical advice. Always consult a qualified healthcare professional.
            </p>
          </div>
        </div>

        {/* What Your Report Says */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-yellow-100 px-8 py-5 flex items-center gap-3">
            <div className="bg-yellow-400 rounded-lg p-2">
              <FaLightbulb className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">What Your Report Says</h2>
              <p className="text-gray-500 text-sm">Simplified in plain language</p>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-8 py-6">
            <ReactMarkdown
              components={{
                h1: ({children}) => <h1 className="text-2xl font-bold text-gray-800 mb-4 mt-2">{children}</h1>,
                h2: ({children}) => <h2 className="text-xl font-bold text-gray-800 mb-3 mt-5 pb-2 border-b border-gray-100">{children}</h2>,
                h3: ({children}) => <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-4">{children}</h3>,
                p: ({children}) => <p className="text-gray-600 leading-8 mb-4 text-[15px]">{children}</p>,
                strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                ul: ({children}) => <ul className="space-y-2 mb-4 ml-1">{children}</ul>,
                ol: ({children}) => <ol className="space-y-2 mb-4 ml-1 list-decimal list-inside">{children}</ol>,
                li: ({children}) => (
                  <li className="flex items-start gap-3 text-gray-600 text-[15px] leading-7">
                    <span className="mt-2 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
                    <span>{children}</span>
                  </li>
                ),
              }}
            >
              {report.simplifiedText}
            </ReactMarkdown>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-green-100 px-8 py-5 flex items-center gap-3">
            <div className="bg-emerald-500 rounded-lg p-2">
              <FaCheckCircle className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Recommendations</h2>
              <p className="text-gray-500 text-sm">Based on your report findings</p>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-8 py-6">
            {report.recommendations && report.recommendations.length > 0 ? (
              <div className="space-y-3">
                {report.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                      rec.includes('⚠️')
                        ? 'bg-orange-50 border border-orange-100'
                        : 'bg-green-50 border border-green-100'
                    }`}
                  >
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                      rec.includes('⚠️')
                        ? 'bg-orange-200 text-orange-700'
                        : 'bg-emerald-200 text-emerald-700'
                    }`}>
                      {rec.includes('⚠️') ? '!' : index + 1}
                    </span>
                    <div className={`text-sm leading-relaxed flex-1 ${
                      rec.includes('⚠️') ? 'text-orange-800' : 'text-gray-700'
                    }`}>
                      <ReactMarkdown
                        components={{
                          p: ({children}) => <p className="leading-7 text-[15px]">{children}</p>,
                          strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                          ul: ({children}) => <ul className="space-y-1 mt-2 ml-1">{children}</ul>,
                          li: ({children}) => (
                            <li className="flex items-start gap-2">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                              <span>{children}</span>
                            </li>
                          ),
                        }}
                      >
                        {rec.replace('⚠️', '').trim()}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No recommendations available.</p>
            )}
          </div>
        </div>

        {/* Ask a Question */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-purple-100 px-8 py-5 flex items-center gap-3">
            <div className="bg-violet-500 rounded-lg p-2">
              <FaComments className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Ask About Your Report</h2>
              <p className="text-gray-500 text-sm">Get answers in simple language</p>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-8 py-6">
            {/* Suggested Questions */}
            <div className="flex flex-wrap gap-2 mb-5">
              {suggestedQuestions.map((q, i) => (
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
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg shadow-violet-200"
              >
                {isAsking
                  ? <><FaSpinner className="animate-spin" /> Thinking...</>
                  : <><FaPaperPlane /> Ask</>
                }
              </button>
            </div>

            {/* Answer */}
            {answer && (
              <div className="mt-5 bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
                  <span className="font-semibold text-violet-800 text-sm">Answer</span>
                </div>
                <ReactMarkdown
                  components={{
                    p: ({children}) => <p className="text-gray-700 leading-7 mb-2 text-sm">{children}</p>,
                    strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                    ul: ({children}) => <ul className="space-y-1 mb-2 ml-1">{children}</ul>,
                    li: ({children}) => (
                      <li className="flex items-start gap-2 text-gray-600 text-sm">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0"></span>
                        <span>{children}</span>
                      </li>
                    ),
                  }}
                >
                  {answer}
                </ReactMarkdown>
                <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-violet-100">
                  ⚠️ For informational purposes only. Always consult a healthcare professional.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportDetail;
