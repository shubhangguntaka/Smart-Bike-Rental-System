import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, ImageUp, RefreshCw } from "lucide-react";

interface Props {
  onFileSelect: (file: File) => void;
  title: string;
  subtitle?: string;
  preview?: string | null;
  disabled?: boolean;
}

const UploadBox = ({ onFileSelect, title, subtitle, preview, disabled }: Props) => {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFileSelect(accepted[0]);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    multiple: false,
    accept: { "image/png": [], "image/jpeg": [], "image/jpg": [] },
  });

  if (preview) {
    // Already have a document loaded - offer a compact "replace" affordance
    // instead of the full drop target, so the scanner/preview stays in focus.
    return (
      <div
        {...getRootProps()}
        className="group flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-bureau/30 bg-white/60 px-4 py-2.5 text-sm font-medium text-bureau transition hover:border-bureau/60 hover:bg-white"
      >
        <input {...getInputProps()} />
        <RefreshCw size={15} className="transition group-hover:rotate-180" />
        Replace document
      </div>
    );
  }

  return (
    <label
      {...getRootProps()}
      className={`paper-grain relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed px-8 py-14 text-center transition-colors ${
        isDragActive
          ? "border-brass bg-brass/10"
          : "border-bureau/25 bg-white/70 hover:border-bureau/45 hover:bg-white"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <input {...getInputProps()} />

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bureau/10 text-bureau">
        {isDragActive ? <ImageUp size={26} /> : <FileUp size={24} />}
      </div>

      <div>
        <p className="font-display text-lg font-semibold text-ink">
          {isDragActive ? "Drop to upload" : title}
        </p>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>

      <span className="mt-1 rounded-full bg-ink/5 px-3 py-1 text-xs font-medium tracking-wide text-slate-500">
        JPG or PNG · clear, well-lit photo
      </span>
    </label>
  );
};

export default UploadBox;
