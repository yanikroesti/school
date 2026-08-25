/* =========================================================
   Termine — eigener Speicher und Abgleich mit Google.

   ---- Wo ein Termin lebt ----

   Im Browser, in localStorage. Nicht in Google, nicht in Supabase.
   Warum: eintragen muss sofort gehen, auch im Zug ohne Netz und auch
   dann, wenn Google gar nicht verbunden ist. Der Speicher hier ist der
   Arbeitsplatz; Google ist die Kopie, die auch aufs Handy kommt.

   ---- Was in welche Richtung laeuft ----

     Eigene Termine        beide Richtungen (dieser Speicher <-> Google)
     Stundenplan           nur hinaus, ueber das ICS-Abo
     Pruefungen/Aufgaben   nur hinaus, ueber das ICS-Abo

   Der Stundenplan entsteht aus Stundenplan.md im Vault. Wer ihn in
   Google loescht, hat ihn nicht geloescht, sondern nur die Anzeige —
   beim naechsten Abruf ist er wieder da. Das ist Absicht.

   ---- Wer gewinnt, wenn beide geaendert haben ----

   Die juengere Aenderung. Verglichen wird der lokale Zeitstempel mit
   Googles "updated". Die unterlegene Fassung wird nicht weggeworfen,
   sondern landet unter "verworfen" und laesst sich auf der Seite
   ansehen — eine Aenderung soll nicht spurlos verschwinden.

   Wichtig fuer die Ruhe im System: nach jedem Hochschieben uebernehmen
   wir Googles Zeitstempel als unseren. Sonst waeren die beiden Uhren
   dauerhaft leicht verschieden und jeder Abgleich wuerde erneut
   schieben — ein Ping-Pong, das nie aufhoert.
   ========================================================= */
(function (global) {
  'use strict';

  var SCHLUESSEL = 'schule-termine';
  var VERSION = 1;

  /* Wieviel Zeitraum wird abgeglichen: acht Wochen zurueck fuer den
     Blick auf Vergangenes, dreissig nach vorn — das deckt ein Semester
     samt Ferien. */
  var ZURUECK_TAGE = 56;
  var VORAUS_TAGE = 210;

  var speicher = { v: VERSION, termine: [], verworfen: [], letzterAbgleich: 0 };
  var zustand = { verbunden: false, laeuft: false, fehler: null, grund: null };
  var horcher = [];

  /* ---------------- Speicher ---------------- */

  function laden() {
    try {
      var roh = localStorage.getItem(SCHLUESSEL);
      if (roh) {
        var d = JSON.parse(roh);
        if (d && d.v === VERSION && Array.isArray(d.termine)) speicher = d;
      }
    } catch (e) { /* Privatmodus oder Muell: mit leerem Speicher weiter */ }
    if (!speicher.verworfen) speicher.verworfen = [];
    return speicher;
  }

  function sichern() {
    try {
      localStorage.setItem(SCHLUESSEL, JSON.stringify(speicher));
    } catch (e) { /* voll oder gesperrt — der Speicher im RAM stimmt trotzdem */ }
    melden();
  }

  function melden() {
    horcher.forEach(function (f) { try { f(); } catch (e) { console.error(e); } });
  }

  function neueId() {
    if (global.crypto && global.crypto.randomUUID) return global.crypto.randomUUID();
    return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  /* ---------------- Lesen ---------------- */

  function alle() {
    return speicher.termine.filter(function (t) { return !t.geloescht; });
  }

  function finde(id) {
    for (var i = 0; i < speicher.termine.length; i++) {
      if (speicher.termine[i].id === id) return speicher.termine[i];
    }
    return null;
  }

  function findeNachGcal(gcalId) {
    if (!gcalId) return null;
    for (var i = 0; i < speicher.termine.length; i++) {
      if (speicher.termine[i].gcalId === gcalId) return speicher.termine[i];
    }
    return null;
  }

  /** Alle Termine, die den Tag beruehren — auch mehrtaegige. */
  function amTag(iso) {
    return alle().filter(function (t) {
      var a = String(t.start).slice(0, 10), b = String(t.ende).slice(0, 10);
      // Bei ganztaegigen ist das Ende ausschliessend gedacht wie in ICS,
      // hier aber einschliessend gespeichert: ein Tag = start == ende.
      return iso >= a && iso <= b;
    });
  }

  /* ---------------- Schreiben ---------------- */

  function anlegen(t) {
    var neu = {
      id: neueId(),
      titel: t.titel || '',
      start: t.start,
      ende: t.ende,
      ganztags: !!t.ganztags,
      fach: t.fach || '',
      lehrer: t.lehrer || '',
      ort: t.ort || '',
      notiz: t.notiz || '',
      geaendert: Date.now(),
      gcalId: null,
      geloescht: false
    };
    speicher.termine.push(neu);
    sichern();
    schiebeNach(neu);
    return neu;
  }

  function aendern(id, felder) {
    var t = finde(id);
    if (!t) return null;
    Object.keys(felder).forEach(function (k) {
      if (k !== 'id' && k !== 'gcalId') t[k] = felder[k];
    });
    t.geaendert = Date.now();
    sichern();
    schiebeNach(t);
    return t;
  }

  /** Loeschen heisst zunaechst: als geloescht markieren. Der Grabstein
   *  bleibt, bis Google ihn bestaetigt hat — sonst waere der Termin auf
   *  diesem Geraet weg und auf dem naechsten wieder da. */
  function loeschen(id) {
    var t = finde(id);
    if (!t) return;
    if (!t.gcalId) {
      speicher.termine = speicher.termine.filter(function (x) { return x.id !== id; });
      sichern();
      return;
    }
    t.geloescht = true;
    t.geaendert = Date.now();
    sichern();
    schiebeNach(t);
  }

  function endgueltig(id) {
    speicher.termine = speicher.termine.filter(function (x) { return x.id !== id; });
  }

  /* ---------------- Google ---------------- */

  function hol(pfad, opt) {
    opt = opt || {};
    opt.headers = Object.assign({ 'X-Schule': '1' }, opt.headers || {});
    opt.credentials = 'same-origin';
    return fetch(pfad, opt).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) {
          var e = new Error((d && d.fehler) || ('HTTP ' + r.status));
          e.code = d && d.fehler;
          e.status = r.status;
          throw e;
        }
        return d;
      });
    });
  }

  function status() {
    return fetch('/api/google/status', { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        zustand.verbunden = !!d.verbunden;
        zustand.grund = d.grund || null;
        melden();
        return zustand;
      })
      .catch(function () {
        zustand.verbunden = false;
        zustand.grund = 'unerreichbar';
        melden();
        return zustand;
      });
  }

  function verbinden() { location.href = '/api/google/start'; }

  function trennen() {
    return hol('/api/google/logout', { method: 'POST' }).then(function () {
      zustand.verbunden = false;
      // Die gcalId-Verweise werden ungueltig: der naechste Anschluss
      // legt womoeglich einen anderen Kalender an. Die Termine selbst
      // bleiben — nur ihre Verbindung nach draussen wird gekappt.
      speicher.termine.forEach(function (t) { t.gcalId = null; });
      speicher.letzterAbgleich = 0;
      sichern();
    });
  }

  /** Einen einzelnen Termin sofort hochschieben. Laeuft im Hintergrund;
   *  scheitert es, faellt es beim naechsten vollen Abgleich auf. */
  function schiebeNach(t) {
    if (!zustand.verbunden) return Promise.resolve();
    if (t.geloescht) {
      if (!t.gcalId) { endgueltig(t.id); sichern(); return Promise.resolve(); }
      return hol('/api/google/events?gcalId=' + encodeURIComponent(t.gcalId),
                 { method: 'DELETE' })
        .then(function () { endgueltig(t.id); sichern(); })
        .catch(fehlerMerken);
    }
    var methode = t.gcalId ? 'PATCH' : 'POST';
    return hol('/api/google/events', {
      method: methode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t)
    }).then(function (d) {
      if (d && d.termin) {
        t.gcalId = d.termin.gcalId;
        // Googles Uhr uebernehmen — sonst Ping-Pong bei jedem Abgleich.
        t.geaendert = d.termin.updated || t.geaendert;
        sichern();
      }
    }).catch(fehlerMerken);
  }

  function fehlerMerken(e) {
    zustand.fehler = e.code || e.message || 'fehler';
    if (e.code === 'abgelaufen' || e.code === 'nicht-verbunden' || e.status === 401) {
      zustand.verbunden = false;
    }
    melden();
  }

  /* ---------------- Der volle Abgleich ---------------- */

  function fenster() {
    var a = new Date(); a.setDate(a.getDate() - ZURUECK_TAGE);
    var b = new Date(); b.setDate(b.getDate() + VORAUS_TAGE);
    function iso(d) {
      return d.getFullYear() + '-' +
             ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
             ('0' + d.getDate()).slice(-2);
    }
    return { von: iso(a), bis: iso(b) };
  }

  function verwerfen(fassung, grund) {
    speicher.verworfen.unshift({
      wann: Date.now(), grund: grund, termin: JSON.parse(JSON.stringify(fassung))
    });
    // Fuenfzig reichen. Aelteres ist Archiv, nicht Gedaechtnis.
    if (speicher.verworfen.length > 50) speicher.verworfen.length = 50;
  }

  function abgleichen() {
    if (!zustand.verbunden || zustand.laeuft) return Promise.resolve();
    zustand.laeuft = true;
    zustand.fehler = null;
    melden();

    var f = fenster();

    return hol('/api/google/events?von=' + f.von + '&bis=' + f.bis)
      .then(function (d) {
        var fern = d.termine || [];
        var gesehen = {};
        var nachher = [];

        /* --- 1. Was von Google kommt --- */
        fern.forEach(function (r) {
          var l = (r.id && finde(r.id)) || findeNachGcal(r.gcalId);
          if (r.gcalId) gesehen[r.gcalId] = true;

          if (!l) {
            // Neu drueben — herholen.
            speicher.termine.push({
              id: r.id || neueId(),
              titel: r.titel, start: r.start, ende: r.ende, ganztags: r.ganztags,
              fach: r.fach, lehrer: r.lehrer, ort: r.ort, notiz: r.notiz,
              geaendert: r.updated, gcalId: r.gcalId, geloescht: false
            });
            return;
          }

          if (l.geloescht) {
            // Hier geloescht, drueben noch da.
            if (l.geaendert >= r.updated) nachher.push(l);      // Loeschen durchdruecken
            else {                                              // Drueben juenger: wiederbeleben
              verwerfen(l, 'hier-geloescht-drueben-neuer');
              Object.assign(l, {
                titel: r.titel, start: r.start, ende: r.ende, ganztags: r.ganztags,
                fach: r.fach, lehrer: r.lehrer, ort: r.ort, notiz: r.notiz,
                geaendert: r.updated, gcalId: r.gcalId, geloescht: false
              });
            }
            return;
          }

          if (l.geaendert > r.updated) {
            verwerfen(r, 'google-aelter');
            nachher.push(l);                                    // Hiesige Fassung hoch
          } else if (r.updated > l.geaendert) {
            verwerfen(l, 'hier-aelter');
            Object.assign(l, {
              titel: r.titel, start: r.start, ende: r.ende, ganztags: r.ganztags,
              fach: r.fach, lehrer: r.lehrer, ort: r.ort, notiz: r.notiz,
              geaendert: r.updated, gcalId: r.gcalId
            });
          }
          // Gleich alt: nichts zu tun.
        });

        /* --- 2. Was hier ist und drueben fehlt --- */
        speicher.termine.slice().forEach(function (l) {
          if (nachher.indexOf(l) !== -1) return;
          var tag = String(l.start).slice(0, 10);
          if (tag < f.von || tag > f.bis) return;               // ausserhalb des Fensters

          if (l.geloescht) { nachher.push(l); return; }

          if (!l.gcalId) { nachher.push(l); return; }           // noch nie hochgeschoben

          if (!gesehen[l.gcalId]) {
            // Hatte eine gcalId, taucht im Fenster aber nicht mehr auf:
            // drueben geloescht. Das ist der Weg Google -> Seite.
            verwerfen(l, 'in-google-geloescht');
            endgueltig(l.id);
          }
        });

        sichern();

        /* --- 3. Der Reihe nach hochschieben --- */
        return nachher.reduce(function (kette, t) {
          return kette.then(function () { return schiebeNach(t); });
        }, Promise.resolve());
      })
      .then(function () {
        speicher.letzterAbgleich = Date.now();
        sichern();
      })
      .catch(fehlerMerken)
      .then(function () {
        zustand.laeuft = false;
        melden();
      });
  }

  /* ---------------- Fach aus der Uhrzeit ----------------

     Wer Freitag 09:40 bis 11:10 zieht, meint mit ziemlicher Sicherheit
     NIN bei Berisha. Das laesst sich aus dem Stundenplan ablesen statt
     erfragen. Ausserhalb der Schulzeiten wird nicht geraten: dann steht
     das Fach auf leer und der Kasten fragt.                            */

  function minuten(hhmm) {
    var p = String(hhmm).split(':');
    return (+p[0]) * 60 + (+p[1]);
  }

  function fachAus(start, ende) {
    var S = global.Schule;
    if (!S || !S.data()) return null;
    var tag = new Date(String(start).slice(0, 10) + 'T00:00:00');
    if (isNaN(tag)) return null;
    if (S.freeDay(tag)) return null;                 // Ferien: nichts zu raten

    var a = minuten(String(start).slice(11, 16));
    var b = minuten(String(ende).slice(11, 16));
    var beste = null, bestes = 0;

    S.lessonsFor(tag).forEach(function (l) {
      var la = minuten(l.start), lb = minuten(l.end);
      var deckung = Math.min(b, lb) - Math.max(a, la);
      if (deckung > bestes) { bestes = deckung; beste = l; }
    });

    if (!beste || bestes <= 0) return null;
    return {
      fach: beste.subject,
      lehrer: beste.teacher,
      ort: beste.room || '',
      thema: beste.topic || null,
      deckung: bestes,
      // Deckt die Lektion den gezogenen Bereich zu mindestens der Haelfte,
      // ist die Zuordnung sicher genug, um sie ohne Rueckfrage zu setzen.
      sicher: bestes >= (b - a) * 0.5
    };
  }

  /* ---------------- Aussen ---------------- */

  laden();

  global.Termine = {
    alle: alle,
    amTag: amTag,
    finde: finde,
    anlegen: anlegen,
    aendern: aendern,
    loeschen: loeschen,
    fachAus: fachAus,

    status: status,
    zustand: function () { return zustand; },
    verbinden: verbinden,
    trennen: trennen,
    abgleichen: abgleichen,
    letzterAbgleich: function () { return speicher.letzterAbgleich; },
    verworfen: function () { return speicher.verworfen; },
    verworfeneLeeren: function () { speicher.verworfen = []; sichern(); },

    aufHorchen: function (f) { horcher.push(f); }
  };
})(window);
