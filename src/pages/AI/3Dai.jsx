import React, { useState, useMemo, Suspense, useEffect } from 'react';
import {
  LayoutGrid, BarChart3, BrainCircuit, Maximize2, Box,
  Settings, Activity, ChevronLeft,
  CheckCircle2, ShieldCheck, AlertTriangle,
  HelpCircle, Calendar, Clock, Stethoscope,
  FileText, Layers, AlertCircle
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import { useLocation, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { BASE_URL } from '../../pages/datahandling/constants';

// ─────────────────────────────────────────────────────────────────────────────
// 3D Mesh — reads { vertices: [[x,y,z],...], faces: [[a,b,c],...] } from JSON
// ─────────────────────────────────────────────────────────────────────────────
function MedicalMesh({ data, wireframe = false }) {
  const geometry = useMemo(() => {
    // Support both top-level and nested meshData keys
    const vertices = data?.vertices ?? data?.meshData?.vertices;
    const faces    = data?.faces    ?? data?.meshData?.faces;

    if (!vertices?.length || !faces?.length) return null;

    try {
      const geo = new THREE.BufferGeometry();

      // vertices is [[x,y,z], ...] — flatten to Float32Array
      geo.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(vertices.flat()), 3)
      );

      // faces is [[a,b,c], ...] — flatten to Uint32Array
      geo.setIndex(
        new THREE.BufferAttribute(new Uint32Array(faces.flat()), 1)
      );

      geo.computeVertexNormals();
      geo.center(); // centre so it always appears in view

      return geo;
    } catch (err) {
      console.error('Geometry build error:', err);
      return null;
    }
  }, [data]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#00f2ff"
        emissive="#00f2ff"
        emissiveIntensity={0.25}
        roughness={0.1}
        metalness={0.8}
        wireframe={wireframe}
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Small re-usable components
// ─────────────────────────────────────────────────────────────────────────────
const Metric = ({ label, value, unit }) => (
  <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className="text-lg font-bold text-slate-800 tabular-nums">{value ?? '—'}</span>
      {unit && <span className="text-xs font-semibold text-blue-500 uppercase">{unit}</span>}
    </div>
  </div>
);

const NavItem = ({ icon: Icon, label, active }) => (
  <a
    href="#"
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
      active ? 'bg-sky-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
    {label}
  </a>
);

const ScoreBadge = ({ label, value, highlight }) => (
  <div
    className={`flex justify-between items-center px-4 py-2.5 rounded-xl border text-sm font-medium ${
      highlight
        ? 'bg-blue-50 border-blue-200 text-blue-700'
        : 'bg-slate-50 border-slate-200 text-slate-600'
    }`}
  >
    <span>{label}</span>
    <span className="font-bold tabular-nums">
      {typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : value}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const Analysis3D = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── State passed from AnalysisCard ────────────────────────────────────────
  // { scanData: analysis, fileName: scanName, filePath: fullFilePath }
  const { scanData, fileName } = location.state || {};

  // ── Guard ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!scanData) navigate('/');
  }, [scanData, navigate]);

  const [meshData,    setMeshData]    = useState(null);
  const [meshLoading, setMeshLoading] = useState(false);
  const [meshError,   setMeshError]   = useState(null);
  const [wireframe,   setWireframe]   = useState(false);

  // ── Derive display values from the API response shape ─────────────────────
  //
  // API returns:
  // {
  //   _id, patientId, modelName, filescantype, modelAccuracy,
  //   prediction: {
  //     prediction,       ← "Nodule"
  //     confidence,       ← 0.9999
  //     type,             ← "3D"
  //     all_scores,       ← { Background: 0.0001, Nodule: 0.9999 }
  //     patient_analysis: { volume_voxels, affected_slices, slice_range, max_confidence }
  //   },
  //   originalName, filename, meshFilename, meshPath,
  //   uploadedAt
  // }
  const prediction      = scanData?.prediction;
  const patientAnalysis = prediction?.patient_analysis;
  const allScores       = prediction?.all_scores       ?? {};
  const confidence      = prediction?.confidence       ?? null;
  const predictionLabel = prediction?.prediction       ?? 'Pending';
  const modelName       = scanData?.modelName          ?? '—';
  const modelAccuracy   = scanData?.modelAccuracy      ?? null;
  const patientId       = scanData?.patientId          ?? 'Guest';
  const uploadedAt      = scanData?.uploadedAt
    ? new Date(scanData.uploadedAt).toLocaleString('en-GB')
    : '—';

  // meshFilename is the separate JSON file containing { vertices, faces }
  // e.g. "files-1777437396010-436637636.json"
  const meshFilename = scanData?.meshFilename ?? null;

  // ── Fetch the mesh JSON from the backend ──────────────────────────────────
  // Route: GET /upload/filename/:meshFilename  (same endpoint used in the curl)
  useEffect(() => {
    if (!meshFilename) return;

    const fetchMesh = async () => {
      setMeshLoading(true);
      setMeshError(null);
      try {
        const res = await fetch(`${BASE_URL}/upload/meshfetch/${encodeURIComponent(meshFilename)}`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const json = await res.json();

        // Validate: must have vertices and faces arrays
        if (!json?.vertices || !json?.faces) {
          throw new Error('Mesh JSON is missing "vertices" or "faces" fields.');
        }

        setMeshData(json);
      } catch (err) {
        console.error('❌ Mesh fetch failed:', err.message);
        setMeshError(err.message);
      } finally {
        setMeshLoading(false);
      }
    };

    fetchMesh();
  }, [meshFilename]);

  // ── Mesh stats for the topology panel ────────────────────────────────────
  const meshStats = useMemo(() => {
    if (!meshData) return null;
    return {
      vertices: meshData.vertices?.length ?? 0,
      faces:    meshData.faces?.length    ?? 0,
    };
  }, [meshData]);

  // ── Guard render ──────────────────────────────────────────────────────────
  if (!scanData) return null;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-slate-800">

      {/* Sidebar */}
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
          <NavItem icon={LayoutGrid}  label="Overview"      active={false} />
          <NavItem icon={Calendar}    label="Appointments"  active={false} />
          <NavItem icon={BarChart3}   label="Analysis"      active={true}  />
          <NavItem icon={Clock}       label="Schedule"      active={false} />
          <NavItem icon={Stethoscope} label="Consultation"  active={false} />
        </nav>
        <div className="p-4 border-t border-slate-200">
          <NavItem icon={HelpCircle} label="Help"     active={false} />
          <NavItem icon={Settings}   label="Settings" active={false} />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-auto">

        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-blue-600 font-medium">Volumetric Reconstruction</p>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">PT</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{patientId}</p>
              <p className="text-xs text-slate-500">Patient File</p>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">

          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-200 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">3D Volumetric Reconstruction</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Model: <span className="font-medium text-slate-700">{modelName}</span>
                {modelAccuracy && <> · Accuracy: <span className="font-medium text-slate-700">{modelAccuracy}</span></>}
                {' · '}Analyzed: <span className="font-medium text-slate-700">{uploadedAt}</span>
              </p>
            </div>
          </div>

          {/* No meshFilename warning */}
          {!meshFilename && (
            <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>No mesh file associated with this scan. The 3D viewer will be empty.</span>
            </div>
          )}

          <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">

            {/* ── 3D Viewport ── */}
            <div className="col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">Interactive Model</h3>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setWireframe(w => !w)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      wireframe
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Wireframe
                  </button>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      meshData
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : meshLoading
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {meshData ? 'RENDER_READY' : meshLoading ? 'LOADING_MESH…' : 'WAITING'}
                  </span>
                </div>
              </div>

              <div className="flex-1 bg-slate-950 min-h-[500px] relative">

                {/* Loading overlay */}
                {meshLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-semibold text-slate-400 tracking-widest uppercase animate-pulse">
                      Loading mesh data…
                    </p>
                  </div>
                )}

                {/* Error overlay */}
                {meshError && !meshLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                    <AlertCircle className="w-10 h-10 text-rose-400" />
                    <p className="text-sm text-rose-400 font-medium text-center max-w-xs">{meshError}</p>
                    <button
                      onClick={() => { setMeshError(null); setMeshLoading(true); }}
                      className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* 3D Canvas — only mounts when we have mesh data */}
                {meshData && !meshLoading && (
                  <Canvas shadows>
                    <Suspense fallback={null}>
                      <PerspectiveCamera makeDefault position={[250, 250, 250]} fov={45} />
                      <ambientLight intensity={0.7} />
                      <pointLight position={[100, 100, 100]} intensity={1} />
                      <pointLight position={[-100, -100, -100]} color="#4af" intensity={0.5} />
                      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <MedicalMesh data={meshData} wireframe={wireframe} />
                      </Float>
                      <gridHelper args={[500, 50, '#1e293b', '#0f172a']} position={[0, -120, 0]} />
                      <OrbitControls makeDefault />
                    </Suspense>
                  </Canvas>
                )}

                {/* Idle — no mesh, not loading, no error */}
                {!meshData && !meshLoading && !meshError && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
                    {meshFilename ? 'Preparing mesh buffer…' : 'No mesh file available for this scan.'}
                  </div>
                )}
              </div>
            </div>

            {/* ── Metrics sidebar ── */}
            <div className="col-span-4 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-200px)]">

              {/* AI Classification */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">AI Classification</p>
                <h2 className="text-3xl font-black text-slate-900 uppercase mb-1">{predictionLabel}</h2>
                <div className="text-4xl font-bold text-blue-600">
                  {confidence !== null ? (confidence * 100).toFixed(2) : '—'}
                  <span className="text-lg font-semibold text-slate-400 ml-1">%</span>
                </div>

                {Object.keys(allScores).length > 0 && (
                  <div className="mt-6 space-y-2">
                    {Object.entries(allScores).map(([label, val]) => (
                      <ScoreBadge
                        key={label}
                        label={label}
                        value={val}
                        highlight={label === predictionLabel}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Structural analysis */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-blue-600" /> Structural Analysis
                </h3>
                <Metric
                  label="Volume"
                  value={patientAnalysis?.volume_voxels?.toLocaleString()}
                  unit="vx"
                />
                <Metric
                  label="Slices Affected"
                  value={patientAnalysis?.affected_slices}
                  unit="slc"
                />
                <Metric
                  label="Slice Range"
                  value={
                    patientAnalysis?.slice_range
                      ? `${patientAnalysis.slice_range[0]}–${patientAnalysis.slice_range[1]}`
                      : null
                  }
                />
                <Metric
                  label="Peak Confidence"
                  value={
                    patientAnalysis?.max_confidence != null
                      ? `${(patientAnalysis.max_confidence * 100).toFixed(1)}`
                      : null
                  }
                  unit="%"
                />
              </div>

              {/* Topology info — only shown once mesh is loaded */}
              {meshStats && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" /> Topology Info
                  </h3>
                  <Metric label="Vertices" value={meshStats.vertices.toLocaleString()} />
                  <Metric label="Faces"    value={meshStats.faces.toLocaleString()}    />
                </div>
              )}

              {/* Scan file info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" /> Scan Info
                </h3>
                {[
                  { label: 'Scan type',     value: scanData?.filescantype ?? '—' },
                  { label: 'Original file', value: scanData?.originalName  ?? fileName ?? '—' },
                  { label: 'Mesh file',     value: meshFilename             ?? '—' },
                  { label: 'Upload date',   value: uploadedAt },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</span>
                    <span className="text-xs font-medium text-slate-700 text-right max-w-[55%] truncate">{value}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis3D;