import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        const cols = 140;
        const rows = 120;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            const marginX = canvas.width * 0.45;
            const marginY = canvas.height * 0.45;
            const totalW = canvas.width + marginX * 2;
            const totalH = canvas.height + marginY * 2;
            const spacingX = totalW / (cols - 1);
            const spacingY = totalH / (rows - 1);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    particles.push({
                        baseX: col * spacingX - marginX,
                        baseY: row * spacingY - marginY,
                        x: 0,
                        y: 0,
                        lastZ: 0
                    });
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.009; // Slightly slower for better perception of the fold

            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;
            const fadeRx = w * 0.70;
            const fadeRy = h * 0.22;
            const perspective = 700;

            ctx.fillStyle = '#ffffff';

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const col = i % cols;
                const row = Math.floor(i / cols);

                const nx = col / cols;
                const ny = row / rows;

                // 3D FOLD DYNAMICS
                // Use higher amplitude and frequency to force "intersection" folds
                // This makes the cloth "scrunch" together in some areas

                // Deep Primary Folds (Z-focus)
                const foldZ1 = Math.sin(nx * 4.0 + time * 1.8 + ny * 2.0) * 110;
                const foldZ2 = Math.cos(ny * 6.0 - time * 1.2 + nx * 3.5) * 60;
                const totalZ = foldZ1 + foldZ2;

                // Displacement that causes particles to "scrunch" and overlap (intersect)
                // When nx/ny are in certain phases, dX and dY will be large enough
                // to push particles from one column past particles of another column.
                const dX = (Math.sin(ny * 8.0 + time * 2.5 + nx * 5.0) * 45) +
                    (Math.cos(nx * 3.0 + time * 1.5) * 25);

                const dY = (Math.cos(nx * 7.0 + time * 2.0 + ny * 4.0) * 35) +
                    (Math.sin(ny * 4.0 - time * 1.8) * 20);

                // Wind wave sweep
                const wind = Math.sin(nx * 5.0 + ny * 2.0 - time * 2.0) * 30;

                // Final Projection with perspective
                const scale = perspective / (perspective + totalZ);

                // Map the 3D position into 2D screen space
                p.x = cx + ((p.baseX + dX + wind) - cx) * scale;
                p.y = cy + ((p.baseY + dY) - cy) * scale;

                if (p.x < -15 || p.x > w + 15 || p.y < -15 || p.y > h + 15) continue;

                // Particle size based on fold intensity (compressed areas = bigger/denser)
                const distScale = Math.max(0.3, scale);
                const foldIntensity = (Math.abs(foldZ1) + Math.abs(foldZ2)) / 170;
                const size = 0.6 * distScale + (foldIntensity * 1.0);

                // Center oval fade
                const dx_fade = (p.x - cx) / fadeRx;
                const dy_fade = (p.y - cy) / fadeRy;
                const ovalDist = Math.sqrt(dx_fade * dx_fade + dy_fade * dy_fade);
                let fade = 1;
                if (ovalDist < 1) {
                    fade = ovalDist * ovalDist;
                }

                if (fade < 0.03) continue;

                // Use alpha to accentuate the overlapping / fold area
                // Higher Z (front) is more opaque
                const alpha = Math.max(0.15, Math.min(0.8, scale * fade));
                ctx.globalAlpha = alpha;

                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
        />
    );
};

export default ParticleBackground;
