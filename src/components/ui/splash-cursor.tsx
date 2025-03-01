
"use client";

import React, { useEffect } from 'react';

// Define custom interfaces for the missing types
interface Material {
  vertexShader: string;
  fragmentShaderSource: string;
  programs: Program[];
  activeProgram: Program;
  uniforms: Record<string, any>;
}

interface Program {
  uniforms: Record<string, any>;
  program: WebGLProgram;
}

export const SplashCursor = () => {
  useEffect(() => {
    // Initialize the splash cursor effect
    initSplashCursor();

    // Clean up when component unmounts
    return () => {
      const canvas = document.querySelector('.splashCursor');
      if (canvas) {
        document.body.removeChild(canvas);
      }
    };
  }, []);

  return null; // The component doesn't render anything directly
};

const initSplashCursor = () => {
  // Create a canvas element for the splash cursor
  const canvas = document.createElement('canvas');
  canvas.className = 'splashCursor';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  // Initialize the splash cursor logic
  const mouseFollower = new MouseFollower(canvas);
  mouseFollower.init();
};

class MouseFollower {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  width: number;
  height: number;
  mouse: { x: number; y: number; isDown: boolean };
  lastMouse: { x: number; y: number };
  particles: any[];
  particleCount: number;
  gravity: number;
  mouseRadius: number;
  colors: string[];
  isRunning: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.mouse = { x: -1000, y: -1000, isDown: false };
    this.lastMouse = { x: -1000, y: -1000 };
    this.particles = [];
    this.particleCount = 30;
    this.gravity = 0.5;
    this.mouseRadius = 60;
    this.colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF'];
    this.isRunning = false;

    // Resize handler
    window.addEventListener('resize', () => this.resize());
  }

  init() {
    // Set up mouse event listeners
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mousedown', () => this.handleMouseDown());
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    
    // For touch devices
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.canvas.addEventListener('touchstart', () => this.handleMouseDown());
    this.canvas.addEventListener('touchend', () => this.handleMouseUp());

    // Start animation loop
    this.isRunning = true;
    this.animate();
  }

  handleMouseMove(e: MouseEvent) {
    this.lastMouse.x = this.mouse.x;
    this.lastMouse.y = this.mouse.y;
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;

    // Create particles when moving
    if (this.mouse.isDown) {
      this.createParticles();
    }
  }

  handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (e.touches.length > 0) {
      this.lastMouse.x = this.mouse.x;
      this.lastMouse.y = this.mouse.y;
      this.mouse.x = e.touches[0].clientX;
      this.mouse.y = e.touches[0].clientY;

      if (this.mouse.isDown) {
        this.createParticles();
      }
    }
  }

  handleMouseDown() {
    this.mouse.isDown = true;
    this.createParticles();
  }

  handleMouseUp() {
    this.mouse.isDown = false;
  }

  handleMouseLeave() {
    this.mouse.isDown = false;
    this.mouse.x = -1000;
    this.mouse.y = -1000;
  }

  createParticles() {
    // Create particles at mouse position
    for (let i = 0; i < this.particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      const size = Math.random() * 10 + 5;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      
      this.particles.push({
        x: this.mouse.x,
        y: this.mouse.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        color: color,
        alpha: 1,
        alphaDecrease: Math.random() * 0.05 + 0.01
      });
    }
  }

  animate() {
    if (!this.isRunning) return;
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Update and render particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Apply gravity
      p.vy += this.gravity;
      
      // Fade out
      p.alpha -= p.alphaDecrease;
      
      // Render particle
      if (p.alpha > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }
    
    // Remove dead particles
    this.particles = this.particles.filter(p => p.alpha > 0);
    
    // Draw mouse cursor dot
    if (this.mouse.x > 0 && this.mouse.y > 0) {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Continue animation loop
    requestAnimationFrame(() => this.animate());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
}
