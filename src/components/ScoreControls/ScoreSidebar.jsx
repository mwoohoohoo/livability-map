import ScoreControl from "./ScoreControl";

export default function ScoreSidebar({
  variables,
  settings,
  defaultSettings,
  onImportanceChange,
  onRemove,
  onDealbreakerChange,
  onReset,
  onClose,
  onView,
  isSheet = false,
}) {
  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(defaultSettings);

  return (
    <aside
      className={`
        flex
        h-full
        w-full
        flex-col
        bg-white
        ${isSheet ? "rounded-t-2xl" : ""}
      `}
    >
      {/* Header */}
      <header
        className="
          flex
          shrink-0
          items-center
          justify-between
          border-b
          border-[var(--border)]
          px-5
          py-4
        "
      >
        <h2 className="m-0 text-lg font-semibold">Score weighting</h2>

        {isSheet && (
          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              text-xl
              leading-none
              hover:bg-[var(--code-bg)]
            "
            aria-label="Close score weighting"
          >
            ×
          </button>
        )}
      </header>

      {/* Controls */}
      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-5
        "
      >
        {variables.map((variable) => (
          <ScoreControl
            key={variable.id}
            variable={variable}
            importance={settings[variable.id]}
            removed={settings.removed.includes(variable.id)}
            dealbreaker={settings.dealbreaker}
            dealbreakerVariable={settings.dealbreaker}
            onImportanceChange={onImportanceChange}
            onRemove={onRemove}
            onDealbreakerChange={onDealbreakerChange}
          />
        ))}
      </div>

      {/* Footer */}
      <footer
        className="
          flex
          shrink-0
          gap-3
          border-t
          border-[var(--border)]
          p-5
        "
      >
        <button
          type="button"
          onClick={onReset}
          disabled={!hasChanges}
          className={`
            rounded-full
            px-4
            py-2
            text-sm
            transition
            ${
              hasChanges
                ? "bg-[var(--code-bg)] text-[var(--text-h)] hover:bg-[var(--border)]"
                : "cursor-not-allowed bg-[var(--code-bg)] text-gray-400"
            }
          `}
        >
          Reset
        </button>

        {isSheet && (
          <button
            type="button"
            onClick={onView}
            className="
              ml-auto
              rounded-full
              bg-[var(--text-h)]
              px-5
              py-2
              text-sm
              text-white
              transition
              hover:opacity-80
            "
          >
            View
          </button>
        )}
      </footer>
    </aside>
  );
}
