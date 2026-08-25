/* =========================================================
   Wochenansicht — sieben Schienen nebeneinander, Zeit nach unten.

   Die Monatsansicht ist der Ueberblick. Diese hier ist die Werkbank:
   nur hier gibt es eine Zeitachse, und nur an einer Zeitachse kann man
   ziehen. Sieben senkrechte Hutschienen, eine je Tag; Lektionen und
   eigene Termine sitzen als Klemmen darauf, an der Stelle, die ihrer
   Uhrzeit entspricht.

   ---- Was sich ziehen laesst und was nicht ----

   Eigene Termine: anlegen, verschieben, an der Unterkante laenger
   ziehen, auch quer auf einen anderen Tag.

   Lektionen nicht. Sie kommen aus Stundenplan.md und sind hier
   Anzeige, kein Bedienelement — wer sie verschieben koennte, wuerde
   glauben, damit den Stundenplan zu aendern. Er aendert nur die Anzeige,
   und beim naechsten Laden waere alles wie vorher. Lieber gar nicht
   erst anbieten.

   ---- Finger statt Maus ----

   Auf Geraeten ohne Maus wird nicht gezogen, sondern getippt: ein Tipp
   auf freie Flaeche legt 45 Minuten an und oeffnet den Kasten. Grund:
   das Raster muesste zum Ziehen das senkrechte Wischen abfangen, und
   dann liesse sich die Seite nicht mehr scrollen. Eine Bedienung, die
   das Scrollen kaputtmacht, ist schlechter als eine ohne Ziehen.
   ========================================================= */
(function (global) {
  'use strict';

  var S = global.Schule, T = global.Termine;

  var PX_PRO_MIN = 0.85;         // Hoehe einer Minute
  var RASTER = 5;                // auf 5 Minuten einrasten
  var MIN_DAUER = 15;            // kuerzer laesst sich nicht ziehen
  var VON_STD = 7, BIS_STD = 18; // Standardausschnitt

  var wurzel = null;
  var montag = null;             // Montag der gezeigten Woche
  var vonMin = VON_STD * 60, bisMin = BIS_STD * 60;
  var beimOeffnen = null;        // Rueckruf: Termin bearbeiten
  var grob = global.matchMedia && global.matchMedia('(pointer: coarse)').matches;

  var KURZ = {
    de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  function lang() { return document.documentElement.getAttribute('data-l') || 'de'; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isoTag(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function minuten(hhmm) {
    var p = String(hhmm).split(':');
    return (+p[0]) * 60 + (+p[1]);
  }
  function hhmm(m) {
    m = Math.max(0, Math.min(24 * 60 - 1, Math.round(m)));
    return pad(Math.floor(m / 60)) + ':' + pad(m % 60);
  }
  function tageAb(d, n) {
    var x = new Date(d); x.setDate(x.getDate() + n); x.setHours(0, 0, 0, 0); return x;
  }

  /** Montag der Woche, in der d liegt. Schweizer Plaene fangen montags an. */
  function montagVon(d) {
    var x = new Date(d);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x;
  }

  /* ---------------- Ausschnitt bestimmen ----------------
     Standard ist 07:00 bis 18:00 — das deckt jede Lektion ab. Liegt in
     der Woche etwas davor oder danach, wird der Ausschnitt so weit
     aufgezogen, dass es sichtbar ist. Ein Termin, den man nicht sieht,
     ist schlimmer als ein etwas hoeheres Raster.                        */

  function ausschnitt(tage) {
    var a = VON_STD * 60, b = BIS_STD * 60;
    tage.forEach(function (t) {
      t.lektionen.forEach(function (l) {
        a = Math.min(a, minuten(l.start));
        b = Math.max(b, minuten(l.end));
      });
      t.eigene.forEach(function (e) {
        if (e.ganztags) return;
        a = Math.min(a, minuten(String(e.start).slice(11, 16)));
        b = Math.max(b, minuten(String(e.ende).slice(11, 16)));
      });
    });
    vonMin = Math.max(0, Math.floor(a / 60) * 60);
    bisMin = Math.min(24 * 60, Math.ceil(b / 60) * 60);
    if (bisMin - vonMin < 240) bisMin = vonMin + 240;   // nie flacher als 4 h
  }

  /* ---------------- Daten der Woche ---------------- */

  function wochendaten() {
    var tage = [];
    for (var i = 0; i < 7; i++) {
      var d = tageAb(montag, i);
      var iso = isoTag(d);
      var frei = S.freeDay(d);
      tage.push({
        datum: d,
        iso: iso,
        frei: frei,
        lektionen: frei ? [] : S.lessonsFor(d),
        eigene: T ? T.amTag(iso) : []
      });
    }
    return tage;
  }

  /* ---------------- Spuren bei Ueberschneidung ----------------
     Zwei Termine zur selben Zeit duerfen sich nicht verdecken. Sie
     teilen sich die Breite: gierige Zuteilung, jeder nimmt die erste
     Spur, die zu seiner Zeit frei ist.                                 */

  function spuren(stuecke) {
    var sortiert = stuecke.slice().sort(function (x, y) {
      return x.a - y.a || y.b - x.b;
    });
    var enden = [];
    sortiert.forEach(function (s) {
      var i = 0;
      while (i < enden.length && enden[i] > s.a) i++;
      s.spur = i;
      enden[i] = s.b;
    });
    var n = Math.max(1, enden.length);
    sortiert.forEach(function (s) { s.spuren = n; });
    return sortiert;
  }

  /* ---------------- Zeichnen ---------------- */

  function stueckStil(s) {
    var oben = (s.a - vonMin) * PX_PRO_MIN;
    // Nie flacher als 20 px, auch wenn die Lektion nur 15 Minuten dauert:
    // darunter trifft man die Klemme mit dem Finger nicht mehr. Die Hoehe
    // erzaehlt dann fuer die kuerzesten Termine leicht zu viel — das ist
    // der bessere Fehler.
    var hoch = Math.max(20, (s.b - s.a) * PX_PRO_MIN);
    var breite = 100 / s.spuren;
    return 'top:' + oben.toFixed(1) + 'px;height:' + hoch.toFixed(1) + 'px;' +
           'left:' + (s.spur * breite).toFixed(3) + '%;width:' + breite.toFixed(3) + '%;';
  }

  function zeichne() {
    if (!wurzel) return;
    var tage = wochendaten();
    ausschnitt(tage);

    var D = S.data();
    var heute = isoTag(S.jetzt());
    var l = lang();

    /* --- Kopfzeile --- */
    var kopf = '<div class="wkopf"><div class="ecke">' +
      '<span class="kwzahl">KW ' + S.isoWeek(montag) + '</span></div>';
    tage.forEach(function (t) {
      var cls = ['wtag'];
      if (t.iso === heute) cls.push('heute');
      if (t.frei) cls.push('frei');
      if (t.datum.getDay() === 0 || t.datum.getDay() === 6) cls.push('we');
      kopf += '<button class="' + cls.join(' ') + '" data-tag="' + t.iso + '">' +
                '<span class="wd">' + KURZ[l][(t.datum.getDay() + 6) % 7] + '</span>' +
                '<b>' + t.datum.getDate() + '</b>' +
              '</button>';
    });
    kopf += '</div>';

    /* --- Zeitspalte --- */
    var zeit = '<div class="wzeit">';
    for (var m = Math.ceil(vonMin / 60) * 60; m <= bisMin; m += 60) {
      zeit += '<span style="top:' + ((m - vonMin) * PX_PRO_MIN).toFixed(1) + 'px">' +
              hhmm(m) + '</span>';
    }
    zeit += '</div>';

    /* --- Spalten --- */
    var hoehe = (bisMin - vonMin) * PX_PRO_MIN;
    var feld = '<div class="wfeld" id="wfeld" style="height:' + hoehe.toFixed(1) + 'px">';
    feld += zeit;

    tage.forEach(function (t) {
      var stuecke = [];

      t.lektionen.forEach(function (lek) {
        stuecke.push({
          art: 'lek', a: minuten(lek.start), b: minuten(lek.end), d: lek
        });
      });
      t.eigene.forEach(function (e) {
        if (e.ganztags) return;                       // stehen oben als Band
        stuecke.push({
          art: 'eig',
          a: minuten(String(e.start).slice(11, 16)),
          b: minuten(String(e.ende).slice(11, 16)),
          d: e
        });
      });

      var cls = ['spalte'];
      if (t.frei) cls.push('frei');
      if (t.iso === heute) cls.push('heute');
      var wt = t.datum.getDay();
      if (wt === 0 || wt === 6) cls.push('we');

      var inner = '';

      // Ganztaegige als Band ganz oben
      var band = t.eigene.filter(function (e) { return e.ganztags; });
      band.forEach(function (e, i) {
        inner += '<button class="ganz' + (e.fach ? ' s-' + esc(e.fach) : '') + '" ' +
                 'data-id="' + esc(e.id) + '" style="top:' + (i * 26) + 'px">' +
                 esc(e.titel || '—') + '</button>';
      });

      spuren(stuecke).forEach(function (s) {
        if (s.art === 'lek') {
          var lek = s.d;
          var f = D.subjects[lek.subject] || { code: '?' };
          var lehr = D.teacherById[lek.teacher];
          inner += '<div class="ter lek s-' + esc(lek.subject) + '" style="' + stueckStil(s) + '" ' +
                     'title="' + esc(f.code + ' · ' + (lehr ? lehr.name : '') + ' · ' + (lek.room || '')) + '">' +
                     '<span class="fuss"></span>' +
                     '<span class="wi">' +
                       '<b>' + esc(f.code) + '</b>' +
                       '<span class="wz">' + esc(lek.start) + '–' + esc(lek.end) + '</span>' +
                       (lehr ? '<span class="wl">' + esc(lehr.name) + '</span>' : '') +
                     '</span>' +
                   '</div>';
        } else {
          var e = s.d;
          inner += '<button class="ter eig' + (e.fach ? ' s-' + esc(e.fach) : '') + '" ' +
                     'style="' + stueckStil(s) + '" data-id="' + esc(e.id) + '">' +
                     '<span class="fuss"></span>' +
                     '<span class="wi">' +
                       '<b>' + esc(e.titel || '—') + '</b>' +
                       '<span class="wz">' + hhmm(s.a) + '–' + hhmm(s.b) + '</span>' +
                     '</span>' +
                     (grob ? '' : '<i class="griff" aria-hidden="true"></i>') +
                   '</button>';
        }
      });

      feld += '<div class="' + cls.join(' ') + '" data-tag="' + t.iso + '">' + inner + '</div>';
    });

    feld += '</div>';

    wurzel.innerHTML = kopf + '<div class="wleib">' + feld + '</div>';
    wurzel.style.setProperty('--stunde-h', (60 * PX_PRO_MIN).toFixed(2) + 'px');
    jetztLinie();
  }

  /** Die rote Linie auf der Hoehe der aktuellen Uhrzeit — nur in der
   *  Woche, in der heute liegt, und nur wenn die Zeit im Ausschnitt ist. */
  function jetztLinie() {
    var n = S.jetzt();
    var iso = isoTag(n);
    var sp = wurzel.querySelector('.spalte[data-tag="' + iso + '"]');
    if (!sp) return;
    var m = n.getHours() * 60 + n.getMinutes();
    if (m < vonMin || m > bisMin) return;
    var el = document.createElement('div');
    el.className = 'jetzt';
    el.style.top = ((m - vonMin) * PX_PRO_MIN).toFixed(1) + 'px';
    el.setAttribute('aria-hidden', 'true');
    sp.appendChild(el);
  }

  /* ---------------- Punkt -> Zeit und Tag ---------------- */

  function ausPunkt(ev) {
    var feld = wurzel.querySelector('#wfeld');
    if (!feld) return null;
    var spalten = wurzel.querySelectorAll('.spalte');
    if (!spalten.length) return null;

    var r0 = spalten[0].getBoundingClientRect();
    var rn = spalten[spalten.length - 1].getBoundingClientRect();
    var breite = (rn.right - r0.left) / 7;
    var i = Math.floor((ev.clientX - r0.left) / breite);
    i = Math.max(0, Math.min(6, i));

    var y = ev.clientY - r0.top;
    var m = vonMin + y / PX_PRO_MIN;
    m = Math.round(m / RASTER) * RASTER;
    m = Math.max(vonMin, Math.min(bisMin, m));

    return { spalte: i, tag: isoTag(tageAb(montag, i)), min: m };
  }

  /* ---------------- Ziehen ---------------- */

  var zug = null;

  function geist(tagIso, a, b) {
    weg();
    var sp = wurzel.querySelector('.spalte[data-tag="' + tagIso + '"]');
    if (!sp) return;
    var el = document.createElement('div');
    el.className = 'geist';
    el.style.top = ((Math.min(a, b) - vonMin) * PX_PRO_MIN).toFixed(1) + 'px';
    el.style.height = (Math.abs(b - a) * PX_PRO_MIN).toFixed(1) + 'px';
    el.textContent = hhmm(Math.min(a, b)) + '–' + hhmm(Math.max(a, b));
    sp.appendChild(el);
  }

  function weg() {
    var g = wurzel.querySelector('.geist');
    if (g) g.remove();
  }

  function runter(ev) {
    if (grob) return;
    if (ev.button !== undefined && ev.button !== 0) return;

    var griff = ev.target.closest && ev.target.closest('.griff');
    var eig = ev.target.closest && ev.target.closest('.ter.eig');
    var p = ausPunkt(ev);
    if (!p) return;

    if (griff && eig) {
      var t1 = T.finde(eig.dataset.id);
      if (!t1) return;
      zug = { art: 'ende', id: t1.id, tag: String(t1.start).slice(0, 10),
              a: minuten(String(t1.start).slice(11, 16)) };
      ev.preventDefault();
    } else if (eig) {
      var t2 = T.finde(eig.dataset.id);
      if (!t2 || t2.ganztags) return;
      var a2 = minuten(String(t2.start).slice(11, 16));
      zug = { art: 'schieben', id: t2.id, tag: String(t2.start).slice(0, 10),
              a: a2, dauer: minuten(String(t2.ende).slice(11, 16)) - a2,
              griffAb: p.min - a2, start: p };
      ev.preventDefault();
    } else if (ev.target.closest && ev.target.closest('.spalte')) {
      zug = { art: 'neu', tag: p.tag, a: p.min, b: p.min, bewegt: false };
      ev.preventDefault();
    } else {
      return;
    }

    var feld = wurzel.querySelector('#wfeld');
    if (feld && feld.setPointerCapture) {
      try { feld.setPointerCapture(ev.pointerId); zug.pointer = ev.pointerId; } catch (e) {}
    }
  }

  function bewegen(ev) {
    if (!zug) return;
    var p = ausPunkt(ev);
    if (!p) return;

    if (zug.art === 'neu') {
      zug.b = p.min;
      zug.tag = p.tag;
      if (Math.abs(zug.b - zug.a) >= RASTER) zug.bewegt = true;
      geist(zug.tag, zug.a, zug.b);
    } else if (zug.art === 'schieben') {
      var neuA = Math.max(vonMin, Math.min(bisMin - zug.dauer, p.min - zug.griffAb));
      zug.neuTag = p.tag;
      zug.neuA = Math.round(neuA / RASTER) * RASTER;
      geist(p.tag, zug.neuA, zug.neuA + zug.dauer);
    } else if (zug.art === 'ende') {
      zug.neuB = Math.max(zug.a + MIN_DAUER, p.min);
      geist(zug.tag, zug.a, zug.neuB);
    }
  }

  function hoch(ev) {
    if (!zug) return;
    var z = zug;
    zug = null;
    weg();
    var feld = wurzel.querySelector('#wfeld');
    if (feld && z.pointer != null && feld.releasePointerCapture) {
      try { feld.releasePointerCapture(z.pointer); } catch (e) {}
    }

    if (z.art === 'neu') {
      var a = Math.min(z.a, z.b), b = Math.max(z.a, z.b);
      // Ein Klick ohne Ziehen meint 45 Minuten — so lang ist hier eine
      // Lektion. Wer etwas anderes will, zieht oder tippt es im Kasten.
      if (!z.bewegt || b - a < MIN_DAUER) { a = z.a; b = z.a + 45; }
      if (b > bisMin) { b = bisMin; a = Math.min(a, b - MIN_DAUER); }
      neuerTermin(z.tag, hhmm(a), hhmm(b));
      return;
    }

    if (z.art === 'schieben' && z.neuA != null) {
      var t = T.finde(z.id);
      if (!t) return;
      var tag = z.neuTag || z.tag;
      if (tag === String(t.start).slice(0, 10) &&
          z.neuA === minuten(String(t.start).slice(11, 16))) return;   // nichts bewegt
      T.aendern(t.id, {
        start: tag + 'T' + hhmm(z.neuA),
        ende: tag + 'T' + hhmm(z.neuA + z.dauer)
      });
      return;
    }

    if (z.art === 'ende' && z.neuB != null) {
      var t2 = T.finde(z.id);
      if (!t2) return;
      T.aendern(t2.id, { ende: z.tag + 'T' + hhmm(z.neuB) });
    }
  }

  /* ---------------- Aussen ---------------- */

  function neuerTermin(tagIso, von, bis) {
    if (beimOeffnen) beimOeffnen(null, { tag: tagIso, von: von, bis: bis });
  }

  function bind() {
    wurzel.addEventListener('pointerdown', runter);
    wurzel.addEventListener('pointermove', bewegen);
    wurzel.addEventListener('pointerup', hoch);
    wurzel.addEventListener('pointercancel', function () {
      zug = null; weg();
    });

    wurzel.addEventListener('click', function (ev) {
      var eig = ev.target.closest('.ter.eig, .ganz');
      if (eig) {
        var t = T.finde(eig.dataset.id);
        if (t && beimOeffnen) beimOeffnen(t, null);
        return;
      }
      // Tippen auf freie Flaeche — auf Geraeten ohne Maus der Weg zum
      // neuen Termin, weil dort nicht gezogen wird.
      if (grob && ev.target.closest('.spalte')) {
        var p = ausPunkt(ev);
        if (p) neuerTermin(p.tag, hhmm(p.min), hhmm(Math.min(bisMin, p.min + 45)));
      }
    });
  }

  global.Woche = {
    mount: function (el, opts) {
      wurzel = el;
      opts = opts || {};
      beimOeffnen = opts.oeffnen || null;
      montag = montagVon(opts.datum || S.jetzt());
      bind();
      zeichne();
    },
    zeichne: zeichne,
    montag: function () { return montag; },
    setzeDatum: function (d) { montag = montagVon(d); zeichne(); },
    weiter: function (n) { montag = tageAb(montag, n * 7); zeichne(); },
    grob: function () { return grob; }
  };
})(window);
