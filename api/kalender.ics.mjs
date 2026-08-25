/* =========================================================
   ICS-Feed für Google Calendar, Apple Kalender, Outlook.

   Warum ein Feed und kein Zwei-Weg-Sync: der Stundenplan, die Prüfungen
   und die Hausaufgaben entstehen HIER. Google ist die Anzeige, nicht die
   Quelle. Ein Abonnement ist deshalb die ehrliche Richtung — und es
   braucht kein OAuth, keine Einwilligung, keinen abgelaufenen Token.

   Google holt den Feed selbst ab, allerdings gemächlich: zwischen ein
   paar Stunden und einem Tag. Wer eine Prüfung sofort sehen will, schaut
   auf die Seite. Das steht auch so auf der Kalenderseite.

   Aufruf:  /api/kalender.ics
            /api/kalender.ics?wochen=52   (Standard 26)
   ========================================================= */

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "";

// Die Fachfarben stehen in data/subjects.json — hier wird nur der Code
// gebraucht, den liefert der Datensatz mit.
const TZ = "Europe/Zurich";

/* ---------- Hilfen ---------- */

function pad(n) {
  return String(n).padStart(2, "0");
}

function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const tag = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - tag);
  const jan1 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t - jan1) / 86400000 + 1) / 7);
}

function wochenart(d) {
  return isoWeek(d) % 2 === 0 ? "even" : "odd";
}

function stempel(d, hhmm) {
  const [h, m] = (hhmm || "00:00").split(":");
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    "T" +
    pad(h) +
    pad(m) +
    "00"
  );
}

function datumsstempel(d) {
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
}

/** Zeilen über 75 Oktette müssen umgebrochen werden — sonst werfen
 *  strenge Leser (Outlook) den Termin weg. */
function falten(zeile) {
  if (zeile.length <= 74) return zeile;
  const teile = [zeile.slice(0, 74)];
  let rest = zeile.slice(74);
  while (rest.length > 73) {
    teile.push(" " + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  if (rest) teile.push(" " + rest);
  return teile.join("\r\n");
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/* ---------- Daten holen ---------- */

async function lokal(pfad, req) {
  const basis = `https://${req.headers.host}`;
  const r = await fetch(`${basis}/${pfad}`);
  if (!r.ok) throw new Error(`${pfad}: ${r.status}`);
  return r.json();
}

async function ausSupabase(tabelle, query) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabelle}?${query}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!r.ok) return [];
    return await r.json();
  } catch {
    return [];
  }
}

/* ---------- Feed bauen ---------- */

export default async function handler(req, res) {
  let timetable, subjects, teachers, calendar;
  try {
    [timetable, subjects, teachers, calendar] = await Promise.all([
      lokal("data/timetable.json", req),
      lokal("data/subjects.json", req),
      lokal("data/teachers.json", req),
      lokal("data/calendar.json", req),
    ]);
  } catch (e) {
    res.status(500).send(`Stundenplandaten nicht lesbar: ${e.message}`);
    return;
  }

  const lehrerNach = {};
  teachers.forEach((t) => (lehrerNach[t.id] = t));
  const fach = (id) => (subjects[id] && subjects[id].code) || id;
  const lehrer = (id) => (lehrerNach[id] && lehrerNach[id].name) || id;

  const wochen = Math.min(Math.max(parseInt(req.query.wochen, 10) || 26, 1), 78);
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  const ende = new Date(heute);
  ende.setDate(ende.getDate() + wochen * 7);

  // Ferien und Feiertage als Sperrtage
  const frei = new Set();
  (calendar.holidays || []).forEach((h) => {
    for (let d = new Date(h.from); d <= new Date(h.to); d.setDate(d.getDate() + 1)) {
      frei.add(d.toISOString().slice(0, 10));
    }
  });
  (calendar.closures || []).forEach((c) => frei.add(c.date));

  const zeilen = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//yanikroesti//schule//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Schule — ELI 25a",
    "X-WR-CALDESC:Stundenplan, Prüfungen und Hausaufgaben vom BZI Interlaken",
    `X-WR-TIMEZONE:${TZ}`,
    // Ohne diese Zeile fragen manche Leser jede Minute nach.
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
  ];

  const jetzt = stempel(new Date(), "00:00") + "Z";

  function termin({ uid, start, ende, ganztags, titel, ort, text, kategorie }) {
    zeilen.push("BEGIN:VEVENT");
    zeilen.push(`UID:${uid}@schule.yanikroesti.ch`);
    zeilen.push(`DTSTAMP:${jetzt}`);
    if (ganztags) {
      zeilen.push(`DTSTART;VALUE=DATE:${start}`);
      zeilen.push(`DTEND;VALUE=DATE:${ende}`);
    } else {
      zeilen.push(`DTSTART;TZID=${TZ}:${start}`);
      zeilen.push(`DTEND;TZID=${TZ}:${ende}`);
    }
    zeilen.push(falten(`SUMMARY:${esc(titel)}`));
    if (ort) zeilen.push(falten(`LOCATION:${esc(ort)}`));
    if (text) zeilen.push(falten(`DESCRIPTION:${esc(text)}`));
    if (kategorie) zeilen.push(`CATEGORIES:${esc(kategorie)}`);
    zeilen.push("END:VEVENT");
  }

  /* --- Lektionen --- */
  for (let d = new Date(heute); d < ende; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    if (frei.has(iso)) continue;
    const art = wochenart(d);
    const tag = d.getDay();
    timetable.lessons
      .filter((l) => l.day === tag && (l.week === "all" || l.week === art))
      .forEach((l) => {
        const thema = (l.topic && l.topic.de) || fach(l.subject);
        termin({
          uid: `lek-${iso}-${l.start.replace(":", "")}-${l.subject}`,
          start: stempel(d, l.start),
          ende: stempel(d, l.end),
          titel: `${fach(l.subject)} — ${thema}`,
          ort: `BZI Interlaken, Raum ${l.room}`,
          text: `${lehrer(l.teacher)}\nKalenderwoche ${isoWeek(d)} (${
            art === "even" ? "gerade" : "ungerade"
          })`,
          kategorie: "Unterricht",
        });
      });
  }

  /* --- Ferien und Feiertage als ganztägige Einträge --- */
  (calendar.holidays || []).forEach((h, i) => {
    const bis = new Date(h.to);
    bis.setDate(bis.getDate() + 1); // DTEND ist bei Ganztags exklusiv
    termin({
      uid: `ferien-${i}-${h.from}`,
      start: datumsstempel(new Date(h.from)),
      ende: datumsstempel(bis),
      ganztags: true,
      titel: (h.name && h.name.de) || "Ferien",
      text: h.firstSchoolDay ? `Wieder Schule am ${h.firstSchoolDay}` : "",
      kategorie: "Ferien",
    });
  });
  (calendar.closures || []).forEach((c, i) => {
    const bis = new Date(c.date);
    bis.setDate(bis.getDate() + 1);
    termin({
      uid: `frei-${i}-${c.date}`,
      start: datumsstempel(new Date(c.date)),
      ende: datumsstempel(bis),
      ganztags: true,
      titel: (c.name && c.name.de) || "Schulfrei",
      kategorie: "Ferien",
    });
  });

  /* --- Prüfungen und Hausaufgaben aus Supabase --- */
  const abIso = heute.toISOString().slice(0, 10);
  const [pruefungen, aufgaben] = await Promise.all([
    ausSupabase("tests", `due_date=gte.${abIso}&select=*`),
    ausSupabase("homework", `done=is.false&select=*`),
  ]);

  pruefungen.forEach((t) => {
    if (!t.due_date) return;
    const bis = new Date(t.due_date);
    bis.setDate(bis.getDate() + 1);
    const artText = { kurztest: "Kurztest", grosstest: "Grosstest" }[t.kind] || "Prüfung";
    termin({
      uid: `pruefung-${t.id}`,
      start: datumsstempel(new Date(t.due_date)),
      ende: datumsstempel(bis),
      ganztags: true,
      titel: `${artText}: ${t.title}`,
      text: [t.detail, t.teacher ? lehrer(t.teacher) : "", fach(t.subject)]
        .filter(Boolean)
        .join("\n"),
      kategorie: "Prüfung",
    });
  });

  aufgaben.forEach((h) => {
    if (!h.due_date) return;
    const bis = new Date(h.due_date);
    bis.setDate(bis.getDate() + 1);
    termin({
      uid: `aufgabe-${h.id}`,
      start: datumsstempel(new Date(h.due_date)),
      ende: datumsstempel(bis),
      ganztags: true,
      titel: `Fällig: ${h.title}`,
      text: [h.detail, h.teacher ? lehrer(h.teacher) : ""].filter(Boolean).join("\n"),
      kategorie: "Hausaufgabe",
    });
  });

  zeilen.push("END:VCALENDAR");

  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'inline; filename="schule.ics"');
  // Sechs Stunden: oft genug für neue Prüfungen, selten genug, dass
  // Google nicht dauernd anklopft.
  res.setHeader("Cache-Control", "public, max-age=21600, s-maxage=21600");
  res.status(200).send(zeilen.join("\r\n") + "\r\n");
}
