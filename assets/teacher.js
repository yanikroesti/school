/* =========================================================
   Lehrerseite. Jede lehrer/*.html ruft nur Teacher.render('id') auf —
   der ganze Aufbau steckt hier, der Inhalt in data/pages.json.
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

  var S, id, page, teacher, D;

  function heroHTML() {
    var subs = teacher.subjects.map(function (s) {
      return '<span class="chip s-' + s + '">' + esc(D.subjects[s].code) + '</span>';
    }).join('');
    var dayName = teacher.day === 1
      ? '<span lang="de">Montag</span><span lang="en">Monday</span>'
      : '<span lang="de">Freitag</span><span lang="en">Friday</span>';
    return '' +
    '<section class="thero">' +
      '<div class="eyebrow">' + dayName + ' · ' + esc(teacher.room) + '</div>' +
      '<h1>' + esc(teacher.name) + '</h1>' +
      '<div class="chips">' + subs +
        (teacher.exams ? '<span class="exam-badge"><span lang="de">alle Prüfungen zu NIN und Apparatekunde</span>' +
                         '<span lang="en">all NIN and equipment exams</span></span>' : '') +
      '</div>' +
      '<p class="lead">' + bi(page.intro) + '</p>' +
    '</section>';
  }

  function lessonsHTML() {
    var mine = D.timetable.lessons.filter(function (l) { return l.teacher === id; });
    if (!mine.length) return '';
    var rows = mine.map(function (l) {
      var wk = l.week === 'all' ? ''
        : l.week === 'even'
          ? '<span class="wk"><span lang="de">gerade KW</span><span lang="en">even week</span></span>'
          : '<span class="wk"><span lang="de">ungerade KW</span><span lang="en">odd week</span></span>';
      return '<tr>' +
        '<td class="mono nowrap">' + esc(l.start) + '–' + esc(l.end) + '</td>' +
        '<td><span class="chip s-' + l.subject + '">' + esc(D.subjects[l.subject].code) + '</span></td>' +
        '<td>' + bi(l.topic) + ' ' + wk + '</td>' +
        '<td class="mono nowrap muted">' + esc(l.room) + '</td>' +
      '</tr>';
    }).join('');
    var note = mine.filter(function (l) { return l.note; })[0];
    return '' +
    '<section class="sect"><div class="sect-h">' +
      '<h2><span lang="de">Lektionen</span><span lang="en">Lessons</span></h2>' +
      '<span class="n">' + mine.length + '</span><span class="rule"></span></div>' +
      '<div class="card tablecard rv"><table class="ttable"><tbody>' + rows + '</tbody></table>' +
      (note ? '<p class="tnote">' + bi(note.note) + '</p>' : '') +
      '</div></section>';
  }

  function rulesHTML() {
    if (!page.rules) return '';
    var rows = page.rules.map(function (r) {
      return '<tr' + (r.highlight ? ' class="hl"' : '') + '>' +
        '<td><b>' + bi(r.what) + '</b></td>' +
        '<td>' + bi(r.when) + '</td>' +
        '<td class="muted">' + bi(r.counts) + '</td></tr>';
    }).join('');
    return '' +
    '<section class="sect"><div class="sect-h">' +
      '<h2><span lang="de">Wie die Note zustande kommt</span><span lang="en">How the grade is built</span></h2>' +
      '<span class="rule"></span></div>' +
      '<div class="card tablecard rv"><table class="ttable rules"><thead><tr>' +
        '<th><span lang="de">Was</span><span lang="en">What</span></th>' +
        '<th><span lang="de">Rhythmus</span><span lang="en">Cadence</span></th>' +
        '<th><span lang="de">Zählt</span><span lang="en">Counts</span></th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div></section>';
  }

  function topicsHTML() {
    if (!page.topics || !page.topics.length) return '';
    var cards = page.topics.map(function (t, i) {
      var goals = '';
      if (t.goals) {
        goals = '<div class="goals"><h4>' + bi(t.goals.title) + '</h4><ul>' +
          t.goals.items.map(function (g) { return '<li>' + bi(g) + '</li>'; }).join('') +
          '</ul></div>';
      }
      var bullets = (t.bullets && t.bullets.length)
        ? '<ul class="bul">' + t.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>'
        : '';
      return '<article class="card topic rv" style="--c:' + D.subjects[t.subject].color + ';--d:' + (i * 60) + 'ms" id="' + esc(t.id) + '">' +
        '<div class="thead"><span class="chip s-' + t.subject + '">' + esc(D.subjects[t.subject].code) + '</span>' +
          (t.unverified ? '<span class="tag-unconf"><span lang="de">erwartet, nicht bestätigt</span><span lang="en">expected, unconfirmed</span></span>' : '') +
        '</div>' +
        '<h3>' + bi(t.title) + '</h3>' +
        '<p>' + bi(t.desc) + '</p>' + bullets + goals +
      '</article>';
    }).join('');
    return '' +
    '<section class="sect"><div class="sect-h">' +
      '<h2><span lang="de">Themen</span><span lang="en">Topics</span></h2>' +
      '<span class="n">' + page.topics.length + '</span><span class="rule"></span></div>' +
      '<div class="topics">' + cards + '</div></section>';
  }

  function examsHTML(seed) {
    var mine = (seed.tests || []).filter(function (t) { return t.teacher === id; })
      .concat((seed.recurring || []).filter(function (r) { return r.teacher === id; })
        .map(function (r) { return Object.assign({}, r, { weekly: true }); }));
    if (!mine.length) return '';
    var rows = mine.map(function (t) {
      var d = t.date ? S.daysUntil(t.date) : null;
      return '<article class="card row rv" style="--c:' + D.subjects[t.subject].color + '">' +
        '<span class="dot"></span><div>' +
          '<div class="ttl">' + bi(t.title) +
            (t.weekly ? '<span class="tag-unconf" style="color:var(--muted);border-color:var(--line-2)"><span lang="de">wöchentlich</span><span lang="en">weekly</span></span>' : '') +
          '</div><div class="sub">' + bi(t.detail) + '</div></div>' +
        '<div class="cnt">' + (d != null
          ? '<b>' + (d === 0 ? (lang() === 'en' ? 'today' : 'heute')
                             : d + ' ' + (lang() === 'en' ? (d === 1 ? 'day' : 'days') : (d === 1 ? 'Tag' : 'Tage'))) + '</b>' +
            esc(t.date.split('-').reverse().join('.'))
          : '<b>—</b>') + '</div>' +
      '</article>';
    }).join('');
    return '' +
    '<section class="sect"><div class="sect-h">' +
      '<h2><span lang="de">Prüfungen</span><span lang="en">Exams</span></h2>' +
      '<span class="n">' + mine.length + '</span><span class="rule"></span></div>' +
      '<div class="stack">' + rows + '</div></section>';
  }

  function openHTML() {
    if (!page.open) return '';
    return '<section class="sect"><div class="card openbox rv">' +
      '<div class="eyebrow"><span lang="de">Noch offen</span><span lang="en">Still open</span></div>' +
      '<p>' + bi(page.open) + '</p></div></section>';
  }

  function render(teacherId) {
    id = teacherId;
    S = global.Schule;
    Promise.all([
      S.load(),
      fetch(Shell.up() + 'data/pages.json').then(function (r) { return r.json(); }),
      fetch(Shell.up() + 'data/seed.json').then(function (r) { return r.json(); }),
      global.Lernpakete ? global.Lernpakete.load(Shell.up()) : null
    ]).then(function (parts) {
      D = S.data();
      page = parts[1][id] || {};
      var seed = parts[2];
      teacher = D.teacherById[id];
      if (!teacher) { document.getElementById('app').innerHTML = '<p>Unbekannte Lehrperson.</p>'; return; }

      Shell.mount('lehrer', D.teachers);
      document.title = teacher.name + ' — Schule';

      function paint() {
        document.getElementById('app').innerHTML =
          heroHTML() + lessonsHTML() + rulesHTML() +
          (page.pyramide && global.Pyramide ? global.Pyramide.html() : '') +
          (page.abuModules && global.AbuRad ? global.AbuRad.html(page.abuModules) : '') +
          topicsHTML() + examsHTML(seed) +
          (global.Lernpakete ? global.Lernpakete.html(D.subjects, function (x) { return x.teacher === id; }) : '') +
          openHTML();
        S.reveal();
        document.dispatchEvent(new CustomEvent('pageready'));
      }
      paint();
      document.addEventListener('langchange', paint);
    }).catch(function (e) {
      console.error(e);
      document.getElementById('app').innerHTML =
        '<p class="empty">Daten konnten nicht geladen werden.</p>';
    });
  }

  global.Teacher = { render: render };
})(window);
