# Bookify
En bokrekomendationsapp med enkelt och engegerande swipegränssnitt.

![Responsive Mockup](https://github.com/Krnsand/booktinder/blob/main/src/assets/amIresponsive.png)

[Live Website](https://bookify-lime-one.vercel.app/)



## Instruktioner om tekniska förberedelser och hur projektet körs
- Förutsättningar
  - Node.js (version 18 eller senare rekommenderas)
  - npm (följer normalt med Node)
  - Ett Supabase-projekt med:
    - Auth aktiverat
    - Databastabeller för användare, bibliotek och preferenser
    - Storage-bucket för avatar-bilder
  - En .env-fil med relevanta Supabase-nycklar
- Installera beroenden Klona projektet och installera alla paket:
  - npm install
- Starta utvecklingsserver:
  - npm run dev
- Öppna sedan adressen som visas i terminalen, t.ex.:
  - http://localhost:5173
- När du sparar filer uppdateras sidan automatiskt (hot reload).

- Konfiguration av miljövariabler Skapa en .env-fil i projektroten (samma nivå som package.json) och fyll i dina egna värden:  
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY

Dessa används i supabaseClient.ts för att koppla appen till rätt backend.

- Test av inloggning och funktionalitet
1. Registrera en ny användare via Register-sidan.
2. Bekräfta e-post enligt instruktionerna från Supabase.
3. Logga in, ladda upp en avatar på Welcome-sidan och spara preferenser på Preferences.
4. Testa att:
   - Swipa böcker på Discover.
   - Spara böcker till biblioteket.
   - Ta bort böcker från Library.
   - Ändra avatar och se att den uppdateras i headern och på Profile.

# Checklista: Krav för G och VG

## G-nivå (MÅSTE)
För att du ska få Godkänt (G) på ditt examensarbete, behöver du uppfylla samtliga kursmål och
krav som nämnts i uppgiften. Här är en översikt av vad du ska uppnå för G:

### Planering & research
- [X] Utföra en noggrann målgruppsanalys
- [X] Använda ett projekthanteringsverktyg för backlog, till exempel Linear, Trello, Jira,
Github projects eller något liknande verktyg, för att strukturera arbetet

### Design & prototyp
- [X] Skapa wireframes och prototyp i Figma som följer UX/UI-principer
- [X] Se till att designen är responsiv för minst två olika skärmstorlekar och följer
WCAG 2.1-standarder.

### Applikationsutveckling
- [X] Utveckla med ett modernt JavaScript-ramverk.
- [X] Använd en databas för lagring och hämtning av data.
- [X] Implementera state-hantering och skapa dynamiska komponenter med
reaktivitet och interaktivitet.
- [X] Följa WCAG 2.1-standarder och använda semantisk HTML.
- [X] För webbapp: Produkten ska vara responsiv och fungera korrekt på minst två
skärmstorlekar, till exempel mobil och dator. Gränssnittet ska anpassa sig för
att ge en användarvänlig upplevelse på båda dessa enheter.
- [X] README-fil med innehåll enligt projektbeskrivningen (info om hur projektet körs,
publik länk, checklista med betygskriterier ni uppfyllt)

### Versionshantering
- [X] GitHub-repo med tydlig commit-historik
- [X] README med installations- och körinstruktioner
- [X] Publik länk + checklista inkluderad i README

### Slutrapport, skriv en 2-3 sidor lång rapport med:
- [X] Abstract på engelska
- [X] Tech stack och motivering av valen
- [X] Dokumentation av arbetsprocess, planering och research

### Deploy
- [X] Ditt projekt ska vara hostat och publikt tillgängligt för att kunna visas i en
webbläsare eller simulator.
- [X] Fungerande publik länk i README

### Övergripande kvalitet
- [X] Inga krascher eller döda länkar
- [X] Enhetligt designsystem
- [X] Komplett navigation och användarflöde


---

## VG-nivå 
För att du ska nå Väl Godkänt (VG) på ditt examensarbete, krävs det att du visar på en djupare
förståelse, professionell kvalitet och avancerade tekniska lösningar. Här är specifika åtgärder
du kan vidta i varje del av projektet för att uppnå detta:

- [X] Allt för Godkänt (G)

### Design & prototyp (VG)
- [X] Interaktiv prototyp i Figma (klickbar)
- [X] Prototypen ska vara väldigt lik den färdiga produkten
- [X] Full WCAG 2.1 nivå A + AA
- [X] Alla WebAIM WAVE-fel och varningar åtgärdade

### Applikationsutveckling (VG)
- [X] Använd en state management-lösning som till exempel Redux eller Pinia för att
hantera global state i applikationen. (React context)
- [X] Koden följer, utan undantag, WCAG 2.1-standarder för nivå A och AA.
  - Testad i verktyget WebAIM WAVE utan fel på error- och varnings-nivåer.
- [X] Optimering - Produkten ska vara optimerad och ha tillräckligt stora filfomrat,
återanvända kod och komponenter samt använda optimeringstekniker där det
behövs.
- [X] Implementera CRUD-operationer, Create, Read, Update, Delete, med säker
hantering av användardata.
- [X] Implementera en säker autentiseringslösning för databasen, till exempel OAuth,
JWT (JSON Web Tokens) eller Firebase Authentication, för att säkerställa att
endast behöriga användare kan få åtkomst till och hantera data. Detta skyddar
användardata genom att verifiera identiteten innan CRUD-operationer tillåts.
- [X] För webbapp: Produkten ska vara fullt responsiv och anpassa sig dynamiskt till
olika skärmstorlekar och enheter, från mobiltelefoner till större skärmar.
Gränssnittet ska ge en optimal användarupplevelse oavsett enhet, med korrekt
layout och funktionalitet för både små och stora skärmar.
- [X] Skriv en tydlig README som inte bara beskriver projektet och hur det körs, men
som också förklarar projektets tekniska val och hur olika funktioner
implementerats

### Versionshantering & arbetsflöde (VG)
- [X] Arbeta med feature branches och gör pull requests innan du mergar till
baskoden för att säkerställa ordning och spårbarhet.
- [X] Dokumentera varje steg i din commit-historik med tydliga och informativa
commit-meddelanden

### Deploy (VG)
- [X] Automatiserat flöde för bygge och deploy av applikationen, där byggprocessen
automatiskt triggar publicering till en produktionsmiljö utan manuell
inblandning, vilket säkerställer effektivitet och kontinuerlig leverans.

### Slutrapport, genomför en djupgående analys i slutrapporten, 3-6 A4 sidor (VG)
- [X] I rapporten, gå igenom varje steg i din arbetsprocess och reflektera över de
utmaningar du stött på. Beskriv hur du överkommit tekniska och
designrelaterade hinder och vad du lärt dig
- [X] Inkludera detaljer om de verktyg och tekniker du använt, och varför du valt dessa
över andra alternativ, till exempel varför du valde React istället för Vue
- [X] Förklara och motivera dina beslut inom UX/UI-design och tillgänglighet, och hur
dessa har förbättrat användarupplevelsen.

### Helhetsupplevelsen (VG)
- [X] Helhetsupplevelsen: Applikationen ska, utöver att uppfylla G-kraven, erbjuda en
professionell och optimerad användarupplevelse med minimala laddningstider, tydlig
återkoppling vid alla användarinteraktioner samt vara testad för enhetlig funktion och
design på flera enheter och webbläsare.

![Lighthouse overall score](https://github.com/Krnsand/booktinder/blob/main/src/assets/Lighthouse.png)

De sista procenten på Lighthouse är på grund av bildstorlekar på bokomslagen som hämtas från Google Books API, jag kan ej påverka dessa. Det är också en del nätverkstörningar som gör laddningarna långsammare.

![WAVE results](https://github.com/Krnsand/booktinder/blob/main/src/assets/Wave.png)