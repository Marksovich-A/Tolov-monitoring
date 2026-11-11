/* Orqa fon: qora ustida yumshoq sariq yorug'lik. Shaffof panellar shu fonni "ko'rsatib" turadi. */
export default function GlowBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -right-40 -top-40 size-[34rem] rounded-full bg-sun/20 blur-3xl" />
      <div className="absolute -bottom-56 -left-40 size-[38rem] rounded-full bg-sun/10 blur-3xl" />
      <div className="absolute left-1/2 top-1/3 size-[22rem] -translate-x-1/2 rounded-full bg-white/[0.04] blur-3xl" />
    </div>
  );
}
