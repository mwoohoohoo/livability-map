import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import ScoreControl from "./ScoreControl";

const stepVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const filterContainerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

const filterItemVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export default function ScoreSidebar({
  variables,
  settings,
  defaultSettings,
  step,
  onStepChange,
  onImportanceChange,
  onRemove,
  onDealbreakerChange,
  onReset,
  onClose,
  isSheet = false,
}) {
  const prefersReducedMotion = useReducedMotion();
  const duration = prefersReducedMotion ? 0 : 0.28;

  const selectedCount = variables.filter(
    (variable) => !settings.removed.includes(variable.id),
  ).length;

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(defaultSettings);

  const transition = {
    duration,
    ease: "easeOut",
  };

  return (
    <aside
      className={`
        flex h-full w-full flex-col bg-white
        ${isSheet ? "rounded-t-2xl" : ""}
      `}
      aria-label="Map scoring walkthrough"
    >
      {/* Header */}
      <header className="shrink-0 border-b border-[var(--border)] px-5 py-5">
        <div className="flex items-center justify-between">
          <motion.h1
            animate={{
              fontSize: step === "intro" ? "2rem" : "1.125rem",
              opacity: step === "intro" ? 1 : 0.65,
            }}
            transition={transition}
            className="m-0 font-medium leading-tight text-[var(--text-h)]"
          >
            App title
          </motion.h1>

          {isSheet && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close walkthrough"
              className="
                flex h-9 w-9 items-center justify-center rounded-full
                text-xl transition hover:bg-[var(--code-bg)]
                focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-[var(--text-h)]
              "
            >
              ×
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {step === "intro" && (
            <motion.p
              key="intro-description"
              initial={{ opacity: 0, height: 0, y: 8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={transition}
              className="mb-0 mt-5 max-w-[280px] overflow-hidden text-sm leading-relaxed text-[var(--text)]"
            >
              Choose the factors that matter to you and adjust their importance
              to explore climbing locations across Europe.
            </motion.p>
          )}
        </AnimatePresence>
      </header>

      {/* Step content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait" initial={false}>
          {step === "intro" && (
            <motion.section
              key="intro"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="py-6"
            >
              <button
                type="button"
                onClick={() => onStepChange("filters")}
                className="
                  rounded-full bg-black px-5 py-3 text-sm
                  font-medium text-white transition hover:opacity-80
                  focus-visible:outline-2 focus-visible:outline-offset-4
                  focus-visible:outline-[var(--text-h)]
                "
              >
                Continue
              </button>
            </motion.section>
          )}

          {step === "filters" && (
            <motion.section
              key="filters"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="py-6"
            >
              <h2 className="mb-2 text-xl font-medium text-[var(--text-h)]">
                1. Filters
              </h2>

              <p className="mb-6 text-sm text-[var(--text)]">
                Select the factors you want to use.
              </p>

              <motion.div
                variants={filterContainerVariants}
                initial="initial"
                animate="animate"
                className="flex flex-wrap gap-2"
              >
                {variables.map((variable) => {
                  const selected = !settings.removed.includes(variable.id);

                  return (
                    <motion.button
                      key={variable.id}
                      variants={filterItemVariants}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onRemove(variable.id)}
                      className={`
                        rounded-full border px-4 py-2 text-sm
                        transition-colors
                        focus-visible:outline-2
                        focus-visible:outline-offset-2
                        focus-visible:outline-[var(--text-h)]
                        ${
                          selected
                            ? "border-[var(--text-h)] bg-[var(--text-h)] text-white"
                            : "border-[var(--border)] bg-white text-[var(--text-h)] hover:bg-[var(--code-bg)]"
                        }
                      `}
                    >
                      {variable.label}
                    </motion.button>
                  );
                })}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  ...transition,
                  delay: prefersReducedMotion ? 0 : 0.5,
                }}
                className="mt-8"
              >
                <button
                  type="button"
                  disabled={selectedCount === 0}
                  onClick={() => onStepChange("weighting")}
                  className="
                    rounded-full bg-black px-5 py-3 text-sm
                    font-medium text-white transition
                    hover:opacity-80
                    disabled:cursor-not-allowed
                    disabled:bg-gray-300 disabled:text-gray-500
                    disabled:hover:opacity-100
                    focus-visible:outline-2 focus-visible:outline-offset-4
                    focus-visible:outline-[var(--text-h)]
                  "
                >
                  Continue
                </button>
              </motion.div>
            </motion.section>
          )}

          {step === "weighting" && (
            <motion.section
              key="weighting"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              className="py-6"
            >
              <button
                type="button"
                onClick={() => onStepChange("filters")}
                className="
                  mb-5 text-xs text-[var(--text)]
                  underline underline-offset-2
                  focus-visible:outline-2 focus-visible:outline-offset-4
                  focus-visible:outline-[var(--text-h)]
                "
              >
                ← Back to filters
              </button>

              <h2 className="mb-2 text-xl font-medium text-[var(--text-h)]">
                2. Weighting
              </h2>

              <p className="mb-5 text-sm text-[var(--text)]">
                Adjust how important each factor is. The map updates
                automatically as you make changes.
              </p>

              {variables.map((variable, index) => (
                <motion.div
                  key={variable.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    ...transition,
                    delay: prefersReducedMotion ? 0 : index * 0.06,
                  }}
                >
                  <ScoreControl
                    variable={variable}
                    importance={settings[variable.id]}
                    removed={settings.removed.includes(variable.id)}
                    dealbreaker={settings.dealbreaker}
                    onImportanceChange={onImportanceChange}
                    onRemove={onRemove}
                    onDealbreakerChange={onDealbreakerChange}
                  />
                </motion.div>
              ))}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {step !== "intro" && (
        <footer className="flex shrink-0 border-t border-[var(--border)] p-5">
          <button
            type="button"
            onClick={onReset}
            disabled={!hasChanges}
            className="
              rounded-full bg-[var(--code-bg)] px-4 py-2
              text-sm text-[var(--text-h)] transition
              hover:bg-[var(--border)]
              disabled:cursor-not-allowed disabled:text-gray-400
              focus-visible:outline-2 focus-visible:outline-offset-4
              focus-visible:outline-[var(--text-h)]
            "
          >
            Reset
          </button>
        </footer>
      )}
    </aside>
  );
}
