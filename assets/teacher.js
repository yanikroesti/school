/* =========================================================
   Lehrerseite. Jede lehrer/*.html ruft nur Teacher.render('id') auf —
   der ganze Aufbau steckt hier, der Inhalt in data/pages.json.

   Alles sitzt in denselben Bauteilen wie die Startseite: Schiene und
   Klemme fuer alles mit Uhrzeit, Panel fuer alles zum Lesen.
   ========================================================= */
(function (global) {
  'use strict';

  function lang() { return document.documentElement.getAttribute('data-l') || 'de'; }
  function tx(o) { if (!o) return ''; return typeof o === 'string' ? o : (o[lang()] || o.de || o.en || ''); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function bi(o) {   // beide Sprachen ins Markup, CSS blendet aus
    if (!o) return '';
    if (typeof o === 'string') return esc(o);
    return '<span lang="de">' + esc(o.de || '') + '</span><span lang="en">' + esc(o.en || o.de || '') + '</span>';
  }

  var S, R, id, page, teacher, D;

  /* ---------------- Seitenkopf ---------------- */

  function headHTML() {
    var marks = teacher.subjects.map(function (s) {
      return '<span class="mark s-' + s + '">' + esc(D.subjects[s].code) + '</span>';
    }).join('');
    var day = teacher.day === 1
      ? '<span lang="de">Montag</span><span lang="en">Monday</span>'
      : '<span lang="de">Freitag</span><span lang="en">Friday</span>';
    return '' +
    '<header class="phead">' +
      '<div class="top">' +
        '<h1>' + esc(teacher.name) + '</h1>' +
        '<p class="meta">' + day + '<span>' + esc(teacher.room) + '</span></p>' +
      '</div>' +
      '<div class="marks">' + marks +
        (teacher.exams
          ? '<span class="badge"><span lang="de">alle Prüfungen zu NIN und Apparatekunde</span>' +
            '<span lang="en">all NIN and equipment exams</span></span>'
          : '') +
      '</div>' +
      (page.intro ? '<p class="lead">' + bi(page.intro) + '</p>' : '') +
    '</header>';
  }

  /* ---------------- Lektionen: eine Schiene ---------------- */

  function lessonsHTML() {
    var mine = D.timetable.lessons.filter(function (l) { return l.teacher === id; });
    if (!mine.length) return '';
    var terms = mine.map(function (l) {
      return R.lesson(l, null, { lang: lang(), noLink: true, showWeek: true, room: true });
    }).join('');
    var note = mine.filter(function (l) { return l.note; })[0];
    return '' +
    '<section class="sect" aria-labelledby="les-h"><div class="sect-h">' +
      '<h2 id="les-h"><span lang="de">Lektionen</span><span lang="en">Lessons</span></h2>' +
      '<span class="count">' + mine.length + '</span><span class="spacer"></span></div>' +
      '<div class="rail">' + terms + '</div>' +
      (note ? '<p class="tnote">' + bi(note.note) + '</p>' : '') +
    '</section>';
  }

  /* ---------------- Wie die Note zustande kommt ---------------- */

  function rulesHTML() {
    if (!page.rules) return '';
    var rows = page.rules.map(function (r) {
      return '<tr' + (r.highlight ? ' class="hl"' : '') + '>' +
        '<td><b>' + bi(r.what) + '</b></td>' +
        '<td>' + bi(r.when) + '</td>' +
        '<td class="muted">' + bi(r.counts) + '</td></tr>';
    }).join('');
    return '' +
    '<section class="sect" aria-labelledby="rul-h"><div class="sect-h">' +
      '<h2 id="rul-h"><span lang="de">Wie die Note zustande kommt</span>' +
        '<span lang="en">How the grade is built</span></h2>' +
      '<span class="spacer"></span></div>' +
      '<div class="panel"><div class="tbl-scroll"><table class="tbl"><thead><tr>' +
        '<th><span lang="de">Was</span><span lang="en">What</span></th>' +
        '<th><span lang="de">Rhythmus</span><span lang="en">Cadence</span></th>' +
        '<th><span lang="de">Zählt</span><span lang="en">Counts</span></th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div></div></section>';
  }

  /* ---------------- Themen: gestapelte Panels ----------------
     Bewusst kein Kartenraster: die Bloecke tragen sehr verschieden
     viel Inhalt, und gleich grosse Karten wuerden das verstecken. */

  function topicsHTML() {
    if (!page.topics || !page.topics.length) return '';
    var blocks = page.topics.map(function (t) {
      var goals = '';
      if (t.goals) {
        goals = '<div class="goals"><h4>' + bi(t.goals.title) + '</h4><ul>' +
          t.goals.items.map(function (g) { return '<li>' + bi(g) + '</li>'; }).join('') +
          '</ul></div>';
      }
      var bullets = (t.bullets && t.bullets.length)
        ? '<ul class="bul">' + t.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>'
        : '';
      return '<article class="panel topic" id="' + esc(t.id) + '">' +
        '<div class="ph">' +
          '<span class="mark s-' + t.subject + '">' + esc(D.subjects[t.subject].code) + '</span>' +
          '<span class="t">' + bi(t.title) + '</span>' +
          (t.unverified
            ? '<span class="unconf"><span lang="de">erwartet, nicht bestätigt</span>' +
              '<span lang="en">expected, unconfirmed</span></span>'
            : '') +
        '</div>' +
        '<div class="pb">' +
          (t.desc ? '<p>' + bi(t.desc) + '</p>' : '') + bullets + goals +
        '</div>' +
      '</article>';
    }).join('');
    return '' +
    '<section class="sect" aria-labelledby="top-h"><div class="sect-h">' +
      '<h2 id="top-h"><span lang="de">Themen</span><span lang="en">Topics</span></h2>' +
      '<span class="count">' + page.topics.length + '</span><span class="spacer"></span></div>' +
      '<div class="topics">' + blocks + '</div></section>';
  }

  /* ---------------- Prüfungen: dieselbe Schiene wie überall ---------------- */

  function examsHTML(seed) {
    var mine = (seed.tests || [])
      .filter(function (t) { return t.teacher === id; })
      .concat((seed.recurring || [])
        .filter(function (r) { return r.teacher === id; })
        .map(function (r) {
          var m = /^weekly:(\d)$/.exec(r.rrule || '');
          var d = m ? R.nextWeekday(+m[1]) : null;
          var o = {};
          for (var k in r) o[k] = r[k];
          o.date = d ? S.iso(d) : null;
          o.recurring = true;
          return o;
        }));
    if (!mine.length) return '';
    mine.sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
    return '' +
    '<section class="sect" aria-labelledby="ex-h"><div class="sect-h">' +
      '<h2 id="ex-h"><span lang="de">Prüfungen</span><span lang="en">Exams</span></h2>' +
      '<span class="count">' + mine.length + '</span><span class="spacer"></span></div>' +
      '<div class="rail">' +
        mine.map(function (t) { return R.entry(t, 'test', lang()); }).join('') +
      '</div></section>';
  }

  /* ---------------- Was noch offen ist ---------------- */

  function openHTML() {
    if (!page.open) return '';
    return '<section class="sect"><div class="panel openbox">' +
      '<div class="ph"><span lang="de">Noch offen</span><span lang="en">Still open</span></div>' +
      '<div class="pb"><p>' + bi(page.open) + '</p></div></div></section>';
  }

  /* ---------------- Aufbau ---------------- */

  function render(teacherId) {
    id = teacherId;
    S = global.Schule;
    R = global.Rail;
    Promise.all([
      S.load(),
      fetch(Shell.up() + 'data/pages.json').then(function (r) { return r.json(); }),
      fetch(Shell.up() + 'data/seed.json').then(function (r) { return r.json(); }),
      global.Lernpakete ? global.Lernpakete.load(Shell.up()).catch(function () { return null; }) : null
    ]).then(function (parts) {
      D = S.data();
      page = parts[1][id] || {};
      var seed = parts[2];
      teacher = D.teacherById[id];
      if (!teacher) {
        document.getElementById('app').innerHTML =
          '<div class="err"><b>Unbekannte Lehrperson</b>Diese Seite gehört zu keiner Lehrperson im Stundenplan.</div>';
        return;
      }

      Shell.mount('lehrer', D.teachers);
      document.title = teacher.name + ' — Schule';

      function paint() {
        document.getElementById('app').innerHTML =
          headHTML() + lessonsHTML() + rulesHTML() +
          (page.pyramide && global.Pyramide ? global.Pyramide.html() : '') +
          (page.abuModules && global.AbuRad ? global.AbuRad.html(page.abuModules) : '') +
          topicsHTML() + examsHTML(seed) +
          (global.Lernpakete
            ? global.Lernpakete.html(D.subjects, function (x) { return x.teacher === id; })
            : '') +
          openHTML();
        document.dispatchEvent(new CustomEvent('pageready'));
      }
      paint();
      document.addEventListener('langchange', paint);

      // #gesetzespyramide & Co. werden erst hier geschrieben — der Browser
      // hat beim Laden noch nichts gefunden, wohin er springen koennte.
      if (location.hash.length > 1) {
        var target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView({ block: 'start' });
      }
    }).catch(function (e) {
      console.error(e);
      // Ohne Kopf- und Fusszeile sitzt er in einer Sackgasse ohne Weg zurueck.
      try { Shell.mount('lehrer', []); } catch (x) {}
      document.getElementById('app').innerHTML =
        '<div class="err"><b><span lang="de">Daten nicht geladen</span>' +
        '<span lang="en">Data did not load</span></b>' +
        '<span lang="de">Die Seite konnte ihre Daten nicht lesen. Neu laden hilft meistens.</span>' +
        '<span lang="en">The page could not read its data. A reload usually fixes it.</span></div>';
    });
  }

  global.Teacher = { render: render };
})(window);
