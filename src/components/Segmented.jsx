/* Ikki-uch tugmali tanlov (Bugun / Hafta / Oy, tartib va shunga o'xshash) */
export default function Segmented({ label, options, value, onChange, small = false, className = "" }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`rounded-lg font-medium transition-colors ${small ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"} ${
              active ? "bg-sun text-ink shadow" : "text-white/70 hover:text-white"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
