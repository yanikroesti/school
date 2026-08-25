/* =========================================================
   Verbindung loesen.

   POST /api/google/logout

   Loescht nur das Cookie auf diesem Geraet. Der Kalender bei Google
   und alles darin bleibt bestehen — Trennen ist kein Loeschen. Wer
   die Zustimmung ganz zurueckziehen will, macht das bei Google unter
   Konto -> Sicherheit -> Drittanbieter-Apps; das steht auch so auf
   der Kalenderseite.
   ========================================================= */

import { sitzungLoeschen, json } from './_lib.mjs';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { fehler: 'nur-post' });
  }
  sitzungLoeschen(res);
  json(res, 200, { verbunden: false });
}
