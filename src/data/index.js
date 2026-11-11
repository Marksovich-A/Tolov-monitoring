import { isFirebaseConfigured } from "../lib/firebase";
import { useDemoData } from "./demoStore";
import { useFirebaseData } from "./firebaseStore";

/* Firebase kaliti bo'lsa haqiqiy ma'lumotlar, bo'lmasa demo.
   Tanlov modul yuklanganda bir marta qilinadi, shuning uchun hooklar tartibi o'zgarmaydi. */
export const useData = isFirebaseConfigured ? useFirebaseData : useDemoData;
