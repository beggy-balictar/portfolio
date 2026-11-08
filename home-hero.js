/* ===== Beggy — Home Hero (particle name) =====
   Particle name + glowing cursor + typing text + magnetic buttons. */
(function () {
  var hero = document.querySelector('.bh-hero');
  if (!hero) return;

  var canvas   = hero.querySelector('.bh-canvas');
  var cursorCv = hero.querySelector('.bh-cursor');
  var slot     = hero.querySelector('.bh-name');
  var typedEl  = hero.querySelector('.bh-typed');

  var NAME    = 'BEGGY BALICTAR';
  var PHRASES = ['Web Developer', 'Cybersecurity'];

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---------- typing text ---------- */
  (function typing() {
    if (reduce) { typedEl.textContent = PHRASES[0]; return; }
    var p = 0, c = 0, deleting = false;
    function step() {
      var word = PHRASES[p];
      var wait = deleting ? 45 : 90;
      if (!deleting) {
        c++;
        if (c >= word.length) { c = word.length; deleting = true; wait = 1600; }
      } else {
        c--;
        if (c <= 0) { c = 0; deleting = false; p = (p + 1) % PHRASES.length; wait = 400; }
      }
      typedEl.textContent = word.slice(0, c);
      setTimeout(step, wait);
    }
    setTimeout(step, 1400);
  })();

  /* ---------- particle name + cursor ---------- */
  var ctx, cctx, W = 0, H = 0, parts = [], mouse = null, ring = null, trail = [], magnet = false, visible = true;

  function fit(cv) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: c, w: w, h: h };
  }

  function build() {
    var a = fit(canvas); ctx = a.ctx; W = a.w; H = a.h;
    cctx = fit(cursorCv).ctx;

    var cr = canvas.getBoundingClientRect();
    var sr = slot.getBoundingClientRect();
    var cx = sr.left - cr.left + sr.width / 2;
    var cy = sr.top - cr.top + sr.height / 2;

    var sw = Math.ceil(sr.width), sh = Math.ceil(sr.height);
    if (!sw || !sh) return;
    var off = document.createElement('canvas');
    off.width = sw; off.height = sh;
    var o = off.getContext('2d');

    var size = Math.min(sh * 0.62, sw / 7.6);
    o.font = '900 ' + size + 'px Poppins, sans-serif';
    var tw = o.measureText(NAME).width;
    if (tw > sw * 0.96) { size *= (sw * 0.96) / tw; o.font = '900 ' + size + 'px Poppins, sans-serif'; }
    o.fillStyle = '#fff'; o.textAlign = 'center'; o.textBaseline = 'middle';
    o.fillText(NAME, sw / 2, sh / 2);

    var data = o.getImageData(0, 0, sw, sh).data;
    var gap = Math.max(3, Math.round(size / 26));
    var old = parts, next = [];
    for (var y = 0; y < sh; y += gap) {
      for (var x = 0; x < sw; x += gap) {
        if (data[(y * sw + x) * 4 + 3] > 128) {
          var prev = old[next.length];
          next.push({
            hx: cx - sw / 2 + x, hy: cy - sh / 2 + y,
            x: prev ? prev.x : Math.random() * W,
            y: prev ? prev.y : Math.random() * H,
            vx: 0, vy: 0,
            r: gap * 0.42 + Math.random() * gap * 0.15,
            c: Math.random() < 0.18 ? '#E0FBFF' : (Math.random() < 0.5 ? '#22D3EE' : '#67E8F9')
          });
        }
      }
    }
    if (reduce) next.forEach(function (p) { p.x = p.hx; p.y = p.hy; });
    parts = next;
  }

  function frame() {
    if (!ctx || !visible) return;
    ctx.clearRect(0, 0, W, H);
    var R = 90, m = mouse;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!reduce) {
        p.vx += (p.hx - p.x) * 0.045; p.vy += (p.hy - p.y) * 0.045;
        if (m) {
          var dx = p.x - m.x, dy = p.y - m.y, d2 = dx * dx + dy * dy;
          if (d2 < R * R) { var d = Math.sqrt(d2) || 1, f = (1 - d / R) * 6; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        }
        p.vx *= 0.84; p.vy *= 0.84; p.x += p.vx; p.y += p.vy;
      }
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }

    // glowing cursor
    cctx.clearRect(0, 0, W, H);
    if (!m) { trail = []; return; }
    if (!ring) ring = { x: m.x, y: m.y };
    ring.x += (m.x - ring.x) * 0.18; ring.y += (m.y - ring.y) * 0.18;
    if (!reduce) { trail.push({ x: m.x, y: m.y, life: 1 }); if (trail.length > 22) trail.shift(); }
    for (var j = 0; j < trail.length; j++) {
      var t = trail[j]; t.life -= 0.045;
      if (t.life <= 0) continue;
      cctx.fillStyle = 'rgba(103,232,249,' + (t.life * 0.5).toFixed(3) + ')';
      cctx.beginPath(); cctx.arc(t.x, t.y, 1 + t.life * 3, 0, Math.PI * 2); cctx.fill();
    }
    cctx.strokeStyle = magnet ? 'rgba(224,251,255,0.9)' : 'rgba(34,211,238,0.75)';
    cctx.lineWidth = 1.5;
    cctx.beginPath(); cctx.arc(ring.x, ring.y, magnet ? 34 : 20, 0, Math.PI * 2); cctx.stroke();
    cctx.shadowColor = '#22D3EE'; cctx.shadowBlur = 18;
    cctx.fillStyle = '#E0FBFF';
    cctx.beginPath(); cctx.arc(m.x, m.y, 4, 0, Math.PI * 2); cctx.fill();
    cctx.shadowBlur = 0;
  }

  function loop() { frame(); requestAnimationFrame(loop); }

  hero.addEventListener('mousemove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  hero.addEventListener('mouseleave', function () { mouse = null; ring = null; });

  // pause the animation when the hero is scrolled out of view
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(hero);
  }

  var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  ready.then(function () {
    build();
    if ('ResizeObserver' in window) new ResizeObserver(build).observe(canvas);
    else window.addEventListener('resize', build);
    loop();
  });

  /* ---------- magnetic buttons ---------- */
  hero.querySelectorAll('.bh-magzone').forEach(function (zone) {
    var btn = zone.querySelector('.bh-btn');
    zone.addEventListener('mousemove', function (e) {
      if (reduce) return;
      var r = zone.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * 0.35;
      var dy = (e.clientY - (r.top + r.height / 2)) * 0.45;
      magnet = true;
      btn.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
    });
    zone.addEventListener('mouseleave', function () {
      magnet = false;
      btn.style.transform = '';
    });
  });
})();
