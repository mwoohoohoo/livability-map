import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import ScoreSidebar from "./ScoreSidebar";

const SHEET_EXPANDED_TOP_GAP_PX = 40;

export default function ScoreSheet({
  isOpen,
  onClose,
  variables,
  settings,
  defaultSettings,
  step,
  onStepChange,
  onImportanceChange,
  onRemove,
  onDealbreakerChange,
  onReset,
}) {
  const isExpanded = step !== "intro";

  const expandedHeight = `calc(100dvh - ${SHEET_EXPANDED_TOP_GAP_PX}px)`;

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement;

    const panels = [...document.querySelectorAll("[data-score-sheet-panel]")];

    const panel = panels.find((element) => element.getClientRects().length > 0);

    if (!panel) return;

    const getFocusable = () =>
      [
        ...panel.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => element.getClientRects().length > 0);

    getFocusable()[0]?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusable();

      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    panel.addEventListener("keydown", handleKeyDown);

    return () => {
      panel.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close walkthrough"
            className="fixed inset-0 z-40 cursor-default bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Desktop / tablet side panel */}
          <motion.div
            data-score-sheet-panel
            role="dialog"
            aria-modal="true"
            aria-label="Scoring walkthrough"
            tabIndex={-1}
            className="
              fixed inset-y-0 left-0 z-50 hidden w-[360px]
              shadow-2xl md:block min-[1580px]:hidden
            "
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <ScoreSidebar
              variables={variables}
              settings={settings}
              defaultSettings={defaultSettings}
              step={step}
              onStepChange={onStepChange}
              onImportanceChange={onImportanceChange}
              onRemove={onRemove}
              onDealbreakerChange={onDealbreakerChange}
              onReset={onReset}
              onClose={onClose}
              isSheet
            />
          </motion.div>

          {/* Mobile full-screen sheet */}
          <motion.div
            data-score-sheet-panel
            role="dialog"
            aria-modal="true"
            aria-label="Scoring walkthrough"
            tabIndex={-1}
            className="
              fixed inset-x-0 bottom-0 z-50 overflow-hidden md:hidden
            "
            initial={{ y: "100%", height: isExpanded ? expandedHeight : "auto" }}
            animate={{ y: 0, height: isExpanded ? expandedHeight : "auto" }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <ScoreSidebar
              variables={variables}
              settings={settings}
              defaultSettings={defaultSettings}
              step={step}
              onStepChange={onStepChange}
              onImportanceChange={onImportanceChange}
              onRemove={onRemove}
              onDealbreakerChange={onDealbreakerChange}
              onReset={onReset}
              onClose={onClose}
              isSheet
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
