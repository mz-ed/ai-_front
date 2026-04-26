import React, { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import {
  LayoutGrid, BarChart3, BrainCircuit, Maximize2, Box,
  Settings, Activity, Upload, ChevronLeft, Download,
  Share2, CheckCircle2, ShieldCheck, AlertTriangle,
  Bell, HelpCircle, Calendar, Clock, Stethoscope, Menu,
  MapPin, Layers, Zap, TrendingUp, FileText
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stage, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D Mesh Component — UNTOUCHED ---
function MedicalMesh({ data, color, wireframe }) {
  const geometry = useMemo(() => {
    if (!data || !data.vertices || !data.faces) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(data.vertices.flat()), 3));
    geo.setIndex(data.faces.flat());
    geo.computeVertexNormals();
    return geo;
  }, [data]);

  return geometry ? (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        roughness={0.1}
        metalness={0.8}
        wireframe={wireframe}
        side={THREE.DoubleSide}
        transparent
        opacity={0.8}
      />
    </mesh>
  ) : null;
}

// --- Metric Row Component ---
const Metric = ({ label, value, unit }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-bold text-slate-800 tabular-nums">{value ?? '—'}</span>
      {unit && <span className="text-xs font-semibold text-blue-500 uppercase">{unit}</span>}
    </div>
  </div>
);

// --- Risk Badge ---
const RiskBadge = ({ level }) => {
  const map = {
    low:      { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    moderate: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
    high:     { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200'     },
  };
  const s = map[level?.toLowerCase()] ?? map.moderate;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-widest ${s.bg} ${s.text} ${s.border}`}>
      <AlertTriangle className="w-3.5 h-3.5" />
      {level ?? 'Unknown'} Risk
    </span>
  );
};

// --- Sidebar Nav Item ---
const NavItem = ({ icon: Icon, label, active }) => (
  <a
    href="#"
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
      ${active
        ? 'bg-sky-50 text-blue-600'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
    {label}
  </a>
);

// ─── POLLING HOOK ───────────────────────────────────────────────────────────
const BASE_URL = 'https://pillowlike-lobeliaceous-briana.ngrok-free.dev/api/v1/predict/2bcc9dbd-c6c4-41c0-892d-a5d4aac39ec2';

function useTaskPoller(taskId) {
  const [result, setResult]   = useState(null);
  const [status, setStatus]   = useState(null);
  const [progress, setProgress] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!taskId) return;

    const poll = async () => {
      try {
        const res  = await fetch(`${BASE_URL}`);
        const json = await res.json();
        setStatus(json.status);
        setProgress(json.progress ?? '');

        if (json.status === 'completed') {
          setResult(json.result ?? json);
          clearInterval(intervalRef.current);
        } else if (json.status === 'failed') {
          clearInterval(intervalRef.current);
        }
      } catch (e) {
        console.error('Poll error:', e);
      }
    };

    poll(); // immediate first call
    intervalRef.current = setInterval(poll, 2500);
    return () => clearInterval(intervalRef.current);
  }, [taskId]);

  return { result, status, progress };
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
const Analysis4D = () => {
  const [taskId,       setTaskId]       = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState(null);
  const [volumeFile,   setVolumeFile]   = useState(null);
  const [segFile,      setSegFile]      = useState(null);

  const { result: apiData, status, progress } = useTaskPoller(taskId);

  // ── POST to create task ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!volumeFile || !segFile) return;
    setSubmitting(true);
    setSubmitError(null);
    setTaskId(null);

    try {
      const formData = new FormData();
      formData.append('volume_file',       volumeFile);
      formData.append('segmentation_file', segFile);

      const res  = await fetch(`${BASE_URL}`, { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok) throw new Error(json.detail ?? 'Server error');
      setTaskId(json.task_id);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived fields from new JSON shape ─────────────────────────────────
  const ai   = apiData?.ai_analysis   ?? {};
  const dims = ai.dimensions_mm       ?? {};
  const axial = ai.axial_extent       ?? {};
  const intensity = apiData?.intensity ?? {};

  const isPending   = taskId && (status === 'pending'    || status === 'processing');
  const isFailed    = taskId && status === 'failed';
  const isCompleted = taskId && status === 'completed' && apiData;

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

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-slate-800">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="text-white" size={18} />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg leading-none tracking-tight">NODE</span>
            <span className="font-bold text-blue-600 text-lg leading-none tracking-tight">_SCAN</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-1">
          {bottomItems.map((item) => (
            <NavItem key={item.label} icon={item.icon} label={item.label} active={false} />
          ))}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-auto">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg lg:hidden">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-blue-600 font-medium">Volumetric Reconstruction v3.1</p>
            </div>
          </div>

          {/* Two-file upload + Submit */}
          <div className="flex items-center gap-3">
            {/* Volume file */}
            <div className="flex flex-col items-start">
              <label className="text-xs text-slate-400 mb-1 font-medium">Volume (.nii/.nii.gz)</label>
              <label className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm cursor-pointer transition">
                <Upload size={14} />
                {volumeFile ? volumeFile.name.substring(0, 18) + '…' : 'Choose file'}
                <input
                  type="file"
                  accept=".nii,.nii.gz"
                  className="hidden"
                  onChange={(e) => setVolumeFile(e.target.files[0] ?? null)}
                />
              </label>
            </div>

            {/* Segmentation file */}
            <div className="flex flex-col items-start">
              <label className="text-xs text-slate-400 mb-1 font-medium">Segmentation (.nii/.nii.gz)</label>
              <label className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm cursor-pointer transition">
                <Upload size={14} />
                {segFile ? segFile.name.substring(0, 18) + '…' : 'Choose file'}
                <input
                  type="file"
                  accept=".nii,.nii.gz"
                  className="hidden"
                  onChange={(e) => setSegFile(e.target.files[0] ?? null)}
                />
              </label>
            </div>

            {/* Run button */}
            <div className="flex flex-col items-start">
              <label className="text-xs text-slate-400 mb-1 font-medium opacity-0">Run</label>
              <button
                onClick={handleSubmit}
                disabled={submitting || !volumeFile || !segFile}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap size={15} />
                )}
                Analyse
              </button>
            </div>

            <button className="relative p-2 hover:bg-slate-100 rounded-full transition">
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
                <p className="text-sm font-semibold text-slate-900">
                  {apiData?.filename ?? 'LIDC-0001'}
                </p>
                <p className="text-xs text-slate-500">Patient</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">

          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-2">Results / Analysis</p>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-200 rounded-lg transition">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-2xl font-bold text-slate-900">Lung CT — 3D Reconstruction</h2>
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
              ❌ {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mb-6">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 shadow-sm transition">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-600 rounded-xl text-blue-600 text-sm font-medium hover:bg-blue-50 shadow-sm transition">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-3 mb-8">
            {/* Task status */}
            {isPending && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200 animate-pulse">
                <span className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                {progress || 'Processing…'}
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> Completed
              </span>
            )}
            {isFailed && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-full text-sm font-medium border border-rose-200">
                <AlertTriangle className="w-4 h-4" /> Failed
              </span>
            )}

            {isCompleted && (
              <>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-blue-600 rounded-full text-sm font-medium border border-sky-200">
                  <ShieldCheck className="w-4 h-4" />
                  {ai.confidence_score != null
                    ? `${(ai.confidence_score * 100).toFixed(1)}% Confidence`
                    : '— Confidence'}
                </span>
                <RiskBadge level={ai.risk_level} />
                {taskId && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-xs font-mono border border-slate-200">
                    ID: {taskId.substring(0, 8)}…
                  </span>
                )}
              </>
            )}
          </div>

          {/* ── Main Grid ── */}
          {isCompleted ? (
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">

              {/* 3D Viewport */}
              <div className="col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">3D Volumetric View</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold border border-emerald-200">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    ACTIVE_RECON
                  </span>
                </div>

                <div className="flex-1 bg-slate-50 min-h-[420px]">
                  <Canvas>
                    <Suspense fallback={null}>
                      <PerspectiveCamera makeDefault position={[150, 150, 150]} fov={40} />
                      <Float speed={1.5} rotationIntensity={0.5}>
                        <Stage environment="city" intensity={0.5} contactShadow={true}>
                          <MedicalMesh data={apiData?.mesh_pred} color="#00f2ff" />
                        </Stage>
                      </Float>
                      <gridHelper args={[400, 40, '#94a3b8', '#f1f5f9']} position={[0, -100, 0]} />
                      <OrbitControls autoRotate={false} enableZoom={true} />
                    </Suspense>
                  </Canvas>
                </div>

                {/* Clinical Notes */}
                {ai.clinical_notes?.length > 0 && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-amber-50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Clinical Notes</span>
                    </div>
                    <ul className="space-y-1">
                      {ai.clinical_notes.map((note, i) => (
                        <li key={i} className="text-xs text-amber-800">{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Stats Column */}
              <div className="col-span-4 flex flex-col gap-5 overflow-y-auto">

                {/* Classification */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">AI Analysis</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Lesions Found</p>
                    <h2 className="text-4xl font-black text-slate-900 tabular-nums mb-2">
                      {ai.n_lesions ?? '—'}
                    </h2>
                    <div className="text-3xl font-bold text-blue-600 tabular-nums mb-3">
                      {ai.confidence_score != null
                        ? `${(ai.confidence_score * 100).toFixed(1)}`
                        : '—'}
                      <span className="text-lg font-semibold text-slate-400 ml-1">%</span>
                    </div>
                    <RiskBadge level={ai.risk_level} />
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Anatomical Location</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {ai.anatomical_location ?? '—'}
                    </p>
                  </div>
                </div>

                {/* Volumetric Metrics */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Maximize2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Volumetric Metrics</h3>
                  </div>
                  <div className="p-5">
                    <Metric label="Volume"      value={ai.total_volume_ml?.toFixed(2)}    unit="mL"  />
                    <Metric label="Volume cm³"  value={ai.total_volume_cm3?.toFixed(2)}   unit="cm³" />
                    <Metric label="Max Diameter" value={dims.max_diameter_mm?.toFixed(1) ?? ai.max_diameter_mm?.toFixed(1)} unit="mm" />
                    <Metric label="Depth"       value={dims.depth_mm?.toFixed(1)}         unit="mm"  />
                    <Metric label="Height"      value={dims.height_mm?.toFixed(1)}        unit="mm"  />
                    <Metric label="Width"       value={dims.width_mm?.toFixed(1)}         unit="mm"  />
                  </div>
                </div>

                {/* Axial Extent */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Axial Extent</h3>
                  </div>
                  <div className="p-5">
                    <Metric label="First Slice"  value={axial.first_slice}      unit="idx" />
                    <Metric label="Last Slice"   value={axial.last_slice}       unit="idx" />
                    <Metric label="Slices"       value={axial.n_slices}         unit=""    />
                    <Metric label="Coverage"     value={axial.coverage_pct?.toFixed(1)} unit="%" />
                  </div>
                </div>

                {/* Intensity */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Intensity Profile</h3>
                  </div>
                  <div className="p-5">
                    <Metric label="Mean HU"          value={intensity.mean_hu?.toFixed(3)}          unit=""  />
                    <Metric label="Std HU"           value={intensity.std_hu?.toFixed(3)}           unit=""  />
                    <Metric label="P50 HU"           value={intensity.p50_hu?.toFixed(3)}           unit=""  />
                    <Metric label="Heterogeneity"    value={intensity.heterogeneity_index?.toFixed(3)} unit="" />
                  </div>
                </div>

                {/* Risk Factors */}
                {ai.risk_factors?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      <h3 className="font-semibold text-slate-900">Risk Factors</h3>
                    </div>
                    <div className="p-5 space-y-2">
                      {ai.risk_factors.map((rf, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                          <p className="text-xs text-slate-600">{rf}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          ) : isPending ? (
            /* Polling / loading state */
            <div className="flex-1 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center bg-blue-50/30 min-h-[400px]">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-5" />
              <p className="font-semibold text-blue-600 uppercase tracking-widest text-sm">
                {progress || 'Processing…'}
              </p>
              <p className="text-xs text-slate-400 mt-2">Task ID: {taskId}</p>
            </div>

          ) : (
            /* Empty State */
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white min-h-[400px]">
              <Box size={40} className="mb-4 text-slate-300" />
              <p className="font-semibold text-slate-400 uppercase tracking-widest text-sm">Awaiting Scan Input</p>
              <p className="text-xs text-slate-300 mt-2">Upload a Volume + Segmentation NIfTI pair to begin</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analysis4D;