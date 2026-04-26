import React, { useState, useMemo, Suspense, useEffect } from 'react';
import {
  LayoutGrid, BarChart3, BrainCircuit, Maximize2, Box,
  Settings, Activity, Upload, ChevronLeft, Download,
  Share2, CheckCircle2, ShieldCheck, AlertTriangle,
  Bell, HelpCircle, Calendar, Clock, Stethoscope, Menu
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
      <span className="text-lg font-bold text-slate-800 tabular-nums">{value}</span>
      <span className="text-xs font-semibold text-blue-500 uppercase">{unit}</span>
    </div>
  </div>
);

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

// --- Main Component ---
const Analysis3D = () => {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [apiImages, setApiImages] = useState({
    original_image: "https://via.placeholder.com/300",
    visual_result: "https://via.placeholder.com/300"
  });

  // --- API LOGIC — UNTOUCHED ---
  useEffect(() => {
    const triggerAutoAnalysis = async () => {
      console.log("⚡ Dashboard Mounted: Sending file for analysis...");
      setLoading(true);

      try {
        const formData = new FormData();
        if (selectedFile) {
          formData.append('file', selectedFile);
        } else {
          const blob = new Blob(["data"], { type: "text/plain" });
          formData.append('file', blob, "auto_scan.dcm");
        }

        const response = await fetch('https://pillowlike-lobeliaceous-briana.ngrok-free.dev/api/v1/predict/2bcc9dbd-c6c4-41c0-892d-a5d4aac39ec2', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorDetail = await response.json();
          console.error("Backend Error Detail:", errorDetail);
          throw new Error("422 or Server Error");
        }

        const json = await response.json();
        setApiData(json);

        if (json.visual_result) {
          setApiImages({
            original_image: json.original_image,
            visual_result: json.visual_result
          });
        }
      } catch (err) {
        console.error("❌ Auto-Analysis Failed:", err);
      } finally {
        setLoading(false);
      }
    };

    triggerAutoAnalysis();
  }, []);
  // --- END API LOGIC ---

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

  // Loading Screen — restyled
  if (loading) return (
    <div className="h-screen bg-white flex flex-col items-center justify-center text-blue-600 font-sans">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-5" />
      <p className="text-sm font-semibold text-slate-500 tracking-widest uppercase animate-pulse">
        Initializing Neural Analysis...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-slate-800">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Activity className="text-white" size={18} />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg leading-none tracking-tight">NODE</span>
            <span className="font-bold text-blue-600 text-lg leading-none tracking-tight">_SCAN</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <NavItem key={item.label} {...item} />
          ))}
        </nav>

        {/* Bottom */}
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

          <div className="flex items-center gap-4">
            {/* File upload — UNTOUCHED logic */}
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              <Upload size={15} />
              New Analysis
            </label>

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
                <p className="text-sm font-semibold text-slate-900">LIDC-0001</p>
                <p className="text-xs text-slate-500">Patient</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">

          {/* Breadcrumb */}
          <div className="mb-6">
            <p className="text-slate-400 text-sm mb-2">Results / Analysis #1</p>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-200 rounded-lg transition">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-2xl font-bold text-slate-900">Lung CT — 3D Reconstruction</h2>
            </div>
          </div>

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
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-blue-600 rounded-full text-sm font-medium border border-sky-200">
              <ShieldCheck className="w-4 h-4" />
              {apiData ? `${(apiData.confidence * 100).toFixed(1)}% Confidence` : '— Confidence'}
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-sm font-medium border border-rose-200">
              <AlertTriangle className="w-4 h-4" />
              {apiData ? apiData.prediction : 'Awaiting Result'}
            </span>
          </div>

          {/* ── Main Grid ── */}
          {apiData ? (
            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">

              {/* 3D Viewport — all logic UNTOUCHED */}
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
                          <MedicalMesh data={apiData?.mesh} color="#00f2ff" />
                        </Stage>
                      </Float>
                      <gridHelper args={[400, 40, '#94a3b8', '#f1f5f9']} position={[0, -100, 0]} />
                      <OrbitControls autoRotate={false} enableZoom={true} />
                    </Suspense>
                  </Canvas>
                </div>
              </div>

              {/* Stats Column */}
              <div className="col-span-4 flex flex-col gap-6">

                {/* Classification Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Classification</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Prediction</p>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-1">
                      {apiData?.prediction}
                    </h2>
                    <div className="text-4xl font-bold text-blue-600 tabular-nums">
                      {(apiData?.confidence * 100).toFixed(1)}
                      <span className="text-lg font-semibold text-slate-400 ml-1">%</span>
                    </div>
                  </div>
                </div>

                {/* Structural Metrics Card */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Maximize2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-900">Structural Metrics</h3>
                  </div>
                  <div className="p-6">
                    <Metric label="Volume"    value={apiData?.patient_analysis?.volume_voxels}                         unit="vx"  />
                    <Metric label="Z-Depth"   value={apiData?.patient_analysis?.affected_slices}                       unit="slc" />
                    <Metric label="Peak Conf" value={(apiData?.patient_analysis?.max_confidence * 100).toFixed(1)}     unit="%"   />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-white min-h-[400px]">
              <Box size={40} className="mb-4 text-slate-300" />
              <p className="font-semibold text-slate-400 uppercase tracking-widest text-sm">Awaiting Scan Input</p>
              <p className="text-xs text-slate-300 mt-2">Upload a DICOM file to begin reconstruction</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analysis3D;