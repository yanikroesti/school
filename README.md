# schule.yanikroesti.ch

Schul-Dashboard für **Yanik Rösti** — Elektroinstallateur EFZ, Klasse **ELI 25a**,
BZI Interlaken, 2. Lehrjahr.

Stundenplan, Prüfungen, Hausaufgaben, Material und Noten an einem Ort. Statisches
HTML, **kein Build-Schritt**, keine Abhängigkeiten ausser den Webfonts.

## Aufbau

```
index.html      Kontrollzentrum — was als Nächstes ansteht
tag/            Montag · Freitag
lehrer/         eine Seite je Lehrperson
plan.html       Prüfungen und Hausaufgaben
noten.html      Notenrechner
material.html   Material-Index
assets/         core.css · i18n.js · app.js
data/           timetable · teachers · subjects · seed
logos/          Logos (siehe logos/LOGOS.md)
material/       Dateien, die online liegen sollen
```

## Navigation nach Lehrperson, nicht nach Fach

Montag sind es zwei Lehrpersonen, Freitag drei — und derselbe Fachcode bedeutet bei
verschiedenen Lehrpersonen verschiedenen Stoff (Mosers HTOG ist Elektrotechnik,
Berishas HTOG ist NIN und Arbeitssicherheit). Darum ist die Lehrperson die
Navigationsachse und das **Fach die Farbe**:

| Fach | Farbe |
|---|---|
| ABT | `#f2a03d` |
| HTOG | `#5b9bd5` |
| ATD | `#4fbf87` |
| ABU | `#a97bd6` |
| Sport | `#f2645a` |

Die Farben stehen **zweimal**: in `assets/core.css` (`--s-abt` …) und in
`data/subjects.json` (für SVG und JS). Bei Änderungen **beide** anpassen.

## Woche Gerade / Ungerade

Richtet sich nach der ISO-Kalenderwoche:

- **gerade KW** → ABU 12:50–16:10, **kein Sport**
- **ungerade KW** → ABU 12:50–14:30 + Sport 14:40–16:10

Bestätigt an Montag 17.08.2026 (KW 34, gerade, kein Sport).
Implementiert in `assets/app.js` → `isoWeek()` / `weekKind()`.

## Daten

**Statisch im Repo:** `data/timetable.json`, `teachers.json`, `subjects.json` —
ändert sich selten und gehört versioniert.

**Quelle für den Stundenplan** ist `Stundenplan.md` im Obsidian-Vault
(`Career/Apprenticeship/`), nicht das JSON. Korrekturen dort eintragen.

**Live aus Supabase** (sobald verbunden): Prüfungen, Hausaufgaben, Tagesrückblicke.
Der Anon-Key ist öffentlich, darum darf er nur **lesen** und `homework.done`
umschalten. Alles Schreibende läuft über den Bot mit dem Service-Key.
Bis dahin liefert `data/seed.json` die Startdaten.

## Zweisprachig

`<span lang="de">` / `<span lang="en">` im Markup, CSS blendet die inaktive Sprache aus.
Die Wahl liegt in `localStorage` (`schule-lang`) und gilt für alle Seiten.
Tastenkürzel **Alt + L**. Dazu ein Hell/Dunkel-Umschalter (`schule-theme`), der
standardmässig der Systemeinstellung folgt.

## Lokal ansehen

```bash
python -m http.server 4342
```

Dann <http://localhost:4342> öffnen. Oder in Claude Code die launch.json-Konfiguration
`schule-site` starten.

## Eine Seite hinzufügen

1. HTML nach `lehrer/` oder ins Wurzelverzeichnis legen
2. Kopf und Fusszeile aus `index.html` übernehmen
3. Bei einer neuen Lehrperson: Eintrag in `data/teachers.json` — die Startseite
   erzeugt die Kachel selbst

---

Elektroinstallateur EFZ · ELI 25a · BZI Interlaken.
Gebaut von **Claude** (Opus 5, Anthropic) für Yanik Rösti — 08.2026.
