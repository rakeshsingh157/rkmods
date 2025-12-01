'use client';

import { useEffect } from 'react';

export default function CursorEffect() {
  useEffect(() => {
    // Create custom cursor element
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Smooth cursor following
    const updateCursor = () => {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      cursorX += dx * 0.15;
      cursorY += dy * 0.15;
      
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      
      requestAnimationFrame(updateCursor);
    };

    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Create trail effect
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
      document.body.appendChild(trail);

      // Remove trail after animation
      setTimeout(() => {
        trail.remove();
      }, 600);
    };

    // Hover effects for interactive elements
    const handleMouseEnter = () => {
      document.body.classList.add('cursor-hover');
    };

    const handleMouseLeave = () => {
      document.body.classList.remove('cursor-hover');
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    requestAnimationFrame(updateCursor);

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, [role="button"]');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    // Observer for dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            const newInteractive = node.querySelectorAll('a, button, input, textarea, [role="button"]');
            newInteractive.forEach((el) => {
              el.addEventListener('mouseenter', handleMouseEnter);
              el.addEventListener('mouseleave', handleMouseLeave);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup
    return () => {
      cursor.remove();
      document.removeEventListener('mousemove', handleMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      observer.disconnect();
    };
  }, []);

  return null;
}
