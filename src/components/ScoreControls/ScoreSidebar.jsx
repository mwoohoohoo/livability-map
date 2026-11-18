import ScoreControl from "./ScoreControl";

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
  const selectedCount = variables.filter(
    (variable) => !settings.removed.includes(variable.id),
  ).length;

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(defaultSettings);

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
          <h1
            className={`
              m-0 font-medium leading-tight text-[var(--text-h)] text-left
              ${step === "intro" ? "text-2xl" : "text-lg opacity-65"}
            `}
          >
            Mountain map
          </h1>

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

        {step === "intro" && (
          <p className="mb-0 mt-5 max-w-[280px] text-sm leading-relaxed text-[var(--text)] text-left">
            Choose the factors that matter to you and adjust their importance to
            explore climbing locations across Europe.
          </p>
        )}
      </header>

      {/* Step content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        {step === "intro" && (
          <section className="py-6">
            <button
              type="button"
              onClick={() => onStepChange("filters")}
              className="
                rounded-full bg-[var(--cta)] px-5 py-3 text-sm
                font-medium text-white transition hover:bg-[var(--cta-hover)]
                focus-visible:outline-2 focus-visible:outline-offset-4
                focus-visible:outline-[var(--text-h)]
              "
            >
              Continue
            </button>
          </section>
        )}

        {step === "filters" && (
          <section className="py-6">
            <h2 className="mb-2 text-xl font-medium text-[var(--text-h)]">
              1. Filters
            </h2>

            <p className="mb-6 text-sm text-[var(--text)]">
              Select the factors you want to use.
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              {variables.map((variable) => {
                const selected = !settings.removed.includes(variable.id);

                return (
                  <button
                    key={variable.id}
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
                          ? "border-[var(--text-h)] bg-transparent text-[var(--text-h)]"
                          : "border-[var(--border)] bg-white text-[var(--text-h)] hover:bg-[var(--code-bg)]"
                      }
                    `}
                  >
                    {variable.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={() => onStepChange("weighting")}
                className="
                  rounded-full bg-[var(--cta)] px-5 py-3 text-sm
                  font-medium text-white transition hover:bg-[var(--cta-hover)]
                  disabled:cursor-not-allowed
                  disabled:bg-[var(--cta-disabled)]
                  disabled:text-white
                  disabled:hover:bg-[var(--cta-disabled)]
                  focus-visible:outline-2 focus-visible:outline-offset-4
                  focus-visible:outline-[var(--text-h)]
                "
              >
                Continue
              </button>
            </div>
          </section>
        )}

        {step === "weighting" && (
          <section className="py-6">
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
              Adjust how important each factor is. The map updates automatically
              as you make changes.
            </p>

            {/* Single-filter explanation */}
            {selectedCount === 1 && (
              <p className="mb-5 rounded-lg bg-[var(--code-bg)] p-3 text-xs leading-relaxed">
                With only one filter selected, it receives 100% of the
                weighting. Select another filter to adjust their relative
                importance.
              </p>
            )}

            {selectedCount === 0 ? (
              <div className="rounded-lg bg-[var(--code-bg)] p-4">
                <p className="mb-4 text-sm text-[var(--text)]">
                  No filters selected.
                </p>

                <button
                  type="button"
                  onClick={() => onStepChange("filters")}
                  className="
                    rounded-full bg-[var(--cta)] px-4 py-2 text-sm
                    font-medium text-white transition
                    hover:bg-[var(--cta-hover)]
                    focus-visible:outline-2 focus-visible:outline-offset-4
                    focus-visible:outline-[var(--text-h)]
                  "
                >
                  Back to filters
                </button>
              </div>
            ) : (
              variables
                .filter(
                  (variable) => !settings.removed.includes(variable.id),
                )
                .map((variable) => (
                  <ScoreControl
                    key={variable.id}
                    variable={variable}
                    importance={settings[variable.id]}
                    removed={settings.removed.includes(variable.id)}
                    dealbreaker={settings.dealbreaker}
                    activeCount={selectedCount}
                    onImportanceChange={onImportanceChange}
                    onRemove={onRemove}
                    onDealbreakerChange={onDealbreakerChange}
                  />
                ))
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      {step !== "intro" && (
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--border)] p-5">
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

          {isSheet && step === "weighting" && (
            <button
              type="button"
              onClick={onClose}
              className="
                rounded-full bg-[var(--cta)] px-4 py-2 text-sm
                font-medium text-white transition
                hover:bg-[var(--cta-hover)]
                focus-visible:outline-2 focus-visible:outline-offset-4
                focus-visible:outline-[var(--text-h)]
              "
            >
              Apply filters
            </button>
          )}
        </footer>
      )}
    </aside>
  );
}
