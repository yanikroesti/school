/* =========================================================
   Kopf- und Fusszeile für alle Seiten ausser der Startseite.
   Spart es, dieselben 80 Zeilen auf jeder Seite zu pflegen.
   Aufruf:  Shell.mount('lehrer')  — Argument markiert den aktiven Navi-Punkt.
   ========================================================= */
(function (global) {
  'use strict';

  function up() {
    // Wie viele Ebenen zurück zum Wurzelverzeichnis?
    var segs = location.pathname.replace(/\/[^/]*$/, '/').split('/').filter(Boolean);
    return segs.length ? '../'.repeat(segs.length) : './';
  }

  var NAV = [
    { href: '',              key: 'home',     de: 'Übersicht', en: 'Overview' },
    { href: 'plan.html',     key: 'plan',     de: 'Plan',      en: 'Plan' },
    { href: 'noten.html',    key: 'noten',    de: 'Noten',     en: 'Grades' },
    { href: 'material.html', key: 'material', de: 'Material',  en: 'Material' }
  ];

  var LOGOS = [
    { file: 'bzi.svg',           alt: 'BZI — Bildungszentrum Interlaken', href: 'https://bzi.ch',                 w: 134, de: 'Bildungszentrum Interlaken', en: 'Interlaken education centre' },
    { file: 'etavis.png',        alt: 'Etavis',                           href: 'https://www.etavis.ch',          w: 115, de: 'Etavis — Lehrbetrieb', en: 'Etavis — training company' },
    { file: 'ElectroSuisse.png', alt: 'Electrosuisse',                    href: 'https://www.electrosuisse.ch',   w: 42,  de: 'Electrosuisse — Herausgeberin der NIN', en: 'Electrosuisse — publisher of the NIN' },
    { file: 'suva.png',          alt: 'Suva',                             href: 'https://www.suva.ch',            w: 96,  de: 'Suva — Arbeitssicherheit', en: 'Suva — workplace safety' }
  ];

  function topbar(active) {
    var b = up();
    return '' +
    '<header class="topbar"><div class="wrap">' +
      '<a class="brand" href="' + b + '">schule<i>/ ELI 25a</i></a>' +
      '<nav class="nav">' +
        NAV.map(function (n) {
          return '<a href="' + b + n.href + '"' + (n.key === active ? ' aria-current="page"' : '') + '>' +
                 '<span lang="de">' + n.de + '</span><span lang="en">' + n.en + '</span></a>';
        }).join('') +
      '</nav>' +
      '<div class="tools">' +
        '<div class="langswitch" role="group" aria-label="Sprache / Language">' +
          '<button type="button" data-set="de" aria-pressed="true">DE</button>' +
          '<button type="button" data-set="en" aria-pressed="false">EN</button>' +
        '</div>' +
        '<button class="iconbtn" type="button" data-theme-toggle ' +
          'data-de-label="Hell/Dunkel umschalten" data-en-label="Toggle light/dark">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round">' +
          '<path d="M12 3v1.5M12 19.5V21M4.2 4.2l1.1 1.1M18.7 18.7l1.1 1.1M3 12h1.5M19.5 12H21M4.2 19.8l1.1-1.1M18.7 5.3l1.1-1.1"/>' +
          '<circle cx="12" cy="12" r="3.8"/></svg>' +
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
        '<a href="' + b + 'noten.html"><span lang="de">Noten</span><span lang="en">Grades</span></a>',
        '<a href="' + b + 'material.html"><span lang="de">Material</span><span lang="en">Material</span></a>'
      ]) +
      col('<span lang="de">Montag</span><span lang="en">Monday</span>', mo.map(tl)) +
      col('<span lang="de">Freitag</span><span lang="en">Friday</span>', fr.map(tl)) +
      col('Satelliten', [
        '<a href="https://dump.yanikroesti.ch" target="_blank" rel="noopener">dump.yanikroesti.ch ↗</a>',
        '<a href="https://note.yanikroesti.com" target="_blank" rel="noopener">note.yanikroesti.com ↗</a>'
      ]) +
      '<div class="logos">' + LOGOS.map(function (l) {
        return '<a href="' + l.href + '" target="_blank" rel="noopener" ' +
               'data-de-title="' + l.de + '" data-en-title="' + l.en + '">' +
               '<img src="' + b + 'logos/' + l.file + '" alt="' + l.alt + '" loading="lazy" width="' + l.w + '" height="24"></a>';
      }).join('') + '</div>' +
      '<div class="colophon">' +
        '<span lang="de">Elektroinstallateur EFZ · ELI 25a · BZI Interlaken · 2. Lehrjahr, 3. Semester. ' +
          'Stundenplan-Quelle ist <b>Stundenplan.md</b> im Vault.</span>' +
        '<span lang="en">Electrical installer EFZ · class ELI 25a · BZI Interlaken · 2nd year, 3rd semester. ' +
          'The timetable source of truth is <b>Stundenplan.md</b> in the vault.</span>' +
      '</div>' +
    '</div></footer>';
  }

  global.Shell = {
    up: up,
    mount: function (active, teachers) {
      document.body.insertAdjacentHTML('afterbegin', topbar(active));
      document.body.insertAdjacentHTML('beforeend', footer(teachers));
    }
  };
})(window);
