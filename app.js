(function () {
  'use strict';

  /* ---------- Config ----------
     Google Calendar: make the team calendar public, then fill in the two values below.
     CALENDAR_ID: Calendar settings > Integrate calendar > Calendar ID
     API_KEY: Google Cloud console > Credentials > API key (restrict to Calendar API + this domain)
     Until both are set, the calendar shows placeholder events. */
  var CONFIG = {
    CALENDAR_ID: '',
    API_KEY: '',
    LANGS: ['et', 'en', 'it', 'es']
  };

  var riders = [
    { name: 'Harald Ehasalu', cls: 'Cadet', photo: 'r-harald.jpg', ig: '' },
    { name: 'Hans Joonas Tamm', cls: 'KZ2', photo: 'r-tamm.jpg', ig: 'hans50_' },
    { name: 'Richard Alexander Pullinen', cls: 'OK', photo: 'r-pullinen.jpg', ig: '' },
    { name: 'Mario Vendla', cls: 'KZ2', photo: 'r-vendla.jpg', ig: 'vendlamario' },
    { name: 'Kristjan Penjam', cls: 'KZ2', photo: 'r-penjam.jpg', ig: 'kristjanpenjam' },
    { name: 'Aston Asmer', cls: 'Mini', photo: 'r-placeholder.jpg', ig: 'aston_asmer' },
    { name: 'Gustav Ehasalu', cls: '', photo: 'r-placeholder.jpg', ig: '' },
    { name: 'Martin Keelmann', cls: 'KZ2', photo: 'r-keelmann.jpg', ig: 'm2rt1nk' },
    { name: 'Laur Uusmägi', cls: 'KZ2', photo: 'r-uusmagi.jpg', ig: 'lauruusmagi' },
    { name: 'Karl Hugo Kõrge', cls: 'Mini', photo: 'r-placeholder.jpg', ig: '' },
    { name: 'Villem Pomerants', cls: 'DD2 Masters', photo: 'r-placeholder.jpg', ig: 'vpomerants' },
    { name: 'Priit Kadastik', cls: 'DD2 Masters', photo: 'r-placeholder.jpg', ig: 'priitkada' }
  ];
  var classes = ['*', 'Mini', 'Cadet', 'OK', 'KZ2', 'DD2 Masters'];

  var state = { lang: 'et', filter: '*', tab: 'up', events: null, lastFocus: null };
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function t(k) { var d = window.I18N[state.lang] || window.I18N.et; return d[k] != null ? d[k] : (window.I18N.et[k] || k); }

  /* ---------- Language ---------- */
  function pickInitialLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q && CONFIG.LANGS.indexOf(q) > -1) return q;
    try { var s = localStorage.getItem('teamo-lang'); if (s && CONFIG.LANGS.indexOf(s) > -1) return s; } catch (e) {}
    var n = (navigator.language || 'et').slice(0, 2).toLowerCase();
    return CONFIG.LANGS.indexOf(n) > -1 ? n : 'et';
  }
  function setLang(l) {
    state.lang = l;
    document.documentElement.lang = l;
    try { localStorage.setItem('teamo-lang', l); } catch (e) {}
    var u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(null, '', u);
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === l)); });
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) { el.alt = t(el.dataset.i18nAlt); });
    $('#mailSp').href = 'mailto:timo@team-o.racing?subject=' + encodeURIComponent(t('sp.mailSubject'));
    renderChips(); renderRiders(); renderTabs(); renderEvents(); renderNext(); renderTiers();
  }

  /* ---------- Riders ---------- */
  function clsLabel(c) { return c || t('cls.unknown'); }
  function renderChips() {
    $('#classChips').setAttribute('aria-label', t('riders.title'));
    $('#classChips').innerHTML = classes.map(function (c) {
      var n = c === '*' ? riders.length : riders.filter(function (r) { return r.cls === c; }).length;
      return '<button class="chip" type="button" data-c="' + esc(c) + '" aria-pressed="' + (state.filter === c) + '">' +
        esc(c === '*' ? t('riders.all') : c) + '<span>' + n + '</span></button>';
    }).join('');
  }
  function renderRiders() {
    var list = riders.map(function (r, i) { return [r, i]; }).filter(function (p) { return state.filter === '*' || p[0].cls === state.filter; });
    $('#riders').innerHTML = list.map(function (p) {
      var r = p[0];
      return '<button class="card" type="button" data-i="' + p[1] + '" aria-label="' + esc(t('riders.open') + ': ' + r.name) + '">' +
        '<div class="ph"><img src="assets/' + r.photo + '" alt="" loading="lazy" width="700" height="920"><span class="badge">' + esc(clsLabel(r.cls)) + '</span></div>' +
        '<div class="meta"><span class="nm">' + esc(r.name) + '</span><span class="ig">' + (r.ig ? '@' + esc(r.ig) : 'Team-O Racing') + '</span></div></button>';
    }).join('');
  }

  /* ---------- Profile sheet ---------- */
  function openProfile(i) {
    var r = riders[i];
    state.lastFocus = document.activeElement;
    $('#pImg').src = 'assets/' + r.photo; $('#pImg').alt = r.name;
    $('#pName').textContent = r.name;
    $('#pCls').textContent = clsLabel(r.cls); $('#pCls2').textContent = clsLabel(r.cls);
    var ig = $('#pIg');
    if (r.ig) { ig.style.display = ''; ig.href = 'https://www.instagram.com/' + r.ig + '/'; ig.textContent = '@' + r.ig; }
    else { ig.style.display = 'none'; }
    var s = $('#sheet'); s.classList.add('open'); s.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('#pClose').focus();
  }
  function closeProfile() {
    var s = $('#sheet'); s.classList.remove('open'); s.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (state.lastFocus) state.lastFocus.focus();
  }

  /* ---------- Calendar ---------- */
  function placeholderEvents() {
    var b = { month: t('cal.month'), day: t('cal.day'), title: t('cal.event'), place: t('cal.track') };
    var mk = function (o) { return Object.assign({}, b, o); };
    return {
      up: [mk({ classes: 'KZ2 · OK · Mini', note: t('cal.allRiders') }), mk({ classes: 'KZ2 · DD2 Masters', note: t('cal.more') }), mk({ classes: 'Cadet · Mini', note: t('cal.more') })],
      past: [mk({ classes: 'KZ2', note: t('cal.result') }), mk({ classes: 'OK', note: t('cal.result') }), mk({ classes: 'Mini', note: t('cal.result') })]
    };
  }
  function fromGoogle(item) {
    var start = new Date(item.start.dateTime || item.start.date);
    var loc = { et: 'et-EE', en: 'en-GB', it: 'it-IT', es: 'es-ES' }[state.lang];
    var desc = (item.description || '').replace(/<[^>]+>/g, ' ').trim();
    var firstLine = desc.split(/\n/)[0] || '';
    return {
      month: start.toLocaleDateString(loc, { month: 'short' }).replace('.', '').toUpperCase(),
      day: String(start.getDate()),
      title: item.summary || '', place: item.location || '',
      classes: firstLine.length < 60 ? firstLine : '', note: '', start: start
    };
  }
  function loadCalendar() {
    if (!CONFIG.CALENDAR_ID || !CONFIG.API_KEY) return;
    var base = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(CONFIG.CALENDAR_ID) + '/events';
    var now = new Date(); var yearAgo = new Date(now.getTime() - 365 * 864e5);
    var url = base + '?key=' + CONFIG.API_KEY + '&singleEvents=true&orderBy=startTime&maxResults=50&timeMin=' + yearAgo.toISOString();
    fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      state.events = (d.items || []);
      renderEvents(); renderNext();
    }).catch(function () {});
    var ical = 'https://calendar.google.com/calendar/ical/' + encodeURIComponent(CONFIG.CALENDAR_ID) + '/public/basic.ics';
    $('#subscribe').href = ical.replace(/^https:/, 'webcal:');
  }
  function currentEvents() {
    if (!state.events) return placeholderEvents();
    var all = state.events.map(fromGoogle); var now = new Date();
    return {
      up: all.filter(function (e) { return e.start >= now; }),
      past: all.filter(function (e) { return e.start < now; }).reverse()
    };
  }
  function renderTabs() {
    $('#calTabs').setAttribute('aria-label', t('cal.title'));
    $('#calTabs').innerHTML = [['up', t('cal.upcoming')], ['past', t('cal.results')]].map(function (x) {
      return '<button class="chip" type="button" data-tab="' + x[0] + '" aria-pressed="' + (state.tab === x[0]) + '">' + esc(x[1]) + '</button>';
    }).join('');
  }
  function renderEvents() {
    var list = currentEvents()[state.tab].slice(0, 6);
    if (!list.length) { $('#events').innerHTML = '<p class="sub">' + esc(t('cal.empty')) + '</p>'; return; }
    $('#events').innerHTML = list.map(function (e) {
      return '<article class="ev"><div class="date"><span class="m">' + esc(e.month) + '</span><span class="d">' + esc(e.day) + '</span></div>' +
        '<div class="b"><span class="ti">' + esc(e.title) + '</span>' + (e.place ? '<span class="pl">' + esc(e.place) + '</span>' : '') +
        (e.classes ? '<span class="cl">' + esc(e.classes) + '</span>' : '') + (e.note ? '<span class="re">' + esc(e.note) + '</span>' : '') + '</div></article>';
    }).join('');
  }
  function renderNext() {
    var e = currentEvents().up[0] || placeholderEvents().up[0];
    $('#next').innerHTML = '<div class="date"><span class="m">' + esc(e.month) + '</span><span class="d">' + esc(e.day) + '</span></div>' +
      '<div class="t"><span class="l">' + esc(t('next.label')) + '</span><span class="n">' + esc(e.title + (e.place ? ' · ' + e.place : '')) + '</span>' +
      '<span class="s">' + esc(t('next.sub')) + '</span></div>';
  }

  /* ---------- Sponsorship ---------- */
  function renderTiers() {
    $('#tiers').innerHTML = t('sp.tiers').map(function (x, i) {
      return '<div class="tier' + (i === 1 ? ' dark' : '') + '"><span class="tg">' + esc(x.tag) + '</span><span class="tn">' + esc(x.name) + '</span>' +
        '<span class="pr">' + esc(x.price) + '</span><ul>' + x.perks.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>';
    }).join('');
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-lang],[data-c],[data-tab],.card,#pClose,.burger,.mnav a');
    if (!el) { if (ev.target.id === 'sheet') closeProfile(); return; }
    if (el.dataset.lang) setLang(el.dataset.lang);
    else if (el.dataset.c) { state.filter = el.dataset.c; renderChips(); renderRiders(); }
    else if (el.dataset.tab) { state.tab = el.dataset.tab; renderTabs(); renderEvents(); }
    else if (el.classList.contains('card')) openProfile(+el.dataset.i);
    else if (el.id === 'pClose') closeProfile();
    else if (el.classList.contains('burger')) {
      var open = !$('#mnav').classList.contains('open');
      $('#mnav').classList.toggle('open', open); el.setAttribute('aria-expanded', String(open));
    } else if (el.closest('.mnav')) { $('#mnav').classList.remove('open'); $('.burger').setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && $('#sheet').classList.contains('open')) closeProfile(); });

  setLang(pickInitialLang());
  loadCalendar();
})();
