"use client"

/**
 * MedicalDashboard4.tsx
 * * ──────────────────────────────────────────────────────────────────────────────
 * All file-persistence logic lives in  ./fileStorage.js
 * All network/API logic lives in       ./apiService.js (for manual mode)
 *
 * This component handles UI state, manual analysis via apiService, and 
 * the new Auto-Dispatch direct API POST.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef, useState, useEffect } from "react"
import {
  LayoutDashboard, Calendar, BarChart2, Clock, UserCircle,
  UploadCloud, Settings, HelpCircle, Bell, CheckCircle2, Search,
  ChevronRight, Sparkles, Activity, HeartPulse, Microscope,
  Stethoscope, Zap, Info, ArrowRight, Plus, X, File, ImageIcon,
  Trash2, RefreshCw,
} from "lucide-react"

// ── Service imports ────────────────────────────────────────────────────────────
import { saveFiles, loadFiles, deleteFile, clearAllFiles } from "../datahandling/Filestorage.js"
import { runAnalysis } from "../datahandling/Apiservice.js"

// ── Model definitions ──────────────────────────────────────────────────────────
const MODELS = [
  {
    name: "Breast Cancer Predict",
    desc: "Breast Analysis",
    icon: Activity,
    accuracy: "98.2%",
    endpoint: "http://127.0.0.1:8100/api/v2/breast-predict-stores",
  },
  {
    name: "Lung Segment Store",
    desc: "Lung Segmentation V2",
    icon: Microscope,
    accuracy: "98.0%",
    endpoint: "http://127.0.0.1:8100/api/v2/lung-segment-store",
  },
  {
    name: "Skin Classification",
    desc: "Dermatology AI",
    icon: Activity,
    accuracy: "96.5%",
    endpoint: "http://127.0.0.1:8100/api/v2/skin-classification-store",
  },
  {
    name: "Blood Classification",
    desc: "Hematology Classifier",
    icon: HeartPulse,
    accuracy: "95.8%",
    endpoint: "http://127.0.0.1:8100/api/v2/blood-classify-store",
  },
  {
    name: "Blood Analysis",
    desc: "Comprehensive Blood AI",
    icon: HeartPulse,
    accuracy: "99.1%",
    endpoint: "http://127.0.0.1:8100/api/v2/bloodanalysis",
  },
  {
    name: "Bone Cancer Detect",
    desc: "Osteology AI",
    icon: Activity,
    accuracy: "94.2%",
    endpoint: "http://127.0.0.1:8100/api/v2/bone-segment-store",
  },
  {
    name: "Bone Fracture Detect",
    desc: "Fracture Identification",
    icon: Activity,
    accuracy: "97.1%",
    endpoint: "http://127.0.0.1:8100/api/v2/bone-classification-store",
  },
  {
    name: "Liver Predict",
    desc: "Hepatic Analysis",
    icon: Activity,
    accuracy: "93.9%",
    endpoint: "http://127.0.0.1:8100/api/v2/liver-segment-store",
  },
  {
    name: "Colon Cell Detect",
    desc: "Colonography AI",
    icon: Microscope,
    accuracy: "96.1%",
    endpoint: "http://127.0.0.1:8100/api/v2/colon-classification-store",
  },
  {
    name: "Lung Cell Detect",
    desc: "Cellular Lung AI",
    icon: Stethoscope,
    accuracy: "96.8%",
    endpoint: "http://127.0.0.1:8100/api/v2/lung-classify-store",
  },
  {
    name: "Brain Predict",
    desc: "Neurology AI",
    icon: Activity,
    accuracy: "98.5%",
    endpoint: "http://127.0.0.1:8100/api/v2/brain-segment-store",
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Component ──────────────────────────────────────────────────────────────────
const MedicalDashboard4 = () => {
  const [selectedModels, setSelectedModels] = useState([0, 1])
  const [mode, setMode] = useState("auto")
  const [isDragging, setIsDragging] = useState(false)
  const [storedFiles, setStoredFiles] = useState([])
  const [analysisResults, setAnalysisResults] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [statusMessage, setStatusMessage] = useState("")

  const fileInputRef = useRef(null)

  // ── Load persisted files on mount ────────────────────────────────────────────
  useEffect(() => {
    loadFiles()
      .then((files) => setStoredFiles(files))
      .catch((err) => console.error("[Dashboard] Failed to load stored files:", err))
  }, [])

  // ── File handling ─────────────────────────────────────────────────────────────
  const handleFiles = async (fileList) => {
    if (!fileList) return
    const newFiles = Array.from(fileList)
    try {
      const saved = await saveFiles(newFiles)
      setStoredFiles((prev) => [...prev, ...saved])
    } catch (err) {
      console.error("[Dashboard] Failed to save files:", err)
    }
  }

  const handleRemoveFile = async (storedFileId) => {
    try {
      await deleteFile(storedFileId)
      setStoredFiles((prev) => prev.filter((f) => f.id !== storedFileId))
    } catch (err) {
      console.error("[Dashboard] Failed to delete file:", err)
    }
  }

  const handleClearAll = async () => {
    try {
      await clearAllFiles()
      setStoredFiles([])
      setAnalysisResults([])
    } catch (err) {
      console.error("[Dashboard] Failed to clear files:", err)
    }
  }

  // ── Analysis ──────────────────────────────────────────────────────────────────
  const handleRunAnalysis = async () => {
    if (storedFiles.length === 0) {
      alert("Please upload at least one file.")
      return
    }

    setIsAnalyzing(true)
    setAnalysisResults([])

    // ── Auto-Dispatch Logic ──
// ✅ Correct — send one file at a time with required fields
    if (mode === "auto") {
      setStatusMessage("Sending to Auto-Dispatch Router…")
      try {
        const allResults = []
    
        for (const sf of storedFiles) {
          const formData = new FormData()
          formData.append("file", sf.blob, sf.name)   // 'file' not 'files'
          formData.append("patientId", "pat_123")      // required
          formData.append("fileType", "3D")            // required
    
          const response = await fetch("http://127.0.0.1:8100/api/v1/auto-dispatch-store", {
            method: "POST",
            body: formData,
          })
    
          if (!response.ok) {
            const err = await response.text()
            throw new Error(`Server responded with ${response.status}: ${err}`)
          }
    
          const data = await response.json()
          allResults.push(data)
        }
    
        setAnalysisResults(allResults.map(res => ({
          modelName: res.modelName || "Auto Router",
          prediction: res.prediction,
          fileName: res.originalName || "file",
          error: null
        })))
    
        setStatusMessage("Auto-dispatch complete.")
      } catch (err) {
        console.error("[Dashboard] Auto-dispatch failed:", err)
        setStatusMessage(`Auto-dispatch failed: ${err.message}`)
      } finally {
        setIsAnalyzing(false)
      }
      return
    }
    // ── Manual Selection Logic ──
    if (selectedModels.length === 0) {
      alert("Please select at least one AI model.")
      setIsAnalyzing(false)
      return
    }

    setProgress({ done: 0, total: selectedModels.length })
    setStatusMessage("Sending to selected AI models…")

    try {
      const results = await runAnalysis(
        storedFiles,
        selectedModels,
        MODELS,
        {
          allFilesAllModels: false, 
          onProgress: (result, done, total) => {
            setProgress({ done, total })
            setStatusMessage(
              result.error
                ? `⚠ ${result.modelName} failed — continuing…`
                : `✓ ${result.modelName} complete (${done}/${total})`
            )
          },
        }
      )

      setAnalysisResults(results)
      setStatusMessage(`Analysis complete — ${results.filter((r) => !r.error).length}/${results.length} succeeded.`)
    } catch (err) {
      console.error("[Dashboard] runAnalysis threw:", err)
      setStatusMessage(`Analysis failed: ${err.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleModel = (id) => {
    setSelectedModels((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", badge: null },
    { icon: Calendar, label: "Appointments", badge: "3" },
    { icon: BarChart2, label: "Analysis", active: true, badge: null },
    { icon: Clock, label: "Schedule", badge: null },
    { icon: UserCircle, label: "Consultation", badge: null },
  ]

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-700 antialiased">
      {/* ── Sidebar ────────────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-slate-200/70 flex flex-col">
        <div className="p-6 flex items-center gap-2.5">
          <div className="relative w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <HeartPulse size={18} className="text-white" strokeWidth={2.5} />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-[15px] leading-none">MediScan</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-none">AI Platform</p>
          </div>
        </div>

        <div className="px-4 mb-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-50 border border-slate-200/70 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        <div className="px-6 pt-4 pb-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Menu</p>
        </div>

        <nav className="flex-1 px-4">
          {navItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <button
                key={idx}
                className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all mb-1 relative ${
                  item.active
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg shadow-blue-500/25"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.active && (
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                )}
                <Icon size={18} strokeWidth={item.active ? 2.5 : 2} />
                <span className="text-sm flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      item.active ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-8 h-8 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center mb-3">
              <Sparkles size={16} className="text-amber-300" />
            </div>
            <p className="text-sm font-semibold leading-tight">Go Premium</p>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">Unlock advanced AI models</p>
            <button className="mt-3 w-full bg-white text-slate-900 text-xs font-semibold py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              Upgrade
            </button>
          </div>
        </div>

        <div className="px-4 pb-4 pt-2 border-t border-slate-100">
          <button className="flex items-center gap-3 px-3.5 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg w-full text-sm transition-colors">
            <HelpCircle size={16} /> Help Center
          </button>
          <button className="flex items-center gap-3 px-3.5 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg w-full text-sm transition-colors">
            <Settings size={16} /> Settings
          </button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">Sangar</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">Analysis</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-900 font-semibold">New Analysis</span>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
              <Bell size={18} className="text-slate-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-3 border-l pl-5 border-slate-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 leading-none">Dehmani Mohamed</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-none">Patient · ID #28491</p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white shadow-md">
                  DM
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">

            {/* ── Upload Area ─────────────────────────────────────────────────── */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                handleFiles(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-10 transition-all flex flex-col items-center overflow-hidden ${
                isDragging
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-slate-200 hover:border-blue-400"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                multiple
                accept=".dicom,.pdf,.jpg,.png"
              />

              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/30 to-blue-50/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                  <UploadCloud size={28} strokeWidth={2} />
                </div>
                <div className="absolute -inset-2 bg-blue-500/10 rounded-3xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="font-semibold text-slate-900 text-lg">Drop your files here</p>
              <p className="text-sm text-slate-500 mt-1">
                or <span className="text-blue-600 font-medium">click to browse</span> from your device
              </p>

              <div className="flex items-center gap-2 mt-5 pt-5 border-t border-slate-100 w-full max-w-sm justify-center">
                <span className="text-[11px] text-slate-400 font-medium">Supported:</span>
                {["DICOM", "PDF", "JPG", "PNG"].map((type) => (
                  <span key={type} className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Stored Files List ────────────────────────────────────────────── */}
            {storedFiles.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2 px-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {storedFiles.length} file{storedFiles.length !== 1 ? "s" : ""} saved locally
                  </p>
                  <button
                    onClick={handleClearAll}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                  >
                    <Trash2 size={12} />
                    Clear all
                  </button>
                </div>

                <div className="space-y-2">
                  {storedFiles.map((sf) => {
                    const isImage = sf.type?.startsWith("image/")
                    const FileIcon = isImage ? ImageIcon : File
                    const previewUrl = sf.blob ? URL.createObjectURL(sf.blob) : null

                    return (
                      <div
                        key={sf.id}
                        className="flex items-center gap-4 bg-white border border-slate-200/70 rounded-2xl px-5 py-3.5 shadow-sm"
                      >
                        {isImage && previewUrl ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                            <img src={previewUrl} alt={sf.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <FileIcon size={18} className="text-blue-500" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{sf.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {formatFileSize(sf.size)}
                            {sf.savedAt && (
                              <> · saved {new Date(sf.savedAt).toLocaleTimeString()}</>
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Ready
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(sf.id) }}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Mode Toggle ──────────────────────────────────────────────────── */}
            <div className="mt-8 flex justify-center">
              <div className="inline-flex p-1 bg-white border border-slate-200/70 rounded-xl shadow-sm">
                {[
                  { key: "auto", icon: Zap, label: "Run Automatically" },
                  { key: "manual", icon: Settings, label: "Manual Selection" },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                      mode === key
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Auto-Dispatch Notice (Visible only in auto mode) ───────────────── */}
            {mode === "auto" && (
                <div className="mt-6 bg-gradient-to-r from-emerald-50 to-emerald-50/50 border border-emerald-100 rounded-xl p-5 flex gap-4 max-w-3xl mx-auto items-center">
                    <div className="shrink-0 w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <Zap size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-900">Smart Routing Active</p>
                    <p className="text-sm text-emerald-800/80 mt-0.5 leading-relaxed">
                        Our AI router will automatically detect the scan type and forward your documents to the correct specialized model pipeline.
                    </p>
                    </div>
                </div>
            )}

            {/* ── Model Selection (Visible only in manual mode) ──────────────── */}
            {mode === "manual" && (
              <div className="mt-10 bg-white border border-slate-200/70 rounded-2xl p-8 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-lg">AI Model Selection</h3>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {selectedModels.length} Selected
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">Choose the AI models that will analyze your documents</p>
                  </div>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Plus size={14} />
                    Add Model
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {MODELS.map((model, i) => {
                    const Icon = model.icon
                    const isSelected = selectedModels.includes(i)
                    return (
                      <button
                        key={i}
                        onClick={() => toggleModel(i)}
                        className={`group relative text-left border rounded-2xl p-5 transition-all cursor-pointer overflow-hidden ${
                          isSelected
                            ? "border-blue-500 bg-gradient-to-br from-blue-50/80 to-white shadow-md shadow-blue-500/10"
                            : "border-slate-200/70 bg-white hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-8 translate-x-8" />
                        )}

                        <div className="relative flex items-start justify-between mb-4">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                                : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                            }`}
                          >
                            <Icon size={20} strokeWidth={2} />
                          </div>
                          <div
                            className={`transition-all ${
                              isSelected ? "text-blue-600 scale-110" : "text-slate-300 group-hover:text-slate-400"
                            }`}
                          >
                            <CheckCircle2 size={20} strokeWidth={isSelected ? 2.5 : 2} />
                          </div>
                        </div>

                        <div className="relative">
                          <p className="font-semibold text-slate-900 leading-tight">{model.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{model.desc}</p>

                          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[11px] font-medium text-slate-600">
                              Accuracy <span className="font-bold text-slate-900">{model.accuracy}</span>
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <div className="shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Info size={16} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900">Analysis Information</p>
                    <p className="text-sm text-blue-800/80 mt-0.5 leading-relaxed">
                      Analysis typically takes 30–60 seconds depending on scan complexity and selected models. Results
                      include confidence scores and detailed recommendations.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Analysis Results ─────────────────────────────────────────────── */}
            {analysisResults.length > 0 && (
              <div className="mt-8 bg-white border border-slate-200/70 rounded-2xl p-8 shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg mb-4">Analysis Results</h3>
                <div className="space-y-3">
                  {analysisResults.map((r, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-4 border ${
                        r.error
                          ? "bg-red-50 border-red-200"
                          : "bg-emerald-50 border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-slate-900">{r.modelName}</p>
                        {r.error ? (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase">
                            Failed
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                            Success
                          </span>
                        )}
                      </div>
                      {r.error ? (
                        <p className="text-xs text-red-700">{r.error}</p>
                      ) : (
                        <>
                          <p className="text-xs text-slate-600">
                            File: <span className="font-medium">{r.fileName}</span>
                          </p>
                          {r.mongoId && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              MongoDB ID: <span className="font-mono">{r.mongoId}</span>
                            </p>
                          )}
                          <details className="mt-2">
                            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                              View raw prediction
                            </summary>
                            <pre className="mt-1 text-[11px] bg-white/60 rounded-lg p-2 overflow-x-auto text-slate-700 border border-slate-100">
                              {JSON.stringify(r.prediction, null, 2)}
                            </pre>
                          </details>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Footer Action ────────────────────────────────────────────────── */}
            <div className="mt-8 flex items-center justify-between pb-8">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                {mode === "manual" && selectedModels.length > 0 && (
                  <div className="flex -space-x-2">
                    {selectedModels.map((modelIdx, idx) => (
                      <div
                        key={idx}
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 ring-2 ring-white flex items-center justify-center text-white text-[10px] font-bold"
                      >
                        {MODELS[modelIdx]?.name?.[0] ?? ""}
                      </div>
                    ))}
                  </div>
                )}
                <span>
                  {mode === "auto" ? (
                      <span className="font-semibold text-slate-900">Auto Router Ready</span>
                  ) : (
                      <><span className="font-semibold text-slate-900">{selectedModels.length} models</span> ready to run</>
                  )}
                </span>
                {statusMessage && (
                  <span className="text-[11px] text-slate-400 italic truncate max-w-xs">
                    {statusMessage}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2.5 transition-colors">
                  Save as Draft
                </button>
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || storedFiles.length === 0 || (mode === "manual" && selectedModels.length === 0)}
                  className={`group px-6 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all flex items-center gap-2 ${
                    isAnalyzing || storedFiles.length === 0 || (mode === "manual" && selectedModels.length === 0)
                      ? "bg-slate-300 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      {mode === "manual" && progress.total > 0
                        ? `Processing… (${progress.done}/${progress.total})`
                        : "Processing…"}
                    </>
                  ) : (
                    <>
                      Save and Run Analysis
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default MedicalDashboard4