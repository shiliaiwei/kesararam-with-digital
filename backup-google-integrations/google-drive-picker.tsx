"use client";

import { useState, useEffect } from "react";
import { Search, File, Image, Music, FileText, Video, Folder, X } from "lucide-react";
import { getViewUrl, formatFileSize } from "@/lib/google-drive-client";

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
}

interface GoogleDrivePickerProps {
  onSelect: (fileId: string, fileUrl: string, fileName: string) => void;
  onClose: () => void;
  fileType?: 'image' | 'audio' | 'pdf' | 'video' | 'all';
}

export function GoogleDrivePicker({ onSelect, onClose, fileType = 'all' }: GoogleDrivePickerProps) {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState<GoogleDriveFile | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchFiles();
  }, [currentFolderId]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const url = currentFolderId 
        ? `/api/media/google-drive/list?folderId=${currentFolderId}`
        : '/api/media/google-drive/list';
      
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setFiles(filterByType(data.files));
      } else {
        console.error('API Error:', data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
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
      setCurrentFolderId(null);
      setBreadcrumbs([]);
    } else {
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      setCurrentFolderId(newBreadcrumbs[index].id);
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
        setFiles(filterByType(data.files));
      }
    } catch (error) {
      console.error('Error searching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByType = (files: GoogleDriveFile[]) => {
    // Don't filter folders
    const folders = files.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
    const regularFiles = files.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');
    
    if (fileType === 'all') return [...folders, ...regularFiles];
    
    const filtered = regularFiles.filter(file => {
      switch (fileType) {
        case 'image':
          return file.mimeType.startsWith('image/');
        case 'audio':
          return file.mimeType.startsWith('audio/');
        case 'pdf':
          return file.mimeType === 'application/pdf';
        case 'video':
          return file.mimeType.startsWith('video/');
        default:
          return true;
      }
    });
    
    return [...folders, ...filtered];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image size={20} className="text-blue-600" />;
    if (mimeType.startsWith('audio/')) return <Music size={20} className="text-purple-600" />;
    if (mimeType === 'application/pdf') return <FileText size={20} className="text-red-600" />;
    if (mimeType.startsWith('video/')) return <Video size={20} className="text-green-600" />;
    if (mimeType.includes('folder')) return <Folder size={20} className="text-yellow-600" />;
    return <File size={20} className="text-gray-600" />;
  };

  const handleSelectFile = () => {
    if (selectedFile) {
      const url = getViewUrl(selectedFile.id);
      onSelect(selectedFile.id, url, selectedFile.name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white border-4 border-black w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ boxShadow: "8px 8px 0 #000" }}
      >
        {/* Header */}
        <div className="bg-yellow-400 border-b-4 border-black p-4 flex items-center justify-between">
          <h2 className="text-xl font-black">Select from Google Drive</h2>
          <button
            onClick={onClose}
            className="p-2 bg-white border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b-2 border-black">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <button
                onClick={() => handleBreadcrumbClick(-1)}
                className="text-sm px-2 py-1 bg-gray-100 border border-black hover:bg-yellow-100 font-bold"
              >
                Root
              </button>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  <span className="text-zinc-400">/</span>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="text-sm px-2 py-1 bg-gray-100 border border-black hover:bg-yellow-100 font-bold"
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
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
        </div>

        {/* Files Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 border-2 border-black animate-pulse" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-600 font-bold">No files found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {files.map((file) => {
                const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                
                return (
                  <button
                    key={file.id}
                    onClick={() => isFolder ? handleFolderClick(file) : setSelectedFile(file)}
                    className={`p-3 border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all text-left ${
                      selectedFile?.id === file.id ? 'bg-yellow-100 shadow-[2px_2px_0_#000]' : 'bg-white'
                    } ${isFolder ? 'bg-yellow-50' : ''}`}
                  >
                    <div className="aspect-square mb-2 bg-gray-100 border-2 border-black flex items-center justify-center overflow-hidden">
                      {file.mimeType.startsWith('image/') && file.thumbnailLink ? (
                        <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          {getFileIcon(file.mimeType)}
                          {isFolder && <p className="text-xs font-bold mt-2">Folder</p>}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold truncate">{file.name}</p>
                    {file.size && (
                      <p className="text-xs text-zinc-500">{formatFileSize(file.size)}</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-4 border-black p-4 bg-gray-50 flex gap-3">
          <button
            onClick={handleSelectFile}
            disabled={!selectedFile}
            className="flex-1 bg-green-400 border-2 border-black px-6 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select File
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border-2 border-black font-black hover:shadow-[4px_4px_0_#000] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
