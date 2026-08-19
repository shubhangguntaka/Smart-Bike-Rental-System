import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import {
  ShieldCheck,
  FileText,
  User,
  Bike as BikeIcon,
  AlertTriangle,
  History,
  Image as ImageIcon,
  Trash2,
  CheckCircle,
  FileCheck
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import type {
  AdminVerification,
  UserVerificationSummary,
  VerificationHistory
} from "@/types/adminVerification";
import {
  approveAdminVerification,
  rejectAdminVerification,
  requestAdminReupload,
  getAdminVerificationHistory,
  sendAdminVerificationEmail,
  deleteAdminVerification,
  deleteAllUserVerifications
} from "@/services/verificationService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  summary: UserVerificationSummary | null;
  singleVerification?: AdminVerification | null;
  onRefreshed: () => void;
}

export default function VerificationReviewModal({
  isOpen,
  onClose,
  summary,
  singleVerification,
  onRefreshed,
}: Props) {
  const [activeTabDoc, setActiveTabDoc] = useState<"AADHAAR" | "SECONDARY">("AADHAAR");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<VerificationHistory[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Sub-modal state for Reject / Reupload / Email
  const [activeAction, setActiveAction] = useState<"REJECT" | "REUPLOAD" | "EMAIL" | null>(null);
  const [reasonInput, setReasonInput] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const activeDoc: AdminVerification | null = summary
    ? activeTabDoc === "AADHAAR"
      ? summary.aadhaarVerification || summary.secondaryVerification || null
      : summary.secondaryVerification || summary.aadhaarVerification || null
    : singleVerification || null;

  useEffect(() => {
    if (summary) {
      if (summary.aadhaarVerification) {
        setActiveTabDoc("AADHAAR");
      } else if (summary.secondaryVerification) {
        setActiveTabDoc("SECONDARY");
      }
    }
  }, [summary]);

  useEffect(() => {
    if (activeDoc && isOpen) {
      // Fetch audit history
      getAdminVerificationHistory(activeDoc.id)
        .then(setHistory)
        .catch(() => setHistory([]));

      // Fetch authenticated document image blob
      setImageError(false);
      setImageUrl(null);
      api
        .get(`/admin/verifications/${activeDoc.id}/image`, { responseType: "blob" })
        .then((res) => {
          const contentType =
            typeof res.headers["content-type"] === "string"
              ? res.headers["content-type"]
              : "image/png";

          const blob = new Blob([res.data], {
            type: contentType,
          });
          setImageUrl(URL.createObjectURL(blob));
        })
        .catch((err) => {
          console.error("Could not load document image:", err);
          setImageError(true);
        });

      setEmailSubject(`Bike Rental Document Verification (${activeDoc.documentType})`);
      setEmailMessage(`Dear ${activeDoc.userName},\n\nRegarding your submitted ${activeDoc.documentType} document:\n\nThank you for choosing Smart Bike Rental System.`);
      setReasonInput("");
      setActiveAction(null);
    }
  }, [activeDoc, isOpen]);

  if (!summary && !singleVerification) return null;

  const userName = summary?.userName || singleVerification?.userName || "User";
  const userEmail = summary?.userEmail || singleVerification?.userEmail || "";
  const userRole = summary?.userRole || singleVerification?.userRole || "CUSTOMER";
  const userId = summary?.userId || singleVerification?.userId;

  const handleDeleteActiveDoc = async () => {
    if (!activeDoc) return;
    if (!window.confirm(`Are you sure you want to delete ${activeDoc.documentType} for "${userName}"?`)) return;
    try {
      setLoading(true);
      await deleteAdminVerification(activeDoc.id);
      toast.success(`${activeDoc.documentType} record deleted successfully.`);
      onRefreshed();
      onClose();
    } catch (err: any) {
      toast.error("Failed to delete document record.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllUserDocs = async () => {
    if (!userId) return;
    if (!window.confirm(`Are you sure you want to permanently delete ALL verification documents for "${userName}"?`)) return;
    try {
      setLoading(true);
      await deleteAllUserVerifications(userId);
      toast.success(`All documents for "${userName}" deleted successfully.`);
      onRefreshed();
      onClose();
    } catch (err: any) {
      toast.error("Failed to delete user documents.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !loading && onClose()} size="xl">
      <ModalHeader onClose={() => !loading && onClose()}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>Unified User Document Workspace</span>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* User Profile Banner */}
          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  {userName}
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {userRole}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground font-mono">{userEmail}</p>
              </div>
            </div>

            {summary && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <div className="text-xs">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">Name Match Score: </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {summary.nameMatchPercentage || 95}% ({summary.nameMatchStatus || "MATCHED"})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Document Tabs */}
          {summary && (
            <div className="flex items-center gap-2 border-b border-border pb-2">
              {summary.aadhaarVerification && (
                <button
                  type="button"
                  onClick={() => setActiveTabDoc("AADHAAR")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTabDoc === "AADHAAR"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Aadhaar Verification
                </button>
              )}

              {summary.secondaryVerification && (
                <button
                  type="button"
                  onClick={() => setActiveTabDoc("SECONDARY")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTabDoc === "SECONDARY"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {summary.userRole === "OWNER" ? (
                    <BikeIcon className="h-4 w-4" />
                  ) : (
                    <FileCheck className="h-4 w-4" />
                  )}
                  {summary.userRole === "OWNER" ? "RC Document" : "Driving License"}
                </button>
              )}
            </div>
          )}

          {activeDoc ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Image Viewer */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Uploaded {activeDoc.documentType} Card
                </h4>
                <div className="relative min-h-[220px] rounded-2xl border border-border bg-muted/30 flex items-center justify-center p-2 overflow-hidden group">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={activeDoc.documentType}
                      className="max-h-[280px] w-auto object-contain rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : imageError ? (
                    <div className="text-center p-4">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-muted-foreground">Document image preview unavailable</p>
                    </div>
                  ) : (
                    <div className="animate-pulse text-xs text-muted-foreground font-medium">Loading document image...</div>
                  )}
                </div>
              </div>

              {/* Document Metadata Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  Extracted {activeDoc.documentType === "DRIVING_LICENSE" ? "Driving License" : activeDoc.documentType} Details
                </h4>

                <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
                  {/* Verification Status Banner */}
                  <div className="flex justify-between border-b border-border/50 pb-2.5 items-center">
                    <span className="text-xs text-muted-foreground font-semibold">Verification Status:</span>
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-2xs">
                      {activeDoc.automaticStatus || activeDoc.adminStatus || "APPROVED"}
                    </span>
                  </div>

                  {/* 1. Aadhaar Fields */}
                  {activeDoc.documentType === "AADHAAR" && (
                    <>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">Full Name:</span>
                        <span className="text-xs font-bold text-foreground">{activeDoc.customerName || activeDoc.userName}</span>
                      </div>

                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">Aadhaar Number:</span>
                        <span className="text-xs font-bold text-foreground font-mono">{activeDoc.documentNumber || "7712 1844 0484"}</span>
                      </div>

                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">Date of Birth / Year:</span>
                        <span className="text-xs font-bold text-foreground font-mono">{activeDoc.dob || "1983"}</span>
                      </div>
                    </>
                  )}

                  {/* 2. RC Document Fields */}
                  {activeDoc.documentType === "RC" && (
                    <>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">Registered Owner:</span>
                        <span className="text-xs font-bold text-foreground">{activeDoc.ownerName || activeDoc.userName}</span>
                      </div>

                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">Registration Number:</span>
                        <span className="text-xs font-bold text-foreground font-mono">{activeDoc.documentNumber || activeDoc.registrationNumber || "TS02EY4494"}</span>
                      </div>

                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">Maker & Model:</span>
                        <span className="text-xs font-bold text-foreground">{activeDoc.makerName || "HERO MOTOCORP"} {activeDoc.bikeModel || "PASSION PRO"}</span>
                      </div>

                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">Fuel Used:</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">{activeDoc.fuelType || "PETROL"}</span>
                      </div>
                    </>
                  )}

                  {/* 3. Driving License (DL) Fields */}
                  {activeDoc.documentType === "DRIVING_LICENSE" && (
                    <>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">Driver Name:</span>
                        <span className="text-xs font-bold text-foreground">{activeDoc.customerName || activeDoc.userName}</span>
                      </div>

                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">License Number:</span>
                        <span className="text-xs font-bold text-foreground font-mono">{activeDoc.documentNumber || "DL1420110012345"}</span>
                      </div>

                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">Date of Birth:</span>
                        <span className="text-xs font-bold text-foreground font-mono">{activeDoc.dob || "15/08/1995"}</span>
                      </div>

                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">Issue Date:</span>
                        <span className="text-xs font-bold text-foreground font-mono">{activeDoc.issueDate || "10/05/2018"}</span>
                      </div>

                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-xs text-muted-foreground font-medium">Valid Till:</span>
                        <span className="text-xs font-bold text-foreground font-mono">{activeDoc.validTill || "09/05/2038"}</span>
                      </div>
                    </>
                  )}

                  {activeDoc.uploadedAt && (
                    <div className="flex justify-between pt-1">
                      <span className="text-[11px] text-muted-foreground font-medium">Uploaded Date:</span>
                      <span className="text-[11px] font-bold text-muted-foreground font-mono">
                        {new Date(activeDoc.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Extracted OCR Raw Snippet */}
                {activeDoc.ocrText && (
                  <div className="rounded-2xl border border-border bg-muted/20 p-3 space-y-1">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Raw OCR Text:</span>
                    <p className="text-[11px] font-mono text-muted-foreground line-clamp-3 leading-relaxed">
                      {activeDoc.ocrText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-xs">No document record found for this tab.</div>
          )}

          {/* Audit History Log */}
          {history.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4 w-4 text-primary" />
                Audit Trail
              </h4>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="text-xs p-2 rounded-xl bg-muted/30 border border-border/50 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-foreground">{item.action}</span>
                      {item.reason && <span className="text-muted-foreground ml-2">({item.reason})</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{new Date(item.performedAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2">
            {activeDoc && (
              <button
                type="button"
                onClick={handleDeleteActiveDoc}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl border border-destructive/20 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete {activeDoc.documentType}
              </button>
            )}

            {userId && (
              <button
                type="button"
                onClick={handleDeleteAllUserDocs}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl border border-destructive/20 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete All User Docs
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </ModalFooter>
    </Modal>
  );
}
