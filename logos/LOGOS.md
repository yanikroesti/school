# Logos

## ✅ Geliefert am 15.08.2026 — alle vier da, alles eingebaut

| Datei | Format | Wo eingebaut |
|---|---|---|
| `bzi.svg` | SVG, weisse Flächen | Fusszeile |
| `etavis.png` | PNG RGBA, 2156×449 | Fusszeile |
| `ElectroSuisse.png` | PNG RGBA, 1024×580 | Fusszeile |
| `suva.png` | PNG RGBA, 5000×1254 | Fusszeile |

Alle mit transparentem Hintergrund — genau richtig.

### Wie sie dargestellt werden

Die vier passen farblich nicht zusammen: **bzi.svg ist weiss**, Etavis und Electrosuisse
sind **dunkel**, Suva liegt dazwischen. Damit wäre in jedem Theme mindestens eines
unsichtbar gewesen — weiss auf hell, dunkel auf dunkel.

Lösung in `assets/core.css`: `filter: brightness(0)` macht jedes Logo zu einer flachen
Silhouette (die Transparenz bleibt erhalten), im Dunkelmodus kommt `invert(1)` dazu.
So stimmt der Kontrast überall, und die Leiste wirkt einheitlich statt zusammengewürfelt.

**Willst du eine Marke in Originalfarbe** (z. B. das rote Suva), setz im HTML die Klasse
`keep-color` auf den umschliessenden Link:

```html
<a class="keep-color" href="https://www.suva.ch">…</a>
```

Sag Bescheid, wenn dir monochrom nicht gefällt — ist eine Zeile.

---

## Optional, falls du noch drankommst

| Datei | Wofür |
|---|---|
| `eit-swiss.svg` | EIT.swiss — Branchenverband, Normen |
| `esti.svg` | ESTI — Eidgenössisches Starkstrominspektorat |
| `sbfi.svg` | SBFI — für die ABU-/Bildungsseiten |

## Was ich **nicht** brauche

Fach-Icons, Lehrpersonen-Symbole, die Gesetzespyramide, das ABU-Modulrad und der
Semester-Zeitstrahl sind **selbst gezeichnete Inline-SVGs**. Da ist nichts zu liefern.

## Hinweise

- **SVG schlägt PNG.** Bleibt bei jeder Grösse scharf und ist ein Bruchteil so gross.
- **Transparenter Hintergrund**, kein weisser Kasten — die Seite hat einen Hell- und einen
  Dunkelmodus. Ein Logo auf weissem Kasten sieht im Dunkelmodus kaputt aus.
- Falls du nur eine Version mit dunkler Schrift hast: sag Bescheid, dann lege ich für den
  Dunkelmodus einen Filter drüber.
- Falls ein Logo nicht auftreibbar ist: auch gut. Ich setze dann eine selbst gesetzte
  Wortmarke im Seitenstil ein — sieht bewusst gestaltet aus, nicht nach Lücke.

## Woher

- BZI: [bzi.ch](https://www.bzi.ch)
- Etavis: [etavis.ch](https://www.etavis.ch)
- Electrosuisse: [electrosuisse.ch](https://www.electrosuisse.ch)
- Suva: [suva.ch](https://www.suva.ch)

Oft findet man das SVG direkt im Seitenquelltext (Rechtsklick → Untersuchen → im `<header>`
nach `<svg>` oder `logo.svg` suchen) oder in der Medienmitteilungs-/Presse-Rubrik.
