/* =========================================================
   schule.yanikroesti.ch — gemeinsame Logik
   Stundenplan-Rechnerei, Reveal, Daten laden.
   Alles ohne Build-Schritt, alles ohne Abhängigkeiten.
   ========================================================= */
(function (global) {
  'use strict';

  var DATA = null;
  var loading = null;

  var DAYS = {
    de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };

  /* ---------------- Daten ---------------- */

  function base() {
    // funktioniert aus / und aus /tag/ bzw. /lehrer/
    var d = document.currentScript && document.currentScript.src;
    var depth = (location.pathname.replace(/\/[^/]*$/, '/').match(/\//g) || []).length - 1;
    return depth > 0 ? '../'.repeat(depth) : './';
  }

  function load() {
    if (DATA) return Promise.resolve(DATA);
    if (loading) return loading;
    var b = base();
    loading = Promise.all([
      fetch(b + 'data/timetable.json').then(function (r) { return r.json(); }),
      fetch(b + 'data/teachers.json').then(function (r) { return r.json(); }),
      fetch(b + 'data/subjects.json').then(function (r) { return r.json(); }),
      fetch(b + 'data/calendar.json').then(function (r) { return r.json(); })
    ]).then(function (parts) {
      DATA = { timetable: parts[0], teachers: parts[1], subjects: parts[2], calendar: parts[3] };
      DATA.teacherById = {};
      DATA.teachers.forEach(function (t) { DATA.teacherById[t.id] = t; });
      return DATA;
    });
    return loading;
  }

  /* ---------------- Ferien und Feiertage ---------------- */

  function iso(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  // Gibt den Grund zurück, warum an diesem Tag keine Schule ist — oder null.
  function freeDay(date) {
    if (!DATA || !DATA.calendar) return null;
    var s = iso(date);
    var h = (DATA.calendar.holidays || []).filter(function (x) { return s >= x.from && s <= x.to; })[0];
    if (h) return { type: 'holiday', name: h.name, until: h.to, firstSchoolDay: h.firstSchoolDay };
    var c = (DATA.calendar.closures || []).filter(function (x) { return x.date === s; })[0];
    if (c) return { type: 'closure', name: c.name };
    return null;
  }

  /* ---------------- Kalenderwoche ---------------- */

  // ISO-8601 Kalenderwoche. Die Schule richtet Woche Gerade/Ungerade danach aus.
  function isoWeek(d) {
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = t.getUTCDay() || 7;               // Mo = 1 … So = 7
    t.setUTCDate(t.getUTCDate() + 4 - day);     // Donnerstag dieser Woche
    var jan1 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil((((t - jan1) / 86400000) + 1) / 7);
  }

  // gerade KW -> langer ABU ohne Sport | ungerade KW -> ABU kurz + Sport
  function weekKind(d) { return isoWeek(d) % 2 === 0 ? 'even' : 'odd'; }

  /* ---------------- Lektionen ---------------- */

  function at(date, hhmm) {
    var p = hhmm.split(':');
    var x = new Date(date);
    x.setHours(+p[0], +p[1], 0, 0);
    return x;
  }

  function lessonsFor(date, ignoreFree) {
    if (!DATA) return [];
    if (!ignoreFree && freeDay(date)) return [];   // Ferien und Feiertage
    var kind = weekKind(date);
    var jsDay = date.getDay();
    return DATA.timetable.lessons
      .filter(function (l) { return l.day === jsDay && (l.week === 'all' || l.week === kind); })
      .slice()
      .sort(function (a, b) { return a.start.localeCompare(b.start); });
  }

  // Nächste Lektion ab jetzt. 70 Tage Vorlauf — die Sommerferien dauern sechs Wochen.
  function nextLesson(from) {
    if (!DATA) return null;
    var now = from || new Date();
    for (var i = 0; i < 70; i++) {
      var d = new Date(now);
      d.setDate(d.getDate() + i);
      var ls = lessonsFor(d);
      for (var j = 0; j < ls.length; j++) {
        var startsAt = at(d, ls[j].start);
        var endsAt = at(d, ls[j].end);
        if (endsAt > now) {
          return {
            lesson: ls[j], date: d, startsAt: startsAt, endsAt: endsAt,
            running: startsAt <= now && now < endsAt
          };
        }
      }
    }
    return null;
  }

  /* ---------------- Formatierung ---------------- */

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function fmtDate(d, lang) {
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  function dayName(d, lang) { return DAYS[lang === 'en' ? 'en' : 'de'][d.getDay()]; }

  // "in 2 Tagen 4 h" / "in 18 min" / "läuft"
  function until(target, lang, running) {
    var en = lang === 'en';
    if (running) return en ? 'running now' : 'läuft gerade';
    var ms = target - new Date();
    if (ms <= 0) return en ? 'now' : 'jetzt';
    var min = Math.floor(ms / 60000);
    var h = Math.floor(min / 60);
    var days = Math.floor(h / 24);
    if (days >= 1) {
      var restH = h - days * 24;
      return (en ? 'in ' : 'in ') + days + (en ? (days === 1 ? ' day' : ' days') : (days === 1 ? ' Tag' : ' Tagen'))
             + (restH ? ' ' + restH + ' h' : '');
    }
    if (h >= 1) return 'in ' + h + ' h ' + (min - h * 60) + ' min';
    return 'in ' + min + ' min';
  }

  // Tage bis zu einem Datum (für Prüfungs-Countdown)
  function daysUntil(isoDate) {
    var t = new Date(isoDate + 'T00:00:00');
    var now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.round((t - now) / 86400000);
  }

  /* ---------------- Export ---------------- */

  global.Schule = {
    load: load,
    data: function () { return DATA; },
    base: base,
    iso: iso,
    isoWeek: isoWeek,
    weekKind: weekKind,
    freeDay: freeDay,
    lessonsFor: lessonsFor,
    nextLesson: nextLesson,
    at: at,
    fmtDate: fmtDate,
    dayName: dayName,
    until: until,
    daysUntil: daysUntil,
    pad: pad
  };
})(window);
