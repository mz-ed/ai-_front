"use client"
import React from 'react';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL, TYPE_ROUTE_MAP, TYPE_LABEL_MAP } from '../pages/datahandling/constants';
import { 
  getConfidenceValue, 
  getConfidenceBg, 
  getConfidenceColor, 
  getConfidenceRing 
} from '../pages/datahandling/utils';

export default function AnalysisCard({ analysis }) {
  const navigate = useNavigate();
  
  const confidence = getConfidenceValue(analysis);
  const scanType = analysis._resolvedType || analysis.prediction?.type || 'N/A';
  const scanName = analysis.filename || analysis.originalName || 'Unnamed Scan';
  const date = analysis.uploadedAt
    ? new Date(analysis.uploadedAt).toLocaleDateString('en-GB').replace(/\//g, '-')
    : '—';
  const modelName = analysis.modelName || '—';

  const predictionText =
    analysis.prediction?.prediction || analysis.prediction?.diagnostics
      ? analysis.prediction?.prediction || analysis.prediction?.class_index != null
        ? analysis.prediction?.prediction
        : 'Pending review'
      : 'Pending review';

  const handleDetails = () => {
    const route = TYPE_ROUTE_MAP[scanType] || TYPE_ROUTE_MAP[analysis.prediction?.type];
    const fullFilePath = `${BASE_URL}/uploads/${scanName}`;

    if (route) {
      navigate(route, { 
        state: { 
          scanData: analysis,
          fileName: scanName,
          filePath: fullFilePath
        } 
      });
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/60 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 cursor-pointer hover:-translate-y-1 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${getConfidenceBg(confidence)} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative flex items-center justify-between">
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
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Model</span>
            <p className="text-sm text-slate-900 font-semibold truncate max-w-[160px]">{modelName}</p>
          </div>
        </div>

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

        <div className="flex items-center gap-6 flex-1 justify-end">
          <div className="text-right max-w-[200px]">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Prediction</p>
            <p className="text-sm text-slate-700 font-medium">{predictionText}</p>
          </div>

          <button
            onClick={handleDetails}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:border-blue-300 group-hover:text-blue-600"
          >
            Details
            <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}