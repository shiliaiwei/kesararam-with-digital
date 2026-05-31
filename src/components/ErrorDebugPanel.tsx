"use client";

import { useState, useEffect } from "react";
import { errorLogger } from "@/lib/error-logger";
import { X, Download, Trash2, AlertCircle } from "lucide-react";

export function ErrorDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    // Update logs every 2 seconds
    const interval = setInterval(() => {
      const currentLogs = errorLogger.getLogs();
      setLogs(currentLogs);
      setErrorCount(currentLogs.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development or for admins
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 transition-all border-2 border-black"
        title="Error Debug Panel"
      >
        <AlertCircle size={24} />
        {errorCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-black">
            {errorCount}
          </span>
        )}
      </button>

      {/* Debug panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="bg-red-500 text-white p-4 flex items-center justify-between border-b-4 border-black">
              <div className="flex items-center gap-2">
                <AlertCircle size={24} />
                <h2 className="text-xl font-black">Error Debug Panel</h2>
                <span className="bg-white text-red-500 px-3 py-1 rounded-full font-bold text-sm">
                  {errorCount} errors
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => errorLogger.downloadLogs()}
                  className="bg-white text-red-500 p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Download logs"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => {
                    errorLogger.clearLogs();
                    setLogs([]);
                    setErrorCount(0);
                  }}
                  className="bg-white text-red-500 p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Clear logs"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-white text-red-500 p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <AlertCircle size={48} className="mx-auto mb-4" />
                  <p className="font-bold">No errors logged yet</p>
                  <p className="text-sm">Errors will appear here when they occur</p>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="border-2 border-black p-4 bg-red-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">
                          {log.type}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="font-bold text-red-700 mb-2">{log.message}</p>
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>URL:</strong> {log.url}
                    </p>
                    {log.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-bold text-gray-700 hover:text-gray-900">
                          Stack Trace
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
                          {log.stack}
                        </pre>
                      </details>
                    )}
                    {log.additionalInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-bold text-gray-700 hover:text-gray-900">
                          Additional Info
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                          {JSON.stringify(log.additionalInfo, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
