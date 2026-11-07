export function node(tag, text = '', attrs = {}) {
  const element = document.createElement(tag); element.textContent = text;
  for (const [key, value] of Object.entries(attrs)) { if (key === 'className') element.className = value; else element.setAttribute(key, value); }
  return element;
}
export function button(text, action) { const element = node('button', text, { type: 'button' }); element.addEventListener('click', action); return element; }
export function link(text, href) { return node('a', text, { href, target: '_blank', rel: 'noopener noreferrer' }); }
export function installStyle() {
  if (document.getElementById('asteroid-stamp-style')) return;
  const style = node('style', `
    .asteroid-panel { color:#eefaff; background:#091320; border:2px solid #68e7cf; border-radius:16px; padding:22px; width:min(900px,calc(100vw - 52px)); max-height:80dvh; overflow:auto; font:15px/1.6 system-ui; box-shadow:0 0 50px #39eec633; }
    .asteroid-panel::backdrop { background:#020712d9; }
    .asteroid-panel h2,.asteroid-panel h3 { color:#88ffee; margin:8px 0 14px; }
    .asteroid-panel .panel-heading { position:sticky; top:-22px; z-index:2; display:flex; align-items:center; justify-content:space-between; gap:18px; padding:12px 0; background:#091320; }
    .asteroid-panel .panel-close { flex:none; width:44px; height:44px; padding:0; border-radius:50%; font-size:26px; }
    .flight-log-hero { display:flex; align-items:center; gap:24px; margin:22px 0; }
    .flight-log-hero img { width:100px; height:100px; object-fit:contain; }
    .flight-log-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(135px,1fr)); gap:14px; margin:18px 0 30px; }
    .flight-log-grid > div { background:#102132; border:1px solid #36586a; border-radius:12px; padding:18px; }
    .flight-log-grid strong { display:block; color:#88ffee; font-size:24px; line-height:1.4; }
    .flight-log-grid span { color:#bdd0e4; }
    .asteroid-panel .battle-preview { width:100%; max-width:480px; height:auto; display:block; margin:18px 0; }
    .asteroid-panel button { cursor:pointer; padding:10px 15px; color:#ebffff; background:#183347; border:1px solid #77efd4; border-radius:9px; font:600 14px system-ui; margin:5px; }
    .asteroid-panel button:disabled { opacity:.45; cursor:not-allowed; }
    .asteroid-panel button:focus-visible,.asteroid-panel a:focus-visible { outline:3px solid #fbc770; outline-offset:3px; }
    .asteroid-panel a { color:#8cdbff; overflow-wrap:anywhere; }
    .asteroid-panel article { padding:15px; margin:14px 0; border:1px solid #36586a; border-radius:12px; background:#102132; overflow-wrap:anywhere; }
    .asteroid-panel p { margin:8px 0; }
    .asteroid-panel textarea { box-sizing:border-box; width:100%; min-height:110px; background:#04111c; color:#dcfff9; padding:10px; }
    .asteroid-panel img { width:160px; max-width:100%; border-radius:10px; }
    .asteroid-panel pre { white-space:pre-wrap; overflow-wrap:anywhere; }
    .asteroid-status { color:#ffdb87; white-space:pre-wrap; }
    .asteroid-panel nav { display:flex; flex-wrap:wrap; gap:8px; }
    .asteroid-panel [aria-selected=true] { background:#215c60; }
    .reward-rolodex { display:flex; gap:18px; overflow-x:auto; scroll-snap-type:x mandatory; padding:12px 4px 24px; }
    .asteroid-panel .reward-thumbnail { flex:0 0 190px; display:flex; flex-direction:column; align-items:center; gap:12px; padding:18px; margin:0; scroll-snap-align:start; }
    .reward-thumbnail img { height:150px; object-fit:contain; }
    .reward-thumbnail strong { line-height:1.5; }
    .reward-thumbnail span { color:#bdd0e4; }
    #voyager-reward-detail .reward-card img { display:block; width:min(360px,100%); margin:20px auto; }
  `, { id: 'asteroid-stamp-style' }); document.head.append(style);
}
export function createDialog(title, id) {
  installStyle();
  const dialog = node('dialog', '', { id, className: 'asteroid-panel', 'aria-labelledby': `${id}-title` });
  const heading = node('div', '', { className: 'panel-heading' });
  const close = button('×', () => dialog.close());
  close.className = 'panel-close'; close.setAttribute('aria-label', `Close ${title}`);
  heading.append(node('h2', title, { id: `${id}-title` }), close);
  dialog.append(heading);
  bindBackdropClose(dialog);
  dialog.addEventListener('keydown', event => event.stopPropagation());
  dialog.addEventListener('keyup', event => event.stopPropagation());
  document.body.append(dialog); return dialog;
}
export function bindBackdropClose(dialog, dismiss = () => dialog.close()) {
  let outside = false;
  const isOutside = event => {
    const box = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom);
  };
  dialog.addEventListener('pointerdown', event => { outside = isOutside(event); });
  dialog.addEventListener('click', event => {
    if (outside && isOutside(event)) dismiss();
    outside = false;
  });
}
export function openDialog(dialog) {
  const game = window.asteroidGame;
  if (game?.state === 'playing') { game.handleAction?.('pause'); window.asteroidDraw?.(); }
  if (!dialog.open) dialog.showModal();
}
