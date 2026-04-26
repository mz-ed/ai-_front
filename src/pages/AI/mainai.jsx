"use client"

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Calendar, 
  BarChart3, 
  Clock, 
  Stethoscope, 
  HelpCircle, 
  Settings,
  ChevronLeft,
  Plus,
  ExternalLink,
  TrendingUp,
  Filter,
  ChevronDown,
  Bell,
  Sparkles,
  Activity,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000';
const PATIENT_ID = 'pat_123';
const SCAN_TYPES = ['1D', '2D', '3D'];

const TYPE_ROUTE_MAP = {
  '1D': '/analysis/1d',
  '2D': '/analysis/2d',
  '3D': '/analysis/3d',
};

const TYPE_LABEL_MAP = {
  '1D': '1D Scan',
  '2D': '2D Scan',
  '3D': '3D Scan',
};

export default function AIResultsDashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchAllScans = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        SCAN_TYPES.map(async (type) => {
          const res = await fetch(`${BASE_URL}/upload/patient/${PATIENT_ID}/type/${type}`);
          if (!res.ok) throw new Error(`Failed to fetch type ${type}`);
          const data = await res.json();
          // data may be an array or single object — normalize to array
          const items = Array.isArray(data) ? data : [data];
          return items.map((item) => ({ ...item, _resolvedType: type }));
        })
      );
      setAnalyses(results.flat());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllScans();
  }, []);

  const sidebarItems = [
    { icon: LayoutGrid, label: 'Overview', active: false },
    { icon: Calendar, label: 'Appointments', active: false },
    { icon: BarChart3, label: 'Analysis', active: true },
    { icon: Clock, label: 'Schedule', active: false },
    { icon: Stethoscope, label: 'Consultation', active: false },
  ];

  const bottomItems = [
    { icon: HelpCircle, label: 'Help' },
    { icon: Settings, label: 'Settings' },
  ];

  const getConfidenceValue = (item) => {
    const raw = item.confidence ?? item.diagnostics?.confidence ?? 0;
    // if stored as 0–1 float, convert to percentage
    return raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-emerald-500';
    if (confidence >= 85) return 'text-teal-500';
    return 'text-blue-500';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 90) return 'from-emerald-500/10 to-emerald-500/5';
    if (confidence >= 85) return 'from-teal-500/10 to-teal-500/5';
    return 'from-blue-500/10 to-blue-500/5';
  };

  const getConfidenceRing = (confidence) => {
    if (confidence >= 90) return 'ring-emerald-500/20';
    if (confidence >= 85) return 'ring-teal-500/20';
    return 'ring-blue-500/20';
  };

  const handleDetails = (item) => {
    const route = TYPE_ROUTE_MAP[item._resolvedType] || TYPE_ROUTE_MAP[item.type];
    
    // 1. Extract the file name using the same logic you use in your render loop
    const fileName = item.filename || item.scanName || item.name || 'Unnamed Scan';
    
    // 2. Construct the full URL/path to the file. 
    // NOTE: Change '/uploads/' to whatever endpoint NestJS uses to serve your static files.
    const fullFilePath = `${BASE_URL}/uploads/${fileName}`;

    if (route) {
      navigate(route, { 
        state: { 
          scanData: item,
          fileName: fileName,     // Explicitly pass the name
          filePath: fullFilePath  // Explicitly pass the full file path
        } 
      });
    }
  };

  const avgConfidence = analyses.length
    ? (analyses.reduce((sum, a) => sum + getConfidenceValue(a), 0) / analyses.length).toFixed(1)
    : 0;

  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(analyses.length / ITEMS_PER_PAGE);
  const paginatedAnalyses = analyses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-sky-50/30 flex font-sans text-slate-800">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMmMtNS41MjMgMC0xMC00LjQ3Ny0xMC0xMHM0LjQ3Ny0xMCAxMC0xMCAxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAxIi8+PC9nPjwvc3ZnPg==')] opacity-40 pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex flex-col fixed h-full z-20 shadow-xl shadow-slate-200/20">
        <div className="p-6 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">MedAI Pro</span>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Healthcare Platform</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <p className="px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Main Menu</p>
          {sidebarItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                item.active
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-700'
              }`}
            >
              {item.active && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
              <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.label}
              {item.active && (
                <div className="ml-auto">
                  <Activity className="w-4 h-4 text-white/70 animate-pulse" />
                </div>
              )}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200/60 space-y-1.5">
          <p className="px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Support</p>
          {bottomItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className="group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100/80 hover:text-slate-700 transition-all duration-300"
            >
              <item.icon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-transform duration-300 group-hover:scale-110" />
              {item.label}
            </a>
          ))}
        </div>

        <div className="p-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pro Plan</span>
              </div>
              <p className="text-sm font-medium mb-3 text-slate-200">Unlock advanced AI diagnostics</p>
              <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-sm font-medium transition-all duration-300 border border-white/10 hover:border-white/20">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm shadow-slate-200/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-300 hover:scale-105">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-lg">
                <span className="hover:text-slate-700 cursor-pointer transition-colors">Dashboard</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-blue-600 font-semibold">Analysis</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-300 group">
              <Bell className="w-5 h-5 text-slate-500 group-hover:text-slate-700 transition-colors" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
            </button>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex items-center gap-3 pl-2 cursor-pointer group">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                  alt="User"
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 group-hover:ring-blue-500/50 transition-all duration-300"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900">Dehmani Mohamed</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Patient
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {/* Title Section */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Results</h1>
              </div>
              <p className="text-slate-500 ml-14">
                {loading ? (
                  <span className="text-slate-400">Loading analyses...</span>
                ) : (
                  <><span className="text-blue-600 font-semibold">{analyses.length} analyses</span> completed successfully</>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchAllScans}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => navigate('/main2')}
                className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                Add Scan
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Total Analyses</p>
                  <p className="text-3xl font-bold text-slate-900">{loading ? '—' : analyses.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Avg. Confidence</p>
                  <p className="text-3xl font-bold text-emerald-500">{loading ? '—' : `${avgConfidence}%`}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Scan Types</p>
                  <p className="text-3xl font-bold text-teal-500">{loading ? '—' : SCAN_TYPES.length}</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl">
                  <Clock className="w-6 h-6 text-teal-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-slate-500 font-medium">Fetching analyses from server...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="p-4 bg-red-50 rounded-2xl">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-slate-700 font-semibold">Failed to load analyses</p>
              <p className="text-slate-400 text-sm">{error}</p>
              <button
                onClick={fetchAllScans}
                className="mt-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && analyses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="p-4 bg-slate-100 rounded-2xl">
                <BarChart3 className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-700 font-semibold">No analyses found</p>
              <p className="text-slate-400 text-sm">Upload a scan to get started</p>
            </div>
          )}

          {/* Analyses List */}
          {!loading && !error && analyses.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-slate-900">Recent Analyses</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-300">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {paginatedAnalyses.map((analysis, index) => {
                const confidence = getConfidenceValue(analysis);
                const scanType = analysis._resolvedType || analysis.type || 'N/A';
                const scanName = analysis.filename || analysis.scanName || analysis.name || 'Unnamed Scan';
                const date = analysis.createdAt
                  ? new Date(analysis.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')
                  : analysis.date || '—';
                const prediction = analysis.prediction || analysis.recommendation || 'Pending review';

                return (
                  <div
                    key={analysis._id || index}
                    className="group relative bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer hover:-translate-y-1 overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${getConfidenceBg(confidence)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative flex items-center justify-between">
                      {/* Left: Type & Info */}
                      <div className="flex items-center gap-6 flex-1">
                        <div className="flex items-center gap-4">
                          <span className="px-4 py-2 bg-gradient-to-r from-sky-100 to-blue-100 text-blue-700 rounded-xl text-sm font-semibold shadow-sm ring-1 ring-blue-200/50">
                            {TYPE_LABEL_MAP[scanType] || scanType}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Date</span>
                            <span className="text-sm text-slate-600 font-medium">{date}</span>
                          </div>
                        </div>

                        <div className="min-w-[180px] pl-4 border-l border-slate-200/60">
                          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Scan Name</span>
                          <p className="text-sm text-slate-900 font-semibold truncate max-w-[160px]">{scanName}</p>
                        </div>
                      </div>

                      {/* Center: Confidence */}
                      <div className="flex items-center gap-4 flex-1 justify-center">
                        <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${getConfidenceBg(confidence)} ring-1 ${getConfidenceRing(confidence)}`}>
                          <div className="text-center">
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Confidence</p>
                            <div className="flex items-center justify-center gap-1.5">
                              <TrendingUp className={`w-5 h-5 ${getConfidenceColor(confidence)}`} />
                              <span className={`text-3xl font-bold ${getConfidenceColor(confidence)}`}>
                                {confidence}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Prediction & Action */}
                      <div className="flex items-center gap-6 flex-1 justify-end">
                        <div className="text-right max-w-[200px]">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Prediction</p>
                          <p className="text-sm text-slate-700 font-medium">{prediction}</p>
                        </div>

                        <button
                          onClick={() => handleDetails(analysis)}
                          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:border-blue-300 group-hover:text-blue-600"
                        >
                          Details
                          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && analyses.length > ITEMS_PER_PAGE && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-700">{paginatedAnalyses.length}</span> of{' '}
                <span className="font-semibold text-slate-700">{analyses.length}</span> results
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-300 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-300 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}