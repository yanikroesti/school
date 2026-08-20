# Product

<!-- uizze:product-schema 1 -->

## Platform

web

## Users

Primary and effectively only user: **Yanik Rösti**, Elektroinstallateur-EFZ apprentice
in his 2nd Lehrjahr (3rd semester from 08.2026), class **ELI 25a** at **BZI Interlaken**,
employed at **Etavis**. Schooling is two days a week — Monday and Friday — with four
days on site in between.

The use scene is the constraint that matters. He reads this on a phone, standing, in a
stairwell or the BZI cafeteria or on the train to Interlaken, with about four minutes and
very little patience. His own words for the state he is in when he opens it: "ill be very
tired and have small atetnion span." The second scene is a laptop at a kitchen table in
the evening, when he is deciding what to study and does not want to be there.

Jobs, in the order he actually needs them:
1. What is next, and how long until it starts.
2. What do I owe, and when is it due.
3. What is this exam and how is it graded.
4. Where is the material for it.
5. How am I doing — privately.

## Product Purpose

One private control surface that turns a fragmented school reality into a single glance.
The fragmentation is real and specific: a timetable that alternates by ISO calendar-week
parity, five teachers across two weekdays, five subjects, exams whose grading rules are
partly unknown, and grades that must not be public.

Success is measured in seconds to answer, not in features. If he has to read the page to
find out what is next, the page failed.

## Positioning

Not a school platform and not a study app. It is one apprentice's own instrument, built
around facts no generic product has: this class's actual timetable, these five teachers,
the Woche-Gerade/Ungerade rule, the Swiss semester-Zeugnis grade structure with its
half-rounding, and the BZI holiday calendar.

## Operating Context

- **Two school days.** Monday: Moser + Lädrach. Friday: Wäfler + Berisha + Aeschlimann.
- **Week parity governs the day.** Even ISO calendar week = long ABU block, no sport.
  This is derived from the ISO week number, not stored per week.
- **Navigation is by teacher, not by subject** — his explicit decision: "i think its better
  to group by teacher. makes it easier for me, because monday i only have these and friday i
  have others." Subject is carried as colour, not as structure.
- `Career/Apprenticeship/Stundenplan.md` in the Obsidian vault is the single source of
  truth for the timetable; `data/*.json` is generated from it, never the reverse.
- Lernpakete (study packs) live on the sibling site dump.yanikroesti.ch and are linked in,
  auto-archiving after their exam date.
- A Telegram bot on an old EliteBook is planned as the write path, so he can add homework
  and exams in free text without typing slash-commands.

## Capabilities and Constraints

- Static HTML/CSS/JS, **no build step**, deployed on Vercel from the `school` repo.
  `CNAME` and `.nojekyll` are inert leftovers from a GitHub Pages period.
- Fully bilingual **German / English**, switched client-side by showing one of a
  `<span lang="de">` / `<span lang="en">` pair; choice persists in `localStorage`.
  German is the default and the primary language.
- Supabase project `ljkdibnkifzwydhqkzxt` holds `tests`, `homework`, `reflections`.
  The anon key may read tests and homework and may flip `homework.done` and nothing
  else; `reflections` is closed to anon entirely because daily journal entries are
  personal. Verified against the live keys, not just configured.
- **The site is public. Grades are not.** Grades live only in `localStorage`,
  `data/noten-local.json` is gitignored, and a client-side PIN gate stands in front of
  them. The PIN stops someone holding his unlocked phone; it is not claimed to stop
  anyone with devtools, and the code says so.
- Swiss semester-Zeugnis structure: Allgemeinbildung (Gesellschaft · Sprache und
  Kommunikation) and Berufskenntnisse (Technologische Grundlagen · Technische
  Dokumentation), plus Sport and Absenzen. Sub-grades average and half-round to the
  group grade; 4.0 is the pass line.

### Explicitly undecided — must not be invented

- The grading rules for HTOG, ATD and ABU. Only ABT is known (weekly Kurztests count
  together as one grade, plus 4 Grosstests).
- How ABT / HTOG / ATD map onto the Zeugnis rows Technologische Grundlagen and
  Technische Dokumentation.
- The written-out forms of some subject abbreviations.
- Lädrach's real end time (16:00 or 16:10).

## Brand Commitments

- Name and address: **schule.yanikroesti.ch**, a satellite of dump.yanikroesti.ch.
- Institutional logos on hand and already licensed by being his own school and employer:
  BZI, Etavis, Electrosuisse, Suva (`logos/`).
- Subject colour identity in use: ABT, HTOG, ATD, ABU, Sport. Colours are duplicated in
  `assets/core.css` and `data/subjects.json` and must stay in sync.

## Evidence on Hand

- Real timetable, real teacher names, real holiday and closure dates, real exam objectives
  for NIN and Telekommunikation, and his real first- and second-semester Zeugnis.
- Real logos as described above.
- **No** fabricated grades, classmates, testimonials, or usage statistics exist or may be
  created. Grade values shown in any public context must be illustrative and labelled.

## Product Principles

1. **Answer before it is read.** The next thing and its countdown outrank everything.
2. **Teacher is the axis, subject is the colour.** His decision; do not re-litigate it.
3. **Unknown is a state, not a blank.** Where a grading rule is unconfirmed, the surface
   says so plainly rather than guessing or hiding it.
4. **Private stays private.** Nothing that identifies his grades reaches the repo.
5. **Built for four tired minutes on a phone**, and only then for a desk.

## Accessibility & Inclusion

No diagnosed requirement is established. The governing constraint is situational: low
attention, one hand, a phone screen, often in poor light or bright daylight. Touch targets,
contrast and instant legibility are product requirements here, not compliance checkboxes.
