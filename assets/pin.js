/* =========================================================
   PIN-Sperre für die Notenseite.

   Was sie leistet: Wer dein entsperrtes Handy oder deinen Laptop in die
   Hand nimmt, sieht die Noten nicht. Das ist der realistische Fall.

   Was sie NICHT leistet: Schutz vor jemandem mit Entwicklertools — die
   Noten liegen im localStorage und sind dort auslesbar. Echte Sicherheit
   gäbe es nur mit Server und Login (Supabase). Dafür liegen die Noten
   aber auch nie auf einem Server, sondern nur auf deinem Gerät.

   Der PIN selbst wird als SHA-256-Hash gespeichert, nie im Klartext.
   ========================================================= */
(function (global) {
  'use strict';

  var HASHKEY = 'schule-pin';
  var OPENKEY = 'schule-pin-open';

  function lang() { return document.documentElement.getAttribute('data-l') || 'de'; }
  function t(de, en) { return lang() === 'en' ? en : de; }

  function sha256(s) {
    var enc = new TextEncoder().encode(s);
    return crypto.subtle.digest('SHA-256', enc).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  function stored() { try { return localStorage.getItem(HASHKEY); } catch (e) { return null; } }
  function setStored(h) { try { h ? localStorage.setItem(HASHKEY, h) : localStorage.removeItem(HASHKEY); } catch (e) {} }
  function isOpen() { try { return sessionStorage.getItem(OPENKEY) === '1'; } catch (e) { return false; } }
  function markOpen() { try { sessionStorage.setItem(OPENKEY, '1'); } catch (e) {} }
  function markClosed() { try { sessionStorage.removeItem(OPENKEY); } catch (e) {} }

  function overlay(mode) {
    // mode: 'unlock' | 'set'
    var setzen = mode === 'set';
    var el = document.createElement('div');
    el.className = 'pinwrap';
    el.innerHTML =
      '<div class="pinbox" role="dialog" aria-modal="true" aria-labelledby="pin-h">' +
        '<div class="pin-ico" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">' +
          '<rect x="4" y="10.5" width="16" height="10" rx="2.5"/>' +
          '<path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.3"/></svg>' +
        '</div>' +
        '<h2 id="pin-h">' + (setzen ? t('PIN festlegen', 'Set a PIN') : t('Noten gesperrt', 'Grades locked')) + '</h2>' +
        '<p>' + (setzen
          ? t('Vier Ziffern. Danach sind deine Noten auf diesem Gerät nur nach Eingabe sichtbar.',
              'Four digits. Your grades then stay hidden on this device until you enter it.')
          : t('Gib deinen vierstelligen PIN ein.', 'Enter your four-digit PIN.')) + '</p>' +
        '<div class="pin-dots" id="pinDots">' +
          '<i></i><i></i><i></i><i></i>' +
        '</div>' +
        '<input type="password" id="pinInput" inputmode="numeric" pattern="[0-9]*" maxlength="4" ' +
          'autocomplete="off" aria-label="PIN" >' +
        '<p class="pin-err" id="pinErr" role="alert"></p>' +
        (setzen ? '<button class="tinybtn" id="pinSkip">' + t('Ohne PIN weiter', 'Continue without a PIN') + '</button>' : '') +
      '</div>';
    document.body.appendChild(el);

    var input = el.querySelector('#pinInput');
    var dots = el.querySelectorAll('#pinDots i');
    var err = el.querySelector('#pinErr');
    var first = null;

    function paintDots() {
      var n = input.value.length;
      dots.forEach(function (d, i) { d.classList.toggle('on', i < n); });
    }

    function fail(msg) {
      err.textContent = msg;
      el.querySelector('.pinbox').classList.add('shake');
      setTimeout(function () { el.querySelector('.pinbox').classList.remove('shake'); }, 420);
      input.value = ''; paintDots(); input.focus();
    }

    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '');
      paintDots();
      err.textContent = '';
      if (input.value.length !== 4) return;

      var code = input.value;
      if (setzen) {
        if (!first) {
          first = code;
          el.querySelector('#pin-h').textContent = t('Nochmal zur Bestätigung', 'Once more to confirm');
          input.value = ''; paintDots();
          return;
        }
        if (first !== code) { first = null; el.querySelector('#pin-h').textContent = t('PIN festlegen', 'Set a PIN'); return fail(t('Stimmt nicht überein. Nochmal.', 'Did not match. Try again.')); }
        sha256(code).then(function (h) { setStored(h); markOpen(); close(); });
      } else {
        sha256(code).then(function (h) {
          if (h === stored()) { markOpen(); close(); }
          else fail(t('Falscher PIN.', 'Wrong PIN.'));
        });
      }
    });

    var skip = el.querySelector('#pinSkip');
    if (skip) skip.addEventListener('click', function () { markOpen(); close(); });

    function close() {
      el.classList.add('gone');
      setTimeout(function () { el.remove(); }, 220);
      document.body.classList.remove('locked');
      document.dispatchEvent(new CustomEvent('pinunlocked'));
    }

    setTimeout(function () { input.focus(); }, 60);
    paintDots();
  }

  var API = {
    /** Sperrt die Seite, bis der PIN stimmt. hasData: gibt es überhaupt etwas zu schützen? */
    guard: function (hasData) {
      if (isOpen()) return Promise.resolve(true);
      if (!stored()) {
        // Noch kein PIN gesetzt: nur fragen, wenn schon Daten da sind.
        if (!hasData) { markOpen(); return Promise.resolve(true); }
        document.body.classList.add('locked');
        overlay('set');
        return new Promise(function (res) { document.addEventListener('pinunlocked', function () { res(true); }, { once: true }); });
      }
      document.body.classList.add('locked');
      overlay('unlock');
      return new Promise(function (res) { document.addEventListener('pinunlocked', function () { res(true); }, { once: true }); });
    },
    has: function () { return !!stored(); },
    change: function () { document.body.classList.add('locked'); overlay('set'); },
    remove: function () { setStored(null); markClosed(); },
    lock: function () { markClosed(); location.reload(); }
  };

  global.Pin = API;
})(window);
