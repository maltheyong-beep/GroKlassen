# GroKlassen

**Små handlinger. Stor forskel.** En dansk undervisningsprototype til Business Mind Programme 2026.

Elever registrerer grønne handlinger. Læreren godkender, og klassens fælles plante vokser. Klassen arbejder mod et ugemål uden individuelle elevprofiler eller ranglister.

## Indhold

- **Klassen:** ni grønne handlinger, fem plantestadier, dagligt loft, ugemål, otteugers historik, klasseliga, ventende handlinger og en tydeligt fiktiv Klasse-Cup.
- **For skoler:** værditilbud, roller, prishypoteser, interaktiv økonomiberegner, ni Business Model Canvas-felter, mulige partnere, alternativer, bæredygtighed og næste skridt.
- **Lærer:** godkend/afvis enkeltvis eller samlet, historiske indsendelser, redigering af ugemål, printvenlig ugerapport og Excel-venlig CSV.
- **Præsentation:** seks pitch-trin med piletaster og en printvenlig A4-oversigt.
- **Design:** animeret SVG-plante, kortanimation, talovergange, mørkt tema, reduceret animation og mobiltilpasning.

## Kør lokalt

Intet build og ingen pakkeinstallation er nødvendig. Brug en almindelig statisk webserver, fx `python3 -m http.server 8000`, og åbn den viste lokale adresse. Åbn ikke HTML-filen direkte via `file://`, da appen bruger ES-moduler og service worker.

## GitHub Pages

I repositoryets **Settings → Pages**, vælg **Deploy from a branch**, derefter **main / (root)** og **Save**. Appen bruger relative stier og fungerer under et repository-præfiks. Filen `.nojekyll` holder publiceringen enkel. Der er ingen server, API-nøgler eller runtime-hemmeligheder.

`qr.svg` peger på projektets GitHub Pages-adresse. Hvis repository eller ejer ændres, skal QR-koden opdateres. Den printede webadresse hentes fra den aktuelle side.

## Demo og egne data

Første besøg viser **tydeligt markerede, fiktive demo-data**, så idéen kan afprøves. Vælg **Afslut demo** for egne klassedata. Demoen kan nulstilles uden at ændre egne data. Begge tilstande har separate localStorage-nøgler:

- `groklassen.own.v1`
- `groklassen.demo.v1`
- `groklassen.ui.v1` (klasse, tilstand og tema)

Demoens datoer regnes relativt til dens oprettelsesdag. **Nulstil demo** flytter eksemplerne til den aktuelle dato. Alle point og miljøtal beregnes fra indsendelser, ikke fra uafhængige tællere. Rydning af browserdata sletter også appdata. Ved utilgængelig eller fuld browserlagring vises en advarsel; appen kan fortsat fungere i hukommelsen i den aktuelle session. Ulæselige data overskrives ikke automatisk.

**Data synkroniseres ikke mellem enheder.** Eleven og læreren skal bruge den samme browser til denne prototype. Ingen elevnavne, e-mails eller individuelle profiler registreres. Lærerområdets lås er en lokal prototypebarriere og kan omgås; det er ikke reel adgangskontrol.

Det nye repository og den oprindelige side har forskellige webadresser og dermed separat browserlagring. Den oprindelige sides data overføres ikke automatisk og ændres ikke af dette projekt.

## Pointregler

Afventende og godkendte handlinger reserverer tilsammen højst **15 point pr. klasse pr. kalenderdag**. Afvisning frigiver reservationen. Kun godkendte indsendelser tæller i totaler, plante, grafer og liga. Sen godkendelse kontrolleres mod indsendelsesdagens loft og føres i indsendelsesugens historik og eventuelle konkurrenceperiode. Indsendelsestid og behandlingstid gemmes hver for sig.

Datoer bruger **Europe/Copenhagen**. Uger bruger ISO-ugenumre inklusive ugeår. Ugentlig liga starter forfra hver mandag, mens historikken bevares. Ved samme score deles placeringen. Stadierne begynder ved 0, 30, 80, 140 og 180 point. Ugentlig fejring registreres én gang pr. klasse og uge.

Cup-perioden er et **fiktivt eksempel 2.–29. november 2026**. Perioden konfigureres i `core.js`. Den skifter automatisk mellem kommende, aktiv og afsluttet. Præmien er kun et eksempel uden sponsor.

## Økonomi og kildegrundlag

Alle priser og scenarier er hypoteser, ikke kunder eller aftaler. Standardscenariet har 25 selvstændige licenser, én kommuneaftale med ti særskilte skoler, 150 kr. i variabel omkostning pr. skole og 30.000 kr. i faste omkostninger. Det giver 49.500 kr. i indtægt, 35.250 kr. i omkostninger og 14.250 kr. i resultat. Break-even er 15 selvstændige licenser plus kommuneaftalen. Løn er som standard nul og vises som frivilligt prototypearbejde.

Miljøtallene kommer fra det udleverede projektmateriale. Der er ikke udleveret dokumenterede emissionsfaktorer; tallene mærkes **foreløbigt skøn – ikke faktatjekket**. Et nul for vand betyder, at modellen ikke estimerer en vandbesparelse for handlingen. Ingen resultater må bruges som dokumenteret CO₂-besparelse. Partnernavne er muligheder, ikke samarbejdsaftaler. Pilotforsøget er planlagt og ikke gennemført.

## Offline og tilgængelighed

En lokal service worker cacher appfiler efter første onlinebesøg på HTTPS eller localhost. Opdatér cacheversionen i `sw.js` ved ændringer. Ingen eksterne fonte, CDNs eller analyseværktøjer. Appen bruger semantisk HTML, synlige fokusmarkeringer, native dialoger, skærmlæserbeskeder og tabelalternativer til grafer. Animation følger `prefers-reduced-motion` og pauser, når fanen er skjult.

## Kontrol

Kræver Node.js med ES-moduler og den indbyggede test runner. Kør `npm test` og `npm run check`. Der er ingen npm-afhængigheder. Testene dækker bl.a. dagsloft, afvisning, sene godkendelser, demokonsistens, tidszone, ISO-uger, delt ligaplacering og økonomiberegninger.

## Filer

`index.html` indeholder sider og indhold. `style.css` styrer design, responsivitet og print. `script.js` forbinder UI og lagring. `core.js` indeholder beregningsregler og demodata. `core.test.js` kontrollerer reglerne. `sw.js` håndterer offlinecache. `favicon.svg` og `qr.svg` er lokale billeder.
