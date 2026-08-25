/* =========================================================
   Kalenderseite — Monat, Woche, Bearbeitungskasten, Google.

   Der Monat ist der Ueberblick, die Woche die Werkbank. Beide lesen
   dieselben drei Quellen:

     Stundenplan       data/timetable.json   (aus Stundenplan.md)
     Pruefungen/HA     data/seed.json        (spaeter Supabase)
     Eigene Termine    window.Termine        (localStorage <-> Google)
   ========================================================= */
(function () {
  'use strict';

  var S = window.Schule, R = window.Rail, T = window.Termine, W = window.Woche;
  var seed = { tests: [], homework: [] };

  var MONATE = {
    de: ['Januar','Februar','März','April','Mai','Juni','Juli','August',
         'September','Oktober','November','Dezember'],
    en: ['January','February','March','April','May','June','July','August',
         'September','October','November','December']
  };
  var WOCHENTAGE_KURZ = {
    de: ['Mo','Di','Mi','Do','Fr','Sa','So'],
    en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  };

  function lang() { return document.documentElement.getAttribute('data-l') || 'de'; }
  function tx(o) { return o ? (o[lang()] || o.de || o.en || '') : ''; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function $(id) { return document.getElementById(id); }

  var ansicht = 'woche';        // Woche ist die Voreinstellung — dort wird gearbeitet
  var gezeigt = S.jetzt();          // welcher Monat im Raster steht
  var gewaehlt = S.jetzt();         // welcher Tag unten als Schiene steht
  gezeigt.setHours(0, 0, 0, 0);
  gewaehlt.setHours(0, 0, 0, 0);

  function gleich(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
  }

  /* ---------------- Zeitzonenhinweis ---------------- */

  function zeitzonenhinweis() {
    if (!window.SchuleZeit) return;
    var ab = window.SchuleZeit.abweichung();
    var alt = $('tzwarn');
    if (alt) alt.remove();
    if (!ab) return;
    var std = Math.abs(ab) / 60;
    var richtung = ab > 0 ? (lang() === 'en' ? 'ahead of' : 'vor')
                          : (lang() === 'en' ? 'behind' : 'hinter');
    var name = (window.SchuleZeit.zonen.filter(function (z) {
      return z.id === window.SchuleZeit.zone();
    })[0] || {})[lang()] || window.SchuleZeit.zone();
    var el = document.createElement('div');
    el.className = 'tzwarn';
    el.id = 'tzwarn';
    el.innerHTML = lang() === 'en'
      ? 'Showing <b>' + esc(name) + '</b> — ' + std + ' h ' + richtung + ' this device.'
      : 'Angezeigt wird <b>' + esc(name) + '</b> — ' + std + ' h ' + richtung + ' der Uhr dieses Geräts.';
    var app = document.querySelector('main');
    var kopf = app.querySelector('.phead');
    if (kopf && kopf.nextSibling) app.insertBefore(el, kopf.nextSibling);
    else app.insertBefore(el, app.firstChild);
  }

  /* ---------------- Was ist an dem Tag? ---------------- */

  function eintraege(tag) {
    var iso = S.iso(tag);
    return {
      frei: S.freeDay(tag),
      lektionen: S.lessonsFor(tag),
      pruefungen: (seed.tests || []).filter(function (t) { return t.date === iso; }),
      aufgaben: (seed.homework || []).filter(function (h) { return h.due === iso; }),
      eigene: T.amTag(iso)
    };
  }

  /* ---------------- Monatsraster ---------------- */

  function zeichneMonat() {
    var jahr = gezeigt.getFullYear(), monat = gezeigt.getMonth();
    $('cal-h').textContent = MONATE[lang()][monat] + ' ' + jahr;

    // Montag als erster Tag der Woche — so steht es in jedem Schweizer Plan.
    var erster = new Date(jahr, monat, 1);
    var versatz = (erster.getDay() + 6) % 7;
    var start = new Date(erster);
    start.setDate(start.getDate() - versatz);

    var html = WOCHENTAGE_KURZ[lang()].map(function (w) {
      return '<div class="wd" role="columnheader">' + w + '</div>';
    }).join('');

    var heute = S.jetzt(); heute.setHours(0, 0, 0, 0);

    for (var i = 0; i < 42; i++) {
      var d = new Date(start);
      d.setDate(d.getDate() + i);
      var e = eintraege(d);

      var cls = ['tag'];
      if (d.getMonth() !== monat) cls.push('aus');
      if (e.frei) cls.push('frei');
      if (gleich(d, heute)) cls.push('heute');
      if (gleich(d, gewaehlt)) cls.push('gewaehlt');

      var inhalt = '';
      if (e.frei) {
        inhalt = '<span class="ferienwort">' + esc(tx(e.frei.name)) + '</span>';
      } else {
        var faecher = [];
        e.lektionen.forEach(function (l) {
          if (faecher.indexOf(l.subject) === -1) faecher.push(l.subject);
        });
        if (faecher.length) {
          inhalt += '<span class="balken">' + faecher.map(function (f) {
            return '<i class="s-' + f + '"></i>';
          }).join('') + '</span>';
        }
        e.pruefungen.forEach(function (t) {
          inhalt += '<span class="marke s-' + t.subject + '">' +
                    esc(S.data().subjects[t.subject] ? S.data().subjects[t.subject].code : '?') +
                    '</span>';
        });
        if (e.aufgaben.length) {
          inhalt += '<span class="ferienwort">' + e.aufgaben.length +
                    (lang() === 'en' ? ' due' : ' fällig') + '</span>';
        }
      }

      // Eigene Termine als Punkte — auch an Ferientagen, denn dort
      // stehen sie ja gerade dann.
      if (e.eigene.length) {
        inhalt += '<span class="eigen">' + e.eigene.slice(0, 6).map(function (t) {
          return '<i class="' + (t.fach ? 's-' + esc(t.fach) : 's-neutral') + '"></i>';
        }).join('') + '</span>';
      }

      var kw = d.getDay() === 1 ? '<span class="kw">' + S.isoWeek(d) + '</span>' : '';

      html += '<button class="' + cls.join(' ') + '" role="gridcell" ' +
              'data-tag="' + S.iso(d) + '" ' +
              'aria-label="' + esc(S.dayName(d, lang()) + ', ' + S.fmtDate(d, lang())) + '">' +
                '<span class="kopf"><span class="n">' + d.getDate() + '</span>' + kw + '</span>' +
                inhalt +
              '</button>';
    }

    $('cal').innerHTML = html;
  }

  /* ---------------- Der gewählte Tag als Schiene ---------------- */

  function zeichneTag() {
    $('tag-h').textContent = S.dayName(gewaehlt, lang()) + ', ' + S.fmtDate(gewaehlt, lang());

    var e = eintraege(gewaehlt);
    var teile = [];

    if (e.frei) teile.push(R.bare(e.frei, lang()));
    else if (e.lektionen.length) teile.push(R.day(gewaehlt, { lang: lang() }));

    e.pruefungen.forEach(function (t) { teile.push(R.entry(t, 'test', lang())); });
    e.aufgaben.forEach(function (h) { teile.push(R.entry(h, 'homework', lang())); });

    if (!teile.length && !e.eigene.length) teile.push(R.bare({ kind: 'no-school' }, lang()));

    // Eigene Termine als eigene Schiene darunter — anklickbar.
    if (e.eigene.length) {
      teile.push('<div class="eigenrail">' + e.eigene.map(function (t) {
        var zeit = t.ganztags
          ? (lang() === 'en' ? 'all day' : 'ganzer Tag')
          : String(t.start).slice(11, 16) + '–' + String(t.ende).slice(11, 16);
        return '<button class="ter eig' + (t.fach ? ' s-' + esc(t.fach) : '') + '" ' +
                 'style="position:static;display:block;width:100%;margin-bottom:.3rem;' +
                 'min-height:2.2rem;padding:.4rem .5rem .4rem .7rem" data-id="' + esc(t.id) + '">' +
                 '<span class="fuss"></span>' +
                 '<span class="wi"><b>' + esc(t.titel || '—') + '</b>' +
                 '<span class="wz">' + esc(zeit) + (t.ort ? ' · ' + esc(t.ort) : '') + '</span></span>' +
               '</button>';
      }).join('') + '</div>');
    }

    $('tagrail').innerHTML = teile.join('');
  }

  /* ---------------- Umschalten ---------------- */

  function kopfzeile() {
    if (ansicht === 'monat') {
      $('cal-h').textContent = MONATE[lang()][gezeigt.getMonth()] + ' ' + gezeigt.getFullYear();
      return;
    }
    var mo = W.montag();
    if (ansicht === 'tag') {
      $('cal-h').textContent = S.dayName(mo, lang()) + ', ' + S.fmtDate(mo, lang());
      return;
    }
    var so = new Date(mo); so.setDate(so.getDate() + 6);
    var gleicherMonat = mo.getMonth() === so.getMonth();
    $('cal-h').textContent =
      pad(mo.getDate()) + '.' + (gleicherMonat ? '' : pad(mo.getMonth() + 1) + '.') +
      ' – ' + pad(so.getDate()) + '.' + pad(so.getMonth() + 1) + '. ' + so.getFullYear();
  }

  function setzeAnsicht(neu) {
    if (['tag', 'woche', 'monat'].indexOf(neu) === -1) neu = 'woche';
    ansicht = neu;
    var monat = neu === 'monat';
    $('cal').hidden = !monat;
    $('woche').hidden = monat;
    $('tagsect').hidden = !monat;
    $('wochenhilfe').hidden = monat || W.grob();
    $('wochenhilfe-tipp').hidden = monat || !W.grob();
    document.querySelectorAll('.ansicht button[data-ansicht]').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.ansicht === neu ? 'true' : 'false');
    });
    // Die Ansicht, in die gewechselt wird, muss neu gezeichnet werden.
    // Ohne das stand im Monat noch der Stand von vorhin: ein Termin, den
    // man gerade in der Woche angelegt hat, fehlte dort, bis man
    // zufaellig irgendwo hinklickte.
    if (monat) { zeichneMonat(); zeichneTag(); }
    else W.setzeTage(neu === 'tag' ? 1 : 7, gewaehlt);
    kopfzeile();
    try { localStorage.setItem('schule-kal-ansicht', neu); } catch (e) {}
  }

  function zeichne() {
    if (ansicht === 'monat') { zeichneMonat(); zeichneTag(); }
    else W.zeichne();
    kopfzeile();
    zeitzonenhinweis();
  }

  /* ---------------- Bearbeitungskasten ---------------- */

  var kasten = $('kasten');
  var offen = null;           // der Termin, der bearbeitet wird — oder null
  var fachAuto = false;       // wurde das Fach von der Seite gesetzt?

  function fuelleAuswahl() {
    var D = S.data();
    var f = $('f-fach');
    f.innerHTML = '<option value="">—</option>' +
      Object.keys(D.subjects).filter(function (k) { return k.charAt(0) !== '_'; })
        .map(function (k) {
          return '<option value="' + esc(k) + '">' + esc(D.subjects[k].code) + '</option>';
        }).join('');
    var l = $('f-lehrer');
    l.innerHTML = '<option value="">—</option>' +
      D.teachers.map(function (t) {
        return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>';
      }).join('');
  }

  function ganztagsUm() {
    var an = $('f-ganz').checked;
    $('f-vonbox').hidden = an;
    $('f-bisbox').hidden = an;
    $('f-von').required = !an;
    $('f-bis').required = !an;
  }

  /** Das Fach aus der Uhrzeit vorschlagen. Nur, solange der Nutzer nicht
   *  selbst eingegriffen hat — ein Vorschlag, der eine bewusste Wahl
   *  ueberschreibt, ist keine Hilfe, sondern ein Fehler. */
  function rate() {
    var rat = $('f-rat');
    if ($('f-ganz').checked || !$('f-tag').value || !$('f-von').value || !$('f-bis').value) {
      rat.hidden = true;
      return;
    }
    var v = T.fachAus($('f-tag').value + 'T' + $('f-von').value,
                      $('f-tag').value + 'T' + $('f-bis').value);
    if (!v) {
      rat.hidden = true;
      return;
    }
    var D = S.data();
    var fach = D.subjects[v.fach] ? D.subjects[v.fach].code : v.fach;
    var lehr = D.teacherById[v.lehrer] ? D.teacherById[v.lehrer].name : v.lehrer;

    if (fachAuto || !$('f-fach').value) {
      $('f-fach').value = v.fach;
      if (!$('f-lehrer').value || fachAuto) $('f-lehrer').value = v.lehrer;
      if (!$('f-ort').value || fachAuto) $('f-ort').value = v.ort || '';
      fachAuto = true;
    }

    rat.hidden = false;
    rat.innerHTML = lang() === 'en'
      ? 'From the timetable: <b>' + esc(fach) + '</b> with ' + esc(lehr) +
        (v.ort ? ', room ' + esc(v.ort) : '') +
        (v.sicher ? '.' : ' — but the slot only partly overlaps, so check it.')
      : 'Aus dem Stundenplan: <b>' + esc(fach) + '</b> bei ' + esc(lehr) +
        (v.ort ? ', Raum ' + esc(v.ort) : '') +
        (v.sicher ? '.' : ' — die Zeit überschneidet sich aber nur teilweise, schau kurz nach.');
  }

  function oeffne(termin, vorgabe) {
    offen = termin || null;
    fachAuto = false;

    $('kasten-h').textContent = termin
      ? (lang() === 'en' ? 'Edit event' : 'Termin bearbeiten')
      : (lang() === 'en' ? 'New event' : 'Neuer Termin');
    $('f-loeschen').hidden = !termin;

    if (termin) {
      $('f-titel').value = termin.titel || '';
      $('f-ganz').checked = !!termin.ganztags;
      $('f-tag').value = String(termin.start).slice(0, 10);
      $('f-von').value = termin.ganztags ? '' : String(termin.start).slice(11, 16);
      $('f-bis').value = termin.ganztags ? '' : String(termin.ende).slice(11, 16);
      $('f-fach').value = termin.fach || '';
      $('f-lehrer').value = termin.lehrer || '';
      $('f-ort').value = termin.ort || '';
      $('f-notiz').value = termin.notiz || '';
    } else {
      var v = vorgabe || {};
      $('f-titel').value = '';
      $('f-ganz').checked = false;
      $('f-tag').value = v.tag || S.iso(gewaehlt);
      $('f-von').value = v.von || naechsteHalbe();
      $('f-bis').value = v.bis || plus($('f-von').value, 45);
      $('f-fach').value = '';
      $('f-lehrer').value = '';
      $('f-ort').value = '';
      $('f-notiz').value = '';
      fachAuto = true;                      // frischer Termin: raten erlaubt
    }

    ganztagsUm();
    rate();
    if (kasten.showModal) kasten.showModal(); else kasten.setAttribute('open', '');
    setTimeout(function () { $('f-titel').focus(); }, 30);
  }

  function naechsteHalbe() {
    var n = S.jetzt();
    var m = Math.ceil((n.getHours() * 60 + n.getMinutes()) / 30) * 30;
    if (m >= 24 * 60) m = 23 * 60;
    return pad(Math.floor(m / 60)) + ':' + pad(m % 60);
  }

  function plus(hhmm, min) {
    var p = String(hhmm || '08:00').split(':');
    var m = Math.min(23 * 60 + 55, (+p[0]) * 60 + (+p[1]) + min);
    return pad(Math.floor(m / 60)) + ':' + pad(m % 60);
  }

  function speichern(ev) {
    ev.preventDefault();
    var ganz = $('f-ganz').checked;
    var tag = $('f-tag').value;
    if (!tag || !$('f-titel').value.trim()) return;

    var von = ganz ? '00:00' : ($('f-von').value || '08:00');
    var bis = ganz ? '00:00' : ($('f-bis').value || plus(von, 45));

    // Ende vor Anfang ist kein Termin, sondern ein Tippfehler.
    if (!ganz && bis <= von) bis = plus(von, 15);

    var felder = {
      titel: $('f-titel').value.trim(),
      ganztags: ganz,
      start: ganz ? tag : tag + 'T' + von,
      ende: ganz ? tag : tag + 'T' + bis,
      fach: $('f-fach').value,
      lehrer: $('f-lehrer').value,
      ort: $('f-ort').value.trim(),
      notiz: $('f-notiz').value.trim()
    };

    if (offen) T.aendern(offen.id, felder);
    else T.anlegen(felder);

    kasten.close();
    zeichne();
  }

  function bindeKasten() {
    $('kform').addEventListener('submit', speichern);
    $('f-abbrechen').addEventListener('click', function () { kasten.close(); });
    $('f-ganz').addEventListener('change', function () { ganztagsUm(); rate(); });
    ['f-tag', 'f-von', 'f-bis'].forEach(function (id) {
      $(id).addEventListener('change', rate);
    });
    // Eigene Wahl schlaegt Vorschlag.
    $('f-fach').addEventListener('change', function () { fachAuto = false; rate(); });
    $('f-lehrer').addEventListener('change', function () { fachAuto = false; });

    $('f-loeschen').addEventListener('click', function () {
      if (!offen) return;
      var frage = lang() === 'en'
        ? 'Delete this event? It disappears here and in Google.'
        : 'Diesen Termin löschen? Er verschwindet hier und in Google.';
      if (!window.confirm(frage)) return;
      T.loeschen(offen.id);
      kasten.close();
      zeichne();
    });
  }

  /* ---------------- Google-Leiste ---------------- */

  function zeitWort(ms) {
    if (!ms) return lang() === 'en' ? 'never' : 'noch nie';
    var min = Math.round((Date.now() - ms) / 60000);
    if (min < 1) return lang() === 'en' ? 'just now' : 'gerade eben';
    if (min < 60) return 'vor ' + min + ' min';
    var h = Math.round(min / 60);
    if (h < 24) return 'vor ' + h + ' h';
    return 'vor ' + Math.round(h / 24) + (lang() === 'en' ? ' d' : ' Tagen');
  }

  var GRUENDE = {
    de: {
      'nicht-eingerichtet': 'Auf Vercel fehlen GOOGLE_CLIENT_ID und GOOGLE_CLIENT_SECRET. Bis die stehen, bleibt der Abgleich aus — eintragen kannst du trotzdem, alles liegt lokal.',
      'abgelaufen': 'Google hat die Verbindung beendet. Im Testbetrieb passiert das nach sieben Tagen. Einmal neu verbinden genügt.',
      'unerreichbar': 'Der Server antwortet nicht. Eintragen geht weiter, der Abgleich holt es später nach.',
      'kein-refresh': 'Google hat keinen dauerhaften Schlüssel geschickt. Bei Google unter Konto → Sicherheit → Drittanbieter-Apps den Zugriff entfernen und hier neu verbinden.',
      'abgelehnt': 'Die Zustimmung wurde abgebrochen.',
      'state': 'Die Rückkehr von Google passte nicht zu dieser Sitzung. Noch einmal versuchen.',
      'tausch': 'Der Schlüsseltausch mit Google ist gescheitert. Meist stimmt die Redirect-URI nicht genau.',
      'kalender': 'Der eigene Kalender liess sich nicht anlegen. Ist die Calendar API im Google-Projekt aktiviert?',
      'kopf-fehlt': 'Anfrage ohne Kennung abgewiesen.',
      'google-fehler': 'Google hat die Anfrage abgewiesen.'
    },
    en: {
      'nicht-eingerichtet': 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are missing on Vercel. Syncing stays off until they are set; you can still add events locally.',
      'abgelaufen': 'Google ended the connection. In testing mode that happens after seven days. Just connect again.',
      'unerreichbar': 'The server is not answering. You can keep adding events; the sync catches up later.',
      'kein-refresh': 'Google sent no lasting key. Remove the access under Account → Security → Third-party apps and connect again.',
      'abgelehnt': 'Consent was cancelled.',
      'state': 'The return from Google did not match this session. Try again.',
      'tausch': 'The key exchange with Google failed — usually the redirect URI does not match exactly.',
      'kalender': 'Could not create the dedicated calendar. Is the Calendar API enabled in the Google project?',
      'kopf-fehlt': 'Request rejected: identifying header missing.',
      'google-fehler': 'Google rejected the request.'
    }
  };

  function grundText(g) {
    var t = GRUENDE[lang()] || GRUENDE.de;
    return t[g] || null;
  }

  function zeichneGoogle() {
    var z = T.zustand();
    var l = lang();
    $('gpunkt').className = 'gpunkt' + (z.verbunden ? ' an' : '');

    var txt;
    if (z.laeuft) txt = l === 'en' ? 'Syncing…' : 'Gleicht ab…';
    else if (z.verbunden) {
      txt = (l === 'en' ? 'Connected' : 'Verbunden') +
            ' <span class="zeit">· ' + esc(zeitWort(T.letzterAbgleich())) + '</span>';
    } else {
      txt = l === 'en' ? 'Not connected' : 'Nicht verbunden';
    }
    $('gstatus').innerHTML = txt;

    var aus = z.grund === 'nicht-eingerichtet';
    $('gverbinden').hidden = z.verbunden || aus;
    $('gabgleich').hidden = !z.verbunden;
    $('gtrennen').hidden = !z.verbunden;

    var m = $('gmeldung');
    var grund = z.fehler || z.grund;
    var text = grund ? grundText(grund) : null;
    m.innerHTML = text ? '<div class="gmeldung">' + esc(text) + '</div>' : '';

    // Verworfene Fassungen sichtbar machen — eine Aenderung soll nicht
    // spurlos verschwinden, auch wenn sie den Vergleich verloren hat.
    var v = T.verworfen();
    var box = $('gverworfen');
    if (!v.length) { box.innerHTML = ''; return; }
    box.innerHTML =
      '<div class="gmeldung">' +
      (l === 'en'
        ? v.length + ' version(s) were overwritten by the newer side. '
        : v.length + ' Fassung(en) wurden von der jüngeren Seite überschrieben. ') +
      '<button class="tinybtn" id="vzeigen" style="margin-left:.4rem">' +
      (l === 'en' ? 'Show' : 'Anzeigen') + '</button>' +
      '<button class="tinybtn" id="vweg" style="margin-left:.3rem">' +
      (l === 'en' ? 'Clear' : 'Verwerfen') + '</button>' +
      '<ul class="vlist" id="vliste" hidden>' +
      v.slice(0, 20).map(function (x) {
        return '<li>' + esc(String(x.termin.start).slice(0, 16).replace('T', ' ')) +
               ' · ' + esc(x.termin.titel || '—') + ' · ' + esc(x.grund) + '</li>';
      }).join('') + '</ul></div>';

    $('vzeigen').addEventListener('click', function () {
      var u = $('vliste');
      u.hidden = !u.hidden;
      this.textContent = u.hidden ? (l === 'en' ? 'Show' : 'Anzeigen')
                                  : (l === 'en' ? 'Hide' : 'Verbergen');
    });
    $('vweg').addEventListener('click', function () {
      T.verworfeneLeeren();
      zeichneGoogle();
    });
  }

  /** Meldung aus ?google=… — die Rueckkehr vom Zustimmungsbildschirm. */
  function rueckmeldung() {
    var p = new URLSearchParams(location.search);
    var g = p.get('google');
    if (!g) return;
    history.replaceState(null, '', location.pathname);
    var m = $('gmeldung');
    if (g === 'verbunden') {
      m.innerHTML = '<div class="gmeldung gut">' +
        (lang() === 'en'
          ? 'Connected. Your own events now sync both ways.'
          : 'Verbunden. Eigene Termine gehen ab jetzt in beide Richtungen.') + '</div>';
    } else {
      var t = grundText(g);
      if (t) m.innerHTML = '<div class="gmeldung">' + esc(t) + '</div>';
    }
  }

  /* ---------------- Bedienung ---------------- */

  function bind() {
    function blaettern(um) {
      if (ansicht === 'monat') {
        gezeigt = new Date(gezeigt.getFullYear(), gezeigt.getMonth() + um, 1);
        zeichneMonat();
      } else {
        // weiter() springt um so viele Tage, wie gerade gezeigt werden:
        // im Tag um einen, in der Woche um sieben.
        W.weiter(um);
        gewaehlt = new Date(W.montag());
      }
      kopfzeile();
    }
    $('prev').addEventListener('click', function () { blaettern(-1); });
    $('next').addEventListener('click', function () { blaettern(1); });
    $('heute').addEventListener('click', function () {
      gezeigt = S.jetzt(); gezeigt.setHours(0, 0, 0, 0);
      gewaehlt = new Date(gezeigt);
      if (ansicht !== 'monat') W.setzeDatum(gewaehlt);
      zeichne();
    });

    document.querySelectorAll('.ansicht button[data-ansicht]').forEach(function (b) {
      b.addEventListener('click', function () { setzeAnsicht(b.dataset.ansicht); });
    });

    $('neu').addEventListener('click', function () { oeffne(null, null); });

    // Ein Zuhörer am Raster statt 42 an den Zellen — die werden neu gebaut.
    $('cal').addEventListener('click', function (ev) {
      var z = ev.target.closest('button[data-tag]');
      if (!z) return;
      gewaehlt = new Date(z.dataset.tag + 'T00:00:00');
      if (gewaehlt.getMonth() !== gezeigt.getMonth()) {
        gezeigt = new Date(gewaehlt.getFullYear(), gewaehlt.getMonth(), 1);
      }
      zeichneMonat(); zeichneTag();
    });

    // Eigene Termine unter dem Tag anklickbar
    $('tagrail').addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-id]');
      if (!b) return;
      var t = T.finde(b.dataset.id);
      if (t) oeffne(t, null);
    });

    // Wochenkopf: Tag wählen und in den Monat zurück
    $('woche').addEventListener('click', function (ev) {
      var k = ev.target.closest('.wtag');
      if (!k) return;
      gewaehlt = new Date(k.dataset.tag + 'T00:00:00');
      gezeigt = new Date(gewaehlt.getFullYear(), gewaehlt.getMonth(), 1);
      setzeAnsicht('monat');
      zeichneMonat(); zeichneTag();
    });

    $('gverbinden').addEventListener('click', function () { T.verbinden(); });
    $('gabgleich').addEventListener('click', function () {
      T.abgleichen().then(zeichne);
    });
    $('gtrennen').addEventListener('click', function () {
      var frage = lang() === 'en'
        ? 'Disconnect Google? Events stay here and in Google — only the link goes.'
        : 'Google trennen? Die Termine bleiben hier und bei Google — nur die Verbindung geht.';
      if (!window.confirm(frage)) return;
      T.trennen().then(function () { zeichneGoogle(); zeichne(); });
    });

    document.addEventListener('keydown', function (ev) {
      if (kasten.open) return;
      var t = ev.target.tagName;
      if (t === 'INPUT' || t === 'SELECT' || t === 'TEXTAREA') return;
      if (ev.altKey || ev.ctrlKey || ev.metaKey) return;

      if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); oeffne(null, null); return; }
      if (ev.key === 'w' || ev.key === 'W') {
        ev.preventDefault();
        var folge = ['tag', 'woche', 'monat'];
        setzeAnsicht(folge[(folge.indexOf(ansicht) + 1) % folge.length]);
        return;
      }
      if (ansicht !== 'monat') return;

      var um = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[ev.key];
      if (!um) return;
      ev.preventDefault();
      gewaehlt = new Date(gewaehlt.getTime());
      gewaehlt.setDate(gewaehlt.getDate() + um);
      if (gewaehlt.getMonth() !== gezeigt.getMonth()) {
        gezeigt = new Date(gewaehlt.getFullYear(), gewaehlt.getMonth(), 1);
      }
      zeichneMonat(); zeichneTag();
    });
  }

  /* ---------------- Start ---------------- */

  $('icsurl').textContent = location.origin + '/api/kalender.ics';

  S.load()
    .then(function () {
      window.Shell.mount('kalender', S.data().teachers);
      $('phead-meta').innerHTML =
        '<span>KW ' + S.isoWeek(S.jetzt()) + '</span><span>' +
        S.fmtDate(S.jetzt(), lang()) + '</span>';
      return fetch('data/seed.json').then(function (r) { return r.json(); });
    })
    .then(function (d) {
      seed = { tests: d.tests || [], homework: d.homework || [] };

      fuelleAuswahl();
      bindeKasten();
      bind();

      W.mount($('woche'), { datum: gewaehlt, oeffnen: oeffne });

      var gemerkt = null;
      try { gemerkt = localStorage.getItem('schule-kal-ansicht'); } catch (e) {}
      // Ohne gemerkte Wahl: die Woche — dort wird gearbeitet. Auf einem
      // schmalen Schirm aber der Tag.
      //
      // Nachgemessen am 26.08.2026: bei 375 px ist eine Wochenspalte
      // 44 px breit, und darin wird schon "HTOG" abgeschnitten, die
      // Uhrzeiten sowieso. Dieselbe Absicht — die Ansicht, in der man
      // arbeitet — heisst auf dem Handy eben Tag. Eine ausdrueckliche
      // Wahl bleibt immer erhalten.
      setzeAnsicht(gemerkt || (window.innerWidth < 640 ? 'tag' : 'woche'));
      zeichne();

      T.aufHorchen(function () { zeichneGoogle(); if (!kasten.open) zeichne(); });
      rueckmeldung();

      // Beim Laden einmal fragen und, wenn verbunden, gleich abgleichen.
      T.status().then(function (z) {
        zeichneGoogle();
        if (z.verbunden) return T.abgleichen().then(zeichne);
      });

      document.addEventListener('langchange', function () { zeichne(); zeichneGoogle(); });
      document.addEventListener('tzchange', zeichne);

      // Zurueck auf den Reiter: nachschauen, ob drueben etwas passiert ist.
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState !== 'visible') return;
        if (Date.now() - T.letzterAbgleich() < 60000) return;
        T.abgleichen().then(zeichne);
      });
    })
    .catch(function (e) {
      console.error(e);
      try { window.Shell.mount('kalender', []); } catch (x) {}
      $('cal').innerHTML =
        '<div class="err" style="grid-column:1/-1">' +
        '<b><span lang="de">Daten nicht geladen</span><span lang="en">Data did not load</span></b>' +
        '<span lang="de">Die Seite konnte den Stundenplan nicht lesen. Neu laden hilft meistens.</span>' +
        '<span lang="en">Could not read the timetable. A reload usually fixes it.</span></div>';
    });
})();
