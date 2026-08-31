/**
 * dragons.js — Colossal Dragon Shadows
 * Fast-moving, blurred silhouettes passing overhead
 */

export function initDragons() {
    const container = document.getElementById('dragonsContainer');
    if (!container) return;

    // Use simple blurred divs with box-shadows to simulate massive shadows
    // This looks much more realistic and terrifying than a vector drawing
    const shadow1 = createDragonShadow('shadow-1', 1);
    const shadow2 = createDragonShadow('shadow-2', 2);

    container.appendChild(shadow1);
    container.appendChild(shadow2);

    // Schedule flyovers
    scheduleFlyover(shadow1, {
        startDelay: 12,
        intervalMin: 20,
        intervalMax: 40,
        direction: 'left-to-right',
        yRange: [10, 60],
        duration: 2.5, // VERY fast, terrifying speed
        scale: 1,
    });

    scheduleFlyover(shadow2, {
        startDelay: 25,
        intervalMin: 35,
        intervalMax: 60,
        direction: 'right-to-left',
        yRange: [20, 80],
        duration: 3.5,
        scale: 0.7,
    });
}

function createDragonShadow(className, id) {
    const shadow = document.createElement('div');
    shadow.className = `dragon-shadow ${className}`;
    shadow.id = `dragon-shadow-${id}`;
    
    // Create the shadow shape (massive, blurred oval with winged hints)
    shadow.style.cssText = `
        position: absolute;
        width: 800px;
        height: 300px;
        background: radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 70%);
        border-radius: 50%;
        filter: blur(20px);
        opacity: 0;
        pointer-events: none;
    `;
    return shadow;
}

function scheduleFlyover(shadowEl, config) {
    const { startDelay, intervalMin, intervalMax } = config;

    setTimeout(() => {
        fly(shadowEl, config);

        function scheduleNext() {
            const nextDelay = (Math.random() * (intervalMax - intervalMin) + intervalMin) * 1000;
            setTimeout(() => {
                fly(shadowEl, config);
                scheduleNext();
            }, nextDelay);
        }
        scheduleNext();
    }, startDelay * 1000);
}

function fly(shadowEl, config) {
    const { direction, yRange, duration, scale } = config;
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    const yPos = (Math.random() * (yRange[1] - yRange[0]) + yRange[0]) / 100 * viewH;

    const isLeftToRight = direction === 'left-to-right';
    const startX = isLeftToRight ? -1000 : viewW + 1000;
    const endX = isLeftToRight ? viewW + 1000 : -1000;

    gsap.set(shadowEl, {
        x: startX,
        y: yPos,
        scaleX: scale * (isLeftToRight ? 1 : -1),
        scaleY: scale,
        opacity: 0,
    });

    const tl = gsap.timeline();

    // Sudden appearance (overhead pass)
    tl.to(shadowEl, {
        opacity: 0.8,
        duration: 0.3,
        ease: 'power2.inOut',
    }, 0);

    // Fast movement across screen
    tl.to(shadowEl, {
        x: endX,
        duration: duration,
        ease: 'power1.inOut',
    }, 0);

    // Subtle up/down dip
    tl.to(shadowEl, {
        y: yPos + (Math.random() > 0.5 ? 100 : -100),
        duration: duration,
        ease: 'sine.inOut',
    }, 0);

    // Fade out as it leaves
    tl.to(shadowEl, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
    }, duration - 0.5);
}
