"use client";

import { useState, useEffect } from "react";
import { HardDrive, Search, RefreshCw, Folder, File, Image, Music, FileText, Video, ChevronRight, Home, Copy, X, Play } from "lucide-react";
import { formatFileSize, getViewUrl, isImage, isAudio, isPDF, isVideo, getEmbedUrl } from "@/lib/google-drive-client";

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

interface BreadcrumbItem {
  id: string;
  name: string;
}

export default function StaffGoogleDriveDashboard() {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [filterType, setFilterType] = useState<"all" | "image" | "audio" | "pdf" | "video">("all");
  const [previewFile, setPreviewFile] = useState<GoogleDriveFile | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    audio: 0,
    pdfs: 0,
    videos: 0,
    totalSize: 0,
  });

  useEffect(() => {
    fetchFiles(currentFolderId);
  }, [currentFolderId]);

  useEffect(() => {
    calculateStats();
  }, [files]);

  const fetchFiles = async (folderId: string | null) => {
    setLoading(true);
    try {
      const url = folderId 
        ? `/api/media/google-drive/list?folderId=${folderId}`
        : '/api/media/google-drive/list';
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      } else {
        console.error('API Error:', data);
        alert(`Error: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      alert('Failed to connect to Google Drive API');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder: GoogleDriveFile) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Go to root
      setCurrentFolderId(null);
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolderId(newBreadcrumbs[index].id);
    }
  };

  const handleCopyLink = (file: GoogleDriveFile) => {
    const url = getViewUrl(file.id);
    navigator.clipboard.writeText(url);
    setCopySuccess(file.id + 'view');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handlePreview = (file: GoogleDriveFile) => {
    setPreviewFile(file);
  };

  const handleUseFile = (file: GoogleDriveFile) => {
    setSelectedFile(file);
    // Copy the view URL to clipboard
    navigator.clipboard.writeText(getViewUrl(file.id));
    setCopySuccess(file.id + 'use');
    setTimeout(() => setCopySuccess(null), 3000);
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchFiles(currentFolderId);
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
  const folders = filteredFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
  const regularFiles = filteredFiles.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');

  return (
    <>
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HardDrive size={32} className="text-green-600" />
          <h1 className="text-3xl font-black">Google Drive Resources</h1>
        </div>
        <p className="text-zinc-600">Browse and manage media files by category</p>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white border-2 border-black p-3 mb-6" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 border border-black hover:bg-yellow-100 transition-all font-bold text-sm"
          >
            <Home size={14} />
            All Categories
          </button>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id} className="flex items-center gap-2">
              <ChevronRight size={16} className="text-zinc-400" />
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className="px-3 py-1 bg-gray-100 border border-black hover:bg-yellow-100 transition-all font-bold text-sm"
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Folder Grid View - Show at root level */}
      {!currentFolderId && folders.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
            <Folder className="text-yellow-600" size={32} />
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleFolderClick(folder)}
                className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-black p-6 hover:shadow-[6px_6px_0_#000] transition-all text-left group"
              >
                <Folder size={56} className="text-yellow-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-black text-xl mb-1">{folder.name}</h3>
                <p className="text-sm text-zinc-600">Click to browse files</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats and Table View - Show when inside a folder */}
      {currentFolderId && (
        <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white border-2 border-black p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
          <p className="text-sm font-bold text-zinc-600 mb-1">Total Items</p>
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
            onClick={() => fetchFiles(currentFolderId)}
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
                <>
                  {/* Folders First */}
                  {folders.map((folder) => (
                    <tr 
                      key={folder.id} 
                      className="border-b border-zinc-200 hover:bg-yellow-50 cursor-pointer"
                      onClick={() => handleFolderClick(folder)}
                    >
                      <td className="px-4 py-3">
                        <Folder size={20} className="text-yellow-600" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{folder.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-zinc-400">
                        Folder
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600">
                        {folder.modifiedTime ? new Date(folder.modifiedTime).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFolderClick(folder);
                            }}
                            className="p-2 bg-yellow-100 border border-black hover:shadow-[2px_2px_0_#000] transition-all"
                            title="Open Folder"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Files */}
                  {regularFiles.map((file) => (
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
                          <button
                            onClick={() => handlePreview(file)}
                            className="p-2 bg-purple-100 border border-black hover:shadow-[2px_2px_0_#000] transition-all"
                            title="Preview"
                          >
                            <Play size={16} />
                          </button>
                          <button
                            onClick={() => handleCopyLink(file)}
                            className={`p-2 border border-black hover:shadow-[2px_2px_0_#000] transition-all ${
                              copySuccess === file.id + 'view' ? 'bg-green-200' : 'bg-yellow-100'
                            }`}
                            title="Copy Link"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => handleUseFile(file)}
                            className={`px-3 py-2 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all text-sm ${
                              copySuccess === file.id + 'use' ? 'bg-green-200' : 'bg-blue-100'
                            }`}
                            title="Use in Form"
                          >
                            {copySuccess === file.id + 'use' ? '✓ Copied' : 'Use'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-400 p-4">
        <p className="text-sm font-bold text-blue-900 mb-2">📝 How to Use</p>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click on folders to browse their contents</li>
          <li>Use breadcrumb navigation to go back</li>
          <li>Click <strong>Preview</strong> to view/play files</li>
          <li>Click <strong>Copy</strong> to copy the file link</li>
          <li>Click <strong>Use</strong> to copy link and paste in content forms</li>
        </ol>
      </div>

      {/* Selected File Notice */}
      {selectedFile && (
        <div className="mt-4 bg-green-50 border-2 border-green-400 p-4">
          <p className="text-sm font-bold text-green-900 mb-2">✓ File Ready to Use</p>
          <div className="flex items-center gap-3">
            {getFileIcon(selectedFile.mimeType)}
            <div className="flex-1">
              <p className="font-bold text-green-900">{selectedFile.name}</p>
              <p className="text-xs text-green-700">Link copied! Paste it in your content form.</p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 bg-white border border-green-600 hover:bg-green-100 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Preview Modal */}
    {previewFile && (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
        <div className="bg-white border-4 border-black max-w-5xl w-full max-h-[90vh] overflow-auto" style={{ boxShadow: "8px 8px 0 #000" }} onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="bg-zinc-100 border-b-2 border-black p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {getFileIcon(previewFile.mimeType)}
              <div>
                <h3 className="font-black text-lg">{previewFile.name}</h3>
                <p className="text-sm text-zinc-600">
                  {previewFile.size && formatFileSize(previewFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPreviewFile(null)}
              className="p-2 bg-red-400 border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Preview Area */}
            <div className="mb-6 bg-zinc-50 border-2 border-black p-4 min-h-[400px] flex items-center justify-center">
              {isImage(previewFile.mimeType) && (
                <img 
                  src={getViewUrl(previewFile.id)} 
                  alt={previewFile.name}
                  className="max-w-full max-h-[600px] object-contain border-2 border-black"
                />
              )}
              
              {isAudio(previewFile.mimeType) && (
                <div className="w-full max-w-2xl">
                  <div className="mb-4 text-center">
                    <Music size={64} className="mx-auto text-purple-600 mb-2" />
                    <p className="font-bold">{previewFile.name}</p>
                  </div>
                  <audio 
                    controls 
                    className="w-full"
                    src={`https://drive.google.com/uc?export=download&id=${previewFile.id}`}
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}
              
              {isVideo(previewFile.mimeType) && (
                <video 
                  controls 
                  className="max-w-full max-h-[600px] border-2 border-black"
                  src={`https://drive.google.com/uc?export=download&id=${previewFile.id}`}
                >
                  Your browser does not support video playback.
                </video>
              )}
              
              {isPDF(previewFile.mimeType) && (
                <iframe
                  src={getEmbedUrl(previewFile.id)}
                  className="w-full h-[600px] border-2 border-black"
                  title={previewFile.name}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => handleCopyLink(previewFile)}
                className={`p-3 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all flex items-center justify-center gap-2 ${
                  copySuccess === previewFile.id + 'view' ? 'bg-green-200' : 'bg-blue-100'
                }`}
              >
                <Copy size={18} />
                {copySuccess === previewFile.id + 'view' ? 'Copied!' : 'Copy Link'}
              </button>
              
              <button
                onClick={() => {
                  handleUseFile(previewFile);
                  setPreviewFile(null);
                }}
                className={`p-3 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all flex items-center justify-center gap-2 ${
                  copySuccess === previewFile.id + 'use' ? 'bg-green-200' : 'bg-yellow-100'
                }`}
              >
                <Copy size={18} />
                {copySuccess === previewFile.id + 'use' ? 'Ready to Use!' : 'Use in Form'}
              </button>
            </div>

            {/* Link Display */}
            <div className="mt-4">
              <div className="bg-zinc-50 border-2 border-black p-3">
                <p className="text-xs font-bold text-zinc-600 mb-1">File URL:</p>
                <code className="text-xs break-all">{getViewUrl(previewFile.id)}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
