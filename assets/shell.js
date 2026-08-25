/* =========================================================
   Kopf- und Fusszeile.
   Spart es, dieselben achtzig Zeilen auf jeder Seite zu pflegen.

     Shell.mount('plan', teachers)   Kopf- und Fusszeile
     Shell.mountFooter(teachers)     nur die Fusszeile
                                     (die Startseite hat ihren
                                      eigenen Kopf im Markup)
   ========================================================= */
(function (global) {
  'use strict';

  function up() {
    var segs = location.pathname.replace(/\/[^/]*$/, '/').split('/').filter(Boolean);
    return segs.length ? '../'.repeat(segs.length) : './';
  }

  var NAV = [
    { href: '',              key: 'home',     de: 'Übersicht', en: 'Overview' },
    { href: 'plan.html',     key: 'plan',     de: 'Plan',      en: 'Plan' },
    { href: 'kalender.html', key: 'kalender', de: 'Kalender',  en: 'Calendar' },
    { href: 'noten.html',    key: 'noten',    de: 'Noten',     en: 'Grades' },
    { href: 'material.html', key: 'material', de: 'Material',  en: 'Material' }
  ];

  var LOGOS = [
    { file: 'bzi.svg',           alt: 'BZI — Bildungszentrum Interlaken', href: 'https://bzi.ch',               w: 134, de: 'Bildungszentrum Interlaken', en: 'Interlaken education centre' },
    { file: 'etavis.png',        alt: 'Etavis',                           href: 'https://www.etavis.ch',        w: 115, de: 'Etavis — Lehrbetrieb', en: 'Etavis — training company' },
    { file: 'ElectroSuisse.png', alt: 'Electrosuisse',                    href: 'https://www.electrosuisse.ch', w: 42,  de: 'Electrosuisse — Herausgeberin der NIN', en: 'Electrosuisse — publisher of the NIN' },
    { file: 'suva.png',          alt: 'Suva',                             href: 'https://www.suva.ch',          w: 96,  de: 'Suva — Arbeitssicherheit', en: 'Suva — workplace safety' }
  ];

  /* ---------------- Verteiler ----------------
     Yaniks eigene Seiten. Eine Abzweigdose, keine Werbeleiste: hier
     stehen nur Adressen, die ihm gehoeren und laufen.

     Neue dazunehmen heisst: eine Zeile hier. Farbe aus der
     Klemmenpalette, Kuerzel auf den Fuss — dasselbe Bauteil wie
     ueberall, nur klein.

     Geprueft am 25.08.2026: alle drei erreichbar.               */
  var SATELLITEN = [
    { href: 'https://yanikroesti.ch', kuerzel: 'WEB', farbe: 's-htog',
      titel: 'yanikroesti.ch',
      de: 'Webdesign aus Thun', en: 'Web design from Thun' },
    { href: 'https://dump.yanikroesti.ch', kuerzel: 'DUMP', farbe: 's-abu',
      titel: 'dump.yanikroesti.ch',
      de: 'Lernpakete, Notizen, Abstellkammer', en: 'Study packs, notes, junk drawer' },
    { href: 'https://schule.yanikroesti.ch', kuerzel: 'ELI', farbe: 's-abt',
      titel: 'schule.yanikroesti.ch',
      de: 'Stundenplan, Noten, Kalender', en: 'Timetable, grades, calendar' }
  ];

  /** Ist das die Seite, auf der wir gerade stehen?
   *
   *  Ganze Hostnamen vergleichen, nicht Teilzeichenketten: steht man auf
   *  yanikroesti.ch, enthaelt "dump.yanikroesti.ch" diesen Namen — und ein
   *  indexOf haette dump faelschlich als "hier" behandelt und aus der
   *  Fusszeile geworfen. */
  function istHier(s) {
    var ziel = s.href.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return ziel === location.hostname.replace(/^www\./, '');
  }

  function verteiler() {
    return '' +
    '<div class="vert">' +
      '<button class="vertbtn" type="button" id="vertbtn" aria-expanded="false" ' +
        'aria-controls="vertliste" aria-haspopup="true" ' +
        'data-de-label="Meine Seiten" data-en-label="My sites">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" aria-hidden="true">' +
        // Eine Schiene, von der drei Leitungen abgehen.
        '<path d="M3 6h18M7 6v5M12 6v9M17 6v5"/>' +
        '<circle cx="7" cy="13" r="1.6"/><circle cx="12" cy="17" r="1.6"/><circle cx="17" cy="13" r="1.6"/>' +
        '</svg>' +
      '</button>' +
      '<div class="vertliste" id="vertliste" hidden role="menu" aria-labelledby="vertbtn">' +
        '<div class="verth"><span lang="de">Meine Seiten</span><span lang="en">My sites</span></div>' +
        SATELLITEN.map(function (s) {
          var da = istHier(s);
          return '<a class="vertz ' + s.farbe + '" role="menuitem" href="' + s.href + '"' +
            (da ? ' aria-current="page"' : ' target="_blank" rel="noopener"') + '>' +
            '<span class="fuss">' + s.kuerzel + '</span>' +
            '<span class="vt"><b>' + s.titel + '</b>' +
              '<span lang="de">' + s.de + '</span><span lang="en">' + s.en + '</span></span>' +
            '<span class="ext" aria-hidden="true">' + (da ? '●' : '↗') + '</span>' +
          '</a>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  // Das Zeichen ist ein Stueck Hutschiene mit zwei Klemmen darauf.
  var MARK =
    '<svg class="mk" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="square" aria-hidden="true">' +
    '<path d="M2 12h20M6 12V6h5v6M15 12V8h4v4"/></svg>';

  function topbar(active) {
    var b = up();
    return '' +
    '<header class="topbar"><div class="wrap">' +
      '<a class="brand" href="' + b + '">' + MARK + 'schule<i>ELI 25a</i></a>' +
      '<nav class="nav">' +
        NAV.map(function (n) {
          return '<a href="' + b + n.href + '"' + (n.key === active ? ' aria-current="page"' : '') + '>' +
                 '<span lang="de">' + n.de + '</span><span lang="en">' + n.en + '</span></a>';
        }).join('') +
      '</nav>' +
      '<div class="tools">' +
        verteiler() +
        (global.SchuleZeit ? global.SchuleZeit.auswahlHTML() : '') +
        '<div class="langswitch" role="group" aria-label="Sprache / Language">' +
          '<button type="button" data-set="de" aria-pressed="true">DE</button>' +
          '<button type="button" data-set="en" aria-pressed="false">EN</button>' +
        '</div>' +
        '<button class="iconbtn" type="button" data-theme-toggle ' +
          'data-de-label="Hell/Dunkel umschalten" data-en-label="Toggle light/dark">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
          'stroke-linecap="round" aria-hidden="true">' +
          '<path d="M12 3.5v1.6M12 18.9v1.6M5 5l1.15 1.15M17.85 17.85 19 19M3.5 12h1.6M18.9 12h1.6' +
          'M5 19l1.15-1.15M17.85 6.15 19 5"/><circle cx="12" cy="12" r="3.6"/></svg>' +
        '</button>' +
      '</div>' +
    '</div></header>';
  }

  function footer(teachers) {
    var b = up();
    function col(title, items) {
      return '<div class="col"><h4>' + title + '</h4><ul>' +
        items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul></div>';
    }
    var mo = (teachers || []).filter(function (t) { return t.day === 1; });
    var fr = (teachers || []).filter(function (t) { return t.day === 5; });
    function tl(t) { return '<a href="' + b + 'lehrer/' + t.id + '.html">' + t.name + '</a>'; }

    return '' +
    '<footer class="foot"><div class="wrap">' +
      col('<span lang="de">Schule</span><span lang="en">School</span>', [
        '<a href="' + b + 'plan.html"><span lang="de">Prüfungen &amp; Aufgaben</span><span lang="en">Exams &amp; homework</span></a>',
        '<a href="' + b + 'kalender.html"><span lang="de">Kalender</span><span lang="en">Calendar</span></a>',
        '<a href="' + b + 'noten.html"><span lang="de">Noten</span><span lang="en">Grades</span></a>',
        '<a href="' + b + 'material.html"><span lang="de">Material</span><span lang="en">Material</span></a>'
      ]) +
      col('<span lang="de">Montag</span><span lang="en">Monday</span>', mo.map(tl)) +
      col('<span lang="de">Freitag</span><span lang="en">Friday</span>', fr.map(tl)) +
      // Aus derselben Liste wie der Verteiler oben — sonst laufen die
      // beiden auseinander. Hier stand bis 25.08.2026 note.yanikroesti.com,
      // und das antwortete nicht mehr.
      col('<span lang="de">Meine Seiten</span><span lang="en">My sites</span>',
        SATELLITEN.filter(function (s) { return !istHier(s); }).map(function (s) {
          return '<a href="' + s.href + '" target="_blank" rel="noopener">' +
                 s.titel + ' ↗</a>';
        })) +
      '<div class="logos">' + LOGOS.map(function (l) {
        return '<a href="' + l.href + '" target="_blank" rel="noopener" ' +
               'data-de-title="' + l.de + '" data-en-title="' + l.en + '">' +
               '<img src="' + b + 'logos/' + l.file + '" alt="' + l.alt + '" loading="lazy" ' +
               'width="' + l.w + '" height="22"></a>';
      }).join('') + '</div>' +
      '<div class="colophon">' +
        '<span lang="de">Elektroinstallateur EFZ · ELI 25a · BZI Interlaken · 2. Lehrjahr, 3. Semester. ' +
          'Stundenplan-Quelle ist <b>Stundenplan.md</b> im Vault.</span>' +
        '<span lang="en">Electrical installer EFZ · class ELI 25a · BZI Interlaken · 2nd year, 3rd semester. ' +
          'The timetable source of truth is <b>Stundenplan.md</b> in the vault.</span>' +
      '</div>' +
    '</div></footer>';
  }

  function place(html) {
    var host = document.getElementById('foot-host');
    if (host) host.outerHTML = html;
    else document.body.insertAdjacentHTML('beforeend', html);
  }

  // Nach dem Einhaengen die Sprachschicht nachziehen, damit aria-pressed,
  // Titel und Beschriftungen der frischen Knoepfe stimmen.
  function synced(fn) {
    return function () {
      fn.apply(null, arguments);
      if (global.SchuleLang && global.SchuleLang.sync) global.SchuleLang.sync();
    };
  }

  /* ---------------- Verteiler bedienen ----------------
     Am Dokument gebunden, nicht am Knopf: die Kopfleiste wird erst
     eingehaengt, wenn die Daten geladen sind. Wer hier den Knopf
     direkt bindet, bindet ins Leere — derselbe Fehler, an dem
     Sprachschalter und Hell/Dunkel schon einmal tot waren.        */

  function nah(node, sel) {
    while (node && node.nodeType === 1) {
      if (node.matches && node.matches(sel)) return node;
      node = node.parentElement;
    }
    return null;
  }

  function zu() {
    var l = document.getElementById('vertliste');
    var b = document.getElementById('vertbtn');
    if (l) l.hidden = true;
    if (b) b.setAttribute('aria-expanded', 'false');
  }

  function auf() {
    var l = document.getElementById('vertliste');
    var b = document.getElementById('vertbtn');
    if (!l || !b) return;
    l.hidden = false;
    b.setAttribute('aria-expanded', 'true');
    klemmen(l, b);
  }

  /** Die Liste ins Fenster klemmen.
   *
   *  Sie haengt normalerweise rechtsbuendig am Knopf. Auf schmalen
   *  Schirmen bricht die Kopfleiste aber um, und .tools landet links —
   *  dann ragte die Liste 127 px links aus dem Bild. Rein mit CSS ist
   *  das nicht zu fassen, weil die Lage des Knopfs vom Umbruch abhaengt.
   *  Also einmal beim Oeffnen nachmessen und geradeziehen. */
  function klemmen(l, b) {
    l.style.left = '';
    l.style.right = '';
    var vert = l.parentElement;                     // der positionierte Vorfahr
    if (!vert) return;
    var lr = l.getBoundingClientRect();
    var vr = vert.getBoundingClientRect();
    var rand = 8;
    var platz = document.documentElement.clientWidth;
    if (lr.left >= rand && lr.right <= platz - rand) return;   // passt schon

    var wunsch = Math.min(
      Math.max(rand, vr.right - lr.width),          // am liebsten rechtsbuendig
      platz - lr.width - rand
    );
    l.style.right = 'auto';
    l.style.left = (wunsch - vr.left) + 'px';
  }

  function eintraege() {
    var l = document.getElementById('vertliste');
    return l ? Array.prototype.slice.call(l.querySelectorAll('.vertz')) : [];
  }

  document.addEventListener('click', function (e) {
    var b = nah(e.target, '.vertbtn');
    if (b) {
      e.preventDefault();
      if (b.getAttribute('aria-expanded') === 'true') zu();
      else auf();
      return;
    }
    // Klick irgendwo sonst schliesst — ausser auf die Liste selbst.
    if (!nah(e.target, '.vertliste')) zu();
  });

  // Dreht jemand das Handy, stimmt die gemessene Lage nicht mehr.
  // Zumachen ist ehrlicher als eine Liste, die daneben haengt.
  window.addEventListener('resize', function () {
    var l = document.getElementById('vertliste');
    if (l && !l.hidden) zu();
  });

  document.addEventListener('keydown', function (e) {
    var l = document.getElementById('vertliste');
    if (!l || l.hidden) {
      // Pfeil nach unten auf dem Knopf oeffnet und springt in die Liste.
      if (e.key === 'ArrowDown' && nah(e.target, '.vertbtn')) {
        e.preventDefault(); auf();
        var erste = eintraege()[0];
        if (erste) erste.focus();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault(); zu();
      var b = document.getElementById('vertbtn');
      if (b) b.focus();
      return;
    }

    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    var items = eintraege();
    if (!items.length) return;
    e.preventDefault();
    var i = items.indexOf(document.activeElement);
    var n = e.key === 'ArrowDown' ? i + 1 : i - 1;
    if (n < 0) n = items.length - 1;
    if (n >= items.length) n = 0;
    items[n].focus();
  });

  global.Shell = {
    up: up,
    satelliten: SATELLITEN,
    // Die Startseite baut ihre Kopfleiste selbst im Markup und ruft
    // Shell.mount() nie auf — sie holt sich den Verteiler hierueber.
    verteilerHTML: verteiler,
    mount: synced(function (active, teachers) {
      document.body.insertAdjacentHTML('afterbegin', topbar(active));
      place(footer(teachers));
    }),
    mountFooter: synced(function (teachers) { place(footer(teachers)); })
  };
})(window);
