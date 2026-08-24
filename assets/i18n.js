/* =========================================================
   Sprachumschaltung DE/EN + Hell/Dunkel
   Beides in localStorage, gilt für alle Seiten.
   Muster übernommen aus den Lerndokumentationen.
   ========================================================= */
(function () {
  'use strict';

  var LKEY = 'schule-lang';
  var TKEY = 'schule-theme';
  var ZKEY = 'schule-tz';
  var root = document.documentElement;

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* Privatmodus */ } }

  /* ---------------- Sprache ---------------- */

  function applyLang(lang) {
    lang = (lang === 'en') ? 'en' : 'de';
    root.setAttribute('data-l', lang);
    root.setAttribute('lang', lang === 'en' ? 'en' : 'de-CH');

    var t = document.querySelector('title');
    if (t) {
      var alt = t.getAttribute(lang === 'en' ? 'data-en' : 'data-de');
      if (alt) t.textContent = alt;
    }

    // Attribute mitziehen: data-de-* / data-en-* -> *
    var nodes = document.querySelectorAll('[data-de-label],[data-de-title],[data-de-placeholder]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var l = n.getAttribute('data-' + lang + '-label');
      var ti = n.getAttribute('data-' + lang + '-title');
      var p = n.getAttribute('data-' + lang + '-placeholder');
      if (l) n.setAttribute('aria-label', l);
      if (ti) n.setAttribute('title', ti);
      if (p) n.setAttribute('placeholder', p);
    }

    var btns = document.querySelectorAll('.langswitch button[data-set]');
    for (var j = 0; j < btns.length; j++) {
      btns[j].setAttribute('aria-pressed', btns[j].getAttribute('data-set') === lang ? 'true' : 'false');
    }

    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
    return lang;
  }

  var lang = applyLang(read(LKEY) || root.getAttribute('data-l') || 'de');

  /* ---------------- Theme ---------------- */

  function applyTheme(mode) {
    if (mode === 'dark' || mode === 'light') root.setAttribute('data-theme', mode);
    else root.removeAttribute('data-theme');
    return mode;
  }

  var theme = applyTheme(read(TKEY) || 'system');

  function nextTheme(cur) {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (cur === 'system') return prefersDark ? 'light' : 'dark';
    return cur === 'dark' ? 'light' : 'dark';
  }

  /* ---------------- Zeitzone ----------------
     Warum das eine Einstellung ist: der Stundenplan steht in Schweizer
     Ortszeit. Wer die Seite auf einem Geraet oeffnet, das anders gestellt
     ist — Server in UTC, Ferien im Ausland, falsch gestelltes Handy —
     bekaeme sonst einen Countdown, der um Stunden danebenliegt.

     Voreinstellung ist deshalb Europe/Zurich, nicht das Geraet: die
     Schulzeit ist die Wahrheit, nicht die Uhr in der Hand.               */

  var ZONEN = [
    { id: 'Europe/Zurich', de: 'Schulzeit (Zürich)', en: 'School time (Zurich)' },
    { id: 'auto',          de: 'Gerät',              en: 'Device' },
    { id: 'Europe/London', de: 'London',             en: 'London' },
    { id: 'Europe/Lisbon', de: 'Lissabon',           en: 'Lisbon' },
    { id: 'America/New_York', de: 'New York',        en: 'New York' },
    { id: 'Asia/Tokyo',    de: 'Tokio',              en: 'Tokyo' },
    { id: 'UTC',           de: 'UTC',                en: 'UTC' }
  ];

  var tz = read(ZKEY) || 'Europe/Zurich';

  /** Jetzt, in der eingestellten Zone — als Date, dessen oertliche
      Felder die dortige Wanduhr zeigen. Genau das braucht der
      Stundenplan, denn dort stehen Wanduhrzeiten. */
  function jetzt() {
    if (tz === 'auto') return new Date();
    try {
      return new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
    } catch (e) {
      return new Date();          // unbekannte Zone: lieber Geraetezeit als nichts
    }
  }

  /** Weicht die eingestellte Zone gerade von der des Geraets ab? Dann
      sagt die Seite das, statt still eine andere Zeit zu zeigen. */
  function abweichung() {
    if (tz === 'auto') return 0;
    var a = new Date(), b = jetzt();
    return Math.round((b - a) / 60000);
  }

  function setzeZone(neu) {
    tz = neu || 'Europe/Zurich';
    write(ZKEY, tz);
    document.dispatchEvent(new CustomEvent('tzchange', { detail: { tz: tz } }));
    return tz;
  }

  function zonenAuswahl() {
    var l = sprache();
    return '<select class="tzpick" id="tzpick" aria-label="' +
      (l === 'en' ? 'Time zone' : 'Zeitzone') + '">' +
      ZONEN.map(function (z) {
        return '<option value="' + z.id + '"' + (z.id === tz ? ' selected' : '') + '>' +
               (l === 'en' ? z.en : z.de) + '</option>';
      }).join('') + '</select>';
  }

  function sprache() { return root.getAttribute('data-l') || 'de'; }

  /* ---------------- Binden ----------------
     Delegiert an das Dokument statt an die Knoepfe selbst.

     Warum: die Kopfleiste wird auf allen Seiten ausser der Startseite
     von Shell.mount() eingehaengt, und das passiert erst, nachdem die
     Daten geladen sind — also lange nach DOMContentLoaded. Wer hier
     einzelne Knoepfe bindet, bindet auf acht von neun Seiten ins Leere:
     Sprachschalter und Hell/Dunkel waren dort tot.                    */

  function closest(node, sel) {
    while (node && node.nodeType === 1) {
      if (node.matches && node.matches(sel)) return node;
      node = node.parentElement;
    }
    return null;
  }

  document.addEventListener('click', function (e) {
    var l = closest(e.target, '.langswitch button[data-set]');
    if (l) {
      lang = applyLang(l.getAttribute('data-set'));
      write(LKEY, lang);
      return;
    }
    var t = closest(e.target, '[data-theme-toggle]');
    if (t) {
      theme = applyTheme(nextTheme(theme));
      write(TKEY, theme);
    }
  });

  document.addEventListener('change', function (e) {
    var z = closest(e.target, '#tzpick');
    if (z) setzeZone(z.value);
  });

  // Frisch eingehaengte Bedienelemente nachziehen: aria-pressed,
  // Titel und Beschriftungen stehen sonst auf dem Stand des Markups.
  function sync() { applyLang(lang); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();

  // Alt+L wechselt die Sprache
  document.addEventListener('keydown', function (e) {
    if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'l' || e.key === 'L')) {
      lang = applyLang(lang === 'de' ? 'en' : 'de');
      write(LKEY, lang);
    }
  });

  window.SchuleLang = { get: function () { return lang; }, sync: sync };

  window.SchuleZeit = {
    jetzt: jetzt,
    zone: function () { return tz; },
    setzen: setzeZone,
    zonen: ZONEN,
    auswahlHTML: zonenAuswahl,
    abweichung: abweichung
  };
})();
