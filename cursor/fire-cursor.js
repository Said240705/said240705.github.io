/* Fire cursor: a glowing ember with a flame trail. Desktop only (fine pointer), off for reduced motion. */
(function () {
  if (!window.matchMedia || !matchMedia('(pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var style = document.createElement('style');
  style.textContent =
    'html, body, a, button, [role="button"], label, select { cursor: none !important; }' +
    'input, textarea, [contenteditable="true"] { cursor: text !important; }' +
    '#fire-cursor-canvas { position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 2147483647; }';
  document.head.appendChild(style);

  var c = document.createElement('canvas');
  c.id = 'fire-cursor-canvas';
  c.setAttribute('aria-hidden', 'true');
  var ctx = c.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function mount() { document.body.appendChild(c); resize(); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  addEventListener('resize', resize);

  var x = -100, y = -100, px = x, py = y, visible = false, hover = false, parts = [];
  addEventListener('mousemove', function (e) {
    x = e.clientX; y = e.clientY; visible = true;
    hover = !!(e.target.closest && e.target.closest('a, button, [role="button"], input[type="submit"], select, label'));
  }, { passive: true });
  document.addEventListener('mouseleave', function () { visible = false; });
  addEventListener('mousedown', function () {
    for (var i = 0; i < 18; i++) {
      var a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 3;
      parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 1, size: 2 + Math.random() * 3, spark: true });
    }
  });

  function spawn(n) {
    for (var i = 0; i < n; i++) {
      var t = Math.random();
      parts.push({
        x: px + (x - px) * t + (Math.random() - 0.5) * 6,
        y: py + (y - py) * t + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.6 - Math.random() * 1.2,
        life: 1,
        size: (hover ? 9 : 6) + Math.random() * 6
      });
    }
  }

  function color(life, a) {
    // white-yellow core -> orange -> deep red as the particle cools
    var r = 255, g = Math.round(60 + 190 * Math.pow(life, 1.4)), b = Math.round(40 * Math.pow(life, 3) * 4);
    return 'rgba(' + r + ',' + g + ',' + Math.min(b, 160) + ',' + a + ')';
  }

  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (visible) {
      var moved = Math.hypot(x - px, y - py);
      spawn(Math.min(10, 2 + Math.round(moved / 4)));
    }
    ctx.globalCompositeOperation = 'lighter';
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.96; p.vy = p.spark ? p.vy + 0.12 : p.vy * 0.98 - 0.02;
      p.life -= p.spark ? 0.03 : 0.035;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      var r = p.size * (p.spark ? 1 : p.life);
      var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, color(p.life, 0.9 * p.life));
      g.addColorStop(1, color(p.life, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    if (visible) {
      // ember tip = the actual click point
      var core = ctx.createRadialGradient(x, y, 0, x, y, hover ? 9 : 6);
      core.addColorStop(0, 'rgba(255,255,240,1)');
      core.addColorStop(0.5, 'rgba(255,200,80,0.95)');
      core.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(x, y, hover ? 9 : 6, 0, Math.PI * 2); ctx.fill();
    }
    if (parts.length > 400) parts.splice(0, parts.length - 400);
    px = x; py = y;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
