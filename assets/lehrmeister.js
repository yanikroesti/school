/* =========================================================
   Ausbildungsstand — der Bericht für den Lehrbetrieb.

   Zwei Quellen, zwei verschiedene Dinge:

     data/noten-local.json   Semesterzeugnisse — die offiziellen
                             Fachnoten am Semesterende.
     data/pruefungen.json    einzelne Arbeiten im laufenden Semester,
                             aus denen die nächste Zeugnisnote entsteht.

   Durchgehende Regel: **was fehlt, wird nicht gezeigt.** Kein Strich,
   kein leerer Kasten, kein «noch keine Daten». Ein Abschnitt ohne
   Inhalt verschwindet ganz. Ein kürzerer Bericht liest sich besser als
   ein löchriger.
   ========================================================= */
(function () {
  'use strict';

  var S = window.Schule;

  /* Dieselben Schlüssel und dieselbe Gliederung wie im Zeugnis —
     wer den Bericht neben das Papier legt, soll dieselben Wörter
     in derselben Reihenfolge finden. */
  var ROWS = [
    { k: 'ab', gruppe: true, de: 'Allgemeinbildung', en: 'General education',
      c: 'var(--s-abu)', aus: ['ges', 'sk'] },
    { k: 'ges', unter: true, de: 'Gesellschaft', en: 'Society' },
    { k: 'sk', unter: true, de: 'Sprache und Kommunikation', en: 'Language and communication' },
    { k: 'bk', gruppe: true, de: 'Berufskenntnisse', en: 'Professional knowledge',
      c: 'var(--s-abt)', aus: ['tg', 'td'] },
    { k: 'tg', unter: true, de: 'Technologische Grundlagen', en: 'Technological fundamentals' },
    { k: 'td', unter: true, de: 'Technische Dokumentation', en: 'Technical documentation' },
    { k: 'sport', gruppe: true, de: 'Sport', en: 'Sport', c: 'var(--s-sport)' }
  ];

  var REIHEN = [
    { k: 'gesamt', de: 'Gesamt', en: 'Overall', c: 'var(--ink-2)' },
    { k: 'ab', de: 'Allgemeinbildung', en: 'General education', c: 'var(--s-abu)' },
    { k: 'bk', de: 'Berufskenntnisse', en: 'Professional knowledge', c: 'var(--s-abt)' }
  ];

  var daten = { zeugnis: {}, pruefungen: [], lehrer: {} };
  var an = { gesamt: true, ab: true, bk: true };

  function lang() { return document.documentElement.getAttribute('data-l') || 'de'; }
  function tx(o) { return o ? (o[lang()] || o.de || o.en || '') : ''; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }
  function n1(v) { return v == null ? null : Math.round(v * 10) / 10; }
  function n2(v) { return v == null ? null : Math.round(v * 100) / 100; }
  function fmt(v, k) { return v == null ? '' : v.toFixed(k == null ? 1 : k); }

  /** Notenfarbe. 4.0 ist die Grenze; ab 4.75 rundet ein Zeugnis auf 5. */
  function farbe(g) {
    if (g == null) return '';
    if (g >= 4.75) return 'n-gut';
    if (g >= 4) return '';
    if (g >= 3.5) return 'n-warn';
    return 'n-weg';
  }

  /* ---------------- Rechnen ---------------- */

  function z(sem) { return daten.zeugnis[sem] || {}; }

  /** Welche Semester haben überhaupt Zeugnisnoten? Nur die kommen vor. */
  function semester() {
    return Object.keys(daten.zeugnis)
      .map(Number)
      .filter(function (s) {
        var d = z(s);
        return ['ges', 'sk', 'tg', 'td', 'sport'].some(function (k) {
          return typeof d[k] === 'number';
        });
      })
      .sort(function (a, b) { return a - b; });
  }

  /** Mittel über eine Liste von Schlüsseln — fehlende zählen nicht mit,
   *  statt als Null das Ergebnis zu verfälschen. */
  function mittel(sem, keys) {
    var v = keys.map(function (k) { return z(sem)[k]; })
                .filter(function (x) { return typeof x === 'number'; });
    if (!v.length) return null;
    return v.reduce(function (a, b) { return a + b; }, 0) / v.length;
  }

  function bereich(sem, key) {
    var r = ROWS.filter(function (x) { return x.k === key; })[0];
    if (!r) return null;
    if (r.aus) return mittel(sem, r.aus);
    var v = z(sem)[key];
    return typeof v === 'number' ? v : null;
  }

  function gesamt(sem) { return mittel(sem, ['ges', 'sk', 'tg', 'td', 'sport']); }

  function wert(sem, reihe) {
    return reihe === 'gesamt' ? gesamt(sem) : bereich(sem, reihe);
  }

  /* ---------------- Kopf ---------------- */

  function kopf() {
    var d = S.data();
    var t = d.timetable;
    var sem = semester();
    var letzte = sem.length ? sem[sem.length - 1] : null;

    $('stand').textContent = (lang() === 'en' ? 'As of ' : 'Stand ') +
      S.fmtDate(S.jetzt(), lang());

    var f = [
      { de: 'Lehrbetrieb', en: 'Training company', v: 'Etavis' },
      { de: 'Berufsfachschule', en: 'Vocational school', v: t.school || 'BZI Interlaken' },
      { de: 'Klasse', en: 'Class', v: t.class || 'ELI 25a' },
      { de: 'Lehrjahr', en: 'Year', v: (t.apprenticeshipYear || 2) + '. ' +
        (lang() === 'en' ? 'year' : 'Lehrjahr') + ', ' + (t.semester || 3) + '. ' +
        (lang() === 'en' ? 'semester' : 'Semester') },
      { de: 'Schuljahr', en: 'School year', v: t.schoolYear || '26/27' }
    ];
    if (letzte) {
      f.push({ de: 'Letztes Zeugnis', en: 'Last report',
               v: letzte + '. ' + (lang() === 'en' ? 'semester' : 'Semester') });
    }

    $('fakten').innerHTML = f.map(function (x) {
      return '<div><dt>' + esc(lang() === 'en' ? x.en : x.de) + '</dt>' +
             '<dd>' + esc(x.v) + '</dd></div>';
    }).join('');
  }

  /* ---------------- Kennzahlen ---------------- */

  function pfeil(jetztW, vorherW) {
    if (jetztW == null || vorherW == null) return '';
    var d = n2(jetztW - vorherW);
    if (Math.abs(d) < 0.005) {
      return '<span class="pfeil">→ ' + (lang() === 'en' ? 'steady' : 'gleich') + '</span>';
    }
    var hoch = d > 0;
    return '<span class="pfeil ' + (hoch ? 'hoch' : 'runter') + '">' +
           (hoch ? '↑' : '↓') + ' ' + (hoch ? '+' : '') + d.toFixed(2) + '</span>';
  }

  function kennzahlen() {
    var sem = semester();
    if (!sem.length) { $('s-kpi').hidden = true; return; }
    var letzte = sem[sem.length - 1];
    var vor = sem.length > 1 ? sem[sem.length - 2] : null;

    var karten = [];

    function karte(titel, w, vorher, unten) {
      if (w == null) return;                       // fehlt: kommt nicht vor
      karten.push(
        '<div><span class="titel">' + esc(titel) + '</span>' +
        '<span class="wert ' + farbe(w) + '">' + fmt(w, 2) + '</span>' +
        '<span class="unten">' + (unten || pfeil(w, vorher)) + '</span></div>');
    }

    karte(lang() === 'en' ? 'Overall average' : 'Gesamtschnitt',
          gesamt(letzte), vor != null ? gesamt(vor) : null);
    karte(lang() === 'en' ? 'General education' : 'Allgemeinbildung',
          bereich(letzte, 'ab'), vor != null ? bereich(vor, 'ab') : null);
    karte(lang() === 'en' ? 'Professional knowledge' : 'Berufskenntnisse',
          bereich(letzte, 'bk'), vor != null ? bereich(vor, 'bk') : null);

    // Absenzen nur, wenn sie überhaupt erfasst sind.
    var hatAbs = sem.some(function (s) {
      return typeof z(s).absU === 'number' || typeof z(s).absE === 'number';
    });
    if (hatAbs) {
      var unent = sem.reduce(function (a, s) { return a + (z(s).absU || 0); }, 0);
      var ent = sem.reduce(function (a, s) { return a + (z(s).absE || 0); }, 0);
      karten.push(
        '<div><span class="titel">' +
        (lang() === 'en' ? 'Unexcused absences' : 'Absenzen unentschuldigt') + '</span>' +
        '<span class="wert ' + (unent === 0 ? 'n-gut' : 'n-weg') + '">' + unent +
        '<span class="einheit">' + (lang() === 'en' ? 'lessons' : 'Lektionen') + '</span></span>' +
        '<span class="unten">' + ent + ' ' +
        (lang() === 'en' ? 'excused' : 'entschuldigt') + '</span></div>');
    }

    $('kpi').innerHTML = karten.join('');
  }

  /* ---------------- Verlauf ----------------
     Die Achse beginnt bei 4.0, nicht bei 1.0. Das ist keine
     Schönfärberei, sondern die Grenze, um die es geht: 4.0 ist
     genügend. Fällt ein Wert darunter, zieht sich die Achse
     automatisch nach unten, damit nichts aus dem Bild rutscht.       */

  var W = 800, H = 290, PL = 44, PR = 18, PT = 16, PB = 34;

  /** Ist der Schirm zu schmal fuer antippbare Punkte?
   *
   *  Bei 375 px staucht sich das Diagramm auf etwa 43 Prozent. Zwei
   *  Noten, die 0.13 auseinanderliegen — 4.88 und 4.75 —, sind dann
   *  sechs Pixel voneinander entfernt. Das trifft niemand mit dem
   *  Finger, und groesser laesst es sich nicht machen, ohne die Achse
   *  zu strecken, bis sie luegt.
   *
   *  Also ist das Diagramm dort ein Bild: keine Punkte zum Antippen,
   *  dafuer eine Beschreibung fuer Vorleseprogramme. Verloren geht
   *  nichts — jede Zahl steht in der Tabelle direkt darunter. */
  function schmal() { return window.innerWidth < 640; }

  function verlauf() {
    var sem = semester();
    if (sem.length < 2) { $('s-verlauf').hidden = true; return; }   // eine Linie ist kein Verlauf
    $('s-verlauf').hidden = false;

    var alle = [];
    sem.forEach(function (s) {
      REIHEN.forEach(function (r) {
        var v = wert(s, r.k);
        if (v != null) alle.push(v);
      });
    });
    var min = Math.min(4, Math.floor(Math.min.apply(null, alle) * 2) / 2);
    var max = 6;

    var x = function (i) { return PL + i * (W - PL - PR) / Math.max(1, sem.length - 1); };
    var y = function (v) { return PT + (max - v) / (max - min) * (H - PT - PB); };

    var teile = [];

    // Waagrechte Hilfslinien, halbe Noten
    for (var g = min; g <= max + 0.001; g += 0.5) {
      var yy = y(g);
      var vier = Math.abs(g - 4) < 0.001;
      teile.push('<line x1="' + PL + '" y1="' + yy.toFixed(1) + '" x2="' + (W - PR) +
        '" y2="' + yy.toFixed(1) + '" stroke="' +
        (vier ? 'var(--alert)' : 'var(--line)') + '" stroke-width="' + (vier ? 1.5 : 1) + '"' +
        (vier ? ' stroke-dasharray="5 4"' : '') + '/>');
      teile.push('<text x="' + (PL - 8) + '" y="' + (yy + 4).toFixed(1) +
        '" text-anchor="end" font-family="var(--f-data)" font-size="11" fill="' +
        (vier ? 'var(--alert)' : 'var(--muted)') + '">' + g.toFixed(1) + '</text>');
    }

    // Semesterbeschriftung
    sem.forEach(function (s, i) {
      teile.push('<text x="' + x(i).toFixed(1) + '" y="' + (H - 10) +
        '" text-anchor="middle" font-family="var(--f-data)" font-size="11" ' +
        'fill="var(--ink-2)">' + s + '.</text>');
    });

    /* Erst die Linien, je Reihe in ihrer Farbe. */
    var knoten = {};                 // "Semester|Wert" -> beteiligte Reihen
    REIHEN.forEach(function (r) {
      if (!an[r.k]) return;
      var pkt = [];
      sem.forEach(function (s, i) {
        var v = wert(s, r.k);
        if (v != null) pkt.push({ i: i, s: s, v: v });
      });
      if (!pkt.length) return;

      if (pkt.length > 1) {
        teile.push('<polyline fill="none" stroke="' + r.c + '" stroke-width="2" ' +
          'stroke-linejoin="round" stroke-linecap="round" points="' +
          pkt.map(function (p) { return x(p.i).toFixed(1) + ',' + y(p.v).toFixed(1); }).join(' ') +
          '"/>');
      }
      pkt.forEach(function (p) {
        var schl = p.s + '|' + p.v.toFixed(2);
        if (!knoten[schl]) knoten[schl] = { i: p.i, s: p.s, v: p.v, reihen: [] };
        knoten[schl].reihen.push(r);
      });
    });

    /* Dann die Punkte — einer je Stelle, nicht einer je Reihe.
     *
     * Warum: im 2. Semester sind Gesamt und Allgemeinbildung beide 5.00.
     * Vorher lagen dort zwei Punkte exakt uebereinander: der untere war
     * unsichtbar und nicht anzuklicken, und als Ziel hatten beide den
     * Abstand null. Ein gemeinsamer Wert ist aber genau das — eine
     * Stelle, an der zwei Linien zusammenlaufen. Also ein Knoten, und
     * die Ablesung nennt beide.
     *
     * Der sichtbare Kreis misst 13 px; darunter liegt eine unsichtbare
     * Flaeche von 24 px, die sich auch mit der Maus leichter trifft. */
    Object.keys(knoten).forEach(function (schl) {
      var k = knoten[schl];
      var namen = k.reihen.map(function (r) { return lang() === 'en' ? r.en : r.de; });
      var beschriftung = namen.join(', ') + ' — ' + k.s + '. Semester: ' + k.v.toFixed(2);
      var cx = x(k.i).toFixed(1), cy = y(k.v).toFixed(1);
      // Ein Knoten mehrerer Reihen bekommt keine Reihenfarbe, sondern
      // die neutrale: er gehoert keiner allein.
      var strich = k.reihen.length === 1 ? k.reihen[0].c : 'var(--ink-2)';
      var ringe =
        '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="var(--plate)" ' +
          'stroke="' + strich + '" stroke-width="2.5" pointer-events="none"/>' +
        (k.reihen.length > 1
          ? '<circle cx="' + cx + '" cy="' + cy + '" r="8.5" fill="none" ' +
            'stroke="' + strich + '" stroke-width="1" opacity="0.45" pointer-events="none"/>'
          : '');

      if (schmal()) { teile.push(ringe); return; }      // nur Bild, kein Ziel

      teile.push(
        '<g class="punkt" tabindex="0" role="img" ' +
          'data-reihe="' + esc(namen.join(' · ')) + '" ' +
          'data-sem="' + k.s + '" data-wert="' + k.v.toFixed(2) + '">' +
          '<title>' + esc(beschriftung) + '</title>' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="12" fill="transparent"/>' +
          ringe +
        '</g>');
    });

    // Ohne antippbare Punkte muss die Beschriftung die Werte selbst
    // nennen — sonst haetten Vorleseprogramme dort nur ein leeres Bild.
    var beschreibung = lang() === 'en' ? 'Grade trend by semester' : 'Notenverlauf nach Semester';
    if (schmal()) {
      beschreibung += ': ' + Object.keys(knoten).map(function (s) {
        var k = knoten[s];
        return k.reihen.map(function (r) { return lang() === 'en' ? r.en : r.de; }).join(' und ') +
               ' ' + k.s + '. Semester ' + k.v.toFixed(2);
      }).join('; ');
    }

    $('verlauf').innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="' + esc(beschreibung) + '">' + teile.join('') + '</svg>';

    ablesungLeeren();
  }

  /** Die Schalterleiste wird einmal gebaut, nicht bei jedem Umschalten.
   *
   *  Vorher hing sie in verlauf() und wurde mit jedem Klick neu erzeugt —
   *  damit verlor der eben gedrueckte Knopf den Fokus, und wer die Seite
   *  mit der Tastatur bedient, stand nach einem Umschalten wieder am
   *  Anfang. Jetzt aendert sich nur noch aria-pressed. */
  function steuerung() {
    $('vsteuer').innerHTML = REIHEN.map(function (r) {
      return '<button class="reihe" type="button" data-reihe="' + r.k + '" ' +
        'style="--c:' + r.c + '" aria-pressed="' + (an[r.k] ? 'true' : 'false') + '">' +
        '<i></i>' + esc(lang() === 'en' ? r.en : r.de) + '</button>';
    }).join('') + '<span class="spacer"></span>' +
      '<span style="font-size:var(--t-xs);color:var(--muted)">' +
      (lang() === 'en' ? 'Dashed line: pass mark 4.0' : 'Gestrichelt: Grenze 4.0') + '</span>';
  }

  function ablesungLeeren() {
    // Auf dem Handy gibt es nichts anzuzeigen — dort ist das Diagramm
    // ein Bild, und die Zahlen stehen in der Tabelle.
    $('ablesung').hidden = schmal();
    $('ablesung').innerHTML = lang() === 'en'
      ? 'Point at a marker for the exact value.'
      : 'Auf einen Punkt zeigen zeigt den genauen Wert.';
  }

  /* ---------------- Zeugnistabelle ---------------- */

  function zeugnis() {
    var sem = semester();
    if (!sem.length) { $('s-zeugnis').hidden = true; return; }
    $('s-zeugnis').hidden = false;

    var kopfz = '<thead><tr><th>' + (lang() === 'en' ? 'Subject' : 'Fach') + '</th>' +
      sem.map(function (s) { return '<th>' + s + '. Sem.</th>'; }).join('') +
      '<th>' + (lang() === 'en' ? 'Mean' : 'Mittel') + '</th></tr></thead>';

    var zeilen = ROWS.map(function (r) {
      var werte = sem.map(function (s) { return bereich(s, r.k); });
      // Eine Zeile, die in keinem Semester einen Wert hat, gibt es nicht.
      if (!werte.some(function (v) { return v != null; })) return '';

      var vorhanden = werte.filter(function (v) { return v != null; });
      var m = vorhanden.length
        ? vorhanden.reduce(function (a, b) { return a + b; }, 0) / vorhanden.length : null;

      return '<tr class="' + (r.gruppe ? 'gruppe' : 'unter') + '"' +
        (r.c ? ' style="--c:' + r.c + '"' : '') + '>' +
        '<td>' + esc(lang() === 'en' ? r.en : r.de) + '</td>' +
        werte.map(function (v, i) {
          // Sport ohne Note ist im Zeugnis nicht «nichts», sondern
          // «besucht» — ein Fachausdruck, keine Luecke. Eine leere
          // Zelle waere hier schlicht falsch.
          if (v == null && r.k === 'sport' && z(sem[i]).sportBesucht) {
            return '<td class="zahl" style="font-family:var(--f-ui);color:var(--ink-2)">' +
                   (lang() === 'en' ? 'attended' : 'besucht') + '</td>';
          }
          return '<td class="zahl ' + farbe(v) + '">' + fmt(v) + '</td>';
        }).join('') +
        '<td class="zahl ' + farbe(m) + '"><b>' + fmt(m, 2) + '</b></td></tr>';
    }).join('');

    // Gesamtzeile
    var g = sem.map(gesamt);
    var gv = g.filter(function (v) { return v != null; });
    var gm = gv.length ? gv.reduce(function (a, b) { return a + b; }, 0) / gv.length : null;
    zeilen += '<tr class="gruppe" style="--c:var(--ink-2)">' +
      '<td>' + (lang() === 'en' ? 'Overall' : 'Gesamt') + '</td>' +
      g.map(function (v) { return '<td class="zahl ' + farbe(v) + '">' + fmt(v, 2) + '</td>'; }).join('') +
      '<td class="zahl ' + farbe(gm) + '"><b>' + fmt(gm, 2) + '</b></td></tr>';

    $('ztab').innerHTML = kopfz + '<tbody>' + zeilen + '</tbody>';
  }

  /* ---------------- Einzelne Prüfungen ---------------- */

  function pruefungen() {
    var p = (daten.pruefungen || []).slice()
      .sort(function (a, b) { return (b.datum || '').localeCompare(a.datum || ''); });
    if (!p.length) { $('s-pruef').hidden = true; return; }
    $('s-pruef').hidden = false;

    var laufend = Math.max.apply(null, p.map(function (x) { return x.semester || 0; }));
    var d = S.data();

    $('p-h').innerHTML =
      '<span lang="de">Laufendes Semester (' + laufend + '.)</span>' +
      '<span lang="en">Current semester (' + laufend + ')</span>';

    $('pliste').innerHTML = p.map(function (x) {
      var fach = d.subjects[x.fach] || {};
      var lehr = d.teacherById[x.lehrer];
      var bereichName = (ROWS.filter(function (r) { return r.k === x.bereich; })[0] || {});
      var datum = x.datum ? S.fmtDate(new Date(x.datum + 'T00:00:00'), lang()) : '';

      var unten = [];
      if (bereichName.de) {
        unten.push('<div>' + (lang() === 'en' ? 'Counts towards' : 'Zählt zu') + ': <b>' +
          esc(lang() === 'en' ? bereichName.en : bereichName.de) + '</b></div>');
      }
      if (lehr) {
        unten.push('<div>' + (lang() === 'en' ? 'Teacher' : 'Lehrperson') + ': ' +
          esc(lehr.name) + '</div>');
      }
      if (typeof x.punkte === 'number' && typeof x.maxPunkte === 'number' && x.maxPunkte > 0) {
        var q = Math.max(0, Math.min(1, x.punkte / x.maxPunkte));
        unten.push('<div class="balkenzeile" style="--c:' + (fach.color ? 'var(--s-' + x.fach + ')' : 'var(--rail)') + '">' +
          '<span>' + x.punkte + ' / ' + x.maxPunkte + '</span>' +
          '<span class="balken2"><i style="width:' + (q * 100).toFixed(1) + '%"></i></span>' +
          '<span>' + Math.round(q * 100) + ' %</span></div>');
      }
      if (x.themen && x.themen.length) {
        unten.push('<div class="themen">' + x.themen.map(function (t) {
          return '<span>' + esc(t) + '</span>';
        }).join('') + '</div>');
      }

      return '<details class="pruef s-' + esc(x.fach) + '">' +
        '<summary>' +
          '<span class="fuss"></span>' +
          '<span class="mitte"><b>' + esc(tx(x.titel)) + '</b>' +
          '<span>' + esc([datum, fach.code].filter(Boolean).join(' · ')) + '</span></span>' +
          '<span class="note ' + farbe(x.note) + '">' + fmt(x.note) + '</span>' +
        '</summary>' +
        (unten.length ? '<div class="pb">' + unten.join('') + '</div>' : '') +
      '</details>';
    }).join('');
  }

  /* ---------------- Fussnote ---------------- */

  function fussnote() {
    $('fussnote').innerHTML = lang() === 'en'
      ? 'Generated automatically from the school data of schule.yanikroesti.ch. ' +
        'Semester grades come from the official BZI semester reports; individual ' +
        'test results are entered as they are handed back. Sections without data ' +
        'are not shown.'
      : 'Automatisch erzeugt aus den Schuldaten von schule.yanikroesti.ch. ' +
        'Die Semesternoten stammen aus den offiziellen Semesterzeugnissen des BZI ' +
        'Interlaken, die einzelnen Prüfungsergebnisse werden eingetragen, sobald ' +
        'die Arbeit zurückkommt. Abschnitte ohne Daten werden nicht angezeigt.';
  }

  /* ---------------- Alles zeichnen ---------------- */

  function zeichne() {
    kopf();
    kennzahlen();
    steuerung();
    verlauf();
    zeugnis();
    pruefungen();
    fussnote();
  }

  function bind() {
    // Reihen ein- und ausschalten
    $('vsteuer').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-reihe]');
      if (!b) return;
      var k = b.dataset.reihe;
      // Die letzte eingeschaltete Reihe bleibt an — ein leeres Diagramm
      // ist keine Ansicht, sondern ein Fehler.
      if (an[k] && Object.keys(an).filter(function (x) { return an[x]; }).length === 1) return;
      an[k] = !an[k];
      b.setAttribute('aria-pressed', an[k] ? 'true' : 'false');   // Fokus bleibt
      verlauf();
    });

    // Ablesung bei Zeigen und bei Tastaturfokus
    $('verlauf').addEventListener('mouseover', zeige);
    $('verlauf').addEventListener('focusin', zeige);
    $('verlauf').addEventListener('mouseleave', ablesungLeeren);
    $('verlauf').addEventListener('focusout', ablesungLeeren);

    function zeige(e) {
      var p = e.target.closest ? e.target.closest('.punkt') : null;
      if (!p) return;
      $('ablesung').innerHTML =
        '<b>' + esc(p.dataset.reihe) + '</b> · ' + p.dataset.sem + '. ' +
        (lang() === 'en' ? 'semester' : 'Semester') + ' · <b>' + esc(p.dataset.wert) + '</b>';
    }

    $('drucken').addEventListener('click', function () { window.print(); });

    // Wer das Handy dreht, wechselt zwischen schmal und breit — dann
    // muss das Diagramm entscheiden, ob seine Punkte Ziele sind.
    var war = schmal(), timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (schmal() === war) return;
        war = schmal();
        verlauf();
      }, 180);
    });

    document.addEventListener('langchange', zeichne);
  }

  /* ---------------- Start ---------------- */

  S.load()
    .then(function () {
      window.Shell.mount('lehrmeister', S.data().teachers);
      return Promise.all([
        fetch('data/noten-local.json').then(function (r) { return r.ok ? r.json() : {}; })
          .catch(function () { return {}; }),
        fetch('data/pruefungen.json').then(function (r) { return r.ok ? r.json() : {}; })
          .catch(function () { return {}; })
      ]);
    })
    .then(function (teile) {
      daten.zeugnis = (teile[0] && teile[0].zeugnis) || {};
      daten.pruefungen = (teile[1] && teile[1].pruefungen) || [];
      $('laedt').remove();
      $('inhalt').hidden = false;
      zeichne();
      bind();
    })
    .catch(function (e) {
      console.error(e);
      $('laedt').innerHTML =
        '<div class="pb"><b><span lang="de">Daten nicht geladen</span>' +
        '<span lang="en">Data did not load</span></b><br>' +
        '<span lang="de">Neu laden hilft meistens.</span>' +
        '<span lang="en">A reload usually fixes it.</span></div>';
      try { window.Shell.mount('lehrmeister', []); } catch (x) {}
    });
})();
