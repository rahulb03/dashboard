# Complete Guide: Responsive Animations for Modern Websites

> Master responsive design for animation-heavy websites with performance optimization, adaptive techniques, and production-ready patterns.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [CSS Animation Techniques](#css-animation-techniques)
3. [JavaScript/GSAP Responsive Patterns](#javascriptgsap-responsive-patterns)
4. [Framer Motion Responsive Patterns](#framer-motion-responsive-patterns)
5. [Viewport-Based Animations](#viewport-based-animations)
6. [Performance Optimization](#performance-optimization)
7. [Mobile-First Animation Strategy](#mobile-first-animation-strategy)
8. [Advanced Techniques](#advanced-techniques)
9. [Common Patterns & Solutions](#common-patterns--solutions)
10. [Production Examples](#production-examples)

---

## Core Concepts

### The Golden Rules

```javascript
// 1. Mobile First - Always start with mobile
// 2. Scale, Don't Remake - Use transforms for responsive animations
// 3. Performance First - Reduce animations on low-end devices
// 4. Progressive Enhancement - Enhance for larger screens
// 5. User Preferences - Respect prefers-reduced-motion
```

### Responsive Breakpoints Strategy

```css
/* Mobile-first breakpoints */
:root {
  /* Base (Mobile) - 320px to 767px */
  --animation-duration: 0.3s;
  --animation-scale: 1;
  --particle-count: 10;
  
  /* Tablet - 768px to 1023px */
  @media (min-width: 768px) {
    --animation-duration: 0.5s;
    --animation-scale: 1.2;
    --particle-count: 20;
  }
  
  /* Desktop - 1024px to 1439px */
  @media (min-width: 1024px) {
    --animation-duration: 0.7s;
    --animation-scale: 1.5;
    --particle-count: 30;
  }
  
  /* Large Desktop - 1440px+ */
  @media (min-width: 1440px) {
    --animation-duration: 1s;
    --animation-scale: 2;
    --particle-count: 50;
  }
}
```

---

## CSS Animation Techniques

### 1. Using CSS Variables for Responsive Animations

```css
/* ✅ BEST PRACTICE - Scale with viewport */
.hero-animation {
  /* Base mobile styles */
  --scale-factor: 1;
  --translate-x: 50px;
  --duration: 0.3s;
  
  animation: slideIn var(--duration) ease-out;
  transform: translateX(var(--translate-x)) scale(var(--scale-factor));
}

/* Tablet adjustments */
@media (min-width: 768px) {
  .hero-animation {
    --scale-factor: 1.2;
    --translate-x: 100px;
    --duration: 0.5s;
  }
}

/* Desktop adjustments */
@media (min-width: 1024px) {
  .hero-animation {
    --scale-factor: 1.5;
    --translate-x: 150px;
    --duration: 0.7s;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(var(--translate-x)) scale(var(--scale-factor));
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
```

### 2. Container Queries for Component-Level Responsiveness

```css
/* Modern approach - animations based on container size */
.card-container {
  container-type: inline-size;
  container-name: card;
}

.card {
  transition: transform 0.3s ease;
}

/* Small container */
@container card (max-width: 400px) {
  .card {
    transform: scale(0.95);
  }
  
  .card:hover {
    transform: scale(1.02);
    animation: pulse-small 0.3s ease;
  }
}

/* Large container */
@container card (min-width: 600px) {
  .card {
    transform: scale(1);
  }
  
  .card:hover {
    transform: scale(1.1);
    animation: pulse-large 0.5s ease;
  }
}

@keyframes pulse-small {
  0%, 100% { transform: scale(1.02); }
  50% { transform: scale(1.05); }
}

@keyframes pulse-large {
  0%, 100% { transform: scale(1.1); }
  50% { transform: scale(1.15); }
}
```

### 3. Viewport Units for Scalable Animations

```css
/* ✅ RESPONSIVE - Scales with viewport */
.floating-element {
  /* Uses viewport units for responsive movement */
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-5vh) translateX(3vw);
  }
  50% {
    transform: translateY(-8vh) translateX(-2vw);
  }
  75% {
    transform: translateY(-3vh) translateX(-4vw);
  }
}

/* Reduce movement on mobile */
@media (max-width: 767px) {
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3vh); }
  }
}
```

### 4. Clamp() for Fluid Animations

```css
.responsive-bounce {
  /* Fluid animation duration */
  animation-duration: clamp(0.3s, 2vw, 1s);
  
  /* Fluid transform values */
  transform: translateY(clamp(-20px, -5vw, -100px));
  
  /* Fluid shadow */
  box-shadow: 0 clamp(5px, 2vw, 20px) clamp(10px, 4vw, 40px) rgba(0, 0, 0, 0.2);
}

/* Example: Responsive particle animation */
.particle {
  width: clamp(5px, 1vw, 20px);
  height: clamp(5px, 1vw, 20px);
  animation: particle-float clamp(2s, 3vw, 5s) linear infinite;
}

@keyframes particle-float {
  from {
    transform: translateY(0) translateX(clamp(-10px, -2vw, -50px));
    opacity: 1;
  }
  to {
    transform: translateY(clamp(-50vh, -100vh, -150vh)) 
               translateX(clamp(10px, 5vw, 100px));
    opacity: 0;
  }
}
```

### 5. Reduced Motion Support

```css
/* ✅ CRITICAL - Always respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Alternative: Provide simpler animations */
@media (prefers-reduced-motion: no-preference) {
  .fancy-animation {
    animation: complex-spin 2s infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fancy-animation {
    animation: simple-fade 0.3s once;
  }
}
```

---

## JavaScript/GSAP Responsive Patterns

### 1. Responsive GSAP with MatchMedia

```javascript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ✅ BEST PRACTICE - GSAP MatchMedia
function setupResponsiveAnimations() {
  // Create a GSAP matchMedia instance
  const mm = gsap.matchMedia();
  
  // Mobile animations (default)
  mm.add("(max-width: 767px)", () => {
    gsap.to(".hero", {
      y: 50,
      scale: 0.95,
      duration: 0.5,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });
    
    // Return cleanup function
    return () => {
      console.log("Mobile animation cleaned up");
    };
  });
  
  // Tablet animations
  mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
    gsap.to(".hero", {
      y: 100,
      scale: 0.9,
      rotation: 5,
      duration: 0.7,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.5
      }
    });
  });
  
  // Desktop animations
  mm.add("(min-width: 1024px)", () => {
    gsap.to(".hero", {
      y: 200,
      scale: 0.8,
      rotation: 10,
      duration: 1,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 2,
        pin: true // Only pin on desktop
      }
    });
  });
  
  // Optional: Handle orientation changes
  mm.add("(orientation: portrait)", () => {
    console.log("Portrait mode - adjust animations");
  });
  
  mm.add("(orientation: landscape)", () => {
    console.log("Landscape mode - adjust animations");
  });
}

// Initialize
setupResponsiveAnimations();
```

### 2. Dynamic Particle System

```javascript
class ResponsiveParticleSystem {
  constructor(container) {
    this.container = container;
    this.particles = [];
    this.particleCount = this.getParticleCount();
    
    // Listen for resize
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(container);
    
    this.init();
  }
  
  getParticleCount() {
    const width = window.innerWidth;
    
    // Adaptive particle count based on screen size
    if (width < 768) return 10;        // Mobile
    if (width < 1024) return 20;       // Tablet
    if (width < 1440) return 30;       // Desktop
    return 50;                         // Large screens
  }
  
  getAnimationComplexity() {
    const width = window.innerWidth;
    
    return {
      duration: width < 768 ? 2 : width < 1024 ? 3 : 5,
      ease: width < 768 ? 'power1.out' : 'power2.inOut',
      effectsEnabled: width >= 1024, // Only enable on desktop
    };
  }
  
  init() {
    this.createParticles();
    this.animateParticles();
  }
  
  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Responsive sizing
      const size = window.innerWidth < 768 ? 5 : 10;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      this.container.appendChild(particle);
      this.particles.push(particle);
    }
  }
  
  animateParticles() {
    const config = this.getAnimationComplexity();
    
    this.particles.forEach((particle, index) => {
      gsap.to(particle, {
        x: () => gsap.utils.random(-100, 100),
        y: () => gsap.utils.random(-100, 100),
        opacity: () => gsap.utils.random(0.3, 1),
        scale: () => gsap.utils.random(0.5, 1.5),
        duration: config.duration,
        ease: config.ease,
        repeat: -1,
        yoyo: true,
        delay: index * 0.1
      });
      
      // Add rotation only on larger screens
      if (config.effectsEnabled) {
        gsap.to(particle, {
          rotation: 360,
          duration: config.duration * 2,
          ease: 'none',
          repeat: -1
        });
      }
    });
  }
  
  handleResize() {
    const newCount = this.getParticleCount();
    
    // Add or remove particles
    if (newCount > this.particleCount) {
      // Add particles
      for (let i = this.particleCount; i < newCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        this.container.appendChild(particle);
        this.particles.push(particle);
      }
    } else if (newCount < this.particleCount) {
      // Remove particles
      const toRemove = this.particleCount - newCount;
      for (let i = 0; i < toRemove; i++) {
        const particle = this.particles.pop();
        particle.remove();
      }
    }
    
    this.particleCount = newCount;
    
    // Kill all animations and restart
    gsap.killTweensOf(this.particles);
    this.animateParticles();
  }
  
  destroy() {
    this.resizeObserver.disconnect();
    gsap.killTweensOf(this.particles);
    this.particles.forEach(p => p.remove());
  }
}

// Usage
const particleSystem = new ResponsiveParticleSystem(
  document.querySelector('.particle-container')
);
```

### 3. Performance-Aware Animation Manager

```javascript
class AdaptiveAnimationManager {
  constructor() {
    this.deviceTier = this.detectDeviceTier();
    this.reducedMotion = this.checkReducedMotion();
    this.setupPerformanceMonitoring();
  }
  
  detectDeviceTier() {
    // Check various performance indicators
    const memory = navigator.deviceMemory || 4; // GB
    const cores = navigator.hardwareConcurrency || 2;
    const connection = navigator.connection?.effectiveType || '4g';
    
    // Calculate device tier
    if (memory >= 8 && cores >= 4 && connection === '4g') {
      return 'high';
    } else if (memory >= 4 && cores >= 2) {
      return 'medium';
    }
    return 'low';
  }
  
  checkReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  setupPerformanceMonitoring() {
    let lastTime = performance.now();
    let frames = 0;
    
    const checkFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round(frames * 1000 / (currentTime - lastTime));
        
        // Adjust animation quality based on FPS
        if (fps < 30 && this.deviceTier !== 'low') {
          console.warn('Low FPS detected, reducing animation complexity');
          this.deviceTier = 'low';
          this.updateAnimations();
        }
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(checkFPS);
    };
    
    checkFPS();
  }
  
  getAnimationConfig(animationType) {
    if (this.reducedMotion) {
      return {
        duration: 0.01,
        enabled: false
      };
    }
    
    const configs = {
      parallax: {
        high: { enabled: true, intensity: 1, smoothness: 2 },
        medium: { enabled: true, intensity: 0.5, smoothness: 1 },
        low: { enabled: false, intensity: 0, smoothness: 0 }
      },
      particles: {
        high: { count: 50, effects: true },
        medium: { count: 20, effects: false },
        low: { count: 0, effects: false }
      },
      transitions: {
        high: { duration: 0.8, ease: 'power4.out', blur: true },
        medium: { duration: 0.5, ease: 'power2.out', blur: false },
        low: { duration: 0.2, ease: 'power1.out', blur: false }
      }
    };
    
    return configs[animationType][this.deviceTier];
  }
  
  updateAnimations() {
    // Trigger re-initialization of all animations
    window.dispatchEvent(new CustomEvent('animationTierChanged', {
      detail: { tier: this.deviceTier }
    }));
  }
}

// Usage
const animManager = new AdaptiveAnimationManager();

// Setup animations based on device capability
const particleConfig = animManager.getAnimationConfig('particles');
if (particleConfig.count > 0) {
  createParticles(particleConfig.count);
}

const transitionConfig = animManager.getAnimationConfig('transitions');
gsap.defaults({
  duration: transitionConfig.duration,
  ease: transitionConfig.ease
});
```

---

## Framer Motion Responsive Patterns

### 1. Responsive Variants with Hooks

```jsx
import { motion, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';

function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('desktop');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) setBreakpoint('mobile');
      else if (width < 1024) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
}

function ResponsiveAnimatedCard() {
  const breakpoint = useBreakpoint();
  const shouldReduceMotion = useReducedMotion();
  
  // Define variants for different breakpoints
  const variants = {
    mobile: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.3 }
      },
      hover: { scale: 1.02 }
    },
    tablet: {
      hidden: { opacity: 0, y: 50, x: -20 },
      visible: { 
        opacity: 1, 
        y: 0, 
        x: 0,
        transition: { duration: 0.5, ease: 'easeOut' }
      },
      hover: { scale: 1.05, rotate: 2 }
    },
    desktop: {
      hidden: { opacity: 0, y: 100, scale: 0.8 },
      visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
          duration: 0.7,
          ease: 'easeOut',
          type: 'spring',
          stiffness: 100
        }
      },
      hover: { 
        scale: 1.1, 
        rotate: 5,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }
    }
  };
  
  // Use minimal animations if reduced motion is preferred
  if (shouldReduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.01 }}
        className="card"
      >
        Content
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={variants[breakpoint]}
      className="card"
    >
      <h2>Responsive Card</h2>
      <p>Animations adapt to screen size</p>
    </motion.div>
  );
}
```

### 2. Viewport-Aware Scroll Animations

```jsx
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

function ResponsiveParallaxSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  
  // Different parallax intensities for different screen sizes
  const getParallaxRange = () => {
    const width = window.innerWidth;
    if (width < 768) return [0, 50];      // Minimal on mobile
    if (width < 1024) return [0, 100];    // Moderate on tablet
    return [0, 200];                      // Full effect on desktop
  };
  
  const y = useTransform(scrollYProgress, [0, 1], getParallaxRange());
  const ySpring = useSpring(y, { stiffness: 100, damping: 30 });
  
  return (
    <section ref={ref} className="parallax-section">
      <motion.div
        style={{ y: ySpring }}
        className="parallax-content"
      >
        <h2>Parallax Content</h2>
      </motion.div>
    </section>
  );
}
```

### 3. Responsive Stagger Children

```jsx
import { motion } from 'framer-motion';

function ResponsiveGrid({ items }) {
  const getStaggerConfig = () => {
    const width = window.innerWidth;
    
    return {
      mobile: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      },
      tablet: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      },
      desktop: {
        staggerChildren: 0.2,
        delayChildren: 0.5
      }
    }[width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'];
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: getStaggerConfig()
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: window.innerWidth < 768 ? 0.3 : 0.5
      }
    }
  };
  
  return (
    <motion.div
      className="grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="grid-item"
        >
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## Viewport-Based Animations

### 1. Intersection Observer for Responsive Triggers

```javascript
class ResponsiveAnimationObserver {
  constructor(options = {}) {
    this.elements = new Map();
    
    // Different thresholds for different screen sizes
    const threshold = this.getThreshold();
    
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold,
        rootMargin: this.getRootMargin(),
        ...options
      }
    );
  }
  
  getThreshold() {
    const width = window.innerWidth;
    // More aggressive on mobile (trigger earlier)
    if (width < 768) return [0, 0.25];
    if (width < 1024) return [0, 0.25, 0.5];
    return [0, 0.25, 0.5, 0.75, 1];
  }
  
  getRootMargin() {
    const width = window.innerWidth;
    // Trigger earlier on mobile
    if (width < 768) return '0px 0px -100px 0px';
    if (width < 1024) return '0px 0px -150px 0px';
    return '0px 0px -200px 0px';
  }
  
  observe(element, animation) {
    this.elements.set(element, animation);
    this.observer.observe(element);
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      const animation = this.elements.get(entry.target);
      
      if (entry.isIntersecting) {
        // Adjust animation based on intersection ratio
        const intensity = entry.intersectionRatio;
        animation.play(intensity);
      }
    });
  }
  
  destroy() {
    this.observer.disconnect();
    this.elements.clear();
  }
}

// Usage
const observer = new ResponsiveAnimationObserver();

document.querySelectorAll('.animate-on-scroll').forEach(element => {
  const animation = {
    play: (intensity) => {
      const scale = 0.8 + (intensity * 0.2); // Scale from 0.8 to 1.0
      
      gsap.to(element, {
        opacity: intensity,
        scale: scale,
        y: (1 - intensity) * 50,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  };
  
  observer.observe(element, animation);
});
```

### 2. Scroll-Based Transforms

```javascript
class ResponsiveScrollAnimator {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      start: 'top bottom',
      end: 'bottom top',
      ...options
    };
    
    this.setupScrollTrigger();
    this.handleResize();
    
    window.addEventListener('resize', () => this.handleResize());
  }
  
  getScrollConfig() {
    const width = window.innerWidth;
    
    return {
      mobile: {
        scrub: 0.5,
        yMovement: 50,
        xMovement: 0,
        rotation: 0,
        scale: [1, 0.95]
      },
      tablet: {
        scrub: 1,
        yMovement: 100,
        xMovement: 20,
        rotation: 5,
        scale: [1, 0.9]
      },
      desktop: {
        scrub: 2,
        yMovement: 200,
        xMovement: 50,
        rotation: 10,
        scale: [1, 0.8]
      }
    }[width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'];
  }
  
  setupScrollTrigger() {
    const config = this.getScrollConfig();
    
    this.scrollTrigger = ScrollTrigger.create({
      trigger: this.element,
      start: this.options.start,
      end: this.options.end,
      scrub: config.scrub,
      onUpdate: (self) => {
        const progress = self.progress;
        
        gsap.set(this.element, {
          y: progress * config.yMovement,
          x: Math.sin(progress * Math.PI) * config.xMovement,
          rotation: progress * config.rotation,
          scale: gsap.utils.interpolate(
            config.scale[0],
            config.scale[1],
            progress
          )
        });
      }
    });
  }
  
  handleResize() {
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }
    this.setupScrollTrigger();
  }
  
  destroy() {
    if (this.scrollTrigger) {
      this.scrollTrigger.kill();
    }
    window.removeEventListener('resize', this.handleResize);
  }
}

// Usage
document.querySelectorAll('.scroll-animate').forEach(element => {
  new ResponsiveScrollAnimator(element);
});
```

---

## Performance Optimization

### 1. GPU Acceleration & Will-Change

```css
/* ✅ BEST PRACTICE - Optimize for performance */
.animated-element {
  /* Use transform and opacity for smooth animations */
  transform: translateZ(0); /* Force GPU acceleration */
  will-change: transform, opacity;
  
  /* Remove will-change after animation */
  animation: slideIn 0.5s ease-out forwards;
}

.animated-element.animation-complete {
  will-change: auto; /* Release GPU resources */
}

/* Mobile-specific optimizations */
@media (max-width: 767px) {
  .animated-element {
    /* Simpler animations on mobile */
    will-change: transform; /* Only transform, not opacity */
  }
}

/* Disable intensive effects on low-end devices */
@media (max-width: 767px) and (prefers-reduced-motion: no-preference) {
  .complex-3d-animation {
    animation: simple-2d-fallback 0.3s ease;
  }
}
```

### 2. Conditional Animation Loading

```javascript
// ✅ BEST PRACTICE - Load animations based on device capability
class ConditionalAnimationLoader {
  constructor() {
    this.shouldLoadAnimations = this.checkCapability();
  }
  
  checkCapability() {
    // Check various factors
    const checks = {
      memory: navigator.deviceMemory >= 4,
      cores: navigator.hardwareConcurrency >= 2,
      connection: this.checkConnection(),
      battery: true, // Will be updated by battery check
      reducedMotion: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
    
    // Check battery level
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        checks.battery = battery.level > 0.2 && !battery.charging;
      });
    }
    
    // Must pass most checks
    const passedChecks = Object.values(checks).filter(Boolean).length;
    return passedChecks >= 3;
  }
  
  checkConnection() {
    if (!('connection' in navigator)) return true;
    
    const conn = navigator.connection;
    return conn.effectiveType === '4g' && !conn.saveData;
  }
  
  async loadAnimationLibrary() {
    if (!this.shouldLoadAnimations) {
      console.log('Skipping animation library for performance');
      return null;
    }
    
    // Dynamically import heavy libraries
    const { default: gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    
    return { gsap, ScrollTrigger };
  }
  
  async loadParticleSystem() {
    if (!this.shouldLoadAnimations) return null;
    
    const width = window.innerWidth;
    
    // Load different particle systems based on screen size
    if (width < 768) {
      return null; // No particles on mobile
    } else if (width < 1024) {
      return await import('./particles-lite.js');
    } else {
      return await import('./particles-full.js');
    }
  }
}

// Usage
const loader = new ConditionalAnimationLoader();

(async () => {
  const animations = await loader.loadAnimationLibrary();
  
  if (animations) {
    const { gsap, ScrollTrigger } = animations;
    gsap.registerPlugin(ScrollTrigger);
    
    // Setup animations
    setupAnimations(gsap, ScrollTrigger);
  } else {
    // Use CSS-only fallback
    document.body.classList.add('no-js-animations');
  }
})();
```

### 3. Animation Frame Budget

```javascript
class AnimationFrameBudget {
  constructor(maxDuration = 16) { // 16ms = 60fps
    this.maxDuration = maxDuration;
    this.animations = [];
    this.isRunning = false;
  }
  
  addAnimation(fn, priority = 1) {
    this.animations.push({ fn, priority });
    this.animations.sort((a, b) => b.priority - a.priority);
    
    if (!this.isRunning) {
      this.start();
    }
  }
  
  start() {
    this.isRunning = true;
    
    const loop = (timestamp) => {
      const frameStart = performance.now();
      let frameTime = 0;
      
      // Execute animations within frame budget
      for (let i = 0; i < this.animations.length; i++) {
        if (frameTime >= this.maxDuration) {
          console.warn('Frame budget exceeded, deferring animations');
          break;
        }
        
        const animStart = performance.now();
        this.animations[i].fn();
        frameTime = performance.now() - frameStart;
      }
      
      // Log performance metrics
      if (frameTime > this.maxDuration) {
        console.warn(`Frame took ${frameTime.toFixed(2)}ms (budget: ${this.maxDuration}ms)`);
      }
      
      if (this.animations.length > 0) {
        requestAnimationFrame(loop);
      } else {
        this.isRunning = false;
      }
    };
    
    requestAnimationFrame(loop);
  }
  
  clear() {
    this.animations = [];
  }
}

// Usage
const frameBudget = new AnimationFrameBudget(12); // 12ms for 60fps with headroom

// High priority (UI feedback)
frameBudget.addAnimation(() => {
  updateButtonState();
}, 3);

// Medium priority (transitions)
frameBudget.addAnimation(() => {
  updateTransitions();
}, 2);

// Low priority (background effects)
frameBudget.addAnimation(() => {
  updateParticles();
}, 1);
```

---

## Mobile-First Animation Strategy

### 1. Progressive Enhancement Pattern

```javascript
// ✅ BEST PRACTICE - Start simple, enhance progressively

// Base: Simple CSS animations (works everywhere)
const baseAnimations = {
  init: () => {
    document.body.classList.add('css-animations-ready');
  }
};

// Enhancement Level 1: Basic JS animations (most mobile devices)
const enhancedAnimations = {
  init: () => {
    if (!window.requestAnimationFrame) return;
    
    document.querySelectorAll('.fade-in').forEach(el => {
      el.style.opacity = '0';
      
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            el.style.transition = 'opacity 0.3s ease';
            el.style.opacity = '1';
          }
        });
      });
      
      observer.observe(el);
    });
  }
};

// Enhancement Level 2: Advanced animations (tablets/desktops)
const advancedAnimations = {
  init: async () => {
    if (window.innerWidth < 768) return;
    
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    
    gsap.registerPlugin(ScrollTrigger);
    
    // Complex scroll-based animations
    gsap.utils.toArray('.parallax').forEach(section => {
      gsap.to(section, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed,
        ease: 'none',
        scrollTrigger: {
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    });
  }
};

// Enhancement Level 3: Premium animations (high-end devices only)
const premiumAnimations = {
  init: async () => {
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 2;
    
    if (window.innerWidth < 1024 || memory < 8 || cores < 4) return;
    
    // Load heavy particle systems, WebGL effects, etc.
    const ParticleSystem = await import('./premium-particles.js');
    new ParticleSystem.default({
      count: 100,
      interactive: true,
      3d: true
    });
  }
};

// Initialize based on capability
const initAnimations = () => {
  baseAnimations.init();
  
  if (window.innerWidth >= 640) {
    enhancedAnimations.init();
  }
  
  if (window.innerWidth >= 768) {
    advancedAnimations.init();
  }
  
  if (window.innerWidth >= 1440) {
    premiumAnimations.init();
  }
};

// Run on load and resize (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(initAnimations, 250);
});

initAnimations();
```

### 2. Touch-Optimized Animations

```javascript
class TouchOptimizedAnimation {
  constructor(element) {
    this.element = element;
    this.isTouchDevice = 'ontouchstart' in window;
    
    this.setup();
  }
  
  setup() {
    if (this.isTouchDevice) {
      this.setupTouchAnimations();
    } else {
      this.setupMouseAnimations();
    }
  }
  
  setupTouchAnimations() {
    // Simpler, more responsive for touch
    this.element.addEventListener('touchstart', (e) => {
      gsap.to(this.element, {
        scale: 0.95,
        duration: 0.1, // Faster for immediate feedback
        ease: 'power1.out'
      });
    });
    
    this.element.addEventListener('touchend', () => {
      gsap.to(this.element, {
        scale: 1,
        duration: 0.2,
        ease: 'back.out(1.7)'
      });
    });
  }
  
  setupMouseAnimations() {
    // More complex for mouse (can be slower)
    this.element.addEventListener('mouseenter', (e) => {
      const rect = this.element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      gsap.to(this.element, {
        scale: 1.1,
        x: (x - rect.width / 2) * 0.1,
        y: (y - rect.height / 2) * 0.1,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    
    this.element.addEventListener('mouseleave', () => {
      gsap.to(this.element, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.inOut'
      });
    });
  }
}

// Apply to all interactive elements
document.querySelectorAll('.interactive').forEach(el => {
  new TouchOptimizedAnimation(el);
});
```

---

## Advanced Techniques

### 1. Responsive SVG Animations

```html
<svg viewBox="0 0 100 100" class="responsive-svg">
  <circle cx="50" cy="50" r="40" class="animated-circle" />
</svg>

<style>
.responsive-svg {
  width: 100%;
  height: auto;
  max-width: 500px;
}

.animated-circle {
  /* Responsive stroke width using viewport units */
  stroke-width: clamp(1px, 0.5vw, 5px);
  
  /* Animation scales with container */
  animation: pulse 2s ease-in-out infinite;
  transform-origin: center;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}

/* Adjust animation complexity by screen size */
@media (max-width: 767px) {
  .animated-circle {
    animation-duration: 1.5s; /* Faster on mobile */
  }
}

@media (min-width: 1024px) {
  .animated-circle {
    animation-duration: 3s; /* Slower, more dramatic on desktop */
  }
}
</style>

<script>
// JavaScript control for more complex SVG animations
class ResponsiveSVGAnimation {
  constructor(svg) {
    this.svg = svg;
    this.circle = svg.querySelector('.animated-circle');
    this.setupAnimation();
    
    window.addEventListener('resize', () => this.handleResize());
  }
  
  setupAnimation() {
    const width = window.innerWidth;
    const config = this.getConfig(width);
    
    gsap.to(this.circle, {
      scale: config.scale,
      duration: config.duration,
      ease: config.ease,
      repeat: -1,
      yoyo: true,
      transformOrigin: 'center'
    });
  }
  
  getConfig(width) {
    if (width < 768) {
      return { scale: 1.05, duration: 1, ease: 'power1.inOut' };
    } else if (width < 1024) {
      return { scale: 1.1, duration: 1.5, ease: 'power2.inOut' };
    }
    return { scale: 1.2, duration: 2, ease: 'power3.inOut' };
  }
  
  handleResize() {
    gsap.killTweensOf(this.circle);
    this.setupAnimation();
  }
}

new ResponsiveSVGAnimation(document.querySelector('.responsive-svg'));
</script>
```

### 2. Adaptive Canvas Animations

```javascript
class ResponsiveCanvasAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    
    this.setupCanvas();
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', () => this.handleResize());
  }
  
  setupCanvas() {
    // Set canvas resolution based on device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    // Limit DPR on mobile for performance
    const effectiveDPR = window.innerWidth < 768 ? Math.min(dpr, 1.5) : dpr;
    
    this.canvas.width = rect.width * effectiveDPR;
    this.canvas.height = rect.height * effectiveDPR;
    
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    
    this.ctx.scale(effectiveDPR, effectiveDPR);
  }
  
  createParticles() {
    const width = this.canvas.width;
    
    // Adaptive particle count
    const particleCount = width < 768 ? 20 : width < 1024 ? 50 : 100;
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * (width < 768 ? 1 : 2),
        vy: (Math.random() - 0.5) * (width < 768 ? 1 : 2),
        radius: Math.random() * (width < 768 ? 2 : 4) + 1
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
      
      // Draw
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.fill();
    });
    
    requestAnimationFrame(() => this.animate());
  }
  
  handleResize() {
    this.particles = [];
    this.setupCanvas();
    this.createParticles();
  }
}

const canvas = document.querySelector('#animation-canvas');
new ResponsiveCanvasAnimation(canvas);
```

### 3. Orientation-Aware Animations

```javascript
class OrientationAwareAnimation {
  constructor() {
    this.currentOrientation = this.getOrientation();
    this.setupAnimations();
    
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.handleOrientationChange(), 200);
    });
    
    // Fallback for browsers without orientationchange
    window.addEventListener('resize', () => {
      const newOrientation = this.getOrientation();
      if (newOrientation !== this.currentOrientation) {
        this.handleOrientationChange();
      }
    });
  }
  
  getOrientation() {
    if (window.matchMedia('(orientation: portrait)').matches) {
      return 'portrait';
    }
    return 'landscape';
  }
  
  setupAnimations() {
    const orientation = this.currentOrientation;
    
    document.querySelectorAll('.orientation-aware').forEach(element => {
      if (orientation === 'portrait') {
        // Vertical animations for portrait
        gsap.to(element, {
          y: 100,
          rotation: 0,
          duration: 1,
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      } else {
        // Horizontal animations for landscape
        gsap.to(element, {
          x: 200,
          rotation: 15,
          duration: 1,
          scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    });
  }
  
  handleOrientationChange() {
    this.currentOrientation = this.getOrientation();
    
    // Kill all existing animations
    ScrollTrigger.getAll().forEach(st => st.kill());
    
    // Restart with new orientation
    this.setupAnimations();
    ScrollTrigger.refresh();
  }
}

new OrientationAwareAnimation();
```

---

## Common Patterns & Solutions

### 1. Responsive Hero Animation

```jsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function ResponsiveHero() {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });
  
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Calculate responsive values
  const getAnimationValues = () => {
    const { width } = dimensions;
    
    if (width < 768) {
      return {
        titleSize: 'text-4xl',
        subtitleSize: 'text-lg',
        yOffset: 50,
        scale: 1,
        duration: 0.5,
        stagger: 0.1
      };
    } else if (width < 1024) {
      return {
        titleSize: 'text-6xl',
        subtitleSize: 'text-2xl',
        yOffset: 80,
        scale: 1.05,
        duration: 0.7,
        stagger: 0.15
      };
    }
    
    return {
      titleSize: 'text-8xl',
      subtitleSize: 'text-3xl',
      yOffset: 100,
      scale: 1.1,
      duration: 1,
      stagger: 0.2
    };
  };
  
  const config = getAnimationValues();
  
  return (
    <div className="hero min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: config.yOffset }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: config.duration, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.h1
          className={config.titleSize + ' font-bold mb-4'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: config.scale }}
          transition={{ 
            duration: config.duration, 
            delay: config.stagger,
            ease: 'backOut'
          }}
        >
          Responsive Hero
        </motion.h1>
        
        <motion.p
          className={config.subtitleSize}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: config.duration * 0.8, 
            delay: config.stagger * 2 
          }}
        >
          Adapts to any screen size
        </motion.p>
        
        <motion.button
          className="mt-8 px-8 py-4 bg-blue-500 text-white rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ 
            scale: dimensions.width < 768 ? 1.05 : 1.1,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ 
            duration: config.duration * 0.6, 
            delay: config.stagger * 3 
          }}
        >
          Get Started
        </motion.button>
      </motion.div>
    </div>
  );
}
```

### 2. Responsive Scroll Progress Indicator

```javascript
class ResponsiveScrollProgress {
  constructor() {
    this.createProgressBar();
    this.setupAnimation();
  }
  
  createProgressBar() {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    
    // Responsive height
    const height = window.innerWidth < 768 ? '3px' : '5px';
    
    progress.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: ${height};
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      z-index: 9999;
      transition: width 0.1s ease-out;
    `;
    
    document.body.appendChild(progress);
    this.progress = progress;
  }
  
  setupAnimation() {
    // Use different scroll calculation methods based on device
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Simple calculation for mobile
      window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        this.progress.style.width = scrollPercent + '%';
      });
    } else {
      // Smooth GSAP animation for desktop
      gsap.to(this.progress, {
        width: '100%',
        ease: 'none',
        scrollTrigger: {
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5
        }
      });
    }
  }
}

new ResponsiveScrollProgress();
```

### 3. Adaptive Loading Animation

```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

function AdaptiveLoader() {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    // Simulate loading
    setTimeout(() => setLoading(false), 2000);
  }, []);
  
  // Simple spinner for mobile
  const MobileLoader = () => (
    <motion.div
      className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
  
  // Complex animation for desktop
  const DesktopLoader = () => (
    <div className="relative w-32 h-32">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-4 border-blue-500 rounded-full"
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 1],
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
  
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 bg-black flex items-center justify-center z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isMobile ? 0.3 : 0.5 }}
        >
          {isMobile ? <MobileLoader /> : <DesktopLoader />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Production Examples

### Complete Responsive Animation System

```javascript
/**
 * Production-ready responsive animation system
 * Handles device detection, performance monitoring, and adaptive animations
 */

class ResponsiveAnimationSystem {
  constructor(config = {}) {
    this.config = {
      enablePerformanceMonitoring: true,
      enableReducedMotion: true,
      adaptiveQuality: true,
      ...config
    };
    
    this.init();
  }
  
  init() {
    this.detectCapabilities();
    this.setupMediaQueries();
    this.setupPerformanceMonitoring();
    this.initAnimations();
  }
  
  detectCapabilities() {
    this.capabilities = {
      deviceTier: this.getDeviceTier(),
      screenSize: this.getScreenSize(),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      touchDevice: 'ontouchstart' in window,
      gpuAcceleration: this.checkGPUAcceleration()
    };
  }
  
  getDeviceTier() {
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 2;
    const connection = navigator.connection?.effectiveType || '4g';
    
    if (memory >= 8 && cores >= 4 && connection === '4g') return 'high';
    if (memory >= 4 && cores >= 2) return 'medium';
    return 'low';
  }
  
  getScreenSize() {
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1440) return 'desktop';
    return 'large';
  }
  
  checkGPUAcceleration() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  }
  
  setupMediaQueries() {
    const queries = {
      mobile: window.matchMedia('(max-width: 639px)'),
      tablet: window.matchMedia('(min-width: 640px) and (max-width: 1023px)'),
      desktop: window.matchMedia('(min-width: 1024px)'),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
    };
    
    Object.entries(queries).forEach(([key, mq]) => {
      mq.addEventListener('change', () => {
        this.handleMediaChange(key, mq.matches);
      });
    });
  }
  
  setupPerformanceMonitoring() {
    if (!this.config.enablePerformanceMonitoring) return;
    
    let frameCount = 0;
    let lastTime = performance.now();
    
    const monitor = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
        
        if (fps < 30 && this.capabilities.deviceTier !== 'low') {
          console.warn('Low FPS detected, reducing animation quality');
          this.degradeAnimations();
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(monitor);
    };
    
    monitor();
  }
  
  initAnimations() {
    // Initialize based on capabilities
    const animationLevel = this.getAnimationLevel();
    
    switch (animationLevel) {
      case 'none':
        this.initMinimalAnimations();
        break;
      case 'basic':
        this.initBasicAnimations();
        break;
      case 'enhanced':
        this.initEnhancedAnimations();
        break;
      case 'premium':
        this.initPremiumAnimations();
        break;
    }
  }
  
  getAnimationLevel() {
    if (this.capabilities.reducedMotion) return 'none';
    if (this.capabilities.deviceTier === 'low') return 'basic';
    if (this.capabilities.screenSize === 'mobile') return 'basic';
    if (this.capabilities.deviceTier === 'medium') return 'enhanced';
    return 'premium';
  }
  
  initMinimalAnimations() {
    console.log('Initializing minimal animations');
    document.body.classList.add('reduced-motion');
  }
  
  initBasicAnimations() {
    console.log('Initializing basic animations');
    
    // Simple fade-ins
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s ease';
      
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
          }
        });
      });
      
      observer.observe(el);
    });
  }
  
  async initEnhancedAnimations() {
    console.log('Initializing enhanced animations');
    
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    
    gsap.registerPlugin(ScrollTrigger);
    
    // Moderate complexity animations
    gsap.utils.toArray('[data-animate]').forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 50,
        duration: 0.6,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }
  
  async initPremiumAnimations() {
    console.log('Initializing premium animations');
    
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    const { ScrollSmoother } = await import('gsap/ScrollSmoother');
    
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    
    // High-end animations with all features
    ScrollSmoother.create({
      smooth: 2,
      effects: true,
      smoothTouch: 0.1
    });
    
    gsap.utils.toArray('[data-animate]').forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 100,
        scale: 0.8,
        rotation: -10,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 1,
          toggleActions: 'play none none reverse'
        }
      });
    });
  }
  
  degradeAnimations() {
    const currentLevel = this.getAnimationLevel();
    const levels = ['premium', 'enhanced', 'basic', 'none'];
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex < levels.length - 1) {
      this.capabilities.deviceTier = 'low';
      this.cleanup();
      this.initAnimations();
    }
  }
  
  handleMediaChange(key, matches) {
    console.log(`Media query ${key} changed:`, matches);
    this.detectCapabilities();
    this.cleanup();
    this.initAnimations();
  }
  
  cleanup() {
    // Kill all GSAP animations
    if (window.gsap) {
      gsap.killTweensOf('*');
      ScrollTrigger.getAll().forEach(st => st.kill());
    }
    
    // Remove classes
    document.body.classList.remove('reduced-motion');
  }
}

// Initialize the system
const animationSystem = new ResponsiveAnimationSystem({
  enablePerformanceMonitoring: true,
  enableReducedMotion: true,
  adaptiveQuality: true
});

// Export for use in other modules
export default animationSystem;
```

---

## Best Practices Checklist

### ✅ Always Do

1. **Start Mobile-First** - Design animations for mobile, enhance for desktop
2. **Use CSS Variables** - Make values responsive with media queries
3. **Respect User Preferences** - Honor `prefers-reduced-motion`
4. **Performance Monitor** - Track FPS and degrade gracefully
5. **Use Transform & Opacity** - Hardware-accelerated properties only
6. **Test on Real Devices** - Emulators don't show real performance
7. **Provide Fallbacks** - Simple alternatives for low-end devices
8. **Use Viewport Units** - `vw`, `vh`, `clamp()` for fluid scaling
9. **Lazy Load Animations** - Load heavy libraries conditionally
10. **Kill & Cleanup** - Remove animations on resize/unmount

### ❌ Never Do

1. **Don't Animate Width/Height** - Use transform: scale instead
2. **Don't Use Too Many Particles** - Adapt count to screen size
3. **Don't Ignore Battery** - Reduce animations on low battery
4. **Don't Animate on Low-End Devices** - Check capabilities first
5. **Don't Use Fixed Pixels** - Use relative units
6. **Don't Overuse will-change** - Remove after animation
7. **Don't Forget Touch Devices** - Different interaction patterns
8. **Don't Block Main Thread** - Use Web Workers for heavy calculations
9. **Don't Rely on Hover** - Mobile doesn't have hover states
10. **Don't Auto-Play Videos** - Especially on mobile data

---

## Resources & Tools

### Testing Tools
- **Chrome DevTools** - Performance profiler, FPS monitor
- **Lighthouse** - Performance audits
- **WebPageTest** - Real device testing
- **BrowserStack** - Cross-device testing

### Libraries
- **GSAP** - Best animation library with responsive support
- **Framer Motion** - React animations with great responsive patterns
- **Lottie** - Scalable vector animations
- **AOS** - Animate on scroll library
- **ScrollTrigger** - GSAP plugin for scroll animations

### Performance Monitoring
- **web-vitals** - Core Web Vitals tracking
- **perfume.js** - Performance metrics
- **PerformanceObserver** - Native browser API

---

## Conclusion

Making animation-heavy websites responsive requires:

1. **Mobile-first thinking** - Start simple, enhance progressively
2. **Performance awareness** - Monitor and adapt to device capabilities
3. **User respect** - Honor preferences and accessibility needs
4. **Smart scaling** - Use relative units and viewport-based calculations
5. **Conditional loading** - Load complex animations only when appropriate

Remember: **Great animations enhance UX, but performance and accessibility come first!**

Happy animating! 🎨✨
