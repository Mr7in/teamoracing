# Team-O Racing website concept

Static, mobile-first redesign of [team-o.racing](https://team-o.racing/). No build step: plain HTML, CSS and JS.

Live preview: https://teamoracing.noclip.ee

## Files
- `index.html` page structure
- `styles.css` brand styles (black, white, #ED1C24, #C4161C, Poppins)
- `i18n.js` all copy in Estonian, English, Italian and Spanish
- `app.js` riders, class filter, profile sheet, calendar, language switcher
- `assets/` logo, rider photos, Instagram shots, sponsor logos

## Language
Switcher in the header. Choice is remembered and also set by `?lang=et|en|it|es`.

## Google Calendar
1. Make the team calendar public (Settings > Access permissions).
2. Create a Google Cloud API key with the Calendar API enabled, restricted to this domain.
3. Fill `CALENDAR_ID` and `API_KEY` at the top of `app.js`.
The calendar section, the "next race" card and the "add to your calendar" button then use real events. Put the classes (e.g. `KZ2 · OK`) on the first line of the event description.

## Placeholders
Text in [brackets] is waiting for real data: race dates, results, race numbers, prices, podium count, rider bios.

The page is set to `noindex` while it is a concept.
