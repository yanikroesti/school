/* =========================================================
   Ist der Kalender verbunden?

   /api/google/status  ->  { verbunden, kalender, seit }

   Die Seite fragt das beim Laden, um zwischen "Verbinden"-Knopf und
   Abgleich zu entscheiden. Antwortet bewusst auch im Fehlerfall mit
   200 und verbunden:false — ein nicht verbundener Kalender ist kein
   Fehler, sondern der Normalzustand vor dem ersten Mal.
   ========================================================= */

import { CLIENT_ID, sitzung, zugriffstoken, sitzungSetzen, json } from './_lib.mjs';

export default async function handler(req, res) {
  if (!CLIENT_ID) {
    return json(res, 200, { verbunden: false, grund: 'nicht-eingerichtet' });
  }

  const s = sitzung(req);
  if (!s) return json(res, 200, { verbunden: false });

  const t = await zugriffstoken(s);
  if (t.fehler) return json(res, 200, { verbunden: false, grund: t.fehler });

  if (t.erneuert) sitzungSetzen(res, t.sitzung);
  json(res, 200, {
    verbunden: true,
    kalender: s.kalender || null,
    seit: s.seit || null,
  });
}
