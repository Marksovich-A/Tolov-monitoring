# Bir Zum Nasiya to'lov monitoringi

12 filialning muddati o'tgan nasiyalarni undirish natijasini ko'rsatadigan panel. React + Tailwind CSS + Firebase. Qora, sariq va oq ranglar, shaffof (shisha) panellar, telefonda ham ishlaydi.

AI yordamida (Claude) yozilgan va egasi tomonidan tushunib chiqilgan.

> Diqqat: loyihadagi barcha ma'lumotlar o'ydirma. Haqiqiy mijoz, xodim yoki kompaniya ma'lumotini bu yerga qo'ymang. Sarlavhani `src/config.js` dagi `APP_TITLE` orqali almashtirsa bo'ladi.

## Nima qiladi

- **Ro'yxatdan o'tish va kirish.** Ism, filial, oylik mijozlar soni (300 yoki 500), telefon raqam va parol.
- **Test hisob.** Kirish oynasida ko'rsatiladi, bir bosishda kirasiz (demo rejimda: `90 000 00 00` / `test123`).
- **Yon panel.** Hammasi (viloyat) va 12 filial. Muddati o'tganlarni undirish foizi bo'yicha tartiblanadi. Standart: foizi **past** filial tepada. Tartibni yon paneldagi tugma bilan o'zgartirasiz.
- **Natija.** Har filial uchun "muddati o'tgan 1 160 tadan 101 tasi undirildi" ko'rinishida.
- **Ko'rinish qoidasi.** Hamma filiallarning yig'indisini hamma ko'radi. Kim nechta undirganini (yig'uvchilar jadvali) faqat o'z filialingizda ko'rasiz.
- **Hisobot kiritish.** "Bugungi hisobot" tugmasi. Kun boshiga qiymatlari kechagi hisobotdan avtomatik olinadi.
- **Telefon.** Yon panel chap tomondan chiqadi, jadval yon tomonga suriladi.

## Ishga tushirish

```bash
npm install
npm run dev
```

Firebase kaliti kiritilmasa, panel **demo rejimda** ishlaydi (o'ydirma ma'lumotlar, hisob va hisobotlar brauzerda `localStorage` da saqlanadi).

## Firebase'ni ulash

1. https://console.firebase.google.com da loyiha oching.
2. **Authentication > Sign-in method** da **Email/Password** ni yoqing.
3. **Firestore Database** yarating.
4. **Rules** bo'limiga `firestore.rules` matnini qo'yib, **Publish** qiling.
5. Web ilova qo'shib, `firebaseConfig` qiymatlarini `.env.example` dan `.env.local` ga nusxalab to'ldiring.
6. Test hisob uchun: avval shu telefon/parol bilan o'zingiz ro'yxatdan o'ting, keyin `.env.local` ga `VITE_TEST_PHONE` va `VITE_TEST_PASSWORD` yozing. Bu qiymatlar saytda hammaga ko'rinadi, shuning uchun haqiqiy parol qo'ymang.

## Ma'lumot tuzilmasi va ko'rinish

| Kolleksiya | Kim o'qiydi | Nima saqlaydi |
| --- | --- | --- |
| `branchDays/{filial}_{sana}` | tizimga kirgan hamma | filialning kunlik yig'indisi (yon panel va viloyat uchun) |
| `collectors/{uid}` | faqat o'z filiali | ism, oylik mijozlar soni, filial |
| `reports/{uid}_{sana}` | faqat o'z filiali | yig'uvchining kunlik hisoboti |

Yig'uvchi hisobot saqlaganda, o'zgarish farqi `branchDays` yig'indisiga tranzaksiya bilan qo'shiladi (`applyDelta`).

## Hisob-kitob qoidalari

- Farqi = kun boshiga − kun oxiriga. Foizi = farqi / kun boshiga × 100.
- Kunga pros = SUD + o'tgan oydan qolganlar + kunlik mijozlar + muddati o'tgan (kun oxiriga qiymatlari).
- Ertasi kuni: SUD va qolganlar kechagi oxiridan boshlanadi. Muddati o'tgan = kechagi muddati o'tgan oxiri + kechagi kunlik mijozlar oxiri.
- Hafta va oy: kunlik mijozlar kunlar yig'indisi, qolganlari davr boshi va oxiri bo'yicha.
- Foiz belgisi: past = to'ldirilgan sariq, o'rtacha = sariq kontur, yaxshi = oq kontur (rang ishlatilgan 3 ta bilan cheklanadi, ma'no matnda ham bor). Chegaralar `src/lib/calc.js` dagi `THRESHOLDS`.

## Cheklovlar (halol ro'yxat)

- **Firebase qismi shu muhitda sinab ko'rilmagan.** Demo rejim brauzerda to'liq sinalgan, Firebase bilan ishlashni o'zingiz ulab tekshirishingiz kerak.
- Telefon raqam SMS bilan tasdiqlanmaydi va ro'yxatdan o'tishda filialni o'zi tanlaydi. Haqiqiy ishlatishda akkauntlarni faqat admin yaratishi kerak.
- `branchDays` yig'indisini brauzer yangilaydi, qoidalar qiymatning to'g'riligini tekshirmaydi. Jiddiy ishlatishda buni Cloud Functions bajarishi kerak.
- Parolni tiklash xati yo'q.

## Tuzilma

```
src/
  config.js            sarlavha, 12 filial, test hisob
  lib/calc.js          hisob-kitob (toza funksiyalar)
  lib/phone.js         telefon -> email
  data/                demoStore (localStorage) va firebaseStore
  components/          AuthScreen, Dashboard, Sidebar, Topbar, Hero,
                       ClosingBars, TrendChart, ReportTable, ReportDialog,
                       Panel, Segmented, PercentChip, Fill, Toast, GlowBackground
```
