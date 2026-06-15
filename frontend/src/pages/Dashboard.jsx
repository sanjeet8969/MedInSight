import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  FaUpload,
  FaFileAlt,
  FaSignOutAlt,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaHeartbeat,
  FaClock,
  FaUserCircle,
  FaShieldAlt,
  FaBrain,
  FaArrowUp,
  FaNotesMedical,
  FaFolderOpen,
} from 'react-icons/fa';

const STEPS = [
  { icon: '📄', label: 'Reading report...' },
  { icon: '🧠', label: 'Understanding medical terms...' },
  { icon: '🔍', label: 'Finding important values...' },
  { icon: '💡', label: 'Preparing simple explanation...' },
  { icon: '✅', label: 'Finishing analysis...' },
];

const LoadingOverlay = ({ currentStep }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm px-4">
    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
      <div className="text-center mb-6">
        <div className="relative mx-auto mb-4 h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-teal-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xl">
            {STEPS[currentStep]?.icon || '⚙️'}
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Analyzing report</h2>
        <p className="mt-2 text-sm text-slate-500">
          Please wait while your medical summary is being prepared.
        </p>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                active
                  ? 'bg-teal-50 border-teal-200'
                  : done
                  ? 'bg-emerald-50 border-emerald-100'
                  : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? <FaCheckCircle /> : active ? '•' : index + 1}
              </div>
              <span className="text-sm font-medium text-slate-700">{step.label}</span>
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
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
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };

  const startSteps = () => {
    setCurrentStep(0);
    let step = 0;
    stepTimerRef.current = setInterval(() => {
      step += 1;
      if (step < STEPS.length) setCurrentStep(step);
      else clearInterval(stepTimerRef.current);
    }, 2200);
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
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    startSteps();

    const formData = new FormData();
    formData.append('report', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/reports/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      stopSteps();
      await new Promise((r) => setTimeout(r, 700));
      toast.success('Report analyzed successfully');
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
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const lastUpload =
    reports.length > 0
      ? new Date(reports[0].uploadDate).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'No uploads yet';

  return (
    <div className="min-h-screen bg-slate-100">
      {isUploading && currentStep >= 0 && <LoadingOverlay currentStep={currentStep} />}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
              <FaHeartbeat />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Medical Reports Dashboard</h1>
              <p className="text-sm text-slate-500">Patient workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              <FaUserCircle className="text-teal-600" />
              {user?.name || 'User'}
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <FaFolderOpen />
            </div>
            <p className="text-sm text-slate-500">Total Reports</p>
            <h3 className="mt-1 text-3xl font-bold text-slate-900">{reports.length}</h3>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <FaClock />
            </div>
            <p className="text-sm text-slate-500">Last Upload</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">{lastUpload}</h3>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FaBrain />
            </div>
            <p className="text-sm text-slate-500">AI Status</p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">Ready to analyze</h3>
          </div>
        </div>

        <div className="grid gap-6">
  <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600">
          Upload Center
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Upload and analyze a medical report
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 max-w-3xl">
          Upload your file to generate a clear summary, understand key findings,
          and review your medical report in a more patient-friendly format.
        </p>
      </div>

      <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
        <FaUpload className="text-xl" />
      </div>
    </div>

    <input
      type="file"
      id="fileInput"
      onChange={handleFileSelect}
      accept=".pdf,.jpg,.jpeg,.png,.tiff"
      className="hidden"
    />

    {!selectedFile ? (
      <label
        htmlFor="fileInput"
        className="block cursor-pointer rounded-[28px] border-2 border-dashed border-slate-300 bg-slate-50 p-10 md:p-14 text-center transition hover:border-teal-400 hover:bg-teal-50"
      >
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[28px] bg-white text-teal-600 shadow-sm border border-slate-200">
          <FaUpload className="text-4xl" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900">
          Select report from your device
        </h3>

        <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-7">
          Upload your medical report to get an AI-generated explanation, simplified findings,
          and an easier way to review your health information.
        </p>

        <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white">
          Upload Report
          <FaArrowUp className="text-xs" />
        </div>
      </label>
    ) : (
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-white text-teal-600 border border-slate-200">
              <FaFileAlt className="text-2xl" />
            </div>

            <div className="min-w-0">
              <p className="text-sm text-slate-500">Selected file</p>
              <h3 className="truncate text-xl font-bold text-slate-900">
                {selectedFile.name}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="rounded-full bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              {isUploading ? 'Analyzing...' : 'Analyze Report'}
            </button>

            <button
              onClick={() => setSelectedFile(null)}
              disabled={isUploading}
              className="rounded-full bg-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    )}
  </section>
</div>

        <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Recent Reports</h3>
              <p className="mt-1 text-sm text-slate-500">
                Access, review, and manage previously uploaded reports.
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400">
                <FaFileAlt className="text-xl" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">No reports yet</h4>
              <p className="mt-2 text-sm text-slate-500">
                Upload a report from the workspace above to see it here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-slate-200">
              <div className="hidden md:grid grid-cols-[1.6fr_0.7fr_0.7fr] bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <div>Report</div>
                <div>Date</div>
                <div>Actions</div>
              </div>

              <div className="divide-y divide-slate-200">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className="grid gap-4 px-5 py-5 md:grid-cols-[1.6fr_0.7fr_0.7fr] md:items-center"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-teal-600">
                        <FaFileAlt />
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate font-bold text-slate-900">{report.fileName}</h4>
                        <p className="mt-1 text-sm text-slate-500">
                          AI analyzed medical report
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-slate-600">
                      {new Date(report.uploadDate).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/report/${report._id}`)}
                        className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                      >
                        <FaEye />
                        View
                      </button>

                      <button
                        onClick={() => handleDelete(report._id)}
                        className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;