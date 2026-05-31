"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Volume2, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import { TrafficSignForm } from "./traffic-sign-form";

interface TrafficSign {
  id: number;
  titleEn: string;
  titleKm: string;
  descriptionEn: string;
  descriptionKm: string;
  imageUrl: string;
  audioUrlEn?: string | null;
  audioUrlKm?: string | null;
  signType: string;
  category?: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: number | null;
}

interface SignWithCreator {
  sign: TrafficSign;
  creator: {
    id: number;
    username: string;
    displayName: string | null;
  } | null;
}

export function TrafficSignsContent() {
  const [data, setData] = useState<SignWithCreator[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingSign, setEditingSign] = useState<TrafficSign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSigns();
  }, []);

  const fetchSigns = async () => {
    try {
      const response = await fetch("/api/admin/traffic-signs");
      const result = await response.json();
      setData(result.signs || []);
    } catch (error) {
      console.error("Error fetching signs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSigns = data.filter((item) => {
    const sign = item.sign;
    const matchesSearch =
      sign.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sign.titleKm.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || sign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveSign = async (signData: Partial<TrafficSign>) => {
    try {
      if (editingSign?.id) {
        // Update existing
        await fetch(`/api/admin/traffic-signs/${editingSign.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signData),
        });
      } else {
        // Create new
        await fetch("/api/admin/traffic-signs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signData),
        });
      }
      
      fetchSigns();
      setShowForm(false);
      setEditingSign(null);
    } catch (error) {
      console.error("Error saving sign:", error);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Approve this traffic sign?")) return;
    
    try {
      await fetch(`/api/admin/traffic-signs/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments: "Approved" }),
      });
      fetchSigns();
    } catch (error) {
      console.error("Error approving sign:", error);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    
    try {
      await fetch(`/api/admin/traffic-signs/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      fetchSigns();
    } catch (error) {
      console.error("Error rejecting sign:", error);
    }
  };

  const handleDeleteSign = async (id: number) => {
    if (!confirm("Are you sure you want to delete this traffic sign?")) return;
    
    try {
      await fetch(`/api/admin/traffic-signs/${id}`, {
        method: "DELETE",
      });
      fetchSigns();
    } catch (error) {
      console.error("Error deleting sign:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-400",
      approved: "bg-green-400",
      rejected: "bg-red-400",
      inactive: "bg-gray-400",
    };
    return styles[status as keyof typeof styles] || "bg-gray-400";
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-black">Traffic Signs Management</h1>
          <p className="text-sm text-zinc-600">Manage traffic signs with approval workflow</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100"
        >
          <Plus size={16} />
          Add New Sign
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search signs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_#000]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border-2 border-black font-medium text-sm focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <div className="text-sm text-zinc-600">
          {filteredSigns.length} of {data.length} signs
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSigns.map(({ sign, creator }) => (
          <div
            key={sign.id}
            className="bg-white border-2 border-black shadow-[4px_4px_0_#000] overflow-hidden"
          >
            {/* Image */}
            <div className="h-48 bg-yellow-400 border-b-2 border-black relative">
              {sign.imageUrl ? (
                <Image
                  src={sign.imageUrl}
                  alt={sign.titleEn}
                  fill
                  className="object-contain p-4"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-black font-bold">
                  No Image
                </div>
              )}
              <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold border border-black ${getStatusBadge(sign.status)}`}>
                {sign.status}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-black text-lg text-black">{sign.titleEn}</h3>
                <p className="text-sm text-zinc-600" style={{ fontFamily: "Siemreap, sans-serif" }}>
                  {sign.titleKm}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-zinc-700 line-clamp-2">
                  {sign.descriptionEn}
                </p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="px-2 py-1 bg-gray-100 border border-black">
                  {sign.signType}
                </span>
                {creator && (
                  <span>by {creator.displayName || creator.username}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-black flex-wrap">
                {sign.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(sign.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-green-400 border border-black text-xs font-bold hover:bg-green-300"
                    >
                      <CheckCircle size={12} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(sign.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-red-400 border border-black text-xs font-bold hover:bg-red-300"
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setEditingSign(sign)}
                  className="flex items-center gap-1 px-2 py-1 bg-yellow-400 border border-black text-xs font-bold hover:bg-yellow-300"
                >
                  <Edit size={12} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteSign(sign.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-red-400 border border-black text-xs font-bold hover:bg-red-300"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSigns.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-400 border-2 border-black mx-auto mb-4 flex items-center justify-center">
            <Plus size={24} className="text-black" />
          </div>
          <h3 className="text-lg font-black text-black mb-2">No traffic signs found</h3>
          <p className="text-sm text-zinc-600 mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Start by adding your first traffic sign"}
          </p>
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingSign) && (
        <TrafficSignForm
          sign={editingSign}
          onClose={() => {
            setShowForm(false);
            setEditingSign(null);
          }}
          onSave={handleSaveSign}
        />
      )}
    </div>
  );
}
