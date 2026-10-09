(() => {
  'use strict';
  const cfg = window.fagCrmPasskeys;
  if (!cfg) return;

  const loginForm = document.getElementById('forever-crm-login');
  const identifierField = document.getElementById('crm-login-email');
  const rememberField = document.getElementById('crm-remember-username');
  const rememberedKey = 'foreverCrmLoginIdentifier';
  const rememberIdentifier = () => {
    if (!identifierField || !rememberField) return;
    try {
      if (rememberField.checked && identifierField.value.trim()) localStorage.setItem(rememberedKey, identifierField.value.trim());
      else localStorage.removeItem(rememberedKey);
    } catch (error) { /* Private browsing or policy may disable local storage. */ }
  };
  if (identifierField && rememberField) {
    try {
      const remembered = localStorage.getItem(rememberedKey);
      if (remembered && !identifierField.value) identifierField.value = remembered;
      rememberField.checked = Boolean(remembered) || rememberField.checked;
    } catch (error) { /* Normal login remains available without local storage. */ }
    loginForm?.addEventListener('submit', rememberIdentifier);
    rememberField.addEventListener('change', () => { if (!rememberField.checked) rememberIdentifier(); });
  }

  if (!window.isSecureContext || !window.PublicKeyCredential || !navigator.credentials) return;

  const decode = value => {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  };
  const encode = value => {
    const bytes = new Uint8Array(value);
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const request = async (path, body) => {
    const headers = {'Content-Type': 'application/json'};
    if (cfg.nonce) headers['X-WP-Nonce'] = cfg.nonce;
    const response = await fetch(cfg.base + path, {method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify(body)});
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'The passkey request could not be completed.');
    return data;
  };
  const status = (button, message, error = false) => {
    const output = button.parentElement.querySelector('.passkey-status');
    if (output) { output.textContent = message; output.classList.toggle('error', error); }
  };
  const credentialJSON = credential => ({
    id: credential.id, rawId: encode(credential.rawId), type: credential.type,
    response: credential.response.attestationObject ? {
      clientDataJSON: encode(credential.response.clientDataJSON),
      attestationObject: encode(credential.response.attestationObject)
    } : {
      clientDataJSON: encode(credential.response.clientDataJSON),
      authenticatorData: encode(credential.response.authenticatorData),
      signature: encode(credential.response.signature),
      userHandle: credential.response.userHandle ? encode(credential.response.userHandle) : null
    }
  });

  document.querySelectorAll('[data-passkey-login]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const identifier = document.getElementById('crm-login-email')?.value.trim();
      if (!identifier) { status(button, 'Enter your CRM email or username first.', true); document.getElementById('crm-login-email')?.focus(); return; }
      rememberIdentifier();
      button.disabled = true; status(button, 'Waiting for your device…');
      try {
        const begin = await request('login/begin', {identifier});
        begin.publicKey.challenge = decode(begin.publicKey.challenge);
        begin.publicKey.allowCredentials = begin.publicKey.allowCredentials.map(item => ({...item, id: decode(item.id)}));
        const credential = await navigator.credentials.get({publicKey: begin.publicKey});
        const finish = await request('login/finish', {flow: begin.flow, credential: credentialJSON(credential)});
        status(button, 'Signed in. Opening Forever CRM…'); window.location.assign(finish.redirect);
      } catch (error) {
        let message = error.message || 'Passkey sign-in failed.';
        if (error.name === 'NotAllowedError' || error.name === 'AbortError') message = 'Passkey sign-in was canceled, timed out, or no matching passkey was available on this device.';
        if (error.name === 'SecurityError') message = 'The browser blocked passkey sign-in for this website. Make sure you are using the HTTPS Forever CRM address.';
        status(button, message, true); button.disabled = false;
      }
    });
  });


  document.querySelectorAll('[data-passkey-remove]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const output = form.querySelector('.passkey-remove-status');
      const id = form.querySelector('input[name="credential_id"]')?.value || '';
      if (!id) { if (output) output.textContent = 'Passkey ID is missing. Refresh this page.'; return; }
      if (!window.confirm('Remove this passkey from Forever CRM?')) return;
      if (button) button.disabled = true;
      if (output) { output.textContent = ' Removing…'; output.classList.remove('error'); }
      try {
        const result = await request('remove', {credential_id: id});
        if (output) output.textContent = ' ' + (result.message || 'Passkey removed.');
        const article = form.closest('article');
        window.setTimeout(() => article ? article.remove() : window.location.reload(), 300);
      } catch (error) {
        if (output) { output.textContent = ' ' + error.message; output.classList.add('error'); }
        if (button) button.disabled = false;
      }
    });
  });

  document.querySelectorAll('[data-passkey-register]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      button.disabled = true; status(button, 'Waiting for your device…');
      try {
        const begin = await request('register/begin', {});
        begin.publicKey.challenge = decode(begin.publicKey.challenge);
        begin.publicKey.user.id = decode(begin.publicKey.user.id);
        begin.publicKey.excludeCredentials = begin.publicKey.excludeCredentials.map(item => ({...item, id: decode(item.id)}));
        const credential = await navigator.credentials.create({publicKey: begin.publicKey});
        const name = window.prompt('Name this passkey (for example, Richie’s iPhone):', 'My device') || 'My device';
        const finish = await request('register/finish', {flow: begin.flow, name, credential: credentialJSON(credential)});
        status(button, finish.message); window.setTimeout(() => window.location.reload(), 900);
      } catch (error) {
        let message = error.message || 'Passkey setup failed.';
        if (error.name === 'NotAllowedError' || error.name === 'AbortError') message = 'Passkey setup was canceled, timed out, or your device declined the request.';
        if (error.name === 'SecurityError') message = 'The browser blocked passkey setup for this website. Make sure you are using the HTTPS Forever CRM address.';
        status(button, message, true); button.disabled = false;
      }
    });
  });
})();
