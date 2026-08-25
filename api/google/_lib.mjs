/* =========================================================
   Gemeinsames Innenleben des Google-Anschlusses.

   Unterstrich am Dateianfang: Vercel macht daraus keine Route.
   Nur die Nachbardateien in diesem Ordner benutzen das hier.

   ---- Warum die Zugangsdaten in einem Cookie stecken ----

   Der Auffrischungs-Token ist der Generalschluessel: wer ihn hat,
   kommt an den Kalender. Er darf deshalb weder ins Repository noch
   in den Browser-Speicher, den JavaScript lesen kann.

   Er liegt darum verschluesselt in einem httpOnly-Cookie. Das heisst:

     * Der Browser schickt ihn nur an diese eine Domain.
     * Kein Skript auf der Seite kann ihn lesen — auch keins, das
       ueber eine fremde Bibliothek hereingeraet.
     * Entschluesseln kann ihn ausschliesslich dieser Server, denn der
       Schluessel wird aus GOOGLE_CLIENT_SECRET abgeleitet, und das
       steht nur in den Umgebungsvariablen auf Vercel.

   Der Preis: loescht Yanik seine Cookies, muss er einmal neu
   zustimmen. Das ist der richtige Preis.
   ========================================================= */

import crypto from 'node:crypto';

export const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

/* Fest verdrahtet und nicht aus dem Host-Header gelesen: bei Google ist
   genau diese Adresse hinterlegt. Eine Vorschau-Bereitstellung von Vercel
   hat einen anderen Host, und Google wuerde sie zu Recht abweisen. */
export const REDIRECT =
  process.env.GOOGLE_REDIRECT_URI || 'https://schule.yanikroesti.ch/api/google/callback';

export const SCOPE = 'https://www.googleapis.com/auth/calendar';
export const KALENDERNAME = 'Schule — ELI 25a';
export const TZ = 'Europe/Zurich';

const KEKS = 'schule-g';
const KEKS_STATE = 'schule-g-state';

/* ---------------- Verschluesselung ---------------- */

function schluessel() {
  // Aus dem Client-Secret abgeleitet, nicht es selbst: waere der
  // Schluessel gleich dem Secret, wuerde ein Leck in eine Richtung
  // sofort das andere aufmachen.
  return crypto.createHash('sha256')
    .update('schule-keks-v1|' + CLIENT_SECRET).digest();
}

export function siegeln(obj) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', schluessel(), iv);
  const enc = Buffer.concat([c.update(JSON.stringify(obj), 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64url');
}

export function oeffnen(s) {
  if (!s) return null;
  try {
    const roh = Buffer.from(s, 'base64url');
    if (roh.length < 29) return null;
    const d = crypto.createDecipheriv('aes-256-gcm', schluessel(), roh.subarray(0, 12));
    d.setAuthTag(roh.subarray(12, 28));
    return JSON.parse(Buffer.concat([d.update(roh.subarray(28)), d.final()]).toString('utf8'));
  } catch {
    // Falsches Siegel heisst: fremd, alt oder das Secret wurde gewechselt.
    // In allen drei Faellen ist "nicht verbunden" die richtige Antwort.
    return null;
  }
}

/* ---------------- Kekse ---------------- */

export function kekse(req) {
  const roh = req.headers.cookie || '';
  const o = {};
  roh.split(';').forEach((teil) => {
    const i = teil.indexOf('=');
    if (i < 0) return;
    o[teil.slice(0, i).trim()] = decodeURIComponent(teil.slice(i + 1).trim());
  });
  return o;
}

function setzen(name, wert, sekunden) {
  return name + '=' + encodeURIComponent(wert) +
         '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + sekunden;
}

export function sitzungSetzen(res, daten) {
  // 180 Tage. Google laesst Auffrischungs-Token im Testbetrieb nach
  // sieben Tagen verfallen — das Cookie darf ruhig laenger leben, der
  // Ablauf wird beim Auffrischen bemerkt und sauber gemeldet.
  res.setHeader('Set-Cookie', setzen(KEKS, siegeln(daten), 60 * 60 * 24 * 180));
}

export function sitzungLoeschen(res) {
  res.setHeader('Set-Cookie', [
    KEKS + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    KEKS_STATE + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
  ]);
}

export function sitzung(req) {
  return oeffnen(kekse(req)[KEKS]);
}

export function stateSetzen(res, wert) {
  res.setHeader('Set-Cookie', setzen(KEKS_STATE, wert, 600));   // 10 Minuten
}

export function stateLesen(req) {
  return kekse(req)[KEKS_STATE] || '';
}

/* ---------------- Zugriffstoken ---------------- */

/** Gibt ein gueltiges Zugriffstoken zurueck und, falls es erneuert
 *  werden musste, die aktualisierte Sitzung zum Zurueckschreiben.
 *
 *  Das Zugriffstoken liegt mit im Cookie, samt Ablaufzeitpunkt. Ohne
 *  diesen Zwischenspeicher waere jeder Seitenaufruf zwei Anfragen an
 *  Google statt einer. */
export async function zugriffstoken(s) {
  if (!s || !s.refresh) return { fehler: 'nicht-verbunden' };

  const puffer = 90 * 1000;                     // 90 s Sicherheitsabstand
  if (s.access && s.exp && Date.now() + puffer < s.exp) {
    return { token: s.access, sitzung: s };
  }

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: s.refresh,
      grant_type: 'refresh_token',
    }),
  });

  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) {
    // invalid_grant heisst fast immer: Zustimmung entzogen, Token
    // abgelaufen (Testbetrieb: 7 Tage) oder Passwort geaendert.
    return { fehler: d.error === 'invalid_grant' ? 'abgelaufen' : 'token-fehler' };
  }

  const neu = Object.assign({}, s, {
    access: d.access_token,
    exp: Date.now() + (d.expires_in || 3600) * 1000,
  });
  return { token: d.access_token, sitzung: neu, erneuert: true };
}

/* ---------------- Google-Aufrufe ---------------- */

const API = 'https://www.googleapis.com/calendar/v3';

export async function google(token, pfad, opt) {
  opt = opt || {};
  const r = await fetch(API + pfad, Object.assign({}, opt, {
    headers: Object.assign({
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    }, opt.headers || {}),
  }));
  const text = await r.text();
  let d = null;
  try { d = text ? JSON.parse(text) : null; } catch (e) { d = null; }
  if (!r.ok) {
    const err = new Error((d && d.error && d.error.message) || ('Google ' + r.status));
    err.status = r.status;
    throw err;
  }
  return d;
}

/** Unseren eigenen Kalender finden oder anlegen.
 *
 *  Warum ein eigener und nicht der Hauptkalender: so kann diese Seite
 *  gar nicht erst einen Zahnarzttermin ueberschreiben. Alles, was sie
 *  anlegt, liegt in einem Kalender, den sie selbst erzeugt hat — und
 *  wer sie loswerden will, loescht genau diesen einen Kalender. */
export async function kalenderId(token) {
  const liste = await google(token, '/users/me/calendarList?maxResults=250');
  const da = (liste.items || []).find(
    (k) => k.summary === KALENDERNAME && k.accessRole === 'owner'
  );
  if (da) return da.id;

  const neu = await google(token, '/calendars', {
    method: 'POST',
    body: JSON.stringify({
      summary: KALENDERNAME,
      description:
        'Angelegt von schule.yanikroesti.ch. Termine hier gehen in beide ' +
        'Richtungen. Der Stundenplan selbst kommt aus dem Repository und ' +
        'wird nur hierher geschrieben, nie von hier gelesen.',
      timeZone: TZ,
    }),
  });
  return neu.id;
}

/** Riegel: geschrieben wird ausschliesslich in den Kalender, den diese
 *  Seite selbst angelegt hat. "primary" ist ausdruecklich verboten —
 *  auch wenn der Scope es erlauben wuerde. */
export function pruefeKalender(id) {
  if (!id || id === 'primary') {
    const e = new Error('Kein eigener Kalender — bitte neu verbinden.');
    e.status = 409;
    throw e;
  }
  return id;
}

/* ---------------- Fachfarben ---------------- */

/* Googles Farbtoepfe sind eine feste Liste von elf. Das hier ist die
   naechstliegende Zuordnung zu unseren Klemmenfarben. */
export const FARBE = {
  abt: '6',    // Tangerine  — orange
  htog: '9',   // Blueberry  — blau
  atd: '10',   // Basil      — gruen
  abu: '3',    // Grape      — violett
  sport: '11', // Tomato     — rot
};

export function json(res, code, daten) {
  res.status(code);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(JSON.stringify(daten));
}

export function koerper(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return req.body;
}
