/* =========================================================
   Rail — die Klemmenleiste als Bauteilsatz.

   Eine Schiene (.rail) traegt Klemmen (.term). Dazwischen sitzen
   zwei Bauteile, die eine fachliche Tatsache abbilden statt zu
   schmuecken:

     Trennplatte (.part)   Gruppenwechsel = andere Lehrperson.
     Querbruecker (.bridge) Zwei Klemmen am selben Knoten =
                            aufeinanderfolgende Lektionen derselben
                            Lehrperson.

   Die Farbe kommt immer ueber die Klasse s-<fach>, nie als
   Inline-Wert: sonst gewinnt der Hellmodus-Wert gegen den
   Dunkelmodus.
   ========================================================= */
(function (global) {
  'use strict';

  var S = global.Schule;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function tx(o, lang) {
    if (!o) return '';
    return typeof o === 'string' ? o : (o[lang] || o.de || o.en || '');
  }
  function bi(o) {
    if (!o) return '';
    if (typeof o === 'string') return esc(o);
    return '<span lang="de">' + esc(o.de || '') + '</span>' +
           '<span lang="en">' + esc(o.en || o.de || '') + '</span>';
  }
  // Wie viele Ebenen zurueck zur Wurzel? Gilt auch aus lehrer/.
  function up() {
    var segs = location.pathname.replace(/\/[^/]*$/, '/').split('/').filter(Boolean);
    return segs.length ? '../'.repeat(segs.length) : './';
  }

  /* ---------------- Bauteile ---------------- */

  // Trennplatte mit Gruppenbeschriftung: die Lehrperson.
  function partition(teacherId, first, lang) {
    var D = S.data();
    var t = D.teacherById[teacherId];
    if (!t) return '';
    return '<div class="part' + (first ? ' first' : '') + '">' +
      '<span><a href="' + up() + 'lehrer/' + esc(t.id) + '.html">' + esc(t.name) + '</a></span>' +
    '</div>';
  }

  // Querbruecker: zwei Klemmen am selben Knoten.
  function bridge(subject) {
    return '<div class="bridge s-' + esc(subject) + '" aria-hidden="true"></div>';
  }

  /* ---------------- Klemme: Lektion ---------------- */

  function lesson(l, date, opts) {
    opts = opts || {};
    var lang = opts.lang || 'de';
    var D = S.data();
    var subj = D.subjects[l.subject] || { code: '?' };
    var teacher = D.teacherById[l.teacher];

    var cls = ['term', 's-' + l.subject];
    if (opts.lead) cls.push('lead');
    if (opts.live) cls.push('live');

    var aside = '';
    if (opts.value) {
      aside += '<span class="val">' + esc(opts.value) + '</span>';
    }
    var foot = [];
    if (l.room) foot.push(esc(l.room));
    if (opts.when) foot.push(esc(opts.when));
    if (foot.length) aside += '<span class="rm">' + foot.join(' · ') + '</span>';

    // Auf der Seite der Lehrperson selbst waere der Link ein Ring auf
    // sich; dort wird die Klemme zum reinen Anzeigeobjekt.
    var href = (teacher && !opts.noLink) ? up() + 'lehrer/' + teacher.id + '.html' : null;
    var tag = href ? 'a' : 'div';

    var sub = [];
    if (teacher && !opts.noLink) sub.push(esc(teacher.name));
    if (opts.showWeek && l.week && l.week !== 'all') {
      sub.push(l.week === 'even'
        ? '<span class="wk"><span lang="de">gerade KW</span><span lang="en">even week</span></span>'
        : '<span class="wk"><span lang="de">ungerade KW</span><span lang="en">odd week</span></span>');
    }
    if (opts.live) {
      sub.push('<b><span lang="de">läuft gerade</span><span lang="en">running now</span></b>');
    }

    return '<' + tag + ' class="' + cls.join(' ') + '"' +
        (href ? ' href="' + href + '"' : '') + '>' +
      '<span class="strip"><b>' + esc(l.start) + '</b><span>' + esc(l.end) + '</span></span>' +
      '<span class="fuss">' + esc(subj.code) + '</span>' +
      '<span class="body">' +
        '<span class="tt">' + bi(l.topic) + '</span>' +
        (sub.length ? '<span class="sub">' + sub.join(' · ') + '</span>' : '') +
      '</span>' +
      (aside ? '<span class="aside">' + aside + '</span>' : '') +
    '</' + tag + '>';
  }

  /* ---------------- Klemme: Prüfung / Hausaufgabe ---------------- */

  function entry(item, kind, lang) {
    var D = S.data();
    var subj = D.subjects[item.subject] || { code: '?' };
    var teacher = D.teacherById[item.teacher];
    var iso = item.date || item.due;
    var d = iso ? new Date(iso + 'T00:00:00') : null;
    var days = iso ? S.daysUntil(iso) : null;

    var cls = ['term', 's-' + item.subject];
    if (item.done) cls.push('done');
    else if (days !== null && days <= 2) cls.push('soon');
    else if (days !== null && days <= 6) cls.push('warn');

    var unit = days === null ? ''
      : days === 0 ? (lang === 'en' ? 'today' : 'heute')
      : days === 1 ? (lang === 'en' ? 'day' : 'Tag')
      : (lang === 'en' ? 'days' : 'Tage');
    var val = days === null ? ''
      : days === 0
        ? '<span class="val">' + esc(unit) + '</span>'
        : '<span class="val">' + days + ' <u>' + esc(unit) + '</u></span>';

    var strip = d
      ? '<span class="strip"><b>' + S.pad(d.getDate()) + '.' + S.pad(d.getMonth() + 1) + '.</b>' +
        '<span>' + esc(S.dayName(d, lang).slice(0, 2)) + '</span></span>'
      : '<span class="strip"><b>—</b></span>';

    var sub = [];
    if (teacher) sub.push(esc(teacher.name));
    if (item.detail) sub.push(tx(item.detail, lang));
    if (item.recurring) {
      sub.push(lang === 'en' ? 'every week' : 'jede Woche');
    }

    return '<div class="' + cls.join(' ') + '">' +
      strip +
      '<span class="fuss">' + esc(subj.code) + '</span>' +
      '<span class="body">' +
        '<span class="tt">' + esc(tx(item.title, lang)) +
          (item.unconfirmed
            ? ' <span class="unconf"><span lang="de">Regel offen</span><span lang="en">rule open</span></span>'
            : '') +
        '</span>' +
        '<span class="sub">' + sub.join(' · ') + '</span>' +
      '</span>' +
      (val ? '<span class="aside">' + val + '</span>' : '') +
    '</div>';
  }

  /* ---------------- Leere Schiene ----------------
     Lehrt die Oberflaeche, statt "nichts hier" zu sagen. */

  var BARE = {
    'no-tests': {
      de: ['Keine Prüfung eingetragen', 'Der wöchentliche NIN-Kurztest läuft weiter — er steht oben, sobald der nächste Freitag näher ist.'],
      en: ['No exam on the rail', 'The weekly NIN short test still runs — it appears here as the next Friday approaches.']
    },
    'no-homework': {
      de: ['Nichts offen', 'Neue Aufgaben kommen über den Telegram-Bot auf die Schiene — einfach hinschreiben, keine Befehle.'],
      en: ['Nothing due', 'New homework clips onto the rail through the Telegram bot — just write it, no commands.']
    },
    'no-school': {
      de: ['Kein Unterricht an diesem Tag', 'Schule ist Montag und Freitag.'],
      en: ['No lessons on this day', 'School runs Monday and Friday.']
    }
  };

  function bare(reason, lang) {
    var t;
    if (reason && reason.type === 'holiday') {
      var name = tx(reason.name, lang);
      var back = reason.firstSchoolDay
        ? new Date(reason.firstSchoolDay + 'T00:00:00') : null;
      t = [name, back
        ? (lang === 'en' ? 'Back on ' : 'Wieder ab ') + S.fmtDate(back, lang)
        : (lang === 'en' ? 'Holiday period' : 'Ferienzeit')];
    } else if (reason && reason.type === 'closure') {
      t = [tx(reason.name, lang), lang === 'en' ? 'School closed' : 'Schule geschlossen'];
    } else {
      var k = BARE[(reason && reason.kind) || 'no-school'] || BARE['no-school'];
      t = k[lang === 'en' ? 'en' : 'de'];
    }
    return '<div class="bare"><b>' + esc(t[0]) + '</b>' + esc(t[1]) + '</div>';
  }

  /* ---------------- Ein ganzer Tag ---------------- */

  function day(date, opts) {
    opts = opts || {};
    var lang = opts.lang || 'de';
    var free = opts.ignoreFree ? null : S.freeDay(date);
    if (free) return bare(free, lang);

    var ls = S.lessonsFor(date, opts.ignoreFree);
    if (!ls.length) return bare({ kind: 'no-school' }, lang);

    var out = [], prev = null;
    ls.forEach(function (l, i) {
      if (l.teacher !== prev) out.push(partition(l.teacher, i === 0, lang));
      else out.push(bridge(l.subject));
      out.push(lesson(l, date, { lang: lang }));
      prev = l.teacher;
    });
    return out.join('');
  }

  /* ---------------- Datumshelfer ---------------- */

  // Nächstes Vorkommen eines Wochentags (1 = Mo … 5 = Fr), heute eingeschlossen.
  function nextWeekday(dow) {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 0; i < 14; i++) {
      var x = new Date(d); x.setDate(x.getDate() + i);
      if (x.getDay() === dow) return x;
    }
    return d;
  }

  // Ein Datum, das diesen Wochentag in einer Woche der gewünschten
  // Parität trifft — für die Wochenansicht.
  function sampleDate(dow, kind) {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 0; i < 21; i++) {
      var x = new Date(d); x.setDate(x.getDate() + i);
      if (x.getDay() === dow && S.weekKind(x) === kind) return x;
    }
    return nextWeekday(dow);
  }

  // "07:50 – 16:10" für die Kopfzeile eines Tages.
  function dayTimespan(dow, kind) {
    var d = sampleDate(dow, kind);
    var ls = S.lessonsFor(d, true);
    if (!ls.length) return '';
    return ls[0].start + ' – ' + ls[ls.length - 1].end;
  }

  function whenLabel(date, lang) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var d = new Date(date); d.setHours(0, 0, 0, 0);
    var diff = Math.round((d - today) / 86400000);
    if (diff === 0) return lang === 'en' ? 'today' : 'heute';
    if (diff === 1) return lang === 'en' ? 'tomorrow' : 'morgen';
    return S.dayName(d, lang) + ', ' + S.fmtDate(d, lang);
  }

  global.Rail = {
    lesson: lesson,
    entry: entry,
    bare: bare,
    day: day,
    partition: partition,
    bridge: bridge,
    nextWeekday: nextWeekday,
    sampleDate: sampleDate,
    dayTimespan: dayTimespan,
    whenLabel: whenLabel,
    up: up
  };
})(window);
