import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaUpload, FaFileAlt, FaSignOutAlt, FaTrash, FaEye } from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchReports();
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

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
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      toast.success('Report analyzed successfully!');
      setSelectedFile(null);
      setUploadProgress(0);
      fetchReports();
      
      // Navigate to report details
      navigate(`/report/${response.data.data.reportId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload report');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="fileInput"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.tiff"
              className="hidden"
            />

            {!selectedFile ? (
              <label htmlFor="fileInput" className="cursor-pointer">
                <FaFileAlt className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to select a medical report (PDF or Image)
                </p>
                <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
              </label>
            ) : (
              <div>
                <p className="text-gray-700 mb-4">
                  Selected: <strong>{selectedFile.name}</strong>
                </p>
                {isUploading && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                    </p>
                  </div>
                )}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Processing...' : 'Analyze Report'}
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    disabled={isUploading}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Disclaimer:</strong> This is an educational tool. Results are not a substitute
              for professional medical advice. Always consult with healthcare professionals.
            </p>
          </div>
        </div>

        {/* Reports List */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Reports</h2>

          {reports.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No reports uploaded yet. Upload your first medical report above!
            </p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {report.fileName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(report.uploadDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Processing Time: {report.processingTime}s
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/report/${report._id}`)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                      >
                        <FaEye /> View
                      </button>
                      <button
                        onClick={() => handleDelete(report._id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                      >
                        <FaTrash />
                      </button>
                    </div>
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
