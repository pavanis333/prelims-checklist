export function generateId(...parts) {
    return parts.join('|').replace(/\s+/g, '_');
}

export function fireConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Show overlay
    canvas.style.display = 'block';

    const particles = [];
    const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ffffff'];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 2,
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1
        });
    }

    let animationId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;

        particles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);

            if (p.y < canvas.height) active = true;
        });

        if (active) {
            animationId = requestAnimationFrame(animate);
        } else {
            canvas.style.display = 'none';
            cancelAnimationFrame(animationId);
        }
    }

    animate();
    setTimeout(() => {
        canvas.style.display = 'none';
        cancelAnimationFrame(animationId);
    }, 4000);
}
