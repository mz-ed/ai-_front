import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Calendar, BarChart3, Clock, Stethoscope,
  HelpCircle, Settings, ChevronLeft, Download, Share2,
  CheckCircle2, ShieldCheck, AlertTriangle,
  FileText, Image as ImageIcon, BrainCircuit, Bell, Menu, AlertCircle
} from 'lucide-react';

const sidebarItems = [
  { icon: LayoutGrid,  label: 'Overview',     active: false },
  { icon: Calendar,    label: 'Appointments', active: false },
  { icon: BarChart3,   label: 'Analysis',     active: true  },
  { icon: Clock,       label: 'Schedule',     active: false },
  { icon: Stethoscope, label: 'Consultation', active: false },
];

const bottomItems = [
  { icon: HelpCircle, label: 'Help'     },
  { icon: Settings,   label: 'Settings' },
];

const MedicalAnalysisDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Pull state passed from AnalysisCard ────────────────────────────────────
  // AnalysisCard sends: { scanData: analysis, fileName: scanName, filePath: fullFilePath }
  const { scanData, fileName, filePath } = location.state || {};

  // ── Guard ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!scanData) navigate('/');
  }, [scanData, navigate]);

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

  // ── Derive values from the exact MongoDB shape ─────────────────────────────
  //
  // Document shape:
  // {
  //   _id, patientId, modelName, filescantype, modelAccuracy,
  //   prediction: {
  //     type,             ← e.g. "2D"
  //     original_image,   ← base64 data URI  ✓  already here, no fetch needed
  //     visual_result,    ← base64 data URI  ✓  already here, no fetch needed
  //     prediction,       ← class label string
  //     confidence,       ← 0-1 or 0-100
  //     diagnostics: { all_probabilities, uncertainty_score }  (optional)
  //   },
  //   originalName, filename, uploadedAt
  // }

  const prediction    = scanData.prediction?.prediction
                     ?? scanData.prediction?.class_label
                     ?? 'Pending review';

  const rawConf       = scanData.prediction?.confidence ?? scanData.confidence ?? null;
  const confidence    = rawConf !== null
    ? (rawConf <= 1 ? (rawConf * 100).toFixed(2) : parseFloat(rawConf).toFixed(2))
    : null;

  const scanType      = scanData.prediction?.type
                     ?? scanData.filescantype
                     ?? scanData._resolvedType
                     ?? '—';

  const modelName     = scanData.modelName     ?? '—';
  const modelAccuracy = scanData.modelAccuracy ?? null;

  // ✅ Images are already base64 data URIs stored inside prediction — no HTTP fetch required
  const originalImage = scanData.prediction?.original_image ?? filePath ?? null;
  const visualResult  = scanData.prediction?.visual_result  ?? null;

  const displayName   = fileName                 // from AnalysisCard route state
                     ?? scanData.originalName    // original upload filename in MongoDB
                     ?? scanData.filename        // stored filename
                     ?? 'Unnamed Scan';

  const uploadDate    = scanData.uploadedAt
    ? new Date(scanData.uploadedAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : '—';

  // Optional diagnostics
  const diagnostics       = scanData.prediction?.diagnostics ?? null;
  const allProbs          = diagnostics?.all_probabilities ?? null;
  const uncertaintyScore  = diagnostics?.uncertainty_score ?? null;

  // Badge colours driven by confidence value
  const confNum = parseFloat(confidence);
  const confBadge =
    confNum >= 85 ? 'bg-sky-50 text-blue-600 border-sky-200'      :
    confNum >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200'  :
                   'bg-rose-50 text-rose-600 border-rose-200';

  const riskLabel =
    confNum >= 85 ? { label: 'Low Risk',          style: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2  } :
    confNum >= 60 ? { label: 'Low-Moderate Risk', style: 'bg-amber-50  text-amber-700  border-amber-200',    Icon: AlertTriangle } :
                   { label: 'High Risk',           style: 'bg-rose-50   text-rose-600   border-rose-200',     Icon: AlertTriangle };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f1115] flex font-sans text-slate-800">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-slate-900">plateformName</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                item.active ? 'bg-sky-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-slate-400'}`} />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1">
          {bottomItems.map((item) => (
            <a key={item.label} href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50">
              <item.icon className="w-5 h-5 text-slate-400" />
              {item.label}
            </a>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-[#f8f9fa] overflow-auto">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg lg:hidden">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-blue-600 font-medium">Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                alt="User"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900">Dehmani mohamed</p>
                <p className="text-xs text-slate-500">Patient</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">

          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-slate-500 text-sm mb-2">Results / Analysis</p>
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-200 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-2xl font-bold text-slate-900">
                {scanType} Analysis
              </h2>
            </div>
            <div className="flex items-center gap-3 ml-11 text-sm text-slate-500 flex-wrap">
              <span>File: <span className="font-medium text-slate-700">{displayName}</span></span>
              <span>·</span>
              <span>Model: <span className="font-medium text-slate-700">{modelName}</span></span>
              {modelAccuracy && (
                <><span>·</span><span>Accuracy: <span className="font-medium text-slate-700">{modelAccuracy}</span></span></>
              )}
              <span>·</span>
              <span>Date: <span className="font-medium text-slate-700">{uploadDate}</span></span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 mb-6">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 shadow-sm">
              <Download className="w-4 h-4" />Export
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-600 rounded-xl text-blue-600 font-medium hover:bg-blue-50 shadow-sm">
              <Share2 className="w-4 h-4" />Share
            </button>
          </div>

          {/* Status tags */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />Completed
            </span>
            {confidence !== null && (
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${confBadge}`}>
                <ShieldCheck className="w-4 h-4" />{confidence}% Confidence
              </span>
            )}
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${riskLabel.style}`}>
              <riskLabel.Icon className="w-4 h-4" />{riskLabel.label}
            </span>
          </div>

          {/* Images grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">

            {/* Original image — base64 from scanData.prediction.original_image */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Original Image</h3>
              </div>
              <div className="p-6 bg-slate-50 flex items-center justify-center min-h-[320px]">
                {originalImage ? (
                  <div className="text-center">
                    <img
                      src={originalImage}
                      alt="Original Scan"
                      className="max-w-full max-h-[280px] rounded-lg shadow-md object-contain"
                    />
                    <p className="mt-3 text-sm text-slate-500 font-medium">
                      {scanData.originalName ?? displayName}
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI segmentation — base64 from scanData.prediction.visual_result */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900">AI Segmentation</h3>
              </div>
              <div className="p-6 bg-slate-50 flex items-center justify-center min-h-[320px]">
                {visualResult ? (
                  <div className="text-center">
                    <img
                      src={visualResult}
                      alt="AI Segmentation Result"
                      className="max-w-full max-h-[280px] rounded-lg shadow-md object-contain"
                    />
                    <p className="mt-3 text-sm text-slate-500 font-medium">processed_heatmap.png</p>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <BrainCircuit className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No segmentation result available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Report */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">AI Report</h3>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Prediction',      value: prediction },
                  { label: 'Scan Type',       value: scanType },
                  { label: 'Model',           value: modelName },
                  { label: 'Model Accuracy',  value: modelAccuracy ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
                  </div>
                ))}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                The AI system analyzed <span className="font-medium text-slate-800">{displayName}</span> using
                the <span className="font-medium text-slate-800">{modelName}</span> model and produced
                a <span className="font-medium text-slate-800">{prediction}</span> result
                {confidence !== null && (
                  <> with <span className="font-medium text-slate-800">{confidence}% confidence</span></>
                )}.
                This result should be reviewed alongside clinical findings.
              </p>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2 text-sm">Recommendation</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Clinical correlation is advised. This AI-generated report is intended to assist,
                  not replace, professional medical judgment. Please consult a qualified physician
                  before making any diagnostic or treatment decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Probability distribution — only rendered when diagnostics exist */}
          {allProbs && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Classification Probability Distribution</h3>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  {Object.entries(allProbs).map(([label, value]) => (
                    <div key={label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <span className="text-sm font-bold text-blue-600">{(value * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {uncertaintyScore !== null && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800 leading-relaxed">
                        <strong>AI Insight:</strong> The model identified <strong>{prediction}</strong> with an
                        uncertainty score of {uncertaintyScore}.{' '}
                        {uncertaintyScore > 0.8
                          ? 'Warning: High uncertainty detected — manual review is highly recommended.'
                          : 'The confidence level is within the optimal operational range.'}
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

export default MedicalAnalysisDashboard;