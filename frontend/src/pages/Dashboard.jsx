import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUpload, FaFileAlt, FaSignOutAlt, FaTrash, FaEye, FaCheckCircle } from 'react-icons/fa';

const STEPS = [
  { icon: '🔍', label: 'Extracting text...' },
  { icon: '💡', label: 'Simplifying report...' },
  { icon: '🛡️', label: 'Generating precautions...' },
  { icon: '⚡', label: 'Short-term consequences...' },
  { icon: '📅', label: 'Long-term consequences...' },
  { icon: '🥗', label: 'Diet advice...' },
  { icon: '✅', label: 'Getting report ready...' },
];

const LoadingOverlay = ({ currentStep }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md mx-4">
      {/* Spinner */}
      <div className="flex justify-center mb-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          <span className="absolute inset-0 flex items-center justify-center text-2xl">
            {STEPS[currentStep]?.icon || '⚙️'}
          </span>
        </div>
      </div>

      <h2 className="text-center text-xl font-bold text-gray-800 mb-1">Analyzing Report</h2>
      <p className="text-center text-gray-400 text-sm mb-8">Please wait, this may take a minute...</p>

      {/* Steps list */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-500 ${
                isActive ? 'bg-blue-50 border border-blue-200 scale-[1.02]' :
                isDone ? 'bg-green-50' : 'opacity-40'
              }`}
            >
              {/* Status icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                isDone ? 'bg-green-500 text-white' :
                isActive ? 'bg-blue-500 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {isDone ? <FaCheckCircle /> : isActive ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : index + 1}
              </div>

              {/* Step label */}
              <span className={`text-sm font-medium ${
                isActive ? 'text-blue-700' :
                isDone ? 'text-green-700' :
                'text-gray-400'
              }`}>
                {step.icon} {step.label}
              </span>

              {isDone && (
                <span className="ml-auto text-xs text-green-500 font-semibold">Done</span>
              )}
              {isActive && (
                <span className="ml-auto text-xs text-blue-500 font-semibold animate-pulse">Processing</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const stepTimerRef = useRef(null);

  useEffect(() => {
    fetchReports();
    return () => clearInterval(stepTimerRef.current);
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const startSteps = () => {
    setCurrentStep(0);
    let step = 0;
    stepTimerRef.current = setInterval(() => {
      step += 1;
      if (step < STEPS.length) {
        setCurrentStep(step);
      } else {
        clearInterval(stepTimerRef.current);
      }
    }, 3500);
  };

  const stopSteps = () => {
    clearInterval(stepTimerRef.current);
    setCurrentStep(STEPS.length - 1);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload PDF or image files only');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) { toast.error('Please select a file first'); return; }

    setIsUploading(true);
    startSteps();

    const formData = new FormData();
    formData.append('report', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/reports/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
      );

      stopSteps();
      await new Promise(r => setTimeout(r, 800));
      toast.success('Report analyzed successfully!');
      setSelectedFile(null);
      fetchReports();
      navigate(`/report/${response.data.data.reportId}`);
    } catch (error) {
      stopSteps();
      toast.error(error.response?.data?.message || 'Failed to upload report');
    } finally {
      setIsUploading(false);
      setCurrentStep(-1);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Loading Overlay */}
      {isUploading && currentStep >= 0 && <LoadingOverlay currentStep={currentStep} />}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">🏥 Medical AI Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Upload Section */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaUpload /> Upload Medical Report
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="fileInput"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.tiff"
              className="hidden"
            />

            {!selectedFile ? (
              <label htmlFor="fileInput" className="cursor-pointer block">
                <FaFileAlt className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2 font-medium">Click to select a medical report</p>
                <p className="text-sm text-gray-400">PDF, JPG, PNG supported • Max 10MB</p>
              </label>
            ) : (
              <div>
                <FaFileAlt className="mx-auto text-4xl text-blue-400 mb-3" />
                <p className="text-gray-700 mb-5">
                  Selected: <strong>{selectedFile.name}</strong>
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Analyzing...' : 'Analyze Report'}
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Disclaimer:</strong> This is an educational tool. Not a substitute for professional medical advice.
            </p>
          </div>
        </div>

        {/* Reports List */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Reports</h2>
          {reports.length === 0 ? (
            <p className="text-center text-gray-400 py-10">
              No reports yet. Upload your first medical report above!
            </p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{report.fileName}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(report.uploadDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{report.processingTime}s
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/report/${report._id}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 text-sm"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={() => handleDelete(report._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
