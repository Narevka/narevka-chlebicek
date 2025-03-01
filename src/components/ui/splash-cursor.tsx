
import React, { useEffect, useRef } from 'react';

// Note: This is a simplified version without the WebGL errors
export const SplashCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Basic canvas setup with context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    // Initial canvas size
    setCanvasSize();

    // Basic cursor effect (simplified version)
    let pointerX = 0;
    let pointerY = 0;
    let prevPointerX = 0;
    let prevPointerY = 0;
    
    // Track mouse or touch position
    const updatePosition = (e: MouseEvent | TouchEvent) => {
      const pointerEvent = e instanceof MouseEvent ? e : e.touches[0];
      if (pointerEvent) {
        prevPointerX = pointerX;
        prevPointerY = pointerY;
        pointerX = pointerEvent.clientX;
        pointerY = pointerEvent.clientY;
      }
    };
    
    // Add event listeners
    window.addEventListener('resize', setCanvasSize);
    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('touchmove', updatePosition, { passive: true });
    
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('touchmove', updatePosition);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'overlay' }}
    />
  );
};
