import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, doc, onSnapshot, query, runTransaction, setDoc, where } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { applyDelta, emptyDay, toISO } from "../lib/calc";
import { normalizePhone, phoneToEmail } from "../lib/phone";

const byDate = (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0);

/* Telefon raqamni Firebase uchun email'ga aylantiradi. Noto'g'ri raqamda xato tashlaydi. */
function phoneEmail(phone) {
  const digits = normalizePhone(phone);
  if (!digits) throw Object.assign(new Error("Telefon raqam noto'g'ri"), { code: "app/invalid-phone" });
  return phoneToEmail(digits);
}

/* Firebase rejimi.
   Firestore tuzilmasi:
     collectors/{uid}              -> { name, total, branchId }
     reports/{uid}_{sana}          -> { collectorId, branchId, date, total, sud, carried, daily, overdue }
     branchDays/{branchId}_{sana}  -> filialning kunlik yig'indisi (hisobot bilan bir xil shakl)

   Ko'rinish: hamma filiallarning yig'indisi (branchDays) hammaga ochiq, yig'uvchilar va
   hisobotlar esa faqat o'z filialida. Qaytaradigan obyekt shakli demoStore.js bilan bir xil. */
export function useFirebaseData() {
  const [authUser, setAuthUser] = useState(undefined); // undefined: tekshirilmoqda, null: kirmagan
  const [profile, setProfile] = useState(undefined); // undefined: yuklanmoqda, null: topilmadi
  const [creating, setCreating] = useState(false);
  const [people, setPeople] = useState([]);
  const [reports, setReports] = useState([]);
  const [branchDays, setBranchDays] = useState([]);
  const today = useMemo(() => toISO(new Date()), []);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setAuthUser(u);
        if (!u) {
          setProfile(undefined);
          setPeople([]);
          setReports([]);
          setBranchDays([]);
        }
      }),
    []
  );

  useEffect(() => {
    if (!authUser) return undefined;
    return onSnapshot(doc(db, "collectors", authUser.uid), (snap) =>
      setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    );
  }, [authUser]);

  const branchId = profile?.branchId;

  useEffect(() => {
    if (!authUser || !branchId) return undefined;
    // Eslatma: so'rovlar `where("branchId", "==", ...)` bilan bo'lishi shart, aks holda
    // xavfsizlik qoidalari so'rovni rad etadi.
    const stops = [
      onSnapshot(query(collection(db, "collectors"), where("branchId", "==", branchId)), (snap) =>
        setPeople(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      ),
      onSnapshot(query(collection(db, "reports"), where("branchId", "==", branchId)), (snap) =>
        setReports(snap.docs.map((d) => d.data()))
      ),
      onSnapshot(collection(db, "branchDays"), (snap) => setBranchDays(snap.docs.map((d) => d.data()))),
    ];
    return () => stops.forEach((stop) => stop());
  }, [authUser, branchId]);

  const collectors = useMemo(
    () => people.map((p) => ({ ...p, reports: reports.filter((r) => r.collectorId === p.id).sort(byDate) })),
    [people, reports]
  );

  /* Hisobotni saqlash va filial yig'indisini bir tranzaksiyada yangilash */
  const saveReport = useCallback(
    async (report) => {
      const uid = authUser.uid;
      const reportRef = doc(db, "reports", `${uid}_${report.date}`);
      const dayRef = doc(db, "branchDays", `${profile.branchId}_${report.date}`);

      await runTransaction(db, async (tx) => {
        const oldSnap = await tx.get(reportRef);
        const daySnap = await tx.get(dayRef);
        const old = oldSnap.exists() ? oldSnap.data() : null;
        const agg = daySnap.exists() ? daySnap.data() : emptyDay(profile.branchId, report.date);

        tx.set(reportRef, { ...report, collectorId: uid, branchId: profile.branchId });
        tx.set(dayRef, applyDelta(agg, old, report));
      });
    },
    [authUser, profile]
  );

  const authApi = useMemo(
    () => ({
      signIn: (phone, password) => signInWithEmailAndPassword(auth, phoneEmail(phone), password),

      signUp: async ({ name, total, branchId: chosen, phone, password }) => {
        const email = phoneEmail(phone);
        setCreating(true);
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await setDoc(doc(db, "collectors", cred.user.uid), { name, total: Number(total), branchId: chosen });
        } finally {
          setCreating(false);
        }
      },

      signOut: () => signOut(auth),
    }),
    []
  );

  const user = useMemo(() => {
    if (!authUser || !profile) return null;
    return {
      id: authUser.uid,
      name: profile.name,
      phone: (authUser.email ?? "").split("@")[0],
      branchId: profile.branchId,
      total: profile.total,
    };
  }, [authUser, profile]);

  let status = "ready";
  if (authUser === undefined || creating || (authUser && profile === undefined)) status = "loading";
  else if (authUser === null) status = "signedout";
  else if (profile === null) status = "noprofile";

  return useMemo(
    () => ({ mode: "firebase", status, today, user, branchDays, collectors, saveReport, auth: authApi }),
    [status, today, user, branchDays, collectors, saveReport, authApi]
  );
}
