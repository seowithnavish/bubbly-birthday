// ============================================================
// Birthday Cake section — cut-the-cake interaction
// Mirrors the animation conventions used in cause.js (GSAP,
// floating ambient elements, elastic popups, fade-page-transition
// navigation) so the page feels native to the rest of the site.
// ============================================================

const cakeWrapper = document.getElementById('cakeWrapper');
const knife = document.getElementById('knife');
const cakeLeft = document.getElementById('cakeLeft');
const cakeRight = document.getElementById('cakeRight');
const candleFlame = document.getElementById('candleFlame');
const cutInstruction = document.getElementById('cutInstruction');
const confettiLayer = document.getElementById('confettiLayer');
const balloonsLayer = document.getElementById('balloons');
const popupOverlay = document.getElementById('popupOverlay');
const popupCard = document.getElementById('popupCard');
const continueBtn = document.getElementById('continueBtn');

let isCut = false;

// ---------- Custom cursor (same pattern as cause.js) ----------
const cursor = document.querySelector('.custom-cursor');
document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX - 15,
        y: e.clientY - 15,
        duration: 0.2
    });
});

// ---------- Ambient floating hearts (same visual language as cause.js) ----------
function createFloatingHeart() {
    const elements = ['🌸', '✨', '💖', '🦋', '⭐'];
    const el = document.createElement('div');
    el.className = 'floating cake-heart';
    el.textContent = elements[Math.floor(Math.random() * elements.length)];
    el.style.left = Math.random() * window.innerWidth + 'px';
    el.style.top = window.innerHeight + 20 + 'px';
    el.style.fontSize = (Math.random() * 20 + 10) + 'px';
    document.body.appendChild(el);

    gsap.to(el, {
        y: -window.innerHeight - 100,
        duration: Math.random() * 6 + 8,
        opacity: 0,
        onComplete: () => el.remove()
    });
}
setInterval(createFloatingHeart, 2200);

// ---------- Balloons rising in the background of the cake scene ----------
function spawnBalloon(delay = 0) {
    const emojis = ['🎈', '🎈', '🎈'];
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    balloon.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    balloon.style.left = Math.random() * 90 + '%';
    balloonsLayer.appendChild(balloon);

    gsap.to(balloon, {
        opacity: 1,
        y: -420 - Math.random() * 120,
        x: (Math.random() - 0.5) * 60,
        rotation: (Math.random() - 0.5) * 20,
        duration: 4 + Math.random() * 2,
        delay,
        ease: 'power1.out',
        onComplete: () => balloon.remove()
    });
}

// ---------- Confetti burst ----------
function spawnConfettiBurst(count = 60) {
    const colors = ['#ff69b4', '#ff99cc', '#c9a9ff', '#ffd166', '#8ae6c2'];
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        confettiLayer.appendChild(piece);

        gsap.to(piece, {
            y: window.innerHeight + 60,
            x: (Math.random() - 0.5) * 200,
            rotation: Math.random() * 720,
            duration: Math.random() * 2 + 2.5,
            delay: Math.random() * 0.4,
            ease: 'power1.in',
            onComplete: () => piece.remove()
        });
    }
}

// ---------- Cake cutting interaction (pointer-based swipe) ----------
let dragging = false;
let startX = 0;
let traveled = 0;
let wrapperRect = null;

function knifeBounds() {
    wrapperRect = cakeWrapper.getBoundingClientRect();
    return wrapperRect;
}

function moveKnifeTo(clientX) {
    const rect = wrapperRect || knifeBounds();
    const relativeX = Math.min(Math.max(clientX - rect.left, 20), rect.width - 40);
    gsap.set(knife, { x: relativeX - 20 });
}

function onPointerDown(e) {
    if (isCut) return;
    dragging = true;
    traveled = 0;
    startX = e.clientX;
    knifeBounds();
    moveKnifeTo(e.clientX);
    knife.setPointerCapture && e.pointerId != null && knife.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
    if (!dragging || isCut) return;
    const dx = e.clientX - startX;
    traveled += Math.abs(dx);
    startX = e.clientX;
    moveKnifeTo(e.clientX);

    // Swipe far enough across the cake to trigger the cut
    if (traveled > (wrapperRect ? wrapperRect.width * 0.65 : 220)) {
        triggerCut();
    }
}

function onPointerUp() {
    dragging = false;
}

knife.addEventListener('pointerdown', onPointerDown);
cakeWrapper.addEventListener('pointerdown', onPointerDown);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
window.addEventListener('pointercancel', onPointerUp);

function triggerCut() {
    if (isCut) return;
    isCut = true;
    dragging = false;

    cutInstruction.classList.add('hidden');

    // Split the cake
    gsap.to(cakeLeft, {
        x: -45,
        y: 15,
        rotation: -10,
        duration: 0.8,
        ease: 'power2.out'
    });
    gsap.to(cakeRight, {
        x: 45,
        y: 15,
        rotation: 10,
        duration: 0.8,
        ease: 'power2.out'
    });

    // Candle is blown out along with the wish
    gsap.to(candleFlame, {
        opacity: 0,
        scale: 0.3,
        duration: 0.4
    });

    // Knife drops away
    gsap.to(knife, {
        rotation: 40,
        y: '+=40',
        opacity: 0,
        duration: 0.5
    });

    // Celebration!
    spawnConfettiBurst(70);
    for (let i = 0; i < 6; i++) {
        spawnBalloon(i * 0.15);
    }

    setTimeout(showPopup, 900);
}

// ---------- Popup ----------
function showPopup() {
    popupOverlay.classList.add('active');
    gsap.to(popupOverlay, {
        opacity: 1,
        duration: 0.5
    });
    gsap.to(popupCard, {
        scale: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.6)'
    });
}

continueBtn.addEventListener('click', () => {
    gsap.to('body', {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            window.location.href = 'cause.html';
        }
    });
});

// Keep the knife positioned correctly if the viewport is resized
window.addEventListener('resize', () => {
    if (!isCut) knifeBounds();
});

// Set the knife's initial resting spot, just above the top-left of the cake
window.addEventListener('load', () => {
    knifeBounds();
    gsap.set(knife, { x: 20, rotation: -15 });
});
