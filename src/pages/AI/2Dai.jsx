import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, Calendar, BarChart3, Clock, Stethoscope, 
  HelpCircle, Settings, ChevronLeft, Download, Share2, 
  CheckCircle2, ShieldCheck, AlertTriangle, Timer, 
  FileText, Image as ImageIcon, BrainCircuit, Bell, Menu
} from 'lucide-react';

const MedicalAnalysisDashboard = () => {
  const [apiImages, setApiImages] = useState({
    original_image: "https://via.placeholder.com/300",
    visual_result: "https://via.placeholder.com/300"
  });

  // 1. Define the logic as its own function
  const runAnalysis = async () => {
    try {
      // 1. Fetch the image from the public folder
      const response = await fetch('/malignant (192).png');
      
      // CHECK: If the file isn't found, stop here so we don't send junk to the API
      if (!response.ok) {
        throw new Error(`Could not find the image file in the public folder. Status: ${response.status}`);
      }
  
      const blob = await response.blob();
      
      // Verify the blob actually contains image data
      if (blob.type.indexOf('image') === -1) {
        throw new Error("The file fetched is not a valid image type.");
      }
  
      const file = new File([blob], "test_image.png", { type: "image/png" });
      const formData = new FormData();
      formData.append('file', file);
  
      const apiResponse = await fetch('http://127.0.0.1:8000/api/v1/breastpredict', {
        method: 'POST',
        body: formData,
      });
  
      const data = await apiResponse.json();
      setApiImages({
        original_image: data.original_image,
        visual_result: data.visual_result
      });
    } catch (error) {
      console.error("Frontend Logic Error:", error.message);
    }
  };

  // 2. Trigger the function on load
  useEffect(() => {
    runAnalysis(); // Call the specific function, NOT the component name
  }, []);

  // 3. Keep your manual upload button working too
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // ... same logic as runAnalysis but using 'file' from event
  };

  // ... rest of your sidebarItems and return // The empty array [] means it only runs once on load
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

  return (
    <div className="min-h-screen bg-[#0f1115] flex font-sans text-slate-800">
      {/* Sidebar - NO CHANGES */}
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
            <a key={item.label} href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${item.active ? 'bg-sky-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>
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

      <main className="flex-1 bg-[#f8f9fa] overflow-auto">
        {/* Header - Added hidden file input trigger */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"><Menu className="w-5 h-5 text-slate-600" /></button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-blue-600 font-medium">Analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <input type="file" id="upload-capture" className="hidden" onChange={handleFileUpload} />
            <button 
              onClick={() => document.getElementById('upload-capture').click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              Upload Scan
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="User" className="w-10 h-10 rounded-full object-cover"/>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900">Dehmani mohamed</p>
                <p className="text-xs text-slate-500">Patient</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Breadcrumb - NO CHANGES */}
          <div className="mb-6">
            <p className="text-slate-500 text-sm mb-2">Results / Analysis #1</p>
            <div className="flex items-center gap-3 mb-2">
              <button className="p-2 hover:bg-slate-200 rounded-lg"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
              <h2 className="text-2xl font-bold text-slate-900">TypeName Analysis</h2>
            </div>
          </div>

          {/* Action Buttons - NO CHANGES */}
          <div className="flex justify-end gap-3 mb-6">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 shadow-sm"><Download className="w-4 h-4" />Export</button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-600 rounded-xl text-blue-600 font-medium hover:bg-blue-50 shadow-sm"><Share2 className="w-4 h-4" />Share</button>
          </div>

          {/* Status Tags - NO CHANGES */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200"><CheckCircle2 className="w-4 h-4" />Completed</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 text-blue-600 rounded-full text-sm font-medium border border-sky-200"><ShieldCheck className="w-4 h-4" />94% Confidence</span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-sm font-medium border border-rose-200"><AlertTriangle className="w-4 h-4" />Low-Moderate Risk</span>
          </div>

          {/* Images Grid - ONLY CHANGED THESE TWO img src ATTRIBUTES */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Original Image Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Original Image</h3>
              </div>
              <div className="p-6 bg-slate-50 flex items-center justify-center min-h-[320px]">
                <div className="text-center">
                  <img 
                    src={apiImages.original_image} 
                    alt="Original Scan" 
                    className="max-w-full max-h-[280px] rounded-lg shadow-md object-contain transition-all duration-500"
                  />
                  <p className="mt-3 text-sm text-slate-500 font-medium">Input_Data.png</p>
                </div>
              </div>
            </div>

            {/* AI Segmentation Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900">AI Segmentation</h3>
              </div>
              <div className="p-6 bg-slate-50 flex items-center justify-center min-h-[320px]">
                <div className="text-center">
                  <img 
                    src={apiImages.visual_result} 
                    alt="AI Segmentation Result" 
                    className="max-w-full max-h-[280px] rounded-lg shadow-md object-contain transition-all duration-500"
                  />
                  <p className="mt-3 text-sm text-slate-500 font-medium">processed_heatmap.png</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Report Card - NO CHANGES */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">AI Report</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                The AI system analyzed the uploaded medical image and detected patterns...
              </p>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2 text-sm">Recommendation</h4>
                <p className="text-slate-600 text-sm leading-relaxed">Clinical correlation advised...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicalAnalysisDashboard;