/* Search/filter boxes never take saved logins. Chrome on Android, Samsung Pass and
   Google Password Manager ignore autocomplete="off", so each search box stays
   readonly until a finger or keyboard reaches it (password managers skip readonly
   fields) and a value that arrives without typing and looks like an email is cleared. */
(() => {
  const SEARCH = 'input[type="search"]';
  const arm = input => { if (document.activeElement !== input) input.readOnly = true; };
  const sweep = root => { for (const input of root.querySelectorAll(SEARCH)) if (!input.dataset.guarded) { input.dataset.guarded = '1'; arm(input); } };
  const unlock = event => { const input = event.target.closest?.(SEARCH); if (input) input.readOnly = false; };
  for (const type of ['pointerdown', 'touchstart', 'mousedown', 'focusin']) document.addEventListener(type, unlock, { capture: true, passive: true });
  document.addEventListener('focusout', event => { const input = event.target.closest?.(SEARCH); if (input) setTimeout(() => arm(input), 0); }, true);
  // Typing fires beforeinput; a browser autofill does not.
  const typed = new WeakSet();
  document.addEventListener('beforeinput', event => { if (event.target.matches?.(SEARCH)) typed.add(event.target); }, true);
  const check = event => {
    const input = event.target;
    if (!input.matches?.(SEARCH)) return;
    let autofilled = false; try { autofilled = input.matches(':autofill'); } catch { try { autofilled = input.matches(':-webkit-autofill'); } catch {} }
    if ((autofilled || !typed.has(input)) && /\S+@\S+\.\S+/.test(input.value)) {
      input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('search', { bubbles: true }));
    }
    typed.delete(input);
  };
  document.addEventListener('input', check, true); document.addEventListener('change', check, true);
  sweep(document);
  new MutationObserver(() => sweep(document)).observe(document.documentElement, { childList: true, subtree: true });

})();
