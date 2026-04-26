// App.jsx or router config
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MedicalAnalysisDashboard from './pages/AI/2Dai';
import Analysis3D from './pages/AI/3Dai';
import MedicalAnalysisDashboard1 from './pages/AI/1Dai'
import AIResultsDashboard from './pages/AI/mainai'
import MedicalDashboard4 from './pages/AI/mainresult'
import BloodAnalysis from './pages/AI/analysis'
import Analysis4D from './pages/AI/3Dpersonal'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/analysis/2d" element={<MedicalAnalysisDashboard />} />
        <Route path="/analysis/3d" element={<Analysis3D />} />
        <Route path="/analysis/1d" element={<MedicalAnalysisDashboard1 />} />
        <Route path="/main" element={<AIResultsDashboard />} />
        <Route path="/main2" element={<MedicalDashboard4 />} />
        <Route path="/analysis" element={<BloodAnalysis />} />
        <Route path="/analysis/4D" element={<Analysis4D />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;