import React from "react";

export default function BloodAnalysis() {
  return (
    <div className="bg-[#f8f9fa] text-slate-800 flex min-h-screen font-sans">

      {/* ── Sidebar ── */}
      <aside className="h-screen w-56 fixed bg-white border-r border-slate-200 flex flex-col p-5">
        <div className="mb-8 px-1">
          <h1 className="text-base font-semibold text-blue-700 tracking-tight">Curator Pro</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Clinical Diagnostics</p>
        </div>

        <nav className="flex-grow space-y-0.5">
          {[
            { label: "Dashboard",       icon: "grid_view"  },
            { label: "Analyses",        icon: "biotech"    },
            { label: "Health trends",   icon: "timeline"   },
            { label: "Patient history", icon: "history"    },
            { label: "Settings",        icon: "settings"   },
          ].map(({ label, icon }) => (
            <a
              key={label}
              href="#"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                label === "Analyses"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-500 hover:text-blue-700 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
              {label}
            </a>
          ))}
        </nav>

        <button className="mt-auto w-full bg-blue-700 hover:bg-blue-800 transition-colors text-white py-2.5 rounded-full text-sm font-medium">
          Start analysis
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="ml-56 flex-1 flex flex-col">

        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-7 py-3 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <span className="text-sm font-semibold text-blue-700">Clinical Curator</span>
            <div className="flex items-center bg-slate-100 px-3 py-2 rounded-full gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">search</span>
              <input className="bg-transparent outline-none text-xs text-slate-700 w-36" placeholder="Search patient ID..." />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-slate-400 cursor-pointer hover:text-slate-600">notifications</span>
            <span className="material-symbols-outlined text-[20px] text-slate-400 cursor-pointer hover:text-slate-600">help_outline</span>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-800">Dr. Julian Vance</p>
                <p className="text-[10px] text-slate-400">Chief Clinician</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-semibold text-blue-700">
                JV
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="p-7 max-w-5xl mx-auto w-full">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">Blood analysis report</h2>
          <p className="text-xs text-slate-400 mb-6">Patient ID: PT-00482 · Collected 18 Apr 2026 · Dr. Julian Vance</p>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <StatCard label="Hemoglobin"  value="11.2" unit="g/dL"  delta="Below range" deltaColor="text-red-700"    valueColor="text-red-700" />
            <StatCard label="Glucose"     value="128"  unit="mg/dL" delta="Above range" deltaColor="text-amber-700"  valueColor="text-amber-700" />
            <StatCard label="Cholesterol" value="185"  unit="mg/dL" delta="Normal"       deltaColor="text-blue-700"   valueColor="text-blue-700" />
            <StatCard label="Risk score"  value="2/5"  unit=""      delta="Low–moderate" deltaColor="text-slate-400"  valueColor="text-slate-900" />
          </div>

          {/* Table card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-5 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900">Hematology &amp; metabolic panel</h3>
              <span className="text-[11px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">3 parameters</span>
            </div>

            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {["Parameter", "Result", "Reference range", "Visual", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row name="Hemoglobin"  result="11.2 g/dL" range="13.5 – 17.5" pct={52}  barColor="bg-red-400"   status="Low"    statusStyle="bg-red-50 text-red-700"    dot="bg-red-400" />
                <Row name="Glucose"     result="128 mg/dL"  range="70 – 99"     pct={85}  barColor="bg-amber-400" status="High"   statusStyle="bg-amber-50 text-amber-700" dot="bg-amber-400" />
                <Row name="Cholesterol" result="185 mg/dL"  range="< 200"       pct={62}  barColor="bg-blue-400"  status="Normal" statusStyle="bg-blue-50 text-blue-700"   dot="bg-blue-400" />
              </tbody>
            </table>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-3 gap-4">
            <Insight
              title="Microcytic anemia"
              text="Low hemoglobin suggests possible iron deficiency. Consider CBC with ferritin."
              bg="bg-red-50" border="border-red-100"
              iconBg="bg-red-100" iconColor="text-red-600"
              titleColor="text-red-900" textColor="text-red-700"
              icon="warning"
            />
            <Insight
              title="High glucose"
              text="Pre-diabetic range detected. Fasting retest and HbA1c recommended."
              bg="bg-amber-50" border="border-amber-100"
              iconBg="bg-amber-100" iconColor="text-amber-600"
              titleColor="text-amber-900" textColor="text-amber-700"
              icon="error"
            />
            <Insight
              title="Healthy cholesterol"
              text="Lipid profile is within normal range. No intervention needed at this time."
              bg="bg-blue-50" border="border-blue-100"
              iconBg="bg-blue-100" iconColor="text-blue-600"
              titleColor="text-blue-900" textColor="text-blue-700"
              icon="check_circle"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ── */

function StatCard({ label, value, unit, delta, deltaColor, valueColor }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-[11px] text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${valueColor}`}>
        {value}
        {unit && <span className="text-xs text-slate-400 ml-1 font-normal">{unit}</span>}
      </p>
      <p className={`text-[11px] mt-1 ${deltaColor}`}>{delta}</p>
    </div>
  );
}

function Row({ name, result, range, pct, barColor, status, statusStyle, dot }) {
  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3.5 text-sm font-medium text-slate-800">{name}</td>
      <td className="px-5 py-3.5 text-sm text-slate-700">{result}</td>
      <td className="px-5 py-3.5 text-sm text-slate-400">{range}</td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 w-7 text-right">{pct}%</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusStyle}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          {status}
        </span>
      </td>
    </tr>
  );
}

function Insight({ title, text, bg, border, iconBg, iconColor, titleColor, textColor, icon }) {
  return (
    <div className={`p-4 rounded-xl border ${bg} ${border}`}>
      <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center mb-3`}>
        <span className={`material-symbols-outlined text-[16px] ${iconColor}`}>{icon}</span>
      </div>
      <h4 className={`text-sm font-semibold mb-1 ${titleColor}`}>{title}</h4>
      <p className={`text-xs leading-relaxed ${textColor}`}>{text}</p>
    </div>
  );
}