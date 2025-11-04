import React, { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '../utils/performanceMonitor';

interface PerformanceDebuggerProps {
  enabled?: boolean;
}

export const PerformanceDebugger: React.FC<PerformanceDebuggerProps> = ({ 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [coreWebVitals, setCoreWebVitals] = useState<any>({});
  const { getStoredMetrics, clearStoredMetrics, getCoreWebVitals } = usePerformanceMonitor();

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      setMetrics(getStoredMetrics());
    };

    const updateCoreWebVitals = async () => {
      const vitals = await getCoreWebVitals();
      setCoreWebVitals(vitals);
    };

    updateMetrics();
    updateCoreWebVitals();

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [enabled]); // Removed the problematic dependencies

  if (!enabled) return null;

  const formatValue = (value: number): string => {
    return value < 1000 ? `${value.toFixed(1)}ms` : `${(value / 1000).toFixed(2)}s`;
  };

  const getVitalStatus = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 z-50"
        title="Performance Debugger"
      >
        📊
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Performance Metrics</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Core Web Vitals */}
          <div className="mb-4">
            <h4 className="font-medium mb-2">Core Web Vitals</h4>
            <div className="space-y-1 text-sm">
              {coreWebVitals.lcp && (
                <div className="flex justify-between">
                  <span>LCP:</span>
                  <span className={getStatusColor(getVitalStatus('lcp', coreWebVitals.lcp))}>
                    {formatValue(coreWebVitals.lcp)}
                  </span>
                </div>
              )}
              {coreWebVitals.fid !== undefined && (
                <div className="flex justify-between">
                  <span>FID:</span>
                  <span className={getStatusColor(getVitalStatus('fid', coreWebVitals.fid))}>
                    {formatValue(coreWebVitals.fid)}
                  </span>
                </div>
              )}
              {coreWebVitals.cls !== undefined && (
                <div className="flex justify-between">
                  <span>CLS:</span>
                  <span className={getStatusColor(getVitalStatus('cls', coreWebVitals.cls))}>
                    {coreWebVitals.cls.toFixed(3)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Metrics */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Recent Metrics</h4>
              <button
                onClick={clearStoredMetrics}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
              {metrics.slice(-20).reverse().map((metric, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="truncate mr-2" title={metric.name}>
                    {metric.name}
                  </span>
                  <span className="font-mono">
                    {formatValue(metric.value)}
                  </span>
                </div>
              ))}
              {metrics.length === 0 && (
                <div className="text-gray-500 text-center py-2">
                  No metrics recorded yet
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Total metrics:</span>
              <span>{metrics.length}</span>
            </div>
            {metrics.length > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Avg load time:</span>
                  <span>
                    {formatValue(
                      metrics
                        .filter(m => m.name.includes('load'))
                        .reduce((sum, m) => sum + m.value, 0) /
                      Math.max(1, metrics.filter(m => m.name.includes('load')).length)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Images loaded:</span>
                  <span>
                    {metrics.filter(m => m.name.includes('image')).length}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceDebugger;