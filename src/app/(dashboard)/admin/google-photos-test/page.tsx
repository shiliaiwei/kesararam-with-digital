"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  message?: string;
  data?: any;
}

export default function GooglePhotosTestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Environment Variables", status: "pending" },
    { name: "List Albums", status: "pending" },
    { name: "API Connection", status: "pending" },
  ]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const newTests: TestResult[] = [];

    // Test 1: Check environment variables
    try {
      const response = await fetch("/api/media/google-photos/test");
      const data = await response.json();
      
      if (data.environment.serviceAccountEmail === "Set ✓" && data.environment.privateKey === "Set ✓") {
        newTests.push({
          name: "Environment Variables",
          status: "success",
          message: "All environment variables are set correctly",
          data: data.environment,
        });
      } else {
        newTests.push({
          name: "Environment Variables",
          status: "error",
          message: "Missing environment variables",
          data: data.environment,
        });
      }
    } catch (error) {
      newTests.push({
        name: "Environment Variables",
        status: "error",
        message: error instanceof Error ? error.message : "Failed to check environment",
      });
    }

    setTests([...newTests, { name: "List Albums", status: "pending" }, { name: "API Connection", status: "pending" }]);

    // Test 2: Try to list albums
    try {
      const response = await fetch("/api/media/google-photos/list?type=albums");
      const data = await response.json();
      
      if (data.success) {
        newTests.push({
          name: "List Albums",
          status: "success",
          message: `Successfully fetched ${data.count} albums`,
          data: data.albums,
        });
      } else {
        newTests.push({
          name: "List Albums",
          status: "error",
          message: data.message || data.error || "Failed to list albums",
          data: data,
        });
      }
    } catch (error) {
      newTests.push({
        name: "List Albums",
        status: "error",
        message: error instanceof Error ? error.message : "Failed to connect to API",
      });
    }

    setTests([...newTests, { name: "API Connection", status: "pending" }]);

    // Test 3: Overall API connection
    const allSuccess = newTests.every(t => t.status === "success");
    newTests.push({
      name: "API Connection",
      status: allSuccess ? "success" : "error",
      message: allSuccess 
        ? "Google Photos API is working correctly!" 
        : "Some tests failed. Check the details above.",
    });

    setTests(newTests);
    setTesting(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="text-green-600" size={24} />;
      case "error":
        return <XCircle className="text-red-600" size={24} />;
      case "pending":
        return <Loader2 className="text-gray-400 animate-spin" size={24} />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-400";
      case "error":
        return "bg-red-50 border-red-400";
      case "pending":
        return "bg-gray-50 border-gray-400";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Google Photos API Test</h1>
        <p className="text-zinc-600">
          Test your Google Photos API integration to ensure everything is working correctly.
        </p>
      </div>

      {/* Run Tests Button */}
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={testing}
          className="px-6 py-3 bg-blue-400 border-2 border-black font-bold hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {testing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Running Tests...
            </>
          ) : (
            <>
              <RefreshCw size={20} />
              Run Tests
            </>
          )}
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {tests.map((test, index) => (
          <div
            key={index}
            className={`border-2 border-black p-4 ${getStatusColor(test.status)}`}
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">{getStatusIcon(test.status)}</div>
              <div className="flex-1">
                <h3 className="font-black text-lg mb-1">{test.name}</h3>
                {test.message && (
                  <p className="text-sm text-zinc-700 mb-2">{test.message}</p>
                )}
                {test.data && (
                  <details className="mt-2">
                    <summary className="text-xs font-bold cursor-pointer text-zinc-600 hover:text-black">
                      View Details
                    </summary>
                    <pre className="mt-2 p-3 bg-white border border-black text-xs overflow-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border-2 border-blue-400 p-4">
        <h3 className="font-black mb-2">Setup Instructions</h3>
        <ol className="text-sm space-y-2 list-decimal list-inside">
          <li>
            <strong>Enable Google Photos Library API</strong> in Google Cloud Console
          </li>
          <li>
            <strong>Set environment variables</strong> in .env.local and Vercel:
            <ul className="ml-6 mt-1 space-y-1 list-disc list-inside text-xs">
              <li>GOOGLE_PHOTOS_SERVICE_ACCOUNT_EMAIL</li>
              <li>GOOGLE_PHOTOS_PRIVATE_KEY</li>
            </ul>
          </li>
          <li>
            <strong>Create albums</strong> in Google Photos and share them publicly
          </li>
          <li>
            <strong>Run tests</strong> to verify everything is working
          </li>
        </ol>
      </div>

      {/* Quick Links */}
      <div className="mt-6 flex gap-3">
        <a
          href="https://console.cloud.google.com/apis/library/photoslibrary.googleapis.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all text-sm"
        >
          Enable API
        </a>
        <a
          href="https://photos.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all text-sm"
        >
          Google Photos
        </a>
        <a
          href="/admin/google-photos"
          className="px-4 py-2 bg-yellow-400 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all text-sm"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
