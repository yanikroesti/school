/* =========================================================
   Schritt 2: Rueckkehr von Google.

   /api/google/callback?code=…&state=…

   Hier wird der einmalige Code gegen Tokens getauscht, der eigene
   Kalender gefunden oder angelegt, und beides verschluesselt ins
   Cookie gelegt. Danach zurueck auf die Kalenderseite.

   Fehler landen als ?google=<grund> in der Adresse, damit die Seite
   etwas Verstaendliches anzeigen kann statt einer weissen Seite.
   ========================================================= */

import {
  CLIENT_ID, CLIENT_SECRET, REDIRECT,
  stateLesen, sitzungSetzen, kalenderId, json,
} from './_lib.mjs';

function zurueck(res, frage) {
  res.writeHead(302, { Location: '/kalender.html?' + frage });
  res.end();
}

export default async function handler(req, res) {
  const { code, state, error } = req.query || {};

  if (error) return zurueck(res, 'google=abgelehnt');
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return json(res, 503, {
      fehler: 'nicht-eingerichtet',
      hinweis: 'GOOGLE_CLIENT_ID oder GOOGLE_CLIENT_SECRET fehlt auf Vercel.',
    });
  }

  // Der state muss der sein, den /start gesetzt hat.
  const erwartet = stateLesen(req);
  if (!code || !state || !erwartet || state !== erwartet) {
    return zurueck(res, 'google=state');
  }

  let tokens;
  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(code),
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT,
        grant_type: 'authorization_code',
      }),
    });
    tokens = await r.json();
    if (!r.ok || !tokens.access_token) return zurueck(res, 'google=tausch');
  } catch (e) {
    return zurueck(res, 'google=tausch');
  }

  if (!tokens.refresh_token) {
    // Kommt vor, wenn Google die Zustimmung als bereits erteilt ansieht.
    // Ohne Auffrischungs-Token waere die Verbindung nach einer Stunde tot,
    // also lieber gleich sagen statt spaeter still versagen.
    return zurueck(res, 'google=kein-refresh');
  }

  let kalender;
  try {
    kalender = await kalenderId(tokens.access_token);
  } catch (e) {
    return zurueck(res, 'google=kalender');
  }

  sitzungSetzen(res, {
    refresh: tokens.refresh_token,
    access: tokens.access_token,
    exp: Date.now() + (tokens.expires_in || 3600) * 1000,
    kalender: kalender,
    seit: Date.now(),
  });

  zurueck(res, 'google=verbunden');
}
