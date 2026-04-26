import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, Calendar, BarChart3, Clock, Stethoscope, HelpCircle, Settings, 
  ChevronLeft, CheckCircle2, ShieldCheck, AlertTriangle, Timer, FileText, 
  Image as ImageIcon, BrainCircuit, Bell, AlertCircle
} from 'lucide-react';

const sidebarItems = [
  { icon: LayoutGrid, label: 'Overview', active: false },
  { icon: Calendar, label: 'Appointments', active: false },
  { icon: BarChart3, label: 'Analysis', active: true },
  { icon: Clock, label: 'Schedule', active: false },
  { icon: Stethoscope, label: 'Consultation', active: false },
];
 const { scanData, fileName, filePath } = location.state || {};
const MedicalAnalysisDashboard1 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Data passed from AIResultsDashboard via navigate(route, { state: { scanData } })
  const scanData = location.state?.scanData ?? null;

  if (!scanData) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-red-50 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>
          <p className="text-slate-700 font-semibold text-lg">No scan data available</p>
          <p className="text-slate-400 text-sm">Please go back and select a scan from the list.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Normalize fields — adapt these keys to match your actual MongoDB document shape
  const prediction   = scanData.prediction  ?? 'N/A';
  const confidence   = scanData.confidence != null
    ? (scanData.confidence <= 1 ? scanData.confidence : scanData.confidence / 100)
    : null;
  const executionTime = scanData.executionTime ?? scanData.processingTime ?? null;
  const originalImage = scanData.original_image ?? scanData.imageUrl ?? scanData.filePath ?? null;
  const filename      = scanData.filename ?? scanData.name ?? 'Unnamed Scan';
  const createdAt     = scanData.createdAt
    ? new Date(scanData.createdAt).toLocaleString()
    : null;

  // diagnostics block (optional — only rendered if present)
  const diagnostics   = scanData.diagnostics ?? null;
  const allProbs      = diagnostics?.all_probabilities ?? null;
  const uncertaintyScore = diagnostics?.uncertainty_score ?? null;

  return (
    <div className="min-h-screen bg-[#0f1115] flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">CellVision</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
                item.active ? 'bg-sky-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#f8f9fa] overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-slate-900">
            Dashboard / <span className="text-blue-600">1D Analysis</span>
          </h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Breadcrumb & Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-2xl font-bold text-slate-900">{prediction}</h2>
            </div>
            <p className="text-slate-500 text-sm ml-11">
              File: <span className="font-medium text-slate-700">{filename}</span>
              {createdAt && <> &nbsp;·&nbsp; Analyzed on {createdAt}</>}
            </p>
          </div>

          {/* Status Tags */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
            {confidence !== null && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-blue-600 rounded-full text-sm font-medium border border-sky-200">
                <ShieldCheck className="w-4 h-4" /> {(confidence * 100).toFixed(2)}% Confidence
              </span>
            )}
            {executionTime !== null && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium border border-slate-200">
                <Timer className="w-4 h-4" /> Processed in {executionTime}s
              </span>
            )}
          </div>

          {/* Images Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Original Image */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Source Specimen</h3>
              </div>
              <div className="p-6 bg-slate-50 flex items-center justify-center min-h-[400px]">
                {originalImage ? (
                  <img
                    src={originalImage}
                    alt="Scan"
                    className="max-w-full max-h-[350px] rounded-lg shadow-lg object-contain"
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                    <p className="text-sm">No image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Raw data / metadata card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900">Scan Metadata</h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Scan ID',    value: scanData._id ?? '—' },
                  { label: 'Type',       value: scanData.type ?? '—' },
                  { label: 'Filename',   value: filename },
                  { label: 'Prediction', value: prediction },
                  { label: 'Confidence', value: confidence !== null ? `${(confidence * 100).toFixed(2)}%` : '—' },
                  { label: 'Date',       value: createdAt ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-500 font-medium">{label}</span>
                    <span className="text-sm text-slate-800 font-semibold text-right max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Probability Distribution — only shown if diagnostics.all_probabilities exists */}
          {allProbs && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Classification Probability Distribution</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(allProbs).map(([label, value]) => (
                    <div key={label}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <span className="text-sm font-bold text-blue-600">{(value * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {uncertaintyScore !== null && (
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
                      <p className="text-sm text-blue-800 leading-relaxed">
                        <strong>AI Insight:</strong> The model identified <strong>{prediction}</strong> with an
                        uncertainty score of {uncertaintyScore}.{' '}
                        {uncertaintyScore > 0.8
                          ? 'Warning: High uncertainty detected, manual review highly recommended.'
                          : 'The confidence level is within optimal operational range.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MedicalAnalysisDashboard1;