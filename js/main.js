/* ═══════════════════════════════════════
   JS — Firmansyach & Dyta Wedding
   ═══════════════════════════════════════ */

// ── Cover Logic & Music ──
const cover   = document.getElementById('cover');
const content = document.getElementById('mainContent');
const btnOpen = document.getElementById('btnOpen');
const btnMusic = document.getElementById('btnMusic');
const bgMusic = document.getElementById('bgMusic');

// ── Dynamic Guest Name from URL ──
const namaTamuCover = document.getElementById('nama-tamu-cover');
const pathSegment = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop() || '');
if (pathSegment) {
    // Replace dashes/underscores with spaces for nicer display
    const namaFormatted = pathSegment.replace(/[-_]/g, ' ');
    namaTamuCover.textContent = namaFormatted;
} else {
    namaTamuCover.textContent = 'Tamu Undangan';
}

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

// ── Comment/Wish System (Google Apps Script Backend) ──
// GANTI URL DI BAWAH INI DENGAN URL WEB APP GOOGLE APPS SCRIPT KAMU
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHUHAeVRCXTNKuJikdbAJH6odLDSc7RT51KyPQ1EloaJYcuT9ZS3GsO69bRfpmjOE0/exec';

const wishList = document.getElementById('wishList');
const wishLoading = document.getElementById('wishLoading');
const wishForm = document.getElementById('wishForm');
const wishSubmitBtn = document.getElementById('wishSubmitBtn');

// Fetch and display all wishes
function loadWishes() {
    fetch(SCRIPT_URL)
        .then(res => res.json())
        .then(data => {
            wishLoading.style.display = 'none';
            if (!data || data.length === 0) {
                wishList.innerHTML = '<p class="wish-empty">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
                return;
            }
            wishList.innerHTML = '';
            
            const myName = localStorage.getItem('weddingWishName') || '';

            // Remove reverse() so newest is at the bottom
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'wish-item';
                
                // If it's our own message, make it appear on the right
                if (myName && item.nama === myName) {
                    div.classList.add('wish-item--self');
                }

                div.innerHTML = `
                    <div class="wish-item__name">${escapeHTML(item.nama)}</div>
                    <p class="wish-item__msg">${escapeHTML(item.ucapan)}</p>
                    <span class="wish-item__time">${formatTanggal(item.waktu)}</span>
                `;
                wishList.appendChild(div);
            });

            // Scroll to bottom automatically so the newest message is visible
            wishList.scrollTop = wishList.scrollHeight;
        })
        .catch(() => {
            wishLoading.innerHTML = '<span class="wish-empty">Gagal memuat ucapan.</span>';
        });
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Format Tanggal (e.g. "20 April 2026")
function formatTanggal(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date)) return isoString;
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Submit wish
wishForm.addEventListener('submit', e => {
    e.preventDefault();
    const nama = document.getElementById('wishName').value.trim();
    const ucapan = document.getElementById('wishMessage').value.trim();
    if (!nama || !ucapan) return;

    // Save name to localStorage so we know which messages are ours
    localStorage.setItem('weddingWishName', nama);

    wishSubmitBtn.disabled = true;
    wishSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';

    fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, ucapan })
    }).then(() => {
        wishForm.reset();
        // Restore name from localStorage to the field so they don't have to retype it next time
        document.getElementById('wishName').value = localStorage.getItem('weddingWishName') || '';
        
        wishSubmitBtn.disabled = false;
        wishSubmitBtn.innerHTML = '<i class="fa-regular fa-comment-dots"></i> Kirim Ucapan';
        // Reload wishes after short delay (give script time to save)
        setTimeout(loadWishes, 1500);
        alert('Ucapan Anda telah terkirim. Terima kasih atas doa & harapannya! 💕');
    }).catch(() => {
        wishSubmitBtn.disabled = false;
        wishSubmitBtn.innerHTML = '<i class="fa-regular fa-comment-dots"></i> Kirim Ucapan';
        alert('Gagal mengirim ucapan. Silakan coba lagi.');
    });
});

// Load wishes on page load
if (SCRIPT_URL !== 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    loadWishes();
    // Pre-fill name if exists
    const savedName = localStorage.getItem('weddingWishName');
    if (savedName) {
        document.getElementById('wishName').value = savedName;
    }
} else {
    wishLoading.innerHTML = '<span class="wish-empty">Sistem ucapan belum dikonfigurasi.</span>';
}

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
