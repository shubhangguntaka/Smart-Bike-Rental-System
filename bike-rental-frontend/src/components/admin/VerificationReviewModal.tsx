import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import {
  Check,
  X,
  RotateCcw,
  Mail,
  ShieldCheck,
  FileText,
  User,
  Bike as BikeIcon,
  AlertTriangle,
  History,
  Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/api/axios";
import type {
  AdminVerification,
  VerificationHistory
} from "@/types/adminVerification";
import {
  approveAdminVerification,
  rejectAdminVerification,
  requestAdminReupload,
  getAdminVerificationHistory,
  sendAdminVerificationEmail
} from "@/services/verificationService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  verification: AdminVerification | null;
  onUpdated: (updated: AdminVerification) => void;
}

export default function VerificationReviewModal({
  isOpen,
  onClose,
  verification,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<VerificationHistory[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Sub-modal state for Reject / Reupload / Email
  const [activeAction, setActiveAction] = useState<"REJECT" | "REUPLOAD" | "EMAIL" | null>(null);
  const [reasonInput, setReasonInput] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  useEffect(() => {
    if (verification && isOpen) {
      // Fetch audit history
      getAdminVerificationHistory(verification.id)
        .then(setHistory)
        .catch(() => setHistory([]));

      // Fetch authenticated document image blob
      setImageError(false);
      setImageUrl(null);
      api
        .get(`/admin/verifications/${verification.id}/image`, { responseType: "blob" })
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

      // Default email texts
      setEmailSubject(`Bike Rental Document Verification (${verification.documentType})`);
      setEmailMessage(`Dear ${verification.userName},\n\nRegarding your submitted ${verification.documentType} document:\n\nThank you for choosing Smart Bike Rental System.`);
      setReasonInput("");
      setActiveAction(null);
    }
  }, [verification, isOpen]);

  if (!verification) return null;

  const handleApprove = async () => {
    try {
      setLoading(true);
      const res = await approveAdminVerification(verification.id);
      toast.success(`Verification for ${verification.userName} approved successfully.`);
      onUpdated(res);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!reasonInput.trim()) {
      toast.error("Rejection reason is mandatory.");
      return;
    }
    try {
      setLoading(true);
      const res = await rejectAdminVerification(verification.id, reasonInput.trim());
      toast.success(`Verification for ${verification.userName} rejected.`);
      onUpdated(res);
      setActiveAction(null);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleReuploadSubmit = async () => {
    if (!reasonInput.trim()) {
      toast.error("Re-upload reason is mandatory.");
      return;
    }
    try {
      setLoading(true);
      const res = await requestAdminReupload(verification.id, reasonInput.trim());
      toast.success(`Re-upload request sent to ${verification.userName}.`);
      onUpdated(res);
      setActiveAction(null);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to request re-upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!emailMessage.trim()) {
      toast.error("Email message cannot be empty.");
      return;
    }
    try {
      setLoading(true);
      await sendAdminVerificationEmail(verification.id, emailSubject.trim(), emailMessage.trim());
      toast.success(`Email sent to registered address (${verification.userEmail}).`);
      setActiveAction(null);
      // Refresh history log
      const updatedHistory = await getAdminVerificationHistory(verification.id);
      setHistory(updatedHistory);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !loading && onClose()} size="xl">
      <ModalHeader onClose={() => !loading && onClose()}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>Document Compliance Review</span>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          {/* User Profile Header Card */}
          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  {verification.userName}
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {verification.userRole}
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground font-mono">{verification.userEmail}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-right">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Document Type</span>
              <span className="text-xs font-bold text-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
                {verification.documentType === "RC" ? "Registration Certificate (RC)" : verification.documentType}
              </span>
            </div>
          </div>

          {/* Bike Info Banner (If RC) */}
          {verification.documentType === "RC" && (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                <BikeIcon className="h-4 w-4" />
                <span>Associated Bike & Registration Details</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Bike Model</span>
                  <span className="font-bold text-foreground">{verification.bikeName || verification.bikeModel || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Brand</span>
                  <span className="font-bold text-foreground">{verification.bikeBrand || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block font-semibold">RC Registration No.</span>
                  <span className="font-mono font-extrabold text-primary">{verification.documentNumber || verification.registrationNumber || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Document Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Actual Uploaded Image Container */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-primary" />
                <span>Actual Uploaded Document Image</span>
              </span>

              <div className="rounded-2xl border border-border bg-black/40 overflow-hidden min-h-[220px] max-h-[300px] flex items-center justify-center relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Uploaded Document"
                    className="max-h-[290px] w-auto object-contain rounded-xl shadow-md transition-transform hover:scale-105"
                  />
                ) : imageError ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-destructive text-xs space-y-1">
                    <AlertTriangle className="h-8 w-8 mb-1" />
                    <span className="font-bold">Image file not available</span>
                    <span className="text-[10px] text-muted-foreground">Document file path may not exist on disk</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-xs">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
                    <span>Loading Document Image...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Metadata & Results */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
                  System Verification Metadata
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Document Number:</span>
                    <span className="font-mono font-bold text-foreground">{verification.documentNumber || "N/A"}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Automatic Verification:</span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase ${verification.automaticStatus === "VERIFIED"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                      }`}>
                      {verification.automaticStatus}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Admin Review Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase ${verification.adminStatus === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : verification.adminStatus === "REJECTED"
                          ? "bg-destructive/10 text-destructive"
                          : verification.adminStatus === "REUPLOAD_REQUIRED"
                            ? "bg-orange-500/10 text-orange-500"
                            : "bg-amber-500/10 text-amber-500"
                      }`}>
                      {verification.adminStatus}
                    </span>
                  </div>

                  {verification.adminReason && (
                    <div className="mt-2 p-2.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-xs">
                      <span className="font-bold block text-[10px] uppercase">Admin Reason:</span>
                      <span>{verification.adminReason}</span>
                    </div>
                  )}

                  {verification.uploadedAt && (
                    <div className="flex justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Upload Date:</span>
                      <span>{new Date(verification.uploadedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* OCR & QR Information */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-2 text-xs">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-1.5 flex items-center justify-between">
                  <span>OCR & QR Extraction</span>
                  <FileText className="h-4 w-4 text-primary" />
                </h4>
                {verification.qrInfo && (
                  <p className="text-muted-foreground"><strong className="text-foreground">QR Source/Info:</strong> {verification.qrInfo}</p>
                )}
                {verification.ocrText ? (
                  <div className="bg-muted/50 p-2.5 rounded-xl max-h-24 overflow-y-auto font-mono text-[11px] text-muted-foreground">
                    {verification.ocrText}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-[11px]">No raw OCR text available</p>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Action Inputs (Reject / Reupload / Email) */}
          {activeAction === "REJECT" && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
              <h4 className="text-xs font-bold text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Specify Mandatory Rejection Reason</span>
              </h4>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="Example: RC registration number does not match the bike details."
                className="w-full h-20 text-xs rounded-xl border border-border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-destructive"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading || !reasonInput.trim()}
                  onClick={handleRejectSubmit}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {activeAction === "REUPLOAD" && (
            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4 space-y-3">
              <h4 className="text-xs font-bold text-orange-600 flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4" />
                <span>Specify Re-upload Requirement Reason</span>
              </h4>
              <textarea
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value)}
                placeholder="Example: RC image is unclear. Please upload a clear image."
                className="w-full h-20 text-xs rounded-xl border border-border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading || !reasonInput.trim()}
                  onClick={handleReuploadSubmit}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-orange-600 text-white hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  Request Re-upload
                </button>
              </div>
            </div>
          )}

          {activeAction === "EMAIL" && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                <span>Send Direct Email to Registered User</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">To (Registered Email)</label>
                  <input
                    type="text"
                    readOnly
                    value={verification.userEmail}
                    className="w-full rounded-xl border border-border bg-muted/60 p-2.5 font-mono text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Message</label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    className="w-full h-24 rounded-xl border border-border bg-background p-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading || !emailMessage.trim()}
                  onClick={handleEmailSubmit}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  Send Email Now
                </button>
              </div>
            </div>
          )}

          {/* Persistent Verification History Section */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
              <History className="h-4 w-4 text-primary" />
              <span>Verification Audit History</span>
            </h4>

            {history && history.length > 0 ? (
              <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                {history.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col sm:flex-row justify-between sm:items-center text-xs p-2.5 rounded-xl bg-muted/40 border border-border/60 gap-1.5"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{log.performedBy}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${log.action === "APPROVED" ? "bg-emerald-500/10 text-emerald-500" :
                            log.action === "REJECTED" ? "bg-destructive/10 text-destructive" :
                              log.action === "REUPLOAD_REQUIRED" ? "bg-orange-500/10 text-orange-500" :
                                "bg-primary/10 text-primary"
                          }`}>
                          {log.action}
                        </span>
                      </div>
                      {log.reason && (
                        <p className="text-muted-foreground text-[11px]">{log.reason}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                      {new Date(log.performedAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No audit history recorded yet.</p>
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setActiveAction("EMAIL")}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="h-4 w-4" />
            <span>Send Email</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setActiveAction("REUPLOAD")}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Request Re-upload</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setActiveAction("REJECT")}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              <span>Reject</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleApprove}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>Accept & Approve</span>
            </button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}
