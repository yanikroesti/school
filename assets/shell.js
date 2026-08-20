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
    { href: 'noten.html',    key: 'noten',    de: 'Noten',     en: 'Grades' },
    { href: 'material.html', key: 'material', de: 'Material',  en: 'Material' }
  ];

  var LOGOS = [
    { file: 'bzi.svg',           alt: 'BZI — Bildungszentrum Interlaken', href: 'https://bzi.ch',               w: 134, de: 'Bildungszentrum Interlaken', en: 'Interlaken education centre' },
    { file: 'etavis.png',        alt: 'Etavis',                           href: 'https://www.etavis.ch',        w: 115, de: 'Etavis — Lehrbetrieb', en: 'Etavis — training company' },
    { file: 'ElectroSuisse.png', alt: 'Electrosuisse',                    href: 'https://www.electrosuisse.ch', w: 42,  de: 'Electrosuisse — Herausgeberin der NIN', en: 'Electrosuisse — publisher of the NIN' },
    { file: 'suva.png',          alt: 'Suva',                             href: 'https://www.suva.ch',          w: 96,  de: 'Suva — Arbeitssicherheit', en: 'Suva — workplace safety' }
  ];

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

  global.Shell = {
    up: up,
    mount: synced(function (active, teachers) {
      document.body.insertAdjacentHTML('afterbegin', topbar(active));
      place(footer(teachers));
    }),
    mountFooter: synced(function (teachers) { place(footer(teachers)); })
  };
})(window);
