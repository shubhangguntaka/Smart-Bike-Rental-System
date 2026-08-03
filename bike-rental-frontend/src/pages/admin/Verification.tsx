import React, { useState } from "react";
import { SearchBar } from "@/components/common/SearchBar";
import { Pagination } from "@/components/common/Pagination";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { ShieldCheck, ShieldAlert, FileText, Eye, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const MOCK_VERIFICATIONS = [
  { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", role: "CUSTOMER", docType: "Driving License", docNumber: "DL-908231A", status: "Pending" },
  { id: 2, name: "Amit Kumar", email: "amit.kumar@yahoo.com", role: "OWNER", docType: "Aadhaar Card", docNumber: "1283-9081-3112", status: "Pending" },
];

export default function AdminVerification() {
  const [verifications, setVerifications] = useState(MOCK_VERIFICATIONS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeItem, setActiveItem] = useState<typeof MOCK_VERIFICATIONS[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filtered = verifications.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.docNumber.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * 5, page * 5);

  const handleOpenModal = (item: typeof MOCK_VERIFICATIONS[0]) => {
    setActiveItem(item);
    setModalOpen(true);
  };

  const handleAction = async (approved: boolean) => {
    if (!activeItem) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setVerifications(verifications.filter((v) => v.id !== activeItem.id));
    toast.success(`KYC document for ${activeItem.name} has been ${approved ? "Approved" : "Rejected"}.`);
    setLoading(false);
    setModalOpen(false);
    setActiveItem(null);
  };

  return (
    <div className="space-y-6 bg-background text-foreground min-h-screen">
      {/* Title */}
      <div className="bg-card border border-border p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-foreground">KYC Verification Gate</h2>
        <p className="text-xs text-muted-foreground mt-1">Verify submitted driving licenses, Aadhaar cards, and business identities.</p>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search pending verifications by name, ID..."
          width="max-w-md w-full"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginated.length > 0 ? (
          paginated.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-card shadow-xs hover:shadow-sm transition-all duration-200"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {item.role}
                  </span>
                  <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md">
                    {item.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground">{item.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>{item.docType}: {item.docNumber}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenModal(item)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Eye className="h-4 w-4" />
                <span>Review KYC Docs</span>
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card text-muted-foreground text-sm">
            All KYC document verifications are complete. No pending items.
          </div>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 5 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(filtered.length / 5)}
          onPageChange={setPage}
          showJumpToPage={false}
        />
      )}

      {/* KYC Document Verification Review Modal */}
      <Modal isOpen={modalOpen} onClose={() => !loading && setModalOpen(false)} size="md">
        <ModalHeader onClose={() => !loading && setModalOpen(false)}>KYC Document Review</ModalHeader>
        <ModalBody>
          {activeItem && (
            <div className="space-y-4">
              <div className="border-b border-border pb-3">
                <h4 className="font-bold text-sm text-foreground">{activeItem.name}</h4>
                <p className="text-xs text-muted-foreground font-mono">{activeItem.email}</p>
              </div>

              <div className="space-y-3.5">
                <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">Document Type</span>
                    <span className="text-foreground font-bold">{activeItem.docType}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-muted-foreground">Document Identifier ID</span>
                    <span className="text-foreground font-bold font-mono">{activeItem.docNumber}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border border-dashed h-40 bg-muted/20 flex flex-col items-center justify-center text-center p-4">
                  <FileText className="h-10 w-10 text-muted-foreground/60 mb-2" />
                  <span className="text-xs font-semibold text-foreground">KYC_DOCUMENT_IMAGE.PDF</span>
                  <span className="text-[10px] text-muted-foreground mt-1">Uploaded securely via encrypted cloud storage</span>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction(false)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl border border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            <span>Reject KYC</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction(true)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span>{loading ? "Processing..." : "Approve & Verify"}</span>
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
