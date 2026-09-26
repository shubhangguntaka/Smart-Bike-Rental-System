import type { OCRData } from "../../types/verification";

interface Props {
  data: OCRData;
}

const OCRDetails = ({ data }: Props) => {
  return (
    <div className="mt-6 sm:mt-8 rounded-2xl bg-card border border-border p-4 sm:p-6 md:p-8 shadow-xl text-card-foreground w-full">
      <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold font-serif text-foreground">
        Extracted Details
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
        <Info title="Name" value={data.name} />
        <Info title="Aadhaar Number" value={data.aadhaarNumber} mono />
        <Info title="Date of Birth" value={data.dob} />
        <Info title="Gender" value={data.gender} />
      </div>

      <div className="mt-4 sm:mt-6 border-t border-border/60 pt-4 sm:pt-6">
        <Info title="Address" value={data.address} />
      </div>

      <details className="mt-6 sm:mt-8 rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4">
        <summary className="cursor-pointer font-semibold text-xs sm:text-sm text-foreground hover:text-primary transition-colors">
          View Raw OCR Output
        </summary>

        <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/60 p-3 text-xs font-mono text-muted-foreground border border-border/40 overflow-x-auto">
          {data.rawText}
        </pre>
      </details>
    </div>
  );
};

interface InfoProps {
  title: string;
  value: string;
  mono?: boolean;
}

const Info = ({ title, value, mono }: InfoProps) => (
  <div>
    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
    <p className={`mt-0.5 text-xs sm:text-sm font-semibold text-foreground ${mono ? "font-mono" : ""}`}>
      {value || "—"}
    </p>
  </div>
);

export default OCRDetails;