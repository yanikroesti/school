/* =========================================================
   Schritt 1: zu Google schicken.

   /api/google/start  ->  Zustimmungsseite von Google

   Der state-Wert ist der Schutz gegen untergeschobene Rueckkehr:
   er wird hier zufaellig erzeugt, in ein kurzlebiges Cookie gelegt
   und beim Rueckweg verglichen. Kommt jemand ohne oder mit falschem
   state zurueck, war es nicht dieser Browser, der angefangen hat.
   ========================================================= */

import crypto from 'node:crypto';
import { CLIENT_ID, REDIRECT, SCOPE, stateSetzen, json } from './_lib.mjs';

export default function handler(req, res) {
  if (!CLIENT_ID) {
    json(res, 503, {
      fehler: 'nicht-eingerichtet',
      hinweis: 'GOOGLE_CLIENT_ID fehlt in den Umgebungsvariablen auf Vercel.',
    });
    return;
  }

  const state = crypto.randomBytes(16).toString('base64url');
  stateSetzen(res, state);

  const u = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  u.searchParams.set('client_id', CLIENT_ID);
  u.searchParams.set('redirect_uri', REDIRECT);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('scope', SCOPE);
  u.searchParams.set('state', state);
  // offline + consent: nur so liefert Google einen Auffrischungs-Token.
  // Ohne ihn waere die Verbindung nach einer Stunde tot.
  u.searchParams.set('access_type', 'offline');
  u.searchParams.set('prompt', 'consent');
  u.searchParams.set('include_granted_scopes', 'true');

  res.writeHead(302, { Location: u.toString() });
  res.end();
}
