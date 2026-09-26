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
    return (
      <div
        {...getRootProps()}
        className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/80 px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground transition hover:border-primary/50 hover:bg-muted"
      >
        <input {...getInputProps()} />
        <RefreshCw size={15} className="transition group-hover:rotate-180 text-muted-foreground group-hover:text-primary" />
        <span>Replace document</span>
      </div>
    );
  }

  return (
    <label
      {...getRootProps()}
      className={`paper-grain relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed px-4 py-8 sm:px-8 sm:py-12 text-center transition-all ${
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-border bg-card/80 hover:border-primary/40 hover:bg-card text-card-foreground shadow-xs"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <input {...getInputProps()} />

      <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform">
        {isDragActive ? <ImageUp size={24} /> : <FileUp size={22} />}
      </div>

      <div className="space-y-1 max-w-xs">
        <p className="font-serif text-base sm:text-lg font-bold text-foreground">
          {isDragActive ? "Drop to upload" : title}
        </p>
        {subtitle && <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{subtitle}</p>}
      </div>

      <span className="mt-1 rounded-full bg-muted/80 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground border border-border/50">
        JPG or PNG · clear, well-lit photo
      </span>
    </label>
  );
};

export default UploadBox;
