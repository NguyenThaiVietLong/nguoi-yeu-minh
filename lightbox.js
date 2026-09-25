/* ---------------- lightbox: bấm vào ảnh/video để xem to ----------------
   Dùng: Lightbox.open(items, index)
   items: [{ url: 'images/a.jpg', caption: '' }, { url: 'images/b.mp4' }, ...]
   Điều khiển: ←/→ hoặc vuốt để chuyển, Esc / bấm nền / nút × để đóng. */
(function () {
  var css =
    '.lb{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;' +
      'background:rgba(6,7,12,.94);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);' +
      'opacity:0;transition:opacity .2s;touch-action:pan-y}' +
    '.lb.open{display:flex}.lb.show{opacity:1}' +
    '.lb-stage{max-width:94vw;max-height:84vh;display:flex;align-items:center;justify-content:center}' +
    '.lb-stage img,.lb-stage video{max-width:94vw;max-height:84vh;border-radius:10px;display:block;' +
      'box-shadow:0 10px 50px rgba(0,0,0,.6);background:#000}' +
    '.lb-btn{position:absolute;border:0;background:rgba(255,255,255,.08);color:#fff;cursor:pointer;' +
      'width:46px;height:46px;border-radius:50%;font-size:26px;line-height:46px;text-align:center;padding:0;' +
      'font-family:system-ui,sans-serif;transition:background .2s}' +
    '.lb-btn:hover{background:rgba(255,255,255,.2)}' +
    '.lb-close{top:max(14px,env(safe-area-inset-top));right:14px}' +
    '.lb-prev{left:12px;top:50%;transform:translateY(-50%)}' +
    '.lb-next{right:12px;top:50%;transform:translateY(-50%)}' +
    '.lb-bar{position:absolute;left:0;right:0;bottom:max(14px,env(safe-area-inset-bottom));text-align:center;' +
      'color:#eceef8;padding:0 16px;font-family:"Cormorant Garamond",serif;font-size:16px}' +
    '.lb-count{display:block;font-family:"Space Mono",monospace;font-size:11px;letter-spacing:.12em;color:#9aa0c0}' +
    '.lb.single .lb-prev,.lb.single .lb-next,.lb.single .lb-count{display:none}' +
    '@media (max-width:600px){.lb-prev,.lb-next{display:none}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var root, stage, capEl, countEl;
  var items = [], index = 0, lastFocus = null;

  function isVideo(url) { return /\.(mp4|webm|mov)$/i.test(url || ''); }

  function build() {
    root = document.createElement('div');
    root.className = 'lb';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.innerHTML =
      '<div class="lb-stage"></div>' +
      '<button class="lb-btn lb-close" aria-label="Đóng">&times;</button>' +
      '<button class="lb-btn lb-prev" aria-label="Trước">&#8249;</button>' +
      '<button class="lb-btn lb-next" aria-label="Sau">&#8250;</button>' +
      '<div class="lb-bar"><span class="lb-cap"></span><span class="lb-count"></span></div>';
    document.body.appendChild(root);
    stage = root.querySelector('.lb-stage');
    capEl = root.querySelector('.lb-cap');
    countEl = root.querySelector('.lb-count');

    root.querySelector('.lb-close').addEventListener('click', close);
    root.querySelector('.lb-prev').addEventListener('click', function () { go(-1); });
    root.querySelector('.lb-next').addEventListener('click', function () { go(1); });
    root.addEventListener('click', function (e) {
      if (e.target === root || e.target === stage) close();
    });

    // vuốt trái/phải trên điện thoại
    var x0 = null, y0 = null;
    root.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      if (!root.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });
  }

  function render() {
    var it = items[index];
    stage.innerHTML = '';
    var el;
    if (isVideo(it.url)) {
      el = document.createElement('video');
      el.src = it.url;
      el.controls = true;
      el.autoplay = true;
      el.playsInline = true;
      el.setAttribute('playsinline', '');
    } else {
      el = document.createElement('img');
      el.src = it.url;
      el.alt = it.caption || '';
    }
    stage.appendChild(el);
    capEl.textContent = it.caption || '';
    countEl.textContent = (index + 1) + ' / ' + items.length;

    // tải trước ảnh kế tiếp cho mượt
    var nx = items[(index + 1) % items.length];
    if (nx && !isVideo(nx.url)) { var pre = new Image(); pre.src = nx.url; }
  }

  function go(step) {
    if (items.length < 2) return;
    index = (index + step + items.length) % items.length;
    render();
  }

  function open(list, start) {
    if (!list || !list.length) return;
    if (!root) build();
    items = list;
    index = Math.max(0, Math.min(start || 0, list.length - 1));
    lastFocus = document.activeElement;
    root.classList.toggle('single', list.length < 2);
    render();
    root.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { root.classList.add('show'); });
    root.querySelector('.lb-close').focus();
  }

  function close() {
    root.classList.remove('show', 'open');
    stage.innerHTML = '';   // bỏ video để dừng phát
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  window.Lightbox = { open: open, close: close };
})();
