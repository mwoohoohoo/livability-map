export default function FiltersButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        rounded-full
        bg-white
        px-5
        py-3
        text-sm
        font-medium
        text-[var(--text-h)]
        shadow-lg
        transition
        hover:scale-[1.02]
        active:scale-[0.98]
      "
    >
      Filters
    </button>
  );
}
