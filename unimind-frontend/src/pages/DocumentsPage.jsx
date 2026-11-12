import React, { useState, useEffect } from 'react';
import { getDocuments, uploadDocument } from '../services/academicService';
import NeoCard from '../components/common/NeoCard';
import NeoButton from '../components/common/NeoButton';
import NeoBadge from '../components/common/NeoBadge';
import NeoAlert from '../components/common/NeoAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FolderOpen, Upload, Download, FileCheck, ShieldCheck, X, FileText } from 'lucide-react';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Academic');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const loadDocs = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!docName || !selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File exceeds the 5 MB limit.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('name', docName);
      formData.append('category', docCategory);
      formData.append('file', selectedFile);

      await uploadDocument(formData);
      setFeedback(`"${docName}" was uploaded and verified successfully.`);
      setShowUploadModal(false);
      setDocName('');
      setSelectedFile(null);
      await loadDocs();
    } catch (err) {
      setError(err.message || 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner label="Securing Student Document Vault..." />;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 text-left">
      {/* Header Banner */}
      <div className="p-5 sm:p-8 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 text-white rounded-3xl shadow-glow-emerald flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white">
              Verified Records
            </span>
            <span className="text-xs font-medium text-emerald-100">
              Institutional Digital Locker
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Student Documents Vault
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Identity credentials &bull; Academic certificates &bull; Verified marksheets
          </p>
        </div>

        <NeoButton
          variant="primary"
          size="md"
          icon={Upload}
          onClick={() => {
            setError('');
            setShowUploadModal(true);
          }}
          className="rounded-full bg-white text-emerald-800 hover:bg-slate-50 w-full sm:w-auto justify-center"
        >
          Upload Document
        </NeoButton>
      </div>

      {feedback && (
        <NeoAlert
          type="success"
          title="Document Uploaded"
          message={feedback}
          onClose={() => setFeedback('')}
        />
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-5 bg-white rounded-3xl border border-slate-100 shadow-soft flex flex-col justify-between gap-4 text-left transition-all hover:border-slate-200"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <NeoBadge color="purple" size="xs">
                  {doc.category}
                </NeoBadge>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 leading-snug">{doc.name}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span>{doc.size}</span>
                  <span>&bull;</span>
                  <span>{doc.date}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>

              <NeoButton
                variant="white"
                size="sm"
                icon={Download}
                onClick={() => alert(`Downloading verified copy of ${doc.name}...`)}
                className="rounded-full"
              >
                Download
              </NeoButton>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-soft-lg p-5 sm:p-6 max-w-md w-full space-y-4 text-left relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1E6BFF] flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">Upload to Locker</h3>
                <p className="text-xs text-slate-400">
                  Secure student document verification
                </p>
              </div>
            </div>

            {error && <NeoAlert type="error" title="Upload Error" message={error} onClose={() => setError('')} />}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Migration Certificate"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#1E6BFF]"
                >
                  <option value="Academic">Academic</option>
                  <option value="Identity">Identity</option>
                  <option value="Financial">Financial</option>
                  <option value="Medical">Medical</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Choose File (PDF, PNG, JPG - Max 5MB)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs font-medium p-2 bg-slate-50 rounded-xl border border-slate-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1E6BFF] file:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <NeoButton
                  variant="white"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </NeoButton>
                <NeoButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={uploading}
                  className="rounded-full"
                >
                  Upload & Verify
                </NeoButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
