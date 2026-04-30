"use client"
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Plus, 
  TrendingUp, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import your newly separated components & helpers
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import AnalysisCard from '../../components/AnalysisCard';
import { BASE_URL, PATIENT_ID, SCAN_TYPES } from '../datahandling/constants';
import { getConfidenceValue } from '../datahandling/utils';

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
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMmMtNS41MjMgMC0xMC00LjQ3Ny0xMC0xMHM0LjQ3Ny0xMCAxMCAxMCAxMCA0LjQ3NyAxMCAxMC00LjQ3NyAxMC0xMCAxMHoiIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iLjAxIi8+PC9nPjwvc3ZnPg==')] opacity-40 pointer-events-none" />

      <Sidebar />

      <main className="flex-1 ml-72">
        <Header />

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

          {/* Dynamic States */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-slate-500 font-medium">Fetching analyses from server...</p>
            </div>
          )}

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

          {!loading && !error && analyses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="p-4 bg-slate-100 rounded-2xl">
                <BarChart3 className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-700 font-semibold">No analyses found</p>
              <p className="text-slate-400 text-sm">Upload a scan to get started</p>
            </div>
          )}

          {!loading && !error && analyses.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-slate-900">Recent Analyses</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-300">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {paginatedAnalyses.map((analysis, index) => (
                <AnalysisCard key={analysis._id || index} analysis={analysis} />
              ))}
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