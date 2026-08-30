---
name: schule.yanikroesti.ch
description: Die Klemmenleiste — der Schultag als Hutschiene, jede Lektion eine beschriftete Reihenklemme darauf.
colors:
  s-abt: "#b35310"
  s-htog: "#1d4e89"
  s-atd: "#2a7049"
  s-abu: "#66459b"
  s-sport: "#b23a2c"
  ground: "#e8eaee"
  plate: "#f6f7f9"
  plate-2: "#eef0f3"
  rail: "#97a1ad"
  rail-2: "#b9c1cb"
  ink: "#14181d"
  ink-2: "#39414d"
  muted: "#596371"
  faint: "#69727f"
  line: "#d2d7de"
  line-2: "#bcc3cd"
  accent: "#14181d"
  live: "#1d7a4d"
  live-ink: "#155a39"
  warn: "#a8620c"
  warn-ink: "#8a5009"
  alert: "#b02a1e"
typography:
  display:
    fontFamily: "Archivo, 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Archivo, 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Archivo, 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Archivo, 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.02em"
  data:
    fontFamily: "'Azeret Mono', ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.03em"
    fontFeature: "tabular-nums"
  data-lead:
    fontFamily: "'Azeret Mono', ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.03em"
    fontFeature: "tabular-nums"
  data-small:
    fontFamily: "'Azeret Mono', ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0.01em"
    fontFeature: "tabular-nums"
rounded:
  r-s: "2px"
  r: "3px"
  r-l: "4px"
  pill: "999px"
spacing:
  pitch: "0.5rem"
  block: "1rem"
  head: "1.75rem"
  sect: "2.5rem"
  foot: "3rem"
  strip: "4.5rem"
  wrap: "1120px"
components:
  terminal:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    height: "3.1rem"
    padding: "0.6rem 0.85rem"
  terminal-hover:
    backgroundColor: "{colors.plate-2}"
  terminal-lead:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    height: "6.4rem"
  terminal-foot:
    backgroundColor: "{colors.s-htog}"
    textColor: "#ffffff"
    typography: "{typography.data-small}"
    width: "3rem"
    padding: "0.3rem 0.15rem"
  terminal-strip:
    textColor: "{colors.muted}"
    typography: "{typography.data-small}"
    width: "4.5rem"
  panel:
    backgroundColor: "{colors.plate}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r}"
    padding: "0.95rem"
  panel-head:
    backgroundColor: "{colors.plate-2}"
    textColor: "{colors.ink}"
    padding: "0.7rem 0.95rem"
  nav-link:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.r-s}"
    padding: "0.4rem 0.65rem"
  nav-link-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.plate}"
    rounded: "{rounded.r-s}"
  segmented-button:
    textColor: "{colors.muted}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.62rem"
    typography: "{typography.data-small}"
  segmented-button-active:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.plate}"
  icon-button:
    textColor: "{colors.muted}"
    rounded: "{rounded.r}"
    size: "30px"
  tiny-button:
    textColor: "{colors.muted}"
    rounded: "{rounded.r-s}"
    padding: "0.34rem 0.7rem"
  mark:
    backgroundColor: "{colors.s-htog}"
    textColor: "#ffffff"
    rounded: "{rounded.r-s}"
    padding: "0.1rem 0.36rem"
    typography: "{typography.data-small}"
  grade-input:
    backgroundColor: "{colors.plate-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r-s}"
    width: "3.2rem"
    height: "24px"
---

# Design System: schule.yanikroesti.ch

## Overview

**Creative North Star: "Die Klemmenleiste"**

Die Welt ist eine Hutschiene im Verteilkasten. Der Schultag ist die Schiene, jede Lektion
eine Reihenklemme darauf: gleiches Rastermass, beschriftetes Markierungsschild, farbiger
Fuss. Das ist keine Metapher zur Zierde, sondern das tragende Ordnungsprinzip — die
Bauteile bilden echte Tatsachen ab. Der Querbrücker verbindet zwei Klemmen, weil zwei
Lektionen wirklich dieselbe Lehrperson haben; die Trennplatte steht dort, wo die
Lehrperson wirklich wechselt; die leere Schiene steht dort, wo im BZI-Kalender wirklich
Ferien sind. Wer ein Bauteil setzt, ohne dass die Tatsache dahinter existiert, hat die
Welt gebrochen, nicht dekoriert.

Die Seite verweigert bewusst zwei Voreinstellungen ihres Genres: das Kartenraster, in das
jedes Schul-Dashboard fällt, und den cremefarbenen Papiergrund. Statt Papier: kühles
Gehäusegrau (`--ground`) mit einer hellen Montageplatte (`--plate`) darauf. Statt Karten:
eine senkrechte verzinkte Schienenlinie, an der alles klemmt. Die Dichte ist die eines
Werkzeugs, nicht einer Kampagnenseite — feste rem-Stufen, kein `clamp()` auf
Überschriften, enge Zeilen, keine Atempausen aus Dekoration.

Der Nutzungsfall regiert die Form: vier müde Minuten, einhändig, auf dem Telefon, im
Treppenhaus oder im Zug. Deshalb beherrscht eine Klemme die Tafel (`.term.lead`, die
nächste Lektion mit ihrem Countdown), deshalb sind Zeiten und Noten Messwerte in
Tabellenziffern, und deshalb ist Hell die Vorgabe und Dunkel der zweite Fall.

**Key Characteristics:**
- Hutschiene als Struktur, nicht als Bild: Bauteile bedeuten Tatsachen.
- Vollständig flach — null `box-shadow`, null `backdrop-filter`, null Glas.
- Fünf gesättigte Klemmenfarben als Konvention, nie als Schmuck.
- Kleine Radien (2–3 px), wie Polyamid-Gehäuse.
- Eine Schriftfamilie (Archivo); Azeret Mono ausschliesslich für Messwerte.
- Kühles Gehäusegrau statt warmem Papier.
- Zweisprachig DE/EN im Markup, nicht in Templates.

## Colors

Fünf gesättigte Klemmenfarben auf einem kühlen Grau-Gerüst. Die Fachfarben folgen der
Konvention echter Reihenklemmen, wo die Farbe die Funktion nennt — nicht der Ästhetik.

### Primary

- **ABT-Orange** (`--s-abt`): orange = abgesichert/trennbar. Das Fach, in dem alle
  Prüfungen laufen — und damit zugleich die Systemfarbe für „hier ist gerade etwas los":
  Caret-Farbe, Fokusring, aktive Stufe der Gesetzespyramide, aktuelles ABU-Modul,
  fokussierte Noteneingabe, PIN-Symbol und Punkte.
- **HTOG-Blau** (`--s-htog`): blau = Neutralleiter. Das Arbeitspferd unter den Fächern;
  ausserdem die Farbe der Textauswahl (`::selection`, 26 % gemischt).
- **ATD-Grün** (`--s-atd`): grün = Schutzleiter. Dokumentation und Telekom; zusätzlich der
  Haken vor jedem Lernziel (`.goals li::before`).
- **ABU-Violett** (`--s-abu`): violett = Sonderfunktion. Allgemeinbildung; trägt die
  erledigten Segmente des Modulrads.
- **Sport-Rot** (`--s-sport`): rot = geschaltet. Sport.

### Secondary

Zustandsfarben. Sie sagen, wie es um eine Sache steht, nie welches Fach sie ist.

- **Läuft-Grün** (`--live` / `--live-ink`): läuft gerade, aktiv, gute Nachricht.
  Rahmen der laufenden Lektion, aktives Lernpaket, die Zusicherung „Noten verlassen das
  Gerät nicht" (`.okbox`).
- **Offen-Ocker** (`--warn` / `--warn-ink`): unbestätigt, geplant, noch offen. Marke
  „Regel offen" (`.unconf`), Panel „Offene Fragen" (`.openbox`), Fälligkeit in 3–6 Tagen.
- **Fällig-Rot** (`--alert`): fällig in ≤ 2 Tagen, ungenügende Note, Bestehensgrenze 4.0,
  Wert ausserhalb 1–6, Fehlermeldung.

### Neutral

- **Gehäuse-Innenseite** (`--ground`): der Seitengrund. Kühl, nicht creme.
- **Montageplatte** (`--plate`): jede Klemme, jedes Panel, Kopf- und Fusszeile.
- **Zweite Ebene** (`--plate-2`): Panelkopf, Hover-Fläche, Code, Skelett, Detailspalte.
- **Verzinkte Schiene** (`--rail` / `--rail-2`): die Schienenlinie selbst, ihre Endhalter,
  die kurzen Stege zu den Klemmen, der Bildlaufleisten-Griff, der neutrale Klemmfuss.
- **Text-Leiter** (`--ink` → `--ink-2` → `--muted` → `--faint`): Titel, Fliesstext,
  Sekundärangaben, Durchgestrichenes. Vier Stufen, keine fünfte.
- **Linien** (`--line` / `--line-2`): Trennlinien und Bauteilkanten. `--line-2` ist die
  sichtbare Kante eines Objekts, `--line` die Trennung innerhalb eines Objekts.
- **Aktion** (`--accent`): primäre Aktion und aktive Auswahl. Im Hellmodus identisch mit
  `--ink`, im Dunkelmodus mit dem hellen Text — die Auswahl ist immer die Umkehrung des
  Grundes.

### Named Rules

**The Two-Place Mirror Rule.** Die fünf Fachfarben stehen an **zwei** Orten: in
`assets/core.css` als `--s-*` und in `data/subjects.json` als `color`. Wer eine Farbe
ändert, ändert beide. Ein Ort allein ist immer falsch — CSS färbt die Klemmen, JSON färbt
das, was JS und SVG selbst zeichnen.

**The Class-Not-Inline Rule.** Fachfarbe kommt ausschliesslich über die Klasse
`s-<fach>` (`s-abt`, `s-htog`, `s-atd`, `s-abu`, `s-sport`, plus `s-neutral` für Klemmen
ohne Fach). Nie als Inline-Wert, nie als hartes Hex im Markup: Der Inline-Wert ist der
Hellmodus-Wert und gewinnt gegen den Dunkelmodus, wo die Farbe aufgehellt sein muss.
`rail.js` setzt die Klasse, die Klasse setzt `--c`, alles andere liest `var(--c)`.

**The Two-Token Tint Rule.** Getönte Flächen brauchen zwei Token: `--warn`/`--live` für
**Fläche und Rahmen**, `--warn-ink`/`--live-ink` für **Schrift auf dieser Fläche**. Die
Flächenfarbe trägt als Text nicht: gemessen 3.69:1 und 4.10:1, bevor sie geteilt wurde.
Im Dunkelmodus sind beide Token identisch — dort ist die Aufhellung schon geschehen.

**The Inversion Rule.** Im Dunkelmodus kehrt Schrift auf farbigem Grund um: nicht Weiss,
sondern `var(--ground)`. Die aufgehellten Fachfarben tragen weisse Schrift nur mit
2.87–3.51:1; dunkle Tinte darauf trägt 5.30–6.47:1. Betrifft `.term > .fuss`, `.mark`,
`.pin-ico` und den Text der aktiven Stufe (`.tier.on .tl`, `.tier.on .ts`) in der
Gesetzespyramide. Jede neue farbig gefüllte Fläche mit Text braucht dieselbe Umkehr.

**The Border-Carries-Colour Rule.** Wo eine Marke Fachfarbe zeigen soll, aber selbst nicht
gefüllt ist, trägt der **Rahmen** die Farbe und die Schrift den Kontrast (`--ink-2`).
So bei `.badge` und `.rad-legend .badge2`: ABT-Orange als Text schaffte nur 4.19:1.

## Typography

**Display / Body Font:** Archivo (Fallback: Helvetica Neue, Helvetica, Arial, system-ui)
**Data Font:** Azeret Mono (Fallback: ui-monospace, SF Mono, Consolas)

**Character:** Eine schweizerisch nüchterne Grotesk für alles, mit einer technischen
Monospace, die ausschliesslich Messwerte trägt. Die Mono ist kein technisches Kostüm — sie
erscheint genau dort, wo eine Zahl gemessen ist, und nirgends sonst. Überschriften stehen
auf festen rem-Stufen (Verhältnis ~1.15–1.2) mit leicht negativer Laufweite
(-0.015em); kein `clamp()` auf Schriftgrössen, `clamp()` existiert im ganzen Projekt nur
einmal, für den seitlichen Innenabstand von `.wrap`.

### Hierarchy

- **Display** (700, 1.875 rem / `--t-2xl`, lh 1.2): Seitentitel — `.board h1`, `.phead h1`.
- **Headline** (700, 1.5 rem / `--t-xl`, lh 1.2): `h2`; ausserdem der Titel der
  dominanten Klemme (`.term.lead .tt`).
- **Title** (700, 1.25 rem / `--t-l`): `h3` und Abschnittsüberschriften (`.sect-h h2`).
- **Subtitle** (700, 1.0625 rem / `--t-m`): `h4`, Tagesüberschriften, Vorspann `.phead .lead`.
- **Body** (400, 0.9375 rem / `--t-b`, lh 1.55): Fliesstext, Klemmentitel `.term .tt` (600).
  Zeilenlänge gedeckelt auf 68ch (`.panel > .pb > p`, `.topic > .pb > p`, `.phead .lead`).
- **Small** (400, 0.8125 rem / `--t-s`): Sekundärzeile `.term .sub`, Tabellen, Listen.
- **Label** (600–700, 0.75 rem / `--t-xs`): Spaltenköpfe, Zähler, Fusszeilen-Titel.
- **Micro-Label** (600, 0.6875 rem, +0.05em, Versalien): nur die Trennplatten-Beschriftung
  (`.part a`) und die kleinen Marken. Die einzige Stelle mit Versalien im System.
- **Data** (600, 1.0625 rem / `--t-m`, Azeret Mono, tabular-nums, -0.03em): Messwerte —
  `.term .val`, Kennzahlen, abgeleitete Zeugnisnoten.
- **Data-Lead** (700, 2.5 rem / `--t-3xl`): der Countdown der nächsten Lektion. Die
  grösste Type der Seite ist eine Zahl, keine Überschrift.

### Named Rules

**The Measured-Values-Only Rule.** Azeret Mono (`--f-data`) erscheint ausschliesslich an
Messwerten: Uhrzeiten, Datumsangaben, Countdown, Noten, Raum- und Klemmennummern,
Kalenderwochen, SR-Nummern. Nie an Fliesstext, nie an Überschriften, nie als Stilmittel.
Wo sie steht, steht `font-variant-numeric: tabular-nums` dazu — Ziffern müssen zwischen
zwei Renderings an derselben Stelle bleiben.

**The No-Kicker Rule.** Über einer Überschrift steht nichts. Kein Kicker, kein Eyebrow,
keine Kategorie in Versalien. Die Einordnung steht rechts als Datenzeile (`.phead .meta`,
`.board .id`) und ist damit Information statt Anlauf.

**The Fixed-Steps Rule.** Acht rem-Stufen, `--t-xs` bis `--t-3xl`. Neue Grössen werden aus
diesen Stufen genommen, nicht erfunden, und Überschriften skalieren nicht mit dem
Viewport. Das hier ist ein Werkzeug, keine Kampagnenseite.

## Layout

Eine zentrierte Spalte von maximal 1120 px (`--wrap`) mit einem viewportabhängigen
Seitenrand (`clamp(0.9rem, 3.5vw, 1.75rem)`). Darin stapeln sich Abschnitte (`.sect`,
2.5 rem Abstand), jeder mit einem Kopf aus Titel, Zähler und einer Haarlinie darunter
(`.sect-h`).

**Das Rastermass.** Die Schiene (`.rail`) ist eine Spalte mit `padding-left: var(--strip)`
— links davon die Zeitspalte (4.5 rem, gemessen am längsten Label „21.08.", 48 px), rechts
die Klemmen. Zwischen zwei Klemmen liegt genau ein Rastermass (`--pitch`, 0.5 rem). Die
Schienenlinie selbst sitzt als 2-px-Hintergrund in einem 0.8 rem breiten Pseudoelement,
dessen Ober- und Unterkante die Endhalter sind; `.rail.no-cap` nimmt die Endhalter weg,
wenn die Schiene weiterläuft. `.rail.tight` schrumpft die Zeitspalte auf 1.2 rem für
Listen ohne Uhrzeit (Lernpakete, Material), damit dort keine tote Spalte stehen bleibt.

**Die Klemme.** Drei Spalten: farbiger Fuss (`--foot`, 3 rem), Körper (`minmax(0, 1fr)`),
Nebenspalte mit Messwert (`auto`, durch eine Linie abgesetzt). Das Markierungsschild
(`.strip`) sitzt absolut positioniert in der Zeitspalte links ausserhalb.

**Nebeneinander.** Die Schulwoche steht als zwei Schienen nebeneinander
(`.week2`, 2 Spalten, unter 820 px eine). Gesetzespyramide und ABU-Rad teilen sich in
Grafik + Detail (`.pyr-wrap` 1.15fr/1fr, `.rad-wrap` 240px/1fr; unter 860 px gestapelt).
Themenblöcke stapeln bewusst statt zu rastern — sie tragen sehr unterschiedlich viel
Inhalt, und ein Raster gleich hoher Karten wäre eine Lüge über den Inhalt.

**Unter 660 px.** `--strip` fällt auf 3.9 rem, `--foot` auf 2.6 rem. Die Kopfleiste bricht
um: Marke und Werkzeuge in Zeile eins, die Navigation als waagrecht scrollende Zeile
darunter (ohne sichtbare Bildlaufleiste). Die Klemme verliert ihre dritte Spalte — die
Nebenspalte rutscht als volle Zeile unter den Körper, mit Trennlinie oben statt links.

**Grobzeiger** (`@media (pointer: coarse)`): Navigation, Fusszeilen-Links, Segmentschalter
und Textknöpfe bekommen mehr Polsterung, `.iconbtn` wächst von 30 auf 40 px, die
Noteneingaben von 24 auf 34 px. Kein Ziel unter 24 × 24 px — gemessen, null Verstösse.

**Breites Material scrollt in sich.** Die Zeugnistabelle hat `min-width: 640px` und liegt
in `.zeug { overflow-x: auto }`; die Seite selbst scrollt nie waagrecht. Gemessen: null
echter horizontaler Überlauf.

**Ferner:** `@media (prefers-reduced-motion: reduce)` setzt alle Animationen und
Übergänge auf 0.01 ms. Ein Druck-Stylesheet blendet Kopf-, Fusszeile und Bedienelemente
aus und zeichnet Schiene und Klemmen in Graustufen.

## Elevation & Depth

**Es gibt keine Schatten.** Null `box-shadow`, null `drop-shadow`, null
`backdrop-filter` im ganzen Projekt — verifiziert über alle CSS-, HTML- und JS-Dateien.
Ein Verteilkasten wirft keine. Tiefe entsteht ausschliesslich durch drei Mittel:

1. **Linie.** Jedes Objekt hat genau eine sichtbare Kante (`1px solid var(--line-2)`).
   Innerhalb eines Objekts trennt die hellere `--line`.
2. **Ton.** Drei Flächenstufen — `--ground` (Grund) unter `--plate` (Objekt) unter
   `--plate-2` (Kopfzeile, Hover, zweite Ebene innerhalb eines Objekts).
3. **Strichstärke.** Die dominante Klemme wird nicht angehoben, sondern bekommt einen
   2-px-Rahmen in `--ink-2` statt 1 px in `--line-2`.

Auch das Modal macht keine Ausnahme: Die PIN-Sperre verbirgt den Inhalt mit
`visibility: hidden` statt ihn weichzuzeichnen. Der Grund steht im Code — ein
`filter: blur(9px)` löste im Test auf genau diesem Element zu `blur(0px)` auf, und ein
Blur, der scheitert, gibt die Noten vollständig frei. `visibility: hidden` kann nicht halb
misslingen. Nebenbei: Diese Welt hat keine Glasflächen.

### Named Rules

**The Declared-Once Rule.** Erhöhung wird genau einmal erklärt: durch die Linie. Nie
zusätzlich durch Schatten, nie durch Verlauf, nie durch Glas. Wer ein Objekt hervorheben
will, verdickt seine Kante oder wechselt seine Tonstufe.

## Shapes

Kleine Radien wie Polyamid-Gehäuse: `--r-s` 2 px für Marken, Eingaben und den Fokusring,
`--r` 3 px für Klemmen, Panels und Knöpfe, `--r-l` 4 px als Reserve. Der Klemmfuss rundet
nur links (`calc(var(--r) - 1px) 0 0 calc(var(--r) - 1px)`) — innen liegende Ecken sind
immer um 1 px kleiner als die Aussenkante, damit die Rundungen konzentrisch bleiben.

Pillen (`999px`) gibt es an genau drei Stellen, und alle drei sind echte kleine
Bedienelemente: der Sprachschalter, der Wochen-Schalter (`.langswitch`, `.wk-toggle`) und
die PIN-Punkte. Nichts anderes wird rund.

Die wiederkehrende Geometrie ist die Schiene: eine 2-px-Senkrechte mit waagrechten Stegen
von 0.75 rem, die jedes Bauteil ankoppeln (`.term::before`, `.part::before`,
`.bare::before`). Der Querbrücker ist eine 3-px-Senkrechte in Fachfarbe, mittig über dem
Klemmfuss. Die Trennplatte läuft als 1-px-Strichlinie nach rechts aus. Icons sind
durchweg gestrichene SVGs auf 24er-Raster (Strichstärke 1.7–2, 13–21 px gerendert), nie
gefüllte Glyphen und nie Emoji.

## Components

### Klemme (`.term`) — das Signaturbauteil

Eine Lektion, eine Prüfung, eine Hausaufgabe. Kein Kärtchen: ein Bauteil mit vier Teilen.

- **Form:** 3 px Radius, 1 px `--line-2`, Mindesthöhe 3.1 rem, Grund `--plate`.
- **Fuss** (`.fuss`, 3 rem breit): trägt das Fachkürzel in Mono, weiss auf Fachfarbe. Er
  ist beschriftet — das ist der Unterschied zwischen einem Bauteil und einem Zierstreifen.
- **Markierungsschild** (`.strip`): Start fett, Ende darunter, in Tabellenziffern, rechts
  ausgerichtet, ausserhalb der Klemme in der Zeitspalte. Bei Terminen: Datum und
  Wochentagskürzel.
- **Körper** (`.body`): Titel (`.tt`, 600) plus Sekundärzeile (`.sub`) aus Lehrperson,
  Wochenparität und Zustand. Deutsche Komposita bekommen `overflow-wrap: break-word` und
  `hyphens: auto` — Werkstoffkunde, Arbeitssicherheit und Telekommunikation schieben sonst
  über den Rand.
- **Nebenspalte** (`.aside`): der Messwert (`.val`, Mono) plus Raum/Zeitangabe (`.rm`),
  abgesetzt durch eine linke Linie.
- **Zustände:** `.live` (grüner Rahmen, grüner Wert), `.soon` (≤ 2 Tage, roter Wert),
  `.warn` (≤ 6 Tage, ockerner Wert), `.done` (55 % Deckkraft, Titel durchgestrichen),
  `[aria-disabled]` (50 %, keine Zeiger). Interaktive Klemmen (`a.term`, `button.term`)
  wechseln beim Überfahren Rahmen auf `--rail` und Fläche auf `--plate-2`.
- **`.lead`:** die dominante Klemme. 6.4 rem hoch, 2-px-Rahmen in `--ink-2`, Titel auf
  1.5 rem, Wert auf 2.5 rem. Genau eine pro Seite — die Anleihe bei der Abfahrtstafel.

### Querbrücker (`.bridge`)

Sitzt in der Lücke zwischen zwei Klemmen und verbindet sie sichtbar: 3-px-Senkrechte in
Fachfarbe, mittig über dem Klemmfuss, mit auf 0 gesetzten Rasterabständen. **Bedeutung:
zwei aufeinanderfolgende Lektionen derselben Lehrperson.** `rail.js` gibt ihn aus einem
echten Vergleich aus (`l.teacher !== prev`), nicht aus einer Layout-Laune. `aria-hidden`,
weil die Information schon im Text steht.

### Trennplatte (`.part`)

Steht dort, wo die Lehrperson wechselt. Beschriftung links (Micro-Label, Versalien,
`--muted`), gestrichelte Platte nach rechts auslaufend, kurzer Steg zur Schiene. Sie ist
zugleich die Navigation: die Beschriftung ist der Link auf `lehrer/<id>.html`, mit
mindestens 24 px Höhe (32 px bei Grobzeiger). Ein Bauteil, zwei Aufgaben — Gliederung und
Weg.

### Leere Schiene (`.bare`)

Ferien, Feiertag, Schulschliessung, nichts fällig. Ein blanker Schienensteg mit fettem
Titel und erklärender Zeile, statt eines leeren Kastens. Sie liest den echten
BZI-Kalender (`data/calendar.json` über `S.freeDay`) und nennt Name und Rückkehrdatum.
**Leer heisst hier nie „nichts da", sondern immer „das hier ist der Grund".**

### Panel (`.panel`)

Ruhige Fläche für Tabellen und Text. `--plate` mit 1 px `--line-2` und 3 px Radius,
optionaler Kopf (`.ph`, `--plate-2`, 600, `--t-s`) und Körper (`.pb`, 0.95 rem).
Varianten: `.openbox` (ockerner Rahmen und Kopf — Unbestätigtes), `.okbox` (grüner Rahmen
und Kopf — gute Nachricht), `.topic` (Themenblock mit linksbündigem Kopf).
**Keine Karte in der Karte:** Lernziele (`.goals`) sitzen im Panel und trennen sich nur
durch eine Linie ab, nicht durch einen zweiten Rahmen.

### Marken

- **`.mark`:** Fachkürzel als kleine Marke — nur dort, wo kein Klemmfuss zur Verfügung
  steht. Mono, weiss auf Fachfarbe, 2 px Radius. Folgt der Inversionsregel.
- **`.unconf` „Regel offen":** ockerne Schrift (`--warn-ink`) auf gemischtem Rahmen, mit
  einem 5-px-Punkt davor. Unbekannt ist ein Zustand, kein leeres Feld.
- **`.lp-state`:** Lernpaket-Status, Mono, Rahmen `--line-2`; `.aktiv` grün, `.geplant`
  ocker. Steht in `core.css` und nicht im `<style>` einer Seite, weil `lernpakete.js` ihn
  auch auf den Lehrerseiten rendert — dasselbe Bauteil darf nicht an zwei Orten
  verschieden aussehen.
- **`.badge` / `.badge2`:** Rahmen in Fachfarbe, Schrift in `--ink-2`.
- **`.wk` / `.kwtag`:** Kalenderwochen-Kennzeichnung, Mono, neutraler Rahmen.

### Kopfleiste (`.topbar`)

Klebend, `--plate`, eine Haarlinie unten, kein Glas, kein Schatten, 54 px hoch. Marke
links (das Zeichen ist ein Schienenstück mit zwei Klemmen darauf, als 24er-SVG), Navigation
rechts, Werkzeuge ganz rechts. Aktive Seite: `--accent` gefüllt, `--plate` Schrift.
Auf allen Seiten ausser der Startseite hängt `Shell.mount()` sie nach dem Datenladen ein.

### Segmentschalter (`.langswitch`, `.wk-toggle`)

Zwei Knöpfe in einer Pille, Mono, `--muted`; der gedrückte (`aria-pressed="true"`)
invertiert auf `--accent`. Das ist die einzige Stelle, an der die Welt rund wird.

### Knöpfe

- **`.iconbtn`:** 30 × 30 px (40 bei Grobzeiger), 3 px Radius, Rahmen `--line-2`,
  transparente Fläche, 15-px-SVG.
- **`.tinybtn`:** kleiner Textknopf für Sperren, PIN ändern, „ohne PIN weiter". 2 px
  Radius, `--t-xs`, Rahmen `--line-2`.
- **`.addbtn`:** gestrichelter Rahmen, 56 × 46 px — das einzige gestrichelte Bedienelement,
  weil es einen noch leeren Platz eröffnet.

### Eingaben

Noten sind Messwerte, also sind ihre Felder Zifferfelder: Mono, tabular, zentriert, 600.
In der Zeugnistabelle (`.ztab input`) rahmenlos bis zum Überfahren, mit `--plate-2` als
Füllung sobald ein Wert drinsteht, und `--s-abt` als Fokusrahmen. Im ABT-Rechner
(`.slot input`) als 56 × 46-px-Feld mit eigener Beschriftung darunter. `:out-of-range`
(ausserhalb 1–6) färbt Rahmen, Fläche und Ziffer rot — ein nicht gezählter Wert darf nicht
aussehen, als wäre er angekommen. Mindesthöhe 24 px, bei Grobzeiger 34 px.

### Tabellen (`.tbl`, `.ztab`)

Kopfzeile in `--muted`, `--t-xs`, 600, Unterlinie `--line-2`; Zeilen durch `--line`
getrennt, letzte Zeile ohne. Zahlenspalten (`.num`, `td.derived`) in Mono mit
Tabellenziffern, rechts- bzw. zentriert ausgerichtet. Gruppenzeilen auf `--plate-2`, die
laufende Zeile mit 12 % ABT-Orange hinterlegt. Notenfarben: `--live-ink` ab 4.75,
neutral ab 4.0, `--alert` unter 3.5. Die 4.0-Grenze ist überall sichtbar statt gedacht —
auch als gestrichelte Linie im Verlaufsdiagramm (`.chart .pass`).

### Gesetzespyramide (`.tier`)

Vier SVG-Stufen, ruhend `--plate-2` mit `--line-2`-Kontur, beim Überfahren 22 % ABT,
ausgewählt voll ABT. Beschriftung in Archivo (14 px, 700), Zusatz in Mono (10 px).
Fokus: `stroke: var(--ink)` mit 2.4 px, kein Ring. Der Text der aktiven Stufe folgt der
Inversionsregel — gemessen von 2.87:1 auf 6.47:1.

### ABU-Modulrad (`.arc`)

Elf Bögen auf einem 240er-Kreis, 17 px stark (aktuell 22 px). `.done` in ABU-Violett,
`.cur` in ABT-Orange, `.todo` in `--line-2`. **Die Modulnummer steht auf dem Segment,
also richtet sich ihre Farbe nach dessen Füllung:** auf `done`/`cur` `--plate`, auf dem
blassen `todo`-Segment `--ink-2`. Hell auf `todo` trug 1.66:1; die zustandsabhängige
Klasse hob das auf 5.35:1. Weil die Füllung ein Token ist, kippt sie im Dunkelmodus von
selbst mit. Kein `role="button"`, kein `tabindex` — es gibt keinen Klick-Handler, und elf
tote Tabulator-Halte versprächen eine Bedienung, die es nicht gibt. Die Legende darunter
ist die Liste; `.done` wird dort über `--muted` zurückgenommen, nie über `opacity`.

### PIN-Sperre (`.pinwrap`, `.pinbox`)

Der einzige Ort, an dem ein Modal richtig ist: Die Sperre braucht geschützten Fokus, sonst
ist sie keine. 78 % `--ground` über dem Inhalt, Kasten aus `--plate` mit 3 px Radius,
maximal 330 px. Quadratisches ABT-Symbol (42 px, folgt der Inversionsregel), vier Punkte
als Pillen, die sich bei Eingabe füllen, Fehlerzeile in `--alert`, Fehleingabe schüttelt
den Kasten (bei `prefers-reduced-motion` nicht).

### Ladezustand und Fehler

`.skel` ist ein Skelett in Klemmenform (gleiche 3.1 rem Mindesthöhe) mit einem 1.3-s-Sweep
— kein Kreisel, weil ein Kreisel nicht sagt, was kommt. `.err` ist ein Kasten mit 7 %
Alert-Fläche und fettem Titel.

### Browser-Oberflächen

Auswahl, Cursor, Bildlaufleiste und Fokusring gehören zum Entwurf, nicht zum Browser:
`::selection` 26 % HTOG-Blau, `caret-color` ABT-Orange, Bildlaufleiste 11 px mit
`--rail-2`-Griff und 3-px-Rand in Grundfarbe (kantig, kein Radius), `:focus-visible`
2 px ABT-Orange mit 2 px Versatz auf allen fokussierbaren Elementen,
`text-underline-offset: 0.22em` auf allen Links.

## Wochenraster — dieselbe Schiene, um 90 Grad gedreht

Die Monatsansicht ist der Überblick. Das Wochenraster ist die Werkbank: nur hier
gibt es eine Zeitachse, und nur an einer Zeitachse lässt sich ziehen.

**Die Welt bleibt dieselbe.** Sieben senkrechte Hutschienen, eine je Tag. Jede
Spalte trägt links ihre Schiene (`border-left: 2px var(--rail-2)`), die Klemmen
sitzen darauf, an der Stelle ihrer Uhrzeit. Der farbige Fuss wandert von links
neben die Klemme an ihre linke Kante — dieselbe Funktion, dieselbe Farbe, nur
gedreht.

**Geometrie.** Eine Minute ist 0.85 px. Die Stundenlinien kommen aus einem
`repeating-linear-gradient` mit `--stunde-h` (60 × 0.85 = 51 px), von JavaScript
gesetzt, damit CSS und Rechnung nicht auseinanderlaufen können. Der Ausschnitt
ist standardmässig 07:00–18:00 und zieht sich auf, sobald etwas davor oder
danach liegt — ein Termin, den man nicht sieht, ist schlimmer als ein etwas
höheres Raster.

**Was sich anfassen lässt, und was nicht.**

| | ziehen | verschieben | verlängern |
|---|---|---|---|
| Eigener Termin | ✅ | ✅ auch auf einen anderen Tag | ✅ Unterkante |
| Lektion | ✕ | ✕ | ✕ |

Lektionen sitzen fest, weil ihre Quelle `Stundenplan.md` ist. Wer sie
verschieben könnte, würde glauben, damit den Stundenplan zu ändern — er ändert
nur die Anzeige, und beim nächsten Laden wäre alles wie vorher. Eine Bedienung,
die etwas verspricht, was sie nicht hält, ist schlechter als keine.

**Überschneidungen** teilen sich die Breite über eine gierige Spurzuteilung:
jeder Termin nimmt die erste Spur, die zu seiner Zeit frei ist.

**Mindesthöhe 20 px.** Eine 15-Minuten-Klemme wäre bei 0.85 px/min nur 12.75 px
hoch und mit dem Finger nicht mehr zu treffen. Die Höhe erzählt für die
kürzesten Termine dadurch etwas zu viel — das ist der bessere Fehler. Beim
Ganztagsband gilt das nicht: dort sagt die Höhe ohnehin nichts über Dauer, also
gibt es keinen Grund, unter 24 px zu gehen.

### Warum am Handy nicht gezogen wird

Auf Geräten ohne Maus legt ein Tipp 45 Minuten an; gezogen wird nicht. Zum
Ziehen müsste das Raster das senkrechte Wischen abfangen (`touch-action: none`),
und dann liesse sich die Seite in diesem Bereich nicht mehr scrollen. Eine
Bedienung, die das Scrollen kaputtmacht, ist schlechter als eine ohne Ziehen.
Der Griff zum Verlängern wird auf groben Zeigern gar nicht erst gerendert.

### Farbe als Funktion, auch bei Google

Googles Farbtöpfe sind eine feste Liste von elf. Die Zuordnung hält die
Klemmenfarben so nah wie möglich: ABT → Tangerine, HTOG → Blueberry,
ATD → Basil, ABU → Grape, Sport → Tomato.

### Zwei Fehler, die die Prüfung fand

**Die Wochenend-Kürzel standen in `--rail`** — der Schienenfarbe — und kamen auf
2.44:1. Eine Bauteilfarbe als Schriftfarbe geht fast nie gut aus. Das Wochenende
trägt jetzt der Grund, nicht die Schrift.

**`.spalte.we` war totes CSS**: die Regel stand da, die Klasse wurde nie gesetzt.
Beim Beheben des ersten Fehlers fiel auf, dass sie gebraucht wird.

---

## Bericht für den Lehrbetrieb

`lehrmeister.html` ist kein zweites Dashboard, sondern ein **Bericht**. Andere
Leserschaft, andere Haltung: wer ihn öffnet, ist nicht Yanik, sondern jemand,
der in dreissig Sekunden wissen will, ob es läuft, und danach die Zahlen
dahinter sehen möchte. Kein Countdown, kein Betrieb, keine Bedienung ausser dem
Nötigen.

Dieselbe Welt, ruhiger eingestellt: derselbe Grund, dieselben Klemmenfarben in
der Tabelle und an den Prüfungen, dieselben flachen Kanten. Was fehlt, sind
Schiene und Klemme als tragende Form — ein Bericht ist ein Blatt, keine Werkbank.

### Die Regel, die diese Seite trägt: was fehlt, wird nicht gezeigt

Kein Strich, kein leerer Kasten, kein «noch keine Daten». Eine Kennzahl ohne
Wert wird nicht gerendert. Eine Tabellenzeile ohne einen einzigen Wert
verschwindet. Ein Abschnitt ohne Inhalt wird ausgeblendet. Der Verlauf erscheint
erst ab zwei Semestern — eine Linie durch einen Punkt ist kein Verlauf.

Der Grund ist nicht Kosmetik: ein Bericht mit Lücken sieht nachlässig aus, ein
kürzerer Bericht nicht. Die Seite wächst mit den Daten, statt von Anfang an
löchrig zu wirken.

**Ausnahme, und sie ist wichtig:** Sport ohne Note ist keine Lücke, sondern
**besucht**. Das ist der Fachausdruck aus dem Zeugnis. Eine leere Zelle wäre
dort schlicht falsch.

### Die Achse beginnt bei 4.0

Nicht bei 1.0, und das ist keine Schönfärberei: 4.0 ist die Grenze zwischen
genügend und ungenügend, und um sie geht es. Die Linie ist gestrichelt und
rot — dieselbe Farbe, die im Schema «geschaltet» heisst. Fällt ein Wert
darunter, zieht sich die Achse selbsttätig nach unten, damit nichts aus dem
Bild rutscht. Die Beschriftung nennt die Grenze ausdrücklich.

### Ein Knoten je Stelle, nicht je Reihe

Im 2. Semester sind Gesamt und Allgemeinbildung beide 5.00. Zwei Punkte lagen
dort exakt übereinander: der untere unsichtbar, nicht anklickbar, als Ziel im
Abstand null. Gezeichnet wird deshalb **ein Knoten je (Semester, Wert)**, und
die Ablesung nennt alle Reihen, die ihn teilen. Ein geteilter Wert ist genau
das — eine Stelle, an der zwei Linien zusammenlaufen. Ein Knoten mehrerer
Reihen trägt keine Reihenfarbe, sondern die neutrale: er gehört keiner allein.

### Auf dem Handy ist das Diagramm ein Bild

Bei 375 px staucht sich das Diagramm auf etwa 43 Prozent. Zwei Noten, die 0.13
auseinanderliegen — 4.88 und 4.75 —, sind dann sechs Pixel voneinander entfernt.
Das trifft kein Finger, und grösser geht es nicht, ohne die Achse zu strecken,
bis sie lügt.

Dort verlieren die Punkte deshalb ihre Anfassbarkeit: kein `tabindex`, keine
Trefferfläche. Stattdessen trägt das SVG eine Beschriftung, die **jeden Wert
ausspricht**, und die Zahlen stehen ohnehin in der Tabelle direkt darunter.
Ein Ziel, das zu klein ist, um getroffen zu werden, ist schlechter als gar
keines — solange die Information anderswo vollständig dasteht.

---

## Die Kopfleiste auf schmalen Schirmen

Gemessen am 26.08.2026: Marke (136), Verteiler (30), Zeitzone (104), Sprache
(88), Hell/Dunkel (40), dazu Polster und Lücken — **456 px auf 375 px Schirm.**
Sie brach in zwei Zeilen um und ass 96 Pixel Höhe.

Ausgeräumt in drei Schritten, in dieser Reihenfolge:

1. **Die Reiter wandern in den Verteiler.** Fünf Seiten nebeneinander sind auf
   einem Telefon ohnehin eine waagrechte Scrollleiste — untereinander in einer
   Liste sind sie lesbar und treffbar.
2. **Die Zeitzone wandert mit.** Sie ist eine Einstellung, die man einmal setzt,
   und stand oben nur im Weg. Dass sie überhaupt in der Kopfleiste sass, war
   eine Fehleinschätzung von der Woche davor.
3. **Das Klassenkürzel entfällt** unter 480 px. Die Klasse steht auf jeder Seite
   im Text.

Ergebnis: **eine Zeile, 54 px**, 280 von 375 px belegt.

Der Verteiler ist damit auf dem Handy die einzige Navigation. Er trägt deshalb
drei Gruppen — *Diese Seite*, *Meine Seiten*, *Zeitzone* —, klemmt sich beim
Öffnen selbst ins Fenster (rein mit CSS nicht zu fassen, weil die Lage des
Knopfs vom Umbruch abhängt) und scrollt bei Bedarf selbst, statt unten
abgeschnitten zu werden.

### Woche als Standard — ausser dort, wo sie nicht lesbar ist

Bei 375 px ist eine Wochenspalte **44 px** breit. Darin wird schon «HTOG»
abgeschnitten, die Uhrzeiten sowieso. Die Wochenansicht bleibt die
Voreinstellung, aber auf schmalen Schirmen beginnt der Kalender im **Tag** —
eine Spalte, 306 px, nichts abgeschnitten. Dieselbe Absicht (die Ansicht, in
der man arbeitet), an den Schirm angepasst. Wählt jemand ausdrücklich anders,
bleibt das gemerkt.

Wer trotzdem die Woche aufruft, bekommt dort die Uhrzeit in der Klemme nicht
mehr angezeigt: sie steht links an der Achse, und die Lage der Klemme sagt sie
ebenfalls. Lieber ein Wert weniger als einer, der abgeschnitten ist.

---

## Lehrmeisterbericht: Lage vor Zahlen

Die Lehrmeisterseite ist kein zweites Noten-Dashboard. Sie beantwortet zuerst
«Was läuft gerade, was steht an, worauf wartet jemand?» und zeigt die Zahlen
danach als Beleg. Deshalb besteht sie aus einem Ereignisstrom und seit
30.08.2026 aus dem **Fachstand**: vier native `details`-Dossiers entlang einer
gemeinsamen Schiene.

Geschlossen trägt jede Zeile nur die Fach-Klemme, Lehrperson, aktuelle Einheit
und den Stand. Offen stehen drei bis vier prüfbare Stichpunkte, ein klarer
nächster Termin und die Vault-Quelle. Das spart eine Kartenwand, funktioniert
ohne JavaScript-Sonderlogik und ist auf dem Handy derselbe Ablauf wie auf dem
Desktop. Die Fachfarbe bleibt eine **Markierung**, nicht die Textfarbe.

Die Daten liegen in `data/agenda.json → fachstand`; die Pflege- und
Quellenregel steht in `Career/Apprenticeship/Lehrmeisterseite — Daten und Aufbau.md`.
Ein geplanter Unterricht wird dort mit `geplant` markiert und nie als bereits
behandelter Stoff ausgegeben.

---

## Do's and Don'ts

### Do:

- **Do** Fachfarbe über die Klasse `s-<fach>` setzen und `var(--c)` lesen — so wie
  `rail.js` es tut.
- **Do** beide Spiegel gleich halten: `--s-*` in `assets/core.css` **und** `color` in
  `data/subjects.json`.
- **Do** `--warn-ink` / `--live-ink` verwenden, sobald die Farbe Schrift ist, und
  `--warn` / `--live` nur für Fläche und Rahmen.
- **Do** bei jeder neuen farbig gefüllten Fläche mit Text die Dunkelmodus-Umkehr
  mitschreiben (`color: var(--ground)` in beiden Dunkel-Blöcken).
- **Do** Azeret Mono nur an Messwerte hängen, immer zusammen mit
  `font-variant-numeric: tabular-nums`.
- **Do** neue Grössen aus den acht rem-Stufen `--t-xs` … `--t-3xl` nehmen.
- **Do** Tiefe durch Linie und Tonstufe erzeugen; zum Hervorheben die Kante verdicken.
- **Do** neue Bauteile aus Schiene, Klemme, Panel und Tabelle bauen — page.css erfindet
  bewusst kein zweites Formenvokabular.
- **Do** breite Inhalte in einen eigenen `overflow-x: auto`-Behälter legen, nie die Seite
  scrollen lassen.
- **Do** jedes Bedienelement auf mindestens 24 × 24 px bringen, bei Grobzeiger auf 32–34 px.
- **Do** einen leeren Zustand erklären (`.bare`), statt ihn zu melden.

### Don't:

- **Don't** eine Fachfarbe inline ins Markup schreiben (`style="background:#b35310"`) —
  der Hellmodus-Wert gewinnt dann gegen den Dunkelmodus.
- **Don't** nur einen der beiden Farborte ändern. `core.css` ohne `subjects.json`
  färbt die Klemmen richtig und die SVGs falsch.
- **Don't** `--warn`, `--live` oder eine Fachfarbe als Textfarbe einsetzen: gemessen
  4.16–4.43:1 (`--warn` auf `--plate-2` / `--plate`) und 4.19:1 (ABT-Orange). *Ausnahme im
  Bestand: `.g-warn` in `noten.html` verwendet noch `--warn`; das ist ein Rest, keine
  Regel — neue Flächen nehmen `--warn-ink`.*
- **Don't** einen `box-shadow`, `drop-shadow` oder `backdrop-filter` einführen. Das
  Projekt hat null davon, und das ist der Entwurf.
- **Don't** Sichtbarkeit über `filter: blur()` schützen — im Test löste sich genau das auf.
- **Don't** eine Karte in eine Karte setzen. Eine Linie trennt innerhalb eines Panels.
- **Don't** einen Kicker, ein Eyebrow oder eine Kategoriezeile über eine Überschrift setzen.
- **Don't** `clamp()` auf Schriftgrössen anwenden — es existiert nur für den Seitenrand.
- **Don't** ein gleichmässiges Kartenraster für ungleich lange Inhalte bauen; stapeln.
- **Don't** Pillen für irgendetwas ausser echten kleinen Schaltern verwenden.
- **Don't** Zustände über `opacity` zurücknehmen, wo eine Textfarbe reicht — Deckkraft
  senkt den Kontrast unvorhersehbar mit.
- **Don't** einem Element `role="button"` oder `tabindex` geben, das keinen Handler hat.
- **Don't** einen Querbrücker oder eine Trennplatte setzen, ohne dass die Tatsache
  dahinter (gleiche bzw. andere Lehrperson) tatsächlich zutrifft. Die Bauteile bedeuten
  etwas; sobald sie lügen, ist die Welt nur noch Dekoration.
