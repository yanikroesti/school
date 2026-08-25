/* =========================================================
   Termine lesen und schreiben — der Durchreicher zu Google.

     GET    /api/google/events?von=2026-08-01&bis=2027-02-28
     POST   /api/google/events          Koerper = ein Termin
     PATCH  /api/google/events          Koerper = ein Termin mit gcalId
     DELETE /api/google/events?gcalId=…

   Der Browser sieht nie ein Google-Token. Er redet mit dieser Adresse,
   diese Adresse redet mit Google. Damit bleibt der Generalschluessel
   im httpOnly-Cookie, wo ihn kein Skript lesen kann.

   ---- Zwei Riegel gegen fremde Schreibzugriffe ----

   1. Das Sitzungscookie ist SameSite=Lax. Ein POST von einer fremden
      Seite bekommt es gar nicht erst mitgeschickt.
   2. Schreibende Aufrufe muessen den Kopf X-Schule tragen. Ein
      einfaches Formular kann keine eigenen Koepfe setzen; sobald einer
      dabei ist, verlangt der Browser eine Vorabfrage, und die scheitert
      an der Same-Origin-Regel.

   Zusammen heisst das: schreiben kann nur diese Seite selbst.
   ========================================================= */

import {
  TZ, FARBE, sitzung, zugriffstoken, sitzungSetzen,
  google, pruefeKalender, json, koerper,
} from './_lib.mjs';

/* ---------------- Zeit ---------------- */

/** Ein Zeitpunkt mit Zeitzonen-Versatz, ausgedrueckt als Wanduhrzeit in
 *  Zuerich: "2026-08-25T14:00". Der Stundenplan denkt in Wanduhrzeiten,
 *  also rechnen wir dorthin zurueck — auch wenn der Termin in Google
 *  von einem Geraet in Tokio angelegt wurde. */
const WANDUHR = new Intl.DateTimeFormat('sv-SE', {
  timeZone: TZ,
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
});

function wanduhr(iso) {
  return WANDUHR.format(new Date(iso)).replace(' ', 'T');
}

/* ---------------- Umformen ---------------- */

/** Google-Termin -> unsere Form. */
function herein(e) {
  const ganztags = !!(e.start && e.start.date);
  const p = (e.extendedProperties && e.extendedProperties.private) || {};
  return {
    gcalId: e.id,
    id: p.schuleId || null,
    titel: e.summary || '',
    start: ganztags ? e.start.date : wanduhr(e.start.dateTime),
    ende: ganztags ? e.end.date : wanduhr(e.end.dateTime),
    ganztags: ganztags,
    fach: p.fach || '',
    lehrer: p.lehrer || '',
    ort: e.location || '',
    notiz: e.description || '',
    // Googles Zeitstempel in Millisekunden — die Waehrung, in der beim
    // Abgleich entschieden wird, welche Fassung juenger ist.
    updated: e.updated ? Date.parse(e.updated) : 0,
    storniert: e.status === 'cancelled',
  };
}

/** Unsere Form -> Google-Termin. */
function hinaus(t) {
  const e = {
    summary: t.titel || 'Termin',
    location: t.ort || '',
    description: t.notiz || '',
    extendedProperties: {
      private: {
        schuleId: String(t.id || ''),
        fach: t.fach || '',
        lehrer: t.lehrer || '',
        quelle: 'schule.yanikroesti.ch',
      },
    },
  };
  if (t.ganztags) {
    e.start = { date: String(t.start).slice(0, 10) };
    e.end = { date: String(t.ende).slice(0, 10) };
  } else {
    // Ohne Sekunden weist Google die Anfrage ab.
    e.start = { dateTime: String(t.start).slice(0, 16) + ':00', timeZone: TZ };
    e.end = { dateTime: String(t.ende).slice(0, 16) + ':00', timeZone: TZ };
  }
  if (FARBE[t.fach]) e.colorId = FARBE[t.fach];
  return e;
}

/* ---------------- Antwort mit aufgefrischtem Cookie ---------------- */

function fertig(res, t, code, daten) {
  if (t && t.erneuert) sitzungSetzen(res, t.sitzung);
  json(res, code, daten);
}

/* ---------------- Handler ---------------- */

export default async function handler(req, res) {
  const schreibend = req.method !== 'GET';

  if (schreibend && !req.headers['x-schule']) {
    return json(res, 403, { fehler: 'kopf-fehlt' });
  }

  const s = sitzung(req);
  if (!s) return json(res, 401, { fehler: 'nicht-verbunden' });

  const t = await zugriffstoken(s);
  if (t.fehler) return json(res, 401, { fehler: t.fehler });

  let kal;
  try {
    kal = pruefeKalender(s.kalender);
  } catch (e) {
    return fertig(res, t, e.status || 500, { fehler: 'kein-kalender' });
  }
  const basis = '/calendars/' + encodeURIComponent(kal) + '/events';

  try {
    if (req.method === 'GET') {
      const von = String((req.query && req.query.von) || '').slice(0, 10);
      const bis = String((req.query && req.query.bis) || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(von) || !/^\d{4}-\d{2}-\d{2}$/.test(bis)) {
        return fertig(res, t, 400, { fehler: 'zeitraum-fehlt' });
      }

      // Je einen Tag Luft an beiden Enden: der Versatz zwischen UTC und
      // Zuerich wuerde sonst Termine am Rand abschneiden.
      const min = new Date(von + 'T00:00:00Z');
      min.setUTCDate(min.getUTCDate() - 1);
      const max = new Date(bis + 'T00:00:00Z');
      max.setUTCDate(max.getUTCDate() + 2);

      const termine = [];
      let seite = '';
      // Bis zu zehn Seiten. Mehr als 25 000 Termine sind kein Schuljahr
      // mehr, sondern ein Fehler — dann lieber aufhoeren als endlos drehen.
      for (let i = 0; i < 10; i++) {
        const q = new URLSearchParams({
          timeMin: min.toISOString(),
          timeMax: max.toISOString(),
          singleEvents: 'true',
          showDeleted: 'false',
          orderBy: 'startTime',
          maxResults: '2500',
        });
        if (seite) q.set('pageToken', seite);
        const d = await google(t.token, basis + '?' + q.toString());
        (d.items || []).forEach((e) => {
          if (e.start && (e.start.date || e.start.dateTime)) termine.push(herein(e));
        });
        seite = d.nextPageToken || '';
        if (!seite) break;
      }
      return fertig(res, t, 200, { termine: termine });
    }

    if (req.method === 'POST') {
      const b = koerper(req);
      if (!b.start || !b.ende) return fertig(res, t, 400, { fehler: 'zeit-fehlt' });
      const d = await google(t.token, basis, {
        method: 'POST',
        body: JSON.stringify(hinaus(b)),
      });
      return fertig(res, t, 200, { termin: herein(d) });
    }

    if (req.method === 'PATCH') {
      const b = koerper(req);
      if (!b.gcalId) return fertig(res, t, 400, { fehler: 'gcalid-fehlt' });
      const d = await google(t.token, basis + '/' + encodeURIComponent(b.gcalId), {
        method: 'PATCH',
        body: JSON.stringify(hinaus(b)),
      });
      return fertig(res, t, 200, { termin: herein(d) });
    }

    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.gcalId) || '');
      if (!id) return fertig(res, t, 400, { fehler: 'gcalid-fehlt' });
      try {
        await google(t.token, basis + '/' + encodeURIComponent(id), { method: 'DELETE' });
      } catch (e) {
        // 404 und 410 heissen: schon weg. Das ist genau das Ziel —
        // kein Grund, den Nutzer mit einem Fehler zu behelligen.
        if (e.status !== 404 && e.status !== 410) throw e;
      }
      return fertig(res, t, 200, { geloescht: true });
    }

    return fertig(res, t, 405, { fehler: 'methode' });
  } catch (e) {
    const code = e.status === 401 || e.status === 403 ? 401 : 502;
    return fertig(res, t, code, {
      fehler: code === 401 ? 'abgelaufen' : 'google-fehler',
      text: e.message || '',
    });
  }
}
