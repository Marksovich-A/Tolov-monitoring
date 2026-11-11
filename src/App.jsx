import { useData } from "./data";
import AuthScreen from "./components/AuthScreen.jsx";
import Dashboard from "./components/Dashboard.jsx";
import GlowBackground from "./components/GlowBackground.jsx";
import Panel from "./components/Panel.jsx";

export default function App() {
  const data = useData();

  let content;
  if (data.status === "loading") {
    content = <div className="grid min-h-screen place-items-center text-white/70">Yuklanmoqda...</div>;
  } else if (data.status === "noprofile") {
    content = (
      <main className="grid min-h-screen place-items-center p-6">
        <Panel className="w-full max-w-md p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Profil topilmadi</h1>
          <p className="mt-2 text-white/70">
            Akkaunt yaratilgan, lekin yig'uvchi profili saqlanmagan. Chiqib, qaytadan ro'yxatdan o'ting yoki administratorga murojaat qiling.
          </p>
          <button
            type="button"
            onClick={() => data.auth.signOut()}
            className="mt-6 rounded-xl bg-sun px-5 py-2.5 font-semibold text-ink hover:brightness-95"
          >
            Chiqish
          </button>
        </Panel>
      </main>
    );
  } else if (data.status === "signedout") {
    content = <AuthScreen auth={data.auth} mode={data.mode} />;
  } else {
    content = <Dashboard data={data} />;
  }

  return (
    <>
      <GlowBackground />
      {content}
    </>
  );
}
