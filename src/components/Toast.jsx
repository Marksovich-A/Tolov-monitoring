export default function Toast({ text }) {
  if (!text) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-sun px-5 py-2.5 font-medium text-ink shadow-xl shadow-black/40"
    >
      {text}
    </div>
  );
}
