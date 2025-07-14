import React, { useEffect, useRef } from 'react';

interface StarBackgroundProps {
  darkMode: boolean;
}

const StarBackground: React.FC<StarBackgroundProps> = ({ darkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Star system
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
      speed: number;
      twinkle: number;
    }> = [];

    // Create stars
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.5 + 0.1,
        twinkle: Math.random() * 0.02 + 0.01,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (darkMode) {
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
      } else {
        gradient.addColorStop(0, '#f0f9ff');
        gradient.addColorStop(0.5, '#e0f2fe');
        gradient.addColorStop(1, '#bae6fd');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star, index) => {
        // Twinkle effect
        star.alpha += star.twinkle;
        if (star.alpha > 1 || star.alpha < 0.1) {
          star.twinkle *= -1;
        }

        // Slow movement
        star.x += star.speed * 0.1;
        star.y += star.speed * 0.05;

        // Wrap around screen
        if (star.x > canvas.width) star.x = 0;
        if (star.y > canvas.height) star.y = 0;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = darkMode 
          ? `rgba(255, 255, 255, ${star.alpha})`
          : `rgba(59, 130, 246, ${star.alpha * 0.6})`;
        ctx.fill();

        // Add glow effect for larger stars
        if (star.radius > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = darkMode
            ? `rgba(255, 255, 255, ${star.alpha * 0.1})`
            : `rgba(59, 130, 246, ${star.alpha * 0.1})`;
          ctx.fill();
        }
      });

      // Add floating particles
      const time = Date.now() * 0.001;
      for (let i = 0; i < 20; i++) {
        const x = (Math.sin(time + i) * 200 + canvas.width / 2) + Math.sin(time * 0.5 + i * 0.5) * 100;
        const y = (Math.cos(time + i) * 100 + canvas.height / 2) + Math.cos(time * 0.3 + i * 0.7) * 50;
        const alpha = Math.sin(time + i) * 0.3 + 0.1;
        
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fillStyle = darkMode
          ? `rgba(147, 51, 234, ${alpha})`
          : `rgba(147, 51, 234, ${alpha * 0.7})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};

export default StarBackground;