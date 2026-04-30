export const getConfidenceValue = (item) => {
    const pred = item.prediction || {};
    const raw = pred.confidence ?? pred.diagnostics?.confidence ?? 0;
    return raw <= 1 ? Math.round(raw * 100) : Math.round(raw);
  };
  
  export const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-emerald-500';
    if (confidence >= 85) return 'text-teal-500';
    return 'text-blue-500';
  };
  
  export const getConfidenceBg = (confidence) => {
    if (confidence >= 90) return 'from-emerald-500/10 to-emerald-500/5';
    if (confidence >= 85) return 'from-teal-500/10 to-teal-500/5';
    return 'from-blue-500/10 to-blue-500/5';
  };
  
  export const getConfidenceRing = (confidence) => {
    if (confidence >= 90) return 'ring-emerald-500/20';
    if (confidence >= 85) return 'ring-teal-500/20';
    return 'ring-blue-500/20';
  };