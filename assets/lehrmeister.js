/* =========================================================
   Ausbildungsstand — der Bericht für den Lehrbetrieb.

   Das hier ist kein Notenblatt, sondern ein **Stand der Dinge**:
   was ansteht, was offen ist, was zuletzt war. Wer die Seite öffnet,
   will in dreissig Sekunden wissen, ob es läuft — und ob von ihm
   selbst etwas erwartet wird. Genau dafür steht «Offen» zuoberst:
   es ist der einzige Abschnitt, bei dem jemand handeln muss.

   Die Noten kommen danach. Sie sind der Beleg, nicht die Nachricht.

   Vier Quellen:

     data/agenda.json        was ansteht, offen ist, zuletzt war —
                             gepflegt aus Yaniks Freitagsnotizen
     data/pruefungen.json    einzelne Arbeiten mit Note
     data/noten-local.json   die Semesterzeugnisse
     data/*.json (Schule)    Klasse, Schule, Lehrpersonen, Fachfarben

   Durchgehende Regel: **was fehlt, wird nicht gezeigt.** Kein Strich,
   kein leerer Kasten, kein «noch keine Daten». Ein Abschnitt ohne
   Inhalt verschwindet ganz.
   ========================================================= */
(function () {
  'use strict';

  var S = window.Schule;

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

  var ARTEN = {
    test:       { de: 'Prüfung',   en: 'Exam' },
    kurztest:   { de: 'Kurztest',  en: 'Short test' },
    note:       { de: 'Note',      en: 'Grade' },
    unterricht: { de: 'Unterricht', en: 'Lesson' },
    termin:     { de: 'Termin',    en: 'Event' }
  };

  var FACHCODES = { abu: 'ABU', abt: 'ABT', atd: 'ATD', htog: 'HTOG' };

  var daten = { zeugnis: {}, pruefungen: [], agenda: {} };
  var an = { gesamt: true, ab: true, bk: true };
  var alleZeigen = false;
  var ZEIGE = 6;                       // wie viele Einträge zuerst

  function lang() { return document.documentElement.getAttribute('data-l') || 'de'; }
  function tx(o) { return o ? (o[lang()] || o.de || o.en || '') : ''; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }
  function n2(v) { return v == null ? null : Math.round(v * 100) / 100; }
  function fmt(v, k) { return v == null ? '' : v.toFixed(k == null ? 1 : k); }

  function farbe(g) {
    if (g == null) return '';
    if (g >= 4.75) return 'n-gut';
    if (g >= 4) return '';
    if (g >= 3.5) return 'n-warn';
    return 'n-weg';
  }

  function fachFarbe(f) { return f ? 'var(--s-' + f + ')' : 'var(--rail)'; }

  function tage(isoA, isoB) {
    var a = new Date(isoA + 'T00:00:00'), b = new Date(isoB + 'T00:00:00');
    return Math.round((a - b) / 86400000);
  }

  function heuteIso() {
    var d = S.jetzt();
    return d.getFullYear() + '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  /** «in 5 Tagen», «morgen», «heute», «vor 2 Tagen» — als Wort, nicht als Zahl. */
  function wann(iso) {
    var d = tage(iso, heuteIso());
    var en = lang() === 'en';
    if (d === 0) return en ? 'today' : 'heute';
    if (d === 1) return en ? 'tomorrow' : 'morgen';
    if (d === -1) return en ? 'yesterday' : 'gestern';
    if (d > 1) return en ? 'in ' + d + ' days' : 'in ' + d + ' Tagen';
    return en ? d * -1 + ' days ago' : 'vor ' + (d * -1) + ' Tagen';
  }

  function datumKurz(iso) {
    var d = new Date(iso + 'T00:00:00');
    return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.';
  }

  function wochentag(iso) {
    var d = new Date(iso + 'T00:00:00');
    var kurz = {
      de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
    return kurz[lang() === 'en' ? 'en' : 'de'][d.getDay()];
  }

  /* ---------------- Zeugnis rechnen ---------------- */

  function z(sem) { return daten.zeugnis[sem] || {}; }

  function semester() {
    return Object.keys(daten.zeugnis).map(Number).filter(function (s) {
      var d = z(s);
      return ['ges', 'sk', 'tg', 'td', 'sport'].some(function (k) {
        return typeof d[k] === 'number';
      });
    }).sort(function (a, b) { return a - b; });
  }

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
  function wert(sem, reihe) { return reihe === 'gesamt' ? gesamt(sem) : bereich(sem, reihe); }

  /* ---------------- Kopf ---------------- */

  function kopf() {
    var t = S.data().timetable;
    var sem = semester();
    $('stand').textContent = (lang() === 'en' ? 'As of ' : 'Stand ') +
      S.fmtDate(S.jetzt(), lang());

    var f = [
      { de: 'Lehrbetrieb', en: 'Training company', v: 'Etavis' },
      { de: 'Berufsfachschule', en: 'Vocational school', v: t.school || 'BZI Interlaken' },
      { de: 'Klasse', en: 'Class', v: t.class || 'ELI 25a' },
      { de: 'Lehrjahr', en: 'Year', v: (t.apprenticeshipYear || 2) + '. ' +
        (lang() === 'en' ? 'year' : 'Lehrjahr') + ', ' + (t.semester || 3) + '. ' +
        (lang() === 'en' ? 'semester' : 'Semester') },
      { de: 'Schultage', en: 'School days', v: lang() === 'en' ? 'Mon and Fri' : 'Montag und Freitag' }
    ];
    if (sem.length) {
      f.push({ de: 'Letztes Zeugnis', en: 'Last report',
               v: sem[sem.length - 1] + '. ' + (lang() === 'en' ? 'semester' : 'Semester') });
    }
    $('fakten').innerHTML = f.map(function (x) {
      return '<div><dt>' + esc(lang() === 'en' ? x.en : x.de) + '</dt>' +
             '<dd>' + esc(x.v) + '</dd></div>';
    }).join('');
  }

  /* ---------------- Die Lage in zwei, drei Sätzen ----------------
     Aus den Daten erzeugt, nicht getippt: wenn sich der Schnitt
     ändert oder eine Prüfung näher rückt, ändert sich der Text mit.  */

  function lage() {
    var en = lang() === 'en';
    var sem = semester();
    var teile = [];

    if (sem.length) {
      var letzte = sem[sem.length - 1];
      var vor = sem.length > 1 ? sem[sem.length - 2] : null;
      var g = gesamt(letzte), gv = vor != null ? gesamt(vor) : null;
      var richtung = '';
      if (g != null && gv != null) {
        var d = n2(g - gv);
        if (Math.abs(d) < 0.005) richtung = en ? ', unverändert zum Vorsemester' : ', unverändert zum Vorsemester';
        else if (d > 0) richtung = en ? ', up ' + d.toFixed(2) : ', ' + d.toFixed(2) + ' besser als im Vorsemester';
        else richtung = en ? ', down ' + Math.abs(d).toFixed(2) : ', ' + Math.abs(d).toFixed(2) + ' tiefer als im Vorsemester';
      }
      if (g != null) {
        teile.push(en
          ? '<p>Last semester report: overall average <b>' + fmt(g, 2) + '</b>' + richtung + '.</p>'
          : '<p>Letztes Semesterzeugnis: Gesamtschnitt <b>' + fmt(g, 2) + '</b>' + richtung + '.</p>');
      }
    }

    // Die jüngste einzelne Arbeit
    var p = (daten.pruefungen || []).slice().sort(function (a, b) {
      return (b.datum || '').localeCompare(a.datum || '');
    })[0];
    if (p && p.note != null) {
      teile.push(en
        ? '<p>Most recent piece of work: <b>' + esc(tx(p.titel)) + '</b> — grade <b>' +
          fmt(p.note) + '</b>, ' + wann(p.datum) + '.</p>'
        : '<p>Jüngste Arbeit: <b>' + esc(tx(p.titel)) + '</b> — Note <b>' +
          fmt(p.note) + '</b>, ' + wann(p.datum) + '.</p>');
    }

    // Was als Nächstes kommt
    var k = kommendeListe()[0];
    if (k) {
      var gross = k.gross ? (en ? 'major test' : '<b>Grosstest</b>') : tx(ARTEN[k.art] || {});
      teile.push(en
        ? '<p>Next up: ' + gross + ' — <b>' + esc(tx(k.titel)) + '</b>, ' + wann(k.datum) + '.</p>'
        : '<p>Als Nächstes: ' + gross + ' — <b>' + esc(tx(k.titel)) + '</b>, ' + wann(k.datum) + '.</p>');
    }

    // Offene Punkte — die kommen zuletzt, weil sie am meisten hängen bleiben
    var w = (daten.agenda.erwartet || []).filter(function (x) { return x.status !== 'erledigt'; });
    if (w.length) {
      teile.push(en
        ? '<p>' + w.length + ' item' + (w.length > 1 ? 's are' : ' is') +
          ' still open — see below.</p>'
        : '<p>' + (w.length === 1 ? 'Ein Punkt ist' : w.length + ' Punkte sind') +
          ' offen — siehe unten.</p>');
    }

    $('lage').innerHTML = teile.join('');
    $('lage').hidden = !teile.length;
  }

  /* ---------------- Fachstand ----------------
     Ein Fachstand ist bewusst etwas anderes als der Stundenplan: Er hält
     fest, woran gerade gearbeitet wird, was dabei konkret zählt und was
     als Nächstes kommt. Die Daten liegen in agenda.json, mit einer Quelle
     aus dem Vault an jeder Zeile. So bleibt dieser Bericht lesbar, ohne
     Inhalte zu erfinden oder einen leeren Fachkasten zu zeigen. */

  function fachstand() {
    var liste = (daten.agenda.fachstand || []).filter(function (x) {
      return x && x.fach && x.aktuell;
    });
    if (!liste.length) { $('s-fachstand').hidden = true; return; }
    $('s-fachstand').hidden = false;

    var h = heuteIso();
    $('fachstandListe').innerHTML = liste.map(function (x) {
      var D = S.data();
      var lehr = x.lehrer ? D.teacherById[x.lehrer] : null;
      var fokus = (x.fokus && (x.fokus[lang()] || x.fokus.de || x.fokus.en)) || [];
      var code = FACHCODES[x.fach] || x.fach.toUpperCase();
      var status;

      if (x.geplant && x.geplant >= h) {
        status = lang() === 'en' ? 'Planned ' + datumKurz(x.geplant) :
          'Geplant ' + datumKurz(x.geplant);
      } else if (x.aktualisiert) {
        status = lang() === 'en' ? 'Status ' + datumKurz(x.aktualisiert) :
          'Stand ' + datumKurz(x.aktualisiert);
      } else status = '';

      var naechstes = '';
      if (x.naechstes && x.naechstes.datum) {
        var was = x.naechstes[lang()] || x.naechstes.de || x.naechstes.en || '';
        naechstes = '<div class="fachkommend"><b>' +
          (lang() === 'en' ? 'Next:' : 'Als Nächstes:') + '</b><span>' +
          esc(datumKurz(x.naechstes.datum) + ' · ' + was) + '</span></div>';
      }

      return '<details class="fach" style="--c:' + fachFarbe(x.fach) + '">' +
        '<summary>' +
          '<i class="leiter" aria-hidden="true"></i>' +
          '<span class="fachkopf"><span class="fachmeta"><span class="fachcode">' + esc(code) +
          '</span>' + (lehr ? '<span class="fachlehrer">' + esc(lehr.name) + '</span>' : '') +
          '</span><span class="fachtitel">' + esc(tx(x.aktuell)) + '</span></span>' +
          '<span class="status">' + esc(status) + '</span><span class="pfeilfach" aria-hidden="true">›</span>' +
        '</summary>' +
        '<div class="fachinhalt"><ul>' + fokus.map(function (p) {
          return '<li>' + esc(p) + '</li>';
        }).join('') + '</ul>' + naechstes +
          (x.quelle ? '<div class="fachquelle">' + esc(x.quelle) + '</div>' : '') +
        '</div></details>';
    }).join('');
  }

  /* ---------------- Offen ---------------- */

  function warten() {
    var w = (daten.agenda.erwartet || []).filter(function (x) { return x.status !== 'erledigt'; });
    if (!w.length) { $('s-warten').hidden = true; return; }
    $('s-warten').hidden = false;

    $('wartenListe').innerHTML = w.map(function (x) {
      var d = x.offenSeit ? tage(heuteIso(), x.offenSeit) : null;
      var dauer = d == null ? '' :
        (lang() === 'en' ? 'open for ' + d + ' days' : 'seit ' + d + ' Tagen offen');
      return '<div class="warten">' +
        '<div class="wt"><b>' + esc(tx(x.titel)) + '</b>' +
          (x.von ? '<span class="marke">' + esc(tx(x.von)) + '</span>' : '') +
          (dauer ? '<span class="dauer">' + esc(dauer) + '</span>' : '') +
        '</div>' +
        (x.detail ? '<p>' + esc(tx(x.detail)) + '</p>' : '') +
        (x.warumWichtig ? '<p class="warum">' + esc(tx(x.warumWichtig)) + '</p>' : '') +
      '</div>';
    }).join('');
  }

  /* ---------------- Was ansteht ---------------- */

  function kommendeListe() {
    var h = heuteIso();
    return (daten.agenda.kommend || [])
      .filter(function (x) { return x.datum >= h; })
      .sort(function (a, b) { return a.datum.localeCompare(b.datum); });
  }

  function eintrag(x, opt) {
    opt = opt || {};
    var D = S.data();
    var fach = x.fach ? (D.subjects[x.fach] || {}) : {};
    var lehr = x.lehrer ? D.teacherById[x.lehrer] : null;
    var marken = [];

    if (x.art) {
      marken.push('<span class="marke' + (x.gross || x.art === 'note' ? ' voll' : '') + '"' +
        (x.fach ? ' style="--c:' + fachFarbe(x.fach) + '"' : '') + '>' +
        esc(tx(ARTEN[x.art] || {}) || x.art) + '</span>');
    }
    if (fach.code) {
      marken.push('<span class="marke" style="--c:' + fachFarbe(x.fach) + '">' +
        esc(fach.code) + '</span>');
    }
    if (lehr) marken.push('<span class="marke">' + esc(lehr.name) + '</span>');

    var rechts = '';
    if (x.note != null) {
      rechts = '<span class="note ' + farbe(x.note) + '">' + fmt(x.note) + '</span>';
      if (typeof x.punkte === 'number' && typeof x.maxPunkte === 'number') {
        rechts += ' <span class="quelle" style="display:inline">' +
          x.punkte + '/' + x.maxPunkte + '</span>';
      }
    }

    return '<div class="fe' + (opt.offen ? ' offen' : '') + '">' +
      '<div class="wann"><b>' + datumKurz(x.datum) + '</b>' +
        '<span>' + wochentag(x.datum) + ' · ' + esc(wann(x.datum)) + '</span></div>' +
      '<div class="knoten" style="--c:' + fachFarbe(x.fach) + '"></div>' +
      '<div class="inhalt">' +
        '<div class="kopf"><span class="tt">' + esc(tx(x.titel)) + '</span>' +
          marken.join('') + rechts + '</div>' +
        (x.detail ? '<div class="det">' + esc(tx(x.detail)) + '</div>' : '') +
        (x.quelle ? '<span class="quelle">' + esc(x.quelle) + '</span>' : '') +
      '</div>' +
    '</div>';
  }

  function kommend() {
    var k = kommendeListe();
    if (!k.length) { $('s-kommend').hidden = true; return; }
    $('s-kommend').hidden = false;
    $('kommendFeed').innerHTML = k.map(function (x) { return eintrag(x); }).join('');
  }

  /* ---------------- Was zuletzt war ----------------
     Noten und Unterricht in einem Strom, neueste zuerst. Die Noten
     stammen aus pruefungen.json, der Unterricht aus agenda.json —
     zusammengeführt, damit man beim Lesen nicht springen muss.       */

  function geschehen() {
    var h = heuteIso();
    var liste = [];

    (daten.pruefungen || []).forEach(function (p) {
      liste.push({
        datum: p.datum, art: 'note', fach: p.fach, lehrer: p.lehrer,
        titel: p.titel, note: p.note, punkte: p.punkte, maxPunkte: p.maxPunkte,
        detail: p.themen && p.themen.length
          ? { de: p.themen.join(' · '), en: p.themen.join(' · ') } : null
      });
    });

    (daten.agenda.geschehen || []).forEach(function (e) { liste.push(e); });

    // Angekündigtes, dessen Datum vorbei ist, gehört auch hierher.
    (daten.agenda.kommend || []).forEach(function (e) {
      if (e.datum < h) liste.push(e);
    });

    liste = liste.filter(function (x) { return x.datum; })
                 .sort(function (a, b) { return b.datum.localeCompare(a.datum); });

    if (!liste.length) { $('s-geschehen').hidden = true; return; }
    $('s-geschehen').hidden = false;

    var zeigen = alleZeigen ? liste : liste.slice(0, ZEIGE);
    $('geschehenFeed').innerHTML = zeigen.map(function (x) { return eintrag(x); }).join('');

    var mehr = $('mehr');
    mehr.hidden = liste.length <= ZEIGE;
    if (!mehr.hidden) {
      mehr.innerHTML = alleZeigen
        ? '<span lang="de">Weniger zeigen</span><span lang="en">Show less</span>'
        : '<span lang="de">Alle ' + liste.length + ' zeigen</span>' +
          '<span lang="en">Show all ' + liste.length + '</span>';
    }
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
    if (!sem.length) { $('s-zahlen').hidden = true; return; }
    var letzte = sem[sem.length - 1];
    var vor = sem.length > 1 ? sem[sem.length - 2] : null;
    var karten = [];

    function karte(titel, w, vorher) {
      if (w == null) return;
      karten.push('<div><span class="titel">' + esc(titel) + '</span>' +
        '<span class="wert ' + farbe(w) + '">' + fmt(w, 2) + '</span>' +
        '<span class="unten">' + pfeil(w, vorher) + '</span></div>');
    }

    karte(lang() === 'en' ? 'Overall average' : 'Gesamtschnitt',
          gesamt(letzte), vor != null ? gesamt(vor) : null);
    karte(lang() === 'en' ? 'General education' : 'Allgemeinbildung',
          bereich(letzte, 'ab'), vor != null ? bereich(vor, 'ab') : null);
    karte(lang() === 'en' ? 'Professional knowledge' : 'Berufskenntnisse',
          bereich(letzte, 'bk'), vor != null ? bereich(vor, 'bk') : null);

    var hatAbs = sem.some(function (s) {
      return typeof z(s).absU === 'number' || typeof z(s).absE === 'number';
    });
    if (hatAbs) {
      var unent = sem.reduce(function (a, s) { return a + (z(s).absU || 0); }, 0);
      var ent = sem.reduce(function (a, s) { return a + (z(s).absE || 0); }, 0);
      karten.push('<div><span class="titel">' +
        (lang() === 'en' ? 'Unexcused absences' : 'Absenzen unentschuldigt') + '</span>' +
        '<span class="wert ' + (unent === 0 ? 'n-gut' : 'n-weg') + '">' + unent +
        '<span class="einheit">' + (lang() === 'en' ? 'lessons' : 'Lektionen') + '</span></span>' +
        '<span class="unten">' + ent + ' ' +
        (lang() === 'en' ? 'excused' : 'entschuldigt') + '</span></div>');
    }
    $('kpi').innerHTML = karten.join('');
  }

  /* ---------------- Verlauf ---------------- */

  var W = 800, H = 290, PL = 44, PR = 18, PT = 16, PB = 34;
  function schmal() { return window.innerWidth < 640; }

  function verlauf() {
    var sem = semester();
    if (sem.length < 2) { $('s-verlauf').hidden = true; return; }
    $('s-verlauf').hidden = false;

    var alle = [];
    sem.forEach(function (s) {
      REIHEN.forEach(function (r) { var v = wert(s, r.k); if (v != null) alle.push(v); });
    });
    var min = Math.min(4, Math.floor(Math.min.apply(null, alle) * 2) / 2);
    var max = 6;
    var x = function (i) { return PL + i * (W - PL - PR) / Math.max(1, sem.length - 1); };
    var y = function (v) { return PT + (max - v) / (max - min) * (H - PT - PB); };
    var teile = [];

    for (var g = min; g <= max + 0.001; g += 0.5) {
      var yy = y(g), vier = Math.abs(g - 4) < 0.001;
      teile.push('<line x1="' + PL + '" y1="' + yy.toFixed(1) + '" x2="' + (W - PR) +
        '" y2="' + yy.toFixed(1) + '" stroke="' + (vier ? 'var(--alert)' : 'var(--line)') +
        '" stroke-width="' + (vier ? 1.5 : 1) + '"' + (vier ? ' stroke-dasharray="5 4"' : '') + '/>');
      teile.push('<text x="' + (PL - 8) + '" y="' + (yy + 4).toFixed(1) +
        '" text-anchor="end" font-family="var(--f-data)" font-size="11" fill="' +
        (vier ? 'var(--alert)' : 'var(--muted)') + '">' + g.toFixed(1) + '</text>');
    }
    sem.forEach(function (s, i) {
      teile.push('<text x="' + x(i).toFixed(1) + '" y="' + (H - 10) +
        '" text-anchor="middle" font-family="var(--f-data)" font-size="11" ' +
        'fill="var(--ink-2)">' + s + '.</text>');
    });

    var knoten = {};
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
          pkt.map(function (p) { return x(p.i).toFixed(1) + ',' + y(p.v).toFixed(1); }).join(' ') + '"/>');
      }
      pkt.forEach(function (p) {
        var schl = p.s + '|' + p.v.toFixed(2);
        if (!knoten[schl]) knoten[schl] = { i: p.i, s: p.s, v: p.v, reihen: [] };
        knoten[schl].reihen.push(r);
      });
    });

    /* Ein Knoten je Stelle, nicht je Reihe: gleiche Werte lägen sonst
       exakt übereinander — der untere unsichtbar und nicht anklickbar. */
    Object.keys(knoten).forEach(function (schl) {
      var k = knoten[schl];
      var namen = k.reihen.map(function (r) { return lang() === 'en' ? r.en : r.de; });
      var cx = x(k.i).toFixed(1), cy = y(k.v).toFixed(1);
      var strich = k.reihen.length === 1 ? k.reihen[0].c : 'var(--ink-2)';
      var ringe = '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="var(--plate)" ' +
        'stroke="' + strich + '" stroke-width="2.5" pointer-events="none"/>' +
        (k.reihen.length > 1 ? '<circle cx="' + cx + '" cy="' + cy + '" r="8.5" fill="none" ' +
          'stroke="' + strich + '" stroke-width="1" opacity="0.45" pointer-events="none"/>' : '');
      if (schmal()) { teile.push(ringe); return; }
      teile.push('<g class="punkt" tabindex="0" role="img" ' +
        'data-reihe="' + esc(namen.join(' · ')) + '" data-sem="' + k.s +
        '" data-wert="' + k.v.toFixed(2) + '">' +
        '<title>' + esc(namen.join(', ') + ' — ' + k.s + '. Semester: ' + k.v.toFixed(2)) + '</title>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="12" fill="transparent"/>' + ringe + '</g>');
    });

    var beschreibung = lang() === 'en' ? 'Grade trend by semester' : 'Notenverlauf nach Semester';
    if (schmal()) {
      beschreibung += ': ' + Object.keys(knoten).map(function (s) {
        var k = knoten[s];
        return k.reihen.map(function (r) { return lang() === 'en' ? r.en : r.de; }).join(' und ') +
               ' ' + k.s + '. Semester ' + k.v.toFixed(2);
      }).join('; ');
    }
    $('verlauf').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
      esc(beschreibung) + '">' + teile.join('') + '</svg>';
    ablesungLeeren();
  }

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
      if (!werte.some(function (v) { return v != null; })) return '';
      var vorhanden = werte.filter(function (v) { return v != null; });
      var m = vorhanden.length
        ? vorhanden.reduce(function (a, b) { return a + b; }, 0) / vorhanden.length : null;
      return '<tr class="' + (r.gruppe ? 'gruppe' : 'unter') + '"' +
        (r.c ? ' style="--c:' + r.c + '"' : '') + '>' +
        '<td>' + esc(lang() === 'en' ? r.en : r.de) + '</td>' +
        werte.map(function (v, i) {
          // Sport ohne Note ist keine Lücke, sondern «besucht».
          if (v == null && r.k === 'sport' && z(sem[i]).sportBesucht) {
            return '<td class="zahl" style="font-family:var(--f-ui);color:var(--ink-2)">' +
                   (lang() === 'en' ? 'attended' : 'besucht') + '</td>';
          }
          return '<td class="zahl ' + farbe(v) + '">' + fmt(v) + '</td>';
        }).join('') +
        '<td class="zahl ' + farbe(m) + '"><b>' + fmt(m, 2) + '</b></td></tr>';
    }).join('');

    var g = sem.map(gesamt);
    var gv = g.filter(function (v) { return v != null; });
    var gm = gv.length ? gv.reduce(function (a, b) { return a + b; }, 0) / gv.length : null;
    zeilen += '<tr class="gruppe" style="--c:var(--ink-2)">' +
      '<td>' + (lang() === 'en' ? 'Overall' : 'Gesamt') + '</td>' +
      g.map(function (v) { return '<td class="zahl ' + farbe(v) + '">' + fmt(v, 2) + '</td>'; }).join('') +
      '<td class="zahl ' + farbe(gm) + '"><b>' + fmt(gm, 2) + '</b></td></tr>';

    $('ztab').innerHTML = kopfz + '<tbody>' + zeilen + '</tbody>';
  }

  function fussnote() {
    $('fussnote').innerHTML = lang() === 'en'
      ? 'Generated automatically from the school data of schule.yanikroesti.ch. ' +
        'Lessons and upcoming dates come from the notes Yanik writes after every ' +
        'school Friday; semester grades from the official BZI reports. Sections ' +
        'without data are not shown.'
      : 'Automatisch erzeugt aus den Schuldaten von schule.yanikroesti.ch. ' +
        'Unterricht und Termine stammen aus den Notizen, die Yanik nach jedem ' +
        'Schulfreitag schreibt; die Semesternoten aus den offiziellen Zeugnissen ' +
        'des BZI Interlaken. Abschnitte ohne Daten werden nicht angezeigt.';
  }

  /* ---------------- Alles zeichnen ---------------- */

  function zeichne() {
    kopf(); lage(); fachstand(); warten(); kommend(); geschehen();
    kennzahlen(); steuerung(); verlauf(); zeugnis(); fussnote();
  }

  function bind() {
    $('vsteuer').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-reihe]');
      if (!b) return;
      var k = b.dataset.reihe;
      if (an[k] && Object.keys(an).filter(function (x) { return an[x]; }).length === 1) return;
      an[k] = !an[k];
      b.setAttribute('aria-pressed', an[k] ? 'true' : 'false');
      verlauf();
    });

    $('verlauf').addEventListener('mouseover', zeige);
    $('verlauf').addEventListener('focusin', zeige);
    $('verlauf').addEventListener('mouseleave', ablesungLeeren);
    $('verlauf').addEventListener('focusout', ablesungLeeren);
    function zeige(e) {
      var p = e.target.closest ? e.target.closest('.punkt') : null;
      if (!p) return;
      $('ablesung').innerHTML = '<b>' + esc(p.dataset.reihe) + '</b> · ' + p.dataset.sem +
        '. ' + (lang() === 'en' ? 'semester' : 'Semester') + ' · <b>' + esc(p.dataset.wert) + '</b>';
    }

    $('mehr').addEventListener('click', function () { alleZeigen = !alleZeigen; geschehen(); });
    $('drucken').addEventListener('click', function () { window.print(); });
    document.addEventListener('langchange', zeichne);

    var war = schmal(), timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (schmal() === war) return;
        war = schmal(); verlauf();
      }, 180);
    });
  }

  /* ---------------- Start ---------------- */

  function hol(pfad) {
    return fetch(pfad).then(function (r) { return r.ok ? r.json() : {}; })
                      .catch(function () { return {}; });
  }

  S.load()
    .then(function () {
      window.Shell.mount('lehrmeister', S.data().teachers);
      return Promise.all([
        hol('data/noten-local.json'), hol('data/pruefungen.json'), hol('data/agenda.json')
      ]);
    })
    .then(function (t) {
      daten.zeugnis = (t[0] && t[0].zeugnis) || {};
      daten.pruefungen = (t[1] && t[1].pruefungen) || [];
      daten.agenda = t[2] || {};
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
