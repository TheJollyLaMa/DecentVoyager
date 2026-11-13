const status = document.getElementById('shell-status');

try {
  await import('../../build/app.js');
  if (!window.DecentHead || !document.querySelector('decent-header')?.shadowRoot) {
    throw new Error('Flight tools did not initialize');
  }
  status.hidden = true;
} catch (error) {
  console.error('Flight tools unavailable:', error);
  status.firstChild.textContent = 'Flight tools could not start. ';
}
