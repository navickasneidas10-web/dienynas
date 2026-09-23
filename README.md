# Dienynas — elektroninis dienynas (Supabase + GitHub Pages)

Mokyklos elektroninio dienyno analogas su keturiais vaidmenimis: **administratorius**, **mokytojas** (ir klasės vadovas), **mokinys**, **tėvai**.
Frontend'as — paprasti HTML/CSS/JS failai be jokio „build“ žingsnio, todėl juos galima tiesiog įkelti į GitHub Pages.
Duomenys, prisijungimas ir 2FA — [Supabase](https://supabase.com).

## Funkcijos

| Vaidmuo | Ką gali |
|---|---|
| **Administratorius** | Klasės (lygis, pusmečiai/trimestrai, klasės vadovas), mokiniai (rankiniu būdu arba įklijuojant sąrašą), mokytojai, dalykų sąrašas (pagrindiniai dalykai ir moduliai), laikotarpių datos ir atostogos, vertinimo būsenos („Pradėti visoms“ / „Sustabdyti“), vertinimo sistemos (dešimtbalė / įskaita, papildomi vertinimo tipai), mokytojų ir klasės vadovų pavadavimai, mokytojų tvarkaraščiai, ataskaitos (naudotojų raktai, mokymosi apskaitos suvestinė, lankomumas, metiniai įvertinimai CSV/XML), naudotojų paskyrų valdymas (laikinas slaptažodis, 2FA išjungimas, registracijos panaikinimas). |
| **Mokytojas** | Tvarkaraštis (visomis / lyginėmis / nelyginėmis savaitėmis), pamokų žurnalas, pamokos langas (tema, namų darbai, visos klasės pažymiai ir lankomumas), grupės (dalykas iš mokyklos sąrašo, pogrupiai, srautai, I/P programos), pusmečių ir metiniai pažymiai (automatinis vertinimas), teminiai planai, atsiskaitomieji darbai su sutapimų patikra, pagyrimai ir pastabos, socialinė-pilietinė veikla, pavadavimai. |
| **Klasės vadovas** | N pateisinimas (vienos dienos, kelių dienų, grupinis, išankstinis), klasės suvestinė, tėvų raktai, socialinės veiklos ataskaita. |
| **Mokinys / tėvai** | Pažymiai ir vidurkiai, tvarkaraštis su temomis ir namų darbais, lankomumas, atsiskaitymai, pagyrimai/pastabos, socialinė veikla. Tėvai gali matyti kelis vaikus ir taisyti vaiko duomenis. |
| **Visi** | Pranešimai, slaptažodžio keitimas, dviejų faktorių autentifikacija (TOTP). |

**Pažymių įvedimas:** skiltyje **Pamokos** mokytojas pasirenka grupę ir pamoką, įrašo temą, klasės darbą ir namų darbus, o žemiau toje pačioje vietoje prie kiekvieno mokinio spaudžiama reikšmė `1 2 3 4 5 6 7 8 9 10 įsk. neįsk. atl. pp. np. neat.`, tipas parenkamas kiekvienam mokiniui atskirai arba visai grupei iš karto („Nustatyti įvertinimų tipą visai grupei“), lankomumas žymimas `n` (nedalyvavo) ir `p` (pavėlavo). Viskas išsaugoma iškart. Pažymiai rodomi paprastu tekstu, raudonai — tik už kontrolinį darbą.

**Vertinimas:** visi pažymiai turi vienodą svorį, vidurkis — paprastasis aritmetinis, „neat.“ į vidurkį neįskaičiuojamas. Laikotarpio pažymys apvalinamas pagal mokyklos pasirinktą taisyklę (nuo ,50 / ,45 / ,40), metinis — matematiškai.

## Failų struktūra

```
index.html                  — puslapis
css/styles.css              — stiliai
js/config.js                — ČIA įrašote Supabase URL ir anon raktą
js/core.js                  — konstantos, būsena, vidurkių ir laikotarpių skaičiavimai
js/api.js                   — Supabase: duomenų įkėlimas, įrašymas, realaus laiko atnaujinimai
js/auth.js                  — prisijungimas, registracija, 2FA, meniu
js/views-admin.js           — administratoriaus puslapiai
js/views-teacher.js         — mokytojo ir klasės vadovo puslapiai
js/views-family.js          — mokinio, tėvų, pranešimų ir paskyros puslapiai
js/events.js                — mygtukų ir formų veiksmai
js/main.js                  — paleidimas
supabase/migrations/…sql    — visa duomenų bazė: lentelės, teisės (RLS), funkcijos
supabase/functions/admin-users/index.ts — Edge funkcija administratoriaus veiksmams su paskyromis
```

## Diegimas žingsnis po žingsnio

### 1. Supabase projektas
1. Prisijunkite prie [supabase.com](https://supabase.com) → **New project**.
2. Palaukite, kol projektas bus sukurtas.

### 2. Duomenų bazė
1. Supabase → **SQL Editor** → **New query**.
2. Įklijuokite visą failo `supabase/migrations/20260923000000_dienynas.sql` turinį → **Run**.
   Failą galima paleisti ir pakartotinai — jis nieko nesugadins.

### 3. Prisijungimo nustatymai
Supabase → **Authentication**:
1. **Sign In / Providers → Email**: įjungta; **Confirm email — IŠJUNKITE**.
   (Dienyne jungiamasi prisijungimo vardu, kuris paverčiamas techniniu el. pašto adresu — laiškų juo nesiunčiama.)
2. **Multi-Factor → TOTP**: turi būti įjungta (numatytai įjungta).
3. **URL Configuration → Site URL**: jūsų GitHub Pages adresas, pvz. `https://vardas.github.io/dienynas/`.

### 4. Konfigūracija
Supabase → **Project Settings → API** (naujesniuose projektuose — **API Keys**). Nukopijuokite:
- **Project URL**,
- **anon public** raktą (arba **Publishable key**, `sb_publishable_…`).

Įrašykite juos į `js/config.js`. Šis raktas yra viešas — jį saugu laikyti GitHub'e, nes duomenis saugo RLS taisyklės.
**Niekada** neįrašykite `service_role` / `secret` rakto į frontend'o failus.

Jei Supabase atmestų techninį el. pašto adresą, `LOGIN_EMAIL_DOMAIN` pakeiskite į jums priklausantį domeną.

### 5. Edge funkcija (administratoriaus veiksmai)
Laikinas slaptažodis, 2FA išjungimas ir registracijos panaikinimas reikalauja `service_role` teisių, todėl vykdomi serveryje.

Su [Supabase CLI](https://supabase.com/docs/guides/cli):
```bash
supabase login
supabase link --project-ref JUSU_PROJEKTO_REF
supabase functions deploy admin-users
```
Arba per naršyklę: **Edge Functions → Deploy a new function → Via Editor**, pavadinimas `admin-users`, įklijuokite `supabase/functions/admin-users/index.ts` turinį.
`SUPABASE_URL` ir `SUPABASE_SERVICE_ROLE_KEY` Supabase suteikia funkcijai automatiškai.

Be šios funkcijos veikia viskas, išskyrus tuos tris administratoriaus mygtukus.

### 6. GitHub Pages
```bash
git init
git add .
git commit -m "Dienynas"
git branch -M main
git remote add origin https://github.com/VARDAS/dienynas.git
git push -u origin main
```
GitHub → repozitorija → **Settings → Pages** → Source: **Deploy from a branch**, Branch: `main`, folder `/ (root)` → Save.
Po minutės svetainė veiks adresu `https://VARDAS.github.io/dienynas/`.

### 7. Pirmasis paleidimas
1. Atidarykite svetainę — pamatysite **„Pirmasis paleidimas“**. Sukurkite administratoriaus paskyrą.
2. Administratorius sukuria **dalykus**, **klases**, **mokytojus** ir **mokinius** (mokinius galima įklijuoti sąrašu iš Excel).
3. **Ataskaitos → Naudotojų raktai** rasite mokytojų, mokinių ir tėvų registracijos raktus.
4. Kitoje naršyklėje (arba inkognito lange) prisijungimo lange pasirinkite **Registracija**, įveskite raktą ir susikurkite paskyrą.
5. Mokytojas susikuria grupes ir tvarkaraštį, tada skiltyje **Pamokos** pildo temą, klasės darbą, namų darbus ir rašo pažymius. Skiltyje **Žurnalas** matoma visa grupės pažymių lentelė.

## Kaip veikia registracija

1. Administratorius įveda mokytoją ar mokinį → duomenų bazė automatiškai sugeneruoja **asmeninį raktą** (mokiniui — ir **tėvų raktą**).
2. Asmuo registracijos lange įveda raktą, susigalvoja prisijungimo vardą ir slaptažodį.
3. Tėvai registruojasi su tėvų raktu; kitą vaiką prideda skiltyje **Pridėti vaiką**.
4. Klasės vadovas gali sugeneruoti papildomą tėvų raktą (pvz., antram tėvui).

## Saugumas (Row Level Security)

Visos taisyklės yra duomenų bazėje, todėl jų negalima apeiti naršyklėje:

- **Mokinys** mato tik savo pažymius, lankomumą ir pastabas.
- **Tėvai** mato tik savo vaikų duomenis.
- **Mokytojas** mato ir rašo tik savo grupių (ir vaduojamų grupių) duomenis. Vaduojantis mokytojas rašyti gali tik pavadavimo dienomis.
- **Klasės vadovas** mato savo klasės mokinių duomenis ir raktus, gali pateisinti praleistas pamokas.
- **Pusmečio pažymius** galima įrašyti tik tada, kai administratorius pradėjo to laikotarpio vertinimą.
- Mokytojas negali pasikeisti savo vaidmens ar grupės vertinimo sistemos — tai saugo trigeriai.
- **Administratorius** gali viską.

## Vietinis paleidimas

Dėl naršyklės apribojimų atidarykite per vietinį serverį, ne dukart spustelėję failą:
```bash
python3 -m http.server 8000
# atidarykite http://localhost:8000
```

## Žinomi apribojimai

- Prisijungus įkeliami visi naudotojui matomi duomenys. Mokyklai iki kelių šimtų mokinių tai veikia greitai; didesnei reikėtų įkelti duomenis pagal pasirinktą grupę ir laikotarpį.
- Ištrynus asmenį dienyne, jo prisijungimo paskyra lieka Supabase → Authentication sąraše — ją galima pašalinti ten.
- Nėra integracijų su išorinėmis sistemomis (Mokinių registras, E. sveikata, egzaminų centras).

## Atnaujinimas

Jei duomenų bazę jau buvote sukūrę su ankstesne versija, SQL failą paleiskite dar kartą — jis atnaujins leidžiamas pažymių reikšmes (`atl.`, `pp.`, `np.`), pridės laukelį „Klasės darbas“ ir nieko neištrins.
