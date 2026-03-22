"use client";

import { useState, useEffect } from "react";
import { HardDrive, Search, RefreshCw, Folder, File, Image, Music, FileText, Video, Download, ExternalLink } from "lucide-react";
import { formatFileSize, getViewUrl, getDownloadUrl, isImage, isAudio, isPDF, isVideo } from "@/lib/google-drive-client";

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export default function GoogleDriveDashboard() {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "audio" | "pdf" | "video">("all");
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    audio: 0,
    pdfs: 0,
    videos: 0,
    totalSize: 0,
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [files]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media/google-drive/list');
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchFiles();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/media/google-drive/search?q=${encodeURIComponent(search)}`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error searching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const stats = {
      total: files.length,
      images: files.filter(f => isImage(f.mimeType)).length,
      audio: files.filter(f => isAudio(f.mimeType)).length,
      pdfs: files.filter(f => isPDF(f.mimeType)).length,
      videos: files.filter(f => isVideo(f.mimeType)).length,
      totalSize: files.reduce((sum, f) => sum + (f.size ? parseInt(f.size) : 0), 0),
    };
    setStats(stats);
  };

  const getFilteredFiles = () => {
    if (filterType === "all") return files;
    
    return files.filter(file => {
      switch (filterType) {
        case "image": return isImage(file.mimeType);
        case "audio": return isAudio(file.mimeType);
        case "pdf": return isPDF(file.mimeType);
        case "video": return isVideo(file.mimeType);
        default: return true;
      }
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (isImage(mimeType)) return <Image size={20} className="text-blue-600" />;
    if (isAudio(mimeType)) return <Music size={20} className="text-purple-600" />;
    if (isPDF(mimeType)) return <FileText size={20} className="text-red-600" />;
    if (isVideo(mimeType)) return <Video size={20} className="text-green-600" />;
    if (mimeType.includes('folder')) return <Folder size={20} className="text-yellow-600" />;
    return <File size={20} className="text-gray-600" />;
  };

  const filteredFiles = getFilteredFiles();

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HardDrive size={32} className="text-green-600" />
          <h1 className="text-3xl font-black">Google Drive Resources</h1>
        </div>
        <p className="text-zinc-600">Manage media files stored in Google Drive</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white border-2 border-black p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
          <p className="text-sm font-bold text-zinc-600 mb-1">Total Files</p>
          <p className="text-2xl font-black">{stats.total}</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-400 p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
          <p className="text-sm font-bold text-blue-900 mb-1">Images</p>
          <p className="text-2xl font-black text-blue-600">{stats.images}</p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-400 p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
          <p className="text-sm font-bold text-purple-900 mb-1">Audio</p>
          <p className="text-2xl font-black text-purple-600">{stats.audio}</p>
        </div>
        <div className="bg-red-50 border-2 border-red-400 p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
          <p className="text-sm font-bold text-red-900 mb-1">PDFs</p>
          <p className="text-2xl font-black text-red-600">{stats.pdfs}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-400 p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
          <p className="text-sm font-bold text-green-900 mb-1">Videos</p>
          <p className="text-2xl font-black text-green-600">{stats.videos}</p>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-400 p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
          <p className="text-sm font-bold text-yellow-900 mb-1">Total Size</p>
          <p className="text-2xl font-black text-yellow-600">{formatFileSize(stats.totalSize)}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-2 border-black p-4 mb-6" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input
                type="text"
                placeholder="Search files..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-400 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all"
            >
              Search
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="px-6 py-2 bg-green-400 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {[
            { type: "all", label: "All Files", color: "bg-white" },
            { type: "image", label: "Images", color: "bg-blue-100" },
            { type: "audio", label: "Audio", color: "bg-purple-100" },
            { type: "pdf", label: "PDFs", color: "bg-red-100" },
            { type: "video", label: "Videos", color: "bg-green-100" },
          ].map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2 border-2 border-black font-bold transition-all ${
                filterType === type ? `${color} shadow-[2px_2px_0_#000]` : 'bg-white hover:shadow-[2px_2px_0_#000]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white border-2 border-black" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-100 border-b-2 border-black">
              <tr>
                <th className="px-4 py-3 text-left font-black">Type</th>
                <th className="px-4 py-3 text-left font-black">Name</th>
                <th className="px-4 py-3 text-left font-black">Size</th>
                <th className="px-4 py-3 text-left font-black">Modified</th>
                <th className="px-4 py-3 text-right font-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent"></div>
                    <p className="mt-2 font-bold">Loading files...</p>
                  </td>
                </tr>
              ) : filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <p className="font-bold text-zinc-600">No files found</p>
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="border-b border-zinc-200 hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      {getFileIcon(file.mimeType)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {file.thumbnailLink && (
                          <img src={file.thumbnailLink} alt="" className="w-10 h-10 object-cover border border-black" />
                        )}
                        <span className="font-medium">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">
                      {file.size ? formatFileSize(file.size) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600">
                      {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={getViewUrl(file.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-100 border border-black hover:shadow-[2px_2px_0_#000] transition-all"
                          title="View"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <a
                          href={getDownloadUrl(file.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-100 border border-black hover:shadow-[2px_2px_0_#000] transition-all"
                          title="Download"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-400 p-4">
        <p className="text-sm font-bold text-blue-900 mb-2">📝 How to Add Files</p>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Upload files to your Google Drive folder</li>
          <li>Make sure folder is shared with: <code className="bg-blue-100 px-1">kwd-900@kwd2026.iam.gserviceaccount.com</code></li>
          <li>Click "Refresh" button above to see new files</li>
          <li>Use files in content creation by selecting "Drive" option</li>
        </ol>
      </div>
    </div>
  );
}
