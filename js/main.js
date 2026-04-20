/* ═══════════════════════════════════════
   JS — Firmansyach & Dyta Wedding
   ═══════════════════════════════════════ */

// ── Cover Logic & Music ──
const cover   = document.getElementById('cover');
const content = document.getElementById('mainContent');
const btnOpen = document.getElementById('btnOpen');
const btnMusic = document.getElementById('btnMusic');
const bgMusic = document.getElementById('bgMusic');

let isMusicPlaying = false;

btnOpen.addEventListener('click', () => {
    cover.classList.add('open');
    
    // Default system play trigger
    bgMusic.play().then(() => {
        isMusicPlaying = true;
        btnMusic.classList.add('spinning');
    }).catch(e => console.log('Autoplay prevented by browser'));

    setTimeout(() => content.classList.remove('hidden'), 300);
    setTimeout(() => {
        cover.classList.add('gone');
        document.body.style.overflow = 'auto';
        startAnimations();
    }, 900);
});

// Play/Pause Music Toggle
btnMusic.addEventListener('click', () => {
    if (isMusicPlaying) {
        bgMusic.pause();
        btnMusic.classList.remove('spinning');
        btnMusic.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    } else {
        bgMusic.play();
        btnMusic.classList.add('spinning');
        btnMusic.innerHTML = '<i class="fa-solid fa-music"></i>';
    }
    isMusicPlaying = !isMusicPlaying;
});

document.body.style.overflow = 'hidden';

// ── Countdown ──
const wedding = new Date('May 17, 2026 09:00:00').getTime();

function tick() {
    const d = wedding - Date.now();
    if (d < 0) { return; }
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('cdD').textContent = pad(Math.floor(d / 864e5));
    document.getElementById('cdH').textContent = pad(Math.floor((d % 864e5) / 36e5));
    document.getElementById('cdM').textContent = pad(Math.floor((d % 36e5) / 6e4));
    document.getElementById('cdS').textContent = pad(Math.floor((d % 6e4) / 1e3));
}
tick();
setInterval(tick, 1000);

// ── Scroll Animations (IntersectionObserver) ──
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) { 
            e.target.classList.add('show'); 
        } else {
            e.target.classList.remove('show');
        }
    });
}, { threshold: 0.15, rootMargin: "0px 0px -100px 0px" });

let isObserving = false;
function startAnimations() {
    if (isObserving) return;
    document.querySelectorAll('.anim').forEach(el => observer.observe(el));
    isObserving = true;
}

// ── Copy to clipboard ──
function salin(txt, btn) {
    navigator.clipboard.writeText(txt).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
        btn.classList.add('ok');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('ok'); }, 2000);
    }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
        btn.classList.add('ok');
        setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('ok'); }, 2000);
    });
}

// ── Form submissions ──
document.getElementById('rsvpForm').addEventListener('submit', e => {
    e.preventDefault();
    alert('Konfirmasi kehadiran Anda telah diterima. Terima kasih!');
    e.target.reset();
});

document.getElementById('wishForm').addEventListener('submit', e => {
    e.preventDefault();
    alert('Ucapan Anda telah terkirim. Terima kasih atas doa & harapannya! 💕');
    e.target.reset();
});

// ── Gallery Carousel: Drag to Scroll & Center Highlight ──
const carousel = document.querySelector('.carousel-wrapper');
if(carousel) {
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.style.scrollSnapType = 'none'; // release snap to prevent fighting drag
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });
    
    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.style.scrollSnapType = 'x mandatory'; // re-enable snap
    });
    
    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.style.scrollSnapType = 'x mandatory';
    });
    
    carousel.addEventListener('mousemove', (e) => {
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // scroll speed multiplier
        carousel.scrollLeft = scrollLeft - walk;
    });

    // Intersection Observer for Center Scale Effect
    const carouselImgs = carousel.querySelectorAll('img');
    const carouselObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Focus image when it passes the middle section
            if (entry.isIntersecting) {
                entry.target.classList.add('focus');
            } else {
                entry.target.classList.remove('focus');
            }
        });
    }, {
        root: carousel,
        rootMargin: "0px -40% 0px -40%", // Watch the center 20% vertical column
        threshold: 0
    });

    carouselImgs.forEach(img => carouselObserver.observe(img));
}
