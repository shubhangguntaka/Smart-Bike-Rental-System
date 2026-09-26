import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";

interface Props {
  imageSrc: string;
  scanning: boolean;
  steps: string[];
  hasError?: boolean;
  failedStepIndex?: number;
}

const STEP_INTERVAL_MS = 900;

/**
 * Shows the uploaded document with a scanner viewfinder frame.
 * While `scanning` is true, a laser line sweeps top-to-bottom and the
 * step checklist advances on its own timer - purely a perception cue
 * (the real work happens in one backend call), so the person feels
 * the document is actually being read rather than just waiting on a
 * spinner.
 *
 * When `scanning` flips back to false without errors, every step is fast-forwarded
 * to "checked" for a beat before the parent swaps in the result.
 * If `hasError` is true, success checkmarks and celebration overlays are suppressed.
 */
const DocumentScanner = ({ imageSrc, scanning, steps, hasError = false, failedStepIndex }: Props) => {
  const [activeStep, setActiveStep] = useState(0);
  const [justFinished, setJustFinished] = useState(false);
  const wasScanning = useRef(false);

  useEffect(() => {
    if (scanning) {
      wasScanning.current = true;
      setJustFinished(false);
      setActiveStep(0);

      const interval = setInterval(() => {
        setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, STEP_INTERVAL_MS);

      return () => clearInterval(interval);
    }

    if (wasScanning.current) {
      if (!hasError) {
        // Scan ended successfully - fast-forward to checked
        setActiveStep(steps.length);
        setJustFinished(true);
      } else {
        setJustFinished(false);
        if (failedStepIndex !== undefined) {
          setActiveStep(failedStepIndex);
        }
      }
      wasScanning.current = false;
    }
  }, [scanning, steps.length, hasError, failedStepIndex]);

  const showChecklist = scanning || justFinished || hasError;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-ink/10 bg-ink shadow-lg">
        <img
          src={imageSrc}
          alt="Uploaded document"
          className={`w-full object-cover transition-[filter] duration-500 ${
            scanning ? "brightness-75 saturate-[0.85]" : "brightness-100"
          }`}
        />

        {/* Viewfinder corner brackets */}
        <span className="reticle-corner left-2 top-2 border-l-2 border-t-2 rounded-tl-sm" />
        <span className="reticle-corner right-2 top-2 border-r-2 border-t-2 rounded-tr-sm" />
        <span className="reticle-corner bottom-2 left-2 border-b-2 border-l-2 rounded-bl-sm" />
        <span className="reticle-corner bottom-2 right-2 border-b-2 border-r-2 rounded-br-sm" />

        {scanning && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(177,135,63,0.08)_1px,transparent_1px)] bg-[length:100%_6px] animate-scan-grid" />
            <div
              className="pointer-events-none absolute left-0 right-0 h-[3px] animate-scan-sweep"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #e4c07a 20%, #fff7e6 50%, #e4c07a 80%, transparent)",
                boxShadow: "0 0 12px 2px rgba(228,192,122,0.7)",
              }}
            />
          </>
        )}

        {justFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/40"
          >
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-verified bg-white/95 text-verified"
            >
              <Check size={22} strokeWidth={3} />
            </motion.span>
          </motion.div>
        )}
      </div>

      <ul className="mx-auto flex w-full max-w-sm flex-col gap-2">
        {steps.map((step, i) => {
          const isFailed = !scanning && hasError && (failedStepIndex !== undefined ? i === failedStepIndex : i === activeStep);
          const done = showChecklist ? (hasError ? i < (failedStepIndex ?? activeStep) : i < activeStep) : false;
          const current = scanning && i === activeStep;

          return (
            <li
              key={step}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  isFailed
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : done
                    ? "border-verified bg-verified text-white"
                    : current
                    ? "border-brass text-brass"
                    : "border-slate-300 text-transparent"
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isFailed ? (
                    <motion.span
                      key="failed"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <X size={12} strokeWidth={3} />
                    </motion.span>
                  ) : done ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </motion.span>
                  ) : current ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </AnimatePresence>
              </span>

              <span
                className={
                  isFailed
                    ? "font-medium text-destructive"
                    : done
                    ? "text-slate-500 line-through decoration-slate-300"
                    : current
                    ? "font-medium text-ink"
                    : "text-slate-400"
                }
              >
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DocumentScanner;
