import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { X, Loader2, FileText } from 'lucide-react';
import api from '../../../../services/api'; // Assuming axios instance

const ImportProgressModal = ({ isOpen, onClose, jobId, onComplete }) => {
  const [progress, setProgress] = useState(null);
  const [report, setReport] = useState(null);
  const [isAborting, setIsAborting] = useState(false);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (isOpen && jobId) {
      // Define fetchReport inside useEffect to avoid dependency issues and hoisting errors
      const fetchReport = async () => {
        try {
          const res = await api.get(`/admin/locations/import/${jobId}/report`);
          setReport(res.data.data);
          if (res.data.data.status === 'completed' && onComplete) {
             onComplete();
          }
        } catch (error) {
          console.error('Failed to fetch report', error);
        }
      };

      // Setup SSE
      // Note: EventSource doesn't support custom headers easily for Bearer token.
      // If your backend requires auth for this endpoint, you might need a query param token or a library like 'event-source-polyfill'
      // For now assuming standard EventSource or cookie-based auth, or query param. 
      // Let's check how to pass token. Usually polyfill or query param.
      // I'll use a query param for simplicity if AuthContext gives a token.
      
      const token = localStorage.getItem('token'); // Simplest assumption
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/v1/admin/locations/import/${jobId}/progress?token=${token}`;
      
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.error) {
          eventSource.close();
          fetchReport();
          return;
        }

        setProgress(data);

        if (['completed', 'failed', 'aborted'].includes(data.status)) {
          // IMPORTANT: Close the connection FIRST to stop further events/reconnections
          eventSource.close();
          fetchReport();
        }
      };

      eventSource.onerror = (err) => {
        // Only log error if not closed intentionally (readyState 2 = CLOSED)
        if (eventSource.readyState !== 2) {
             console.error('SSE Error:', err);
             eventSource.close();
             fetchReport();
        }
      };

      return () => {
        eventSource.close();
      };
    }
  }, [isOpen, jobId, onComplete]);

  const handleAbort = async () => {
    setIsAborting(true);
    try {
      await api.post(`/admin/locations/import/${jobId}/abort`);
    } catch (error) {
      console.error('Failed to abort', error);
      setIsAborting(false);
    }
  };

  const calculatePercent = () => {
    if (!progress || progress.totalRows === 0) return 0;
    return Math.round((progress.processedRows / progress.totalRows) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'aborted': return 'text-orange-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={() => { if (report) onClose(); }}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4 font-inter">
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <DialogTitle className="text-xl font-bold text-gray-900 font-primary flex items-center gap-2">
                  <FileText className="text-primary" />
                  Import Locations
                </DialogTitle>
                {report && (
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                )}
              </div>

              {/* Progress Section */}
              {!report ? (
                <div className="space-y-6">
                  <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span>Processing...</span>
                    <span>{calculatePercent()}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-300 ease-out"
                      style={{ width: `${calculatePercent()}%` }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    {progress ? (
                      <>Processing row {progress.processedRows} of {progress.totalRows}</>
                    ) : (
                      'Initializing...'
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleAbort}
                      disabled={isAborting}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors flex items-center gap-2"
                    >
                      {isAborting && <Loader2 className="animate-spin" size={16} />}
                      Abort Import
                    </button>
                  </div>
                </div>
              ) : (
                /* Report Section */
                <div className="space-y-6">
                  <div className={`text-center p-4 rounded-xl ${
                    report.status === 'completed' ? 'bg-green-50' : 
                    report.status === 'failed' ? 'bg-red-50' : 'bg-orange-50'
                  }`}>
                    <div className={`text-lg font-bold mb-1 ${getStatusColor(report.status)} capitalize`}>
                      {report.status}
                    </div>
                    <div className="text-sm text-gray-600">
                      {report.status === 'completed' ? 'Import completed successfully' : 
                       report.status === 'failed' ? 'Import failed' : 'Import aborted by user'}
                    </div>
                    {report.systemError && (
                        <div className="mt-2 text-sm text-red-600 font-semibold">
                            System Error: {report.systemError}
                        </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-800">{report.totalRows}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Total Rows</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{report.successCount}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Success</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{report.errorCount}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Errors</div>
                    </div>
                  </div>

                  {/* Error List */}
                  {report.errors && report.errors.length > 0 && (
                    <div className="border border-red-100 rounded-xl overflow-hidden">
                      <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex justify-between items-center">
                        <span className="font-semibold text-red-700">Error Log</span>
                        <span className="text-xs text-red-600">{report.errors.length} issues found</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto p-0">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500">
                            <tr>
                              <th className="px-4 py-2 font-medium">Row</th>
                              <th className="px-4 py-2 font-medium">Issue</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {report.errors.map((err, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-2 font-mono text-gray-500 align-top w-16">#{err.row}</td>
                                <td className="px-4 py-2">
                                  <div className="text-red-600 font-medium">{err.message}</div>
                                  {err.column && <div className="text-gray-400 text-xs mt-0.5">Column: {err.column}</div>}
                                  {err.data && (
                                    <div className="text-gray-400 text-xs mt-1 font-mono bg-gray-50 p-1 rounded">
                                        {JSON.stringify(err.data)}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ImportProgressModal;
