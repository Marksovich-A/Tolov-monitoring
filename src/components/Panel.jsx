const TONES = {
  glass: "border-white/10 bg-white/[0.06]",
  sun: "border-sun/30 bg-sun/10",
};

/* Shaffof panel: oq rangning past shaffofligi + xiralashtirilgan fon */
export default function Panel({ as: Tag = "section", tone = "glass", className = "", children, ...rest }) {
  return (
    <Tag className={`rounded-2xl border shadow-xl shadow-black/30 backdrop-blur-xl ${TONES[tone]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
