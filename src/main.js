import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════
   ARGAN — Scroll-driven frame animation + reveals
   ═══════════════════════════════════════════════════ */

// ── Config ──────────────────────────────────────────
const FRAME_COUNT = 192;
const FRAME_PATH = (i) => `frames/frame_${String(i).padStart(4, '0')}.jpg`;

// ── Canvas setup ────────────────────────────────────
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ── Frame preloading ────────────────────────────────
const frames = [];
const frameTracker = { current: 0 };

function loadFrames() {
  return new Promise((resolve) => {
    let loaded = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === FRAME_COUNT) resolve();
      };
      frames.push(img);
    }
  });
}

// ── Draw a frame on canvas (cover fit) ──────────────
function drawFrame(index) {
  const img = frames[index];
  if (!img || !img.complete) return;

  const cw = canvas.width;
  const ch = canvas.height;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;

  // Cover-fit calculation
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.clearRect(0, 0, cw, cw);
  ctx.drawImage(img, dx, dy, dw, dh);
}

// ── Navbar scroll behavior ──────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      navbar.classList.toggle('scrolled', self.progress > 0);
    },
  });
}

// ── Hero entrance animation ─────────────────────────
function initHeroIntro() {
  const tl = gsap.timeline({ delay: 0.3 });

  tl.to('.hero-stars', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
    .to('.hero-title', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.5')
    .to('.hero-btn', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');
}

// ── Scroll-driven frame animation ───────────────────
function initScrollFrames() {
  // Create spacer for the scroll animation (5x viewport height)
  const scrollSpacer = document.createElement('div');
  scrollSpacer.style.height = '400vh';
  scrollSpacer.id = 'scroll-spacer';
  document.getElementById('hero').after(scrollSpacer);

  gsap.to(frameTracker, {
    current: FRAME_COUNT - 1,
    snap: 'current',
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: () => `+=${window.innerHeight * 4}`,
      scrub: 0.5,
      pin: false,
      onUpdate: () => {
        drawFrame(Math.round(frameTracker.current));
      },
    },
  });

  // Fade out hero content as user scrolls
  gsap.to('.hero-content', {
    opacity: 0,
    y: -60,
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=30%',
      scrub: true,
    },
  });

  // Hide canvas once past the scroll spacer
  ScrollTrigger.create({
    trigger: '#scroll-spacer',
    start: 'bottom bottom',
    onEnter: () => { canvas.style.opacity = '0'; canvas.style.transition = 'opacity 0.4s'; },
    onLeaveBack: () => { canvas.style.opacity = '1'; },
  });
}

// ── Section reveal animations ───────────────────────
function initReveals() {
  // 1. Special text reveal (clip-path slide up) for headings
  const textReveals = document.querySelectorAll('.text-reveal');
  textReveals.forEach((el) => {
    gsap.fromTo(el,
      { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)', y: 30 },
      {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        y: 0,
        duration: 1.2,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        }
      }
    );
  });

  // 2. Original full-block reveals (like product cards & images)
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
        delay: (i % 3) * 0.1, // stagger within rows if nearby
      }
    );
  });

  // 3. Global element reveals - "Make every element react"
  // Find paragraphs, labels, stats, etc. inside sections to give them a gentle fade up
  const globalElements = document.querySelectorAll('.section p:not(.word-reveal-text), .section .section-label:not(.reveal), .stat-item, .product-detail > *, .arch__info > *');
  globalElements.forEach((el) => {
    // Prevent double animating if it's already inside a .reveal block (like the product details inside product card)
    if (el.closest('.reveal')) return;

    gsap.fromTo(el,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
        }
      }
    );
  });
}

// ── Word Reveal Animation ─────────────────────────────
function initWordReveal() {
  const problemSection = document.getElementById('problem');
  if (!problemSection) return;

  const textElements = problemSection.querySelectorAll('.word-reveal-text');
  let allWords = [];

  textElements.forEach(text => {
    // Split text into individual words
    const splitText = new SplitType(text, { type: 'words' });
    allWords = allWords.concat(splitText.words);

    // Add gap manually to the words or let splitType handle it, usually splitType gives words absolute position or inline-block. By default it uses inline-block which respects whitespace.
  });

  gsap.from(allWords, {
    opacity: 0.1,
    ease: 'none',
    stagger: 0.1,
    scrollTrigger: {
      trigger: problemSection,
      start: 'top top',
      end: () => `+=${window.innerHeight * 1.5}`, // Pinned duration length
      scrub: true,
      pin: true,
    }
  });
}

// ── Benefits Stacked Cards Animation ───────────────
function initBenefitsAnimation() {
  const cards = gsap.utils.toArray('.benefit-card');

  cards.forEach((card, i) => {
    const num = card.querySelector('.benefit-card-num');
    const body = card.querySelector('.benefit-card-body');
    const tag = card.querySelector('.benefit-card-tag');
    const image = card.querySelector('.benefit-card-image');

    // Card body content slides up on entry
    gsap.fromTo([body, tag],
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: card,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        }
      }
    );

    // Image swoops in from the right with slight rotation already applied via CSS
    if (image) {
      gsap.fromTo(image,
        { opacity: 0, x: 80, rotate: -12 },
        {
          opacity: 1,
          x: 0,
          rotate: -6,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }

    // Ghost number drifts up
    gsap.fromTo(num,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        }
      }
    );
  });
}

function initFooterAnimation() {
  // Massive text scroll scale/parallax effect
  gsap.fromTo('.footer-massive-text span',
    { scale: 0.8, y: 150, opacity: 0 },
    {
      scale: 1,
      y: 0,
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '#footer',
        start: 'top 90%',
        end: 'bottom bottom',
        scrub: 1, // smooth scrub
      }
    }
  );
}

// ── Arch Process Animation ───────────────────────────
function initArchProcessAnimation() {
  document.querySelectorAll(".arch__right .img-wrapper").forEach((element) => {
    const order = element.getAttribute("data-index");
    if (order !== null) {
      element.style.zIndex = order;
    }
  });

  function handleMobileLayout() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const leftItems = gsap.utils.toArray(".arch__left .arch__info");
    const rightItems = gsap.utils.toArray(".arch__right .img-wrapper");

    if (isMobile) {
      leftItems.forEach((item, i) => { item.style.order = i * 2; });
      rightItems.forEach((item, i) => { item.style.order = i * 2 + 1; });
    } else {
      leftItems.forEach((item) => { item.style.order = ""; });
      rightItems.forEach((item) => { item.style.order = ""; });
    }
  }

  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleMobileLayout, 100);
  });
  handleMobileLayout();

  const imgs = gsap.utils.toArray(".img-wrapper img");
  // Gentle Amlou themed color transitions that work with brown text
  const bgColors = ["#FAF3E8", "#FFFDF8", "#FDF5ED", "#EDE0CC"];

  ScrollTrigger.matchMedia({
    "(min-width: 769px)": function () {
      const mainTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: ".arch",
          start: "top top",
          end: "bottom bottom",
          pin: ".arch__right",
          scrub: true
        }
      });

      gsap.set(imgs, { clipPath: "inset(0)", objectPosition: "0px 0%" });

      imgs.forEach((_, index) => {
        const currentImage = imgs[index];
        const nextImage = imgs[index + 1] ? imgs[index + 1] : null;

        const sectionTimeline = gsap.timeline();

        if (nextImage) {
          sectionTimeline
            .to(currentImage, { clipPath: "inset(0px 0px 100%)", objectPosition: "0px 60%", duration: 1.5, ease: "none" }, 0)
            .to(nextImage, { objectPosition: "0px 40%", duration: 1.5, ease: "none" }, 0);
        }

        mainTimeline.add(sectionTimeline);
      });
    },
    "(max-width: 768px)": function () {
      const mbTimeline = gsap.timeline();
      gsap.set(imgs, { objectPosition: "0px 60%" });

      imgs.forEach((image, index) => {
        const innerTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: image,
            start: "top-=70% top+=50%",
            end: "bottom+=200% bottom",
            scrub: true
          }
        });

        innerTimeline
          .to(image, { objectPosition: "0px 30%", duration: 5, ease: "none" });

        mbTimeline.add(innerTimeline);
      });
    }
  });
}

// ── Init ─────────────────────────────────────────────
async function init() {
  // Draw first frame immediately for instant hero background
  const firstImg = new Image();
  firstImg.src = FRAME_PATH(1);
  firstImg.onload = () => {
    frames[0] = firstImg;
    drawFrame(0);
  };

  // Load all frames in background
  await loadFrames();

  // Draw first frame again in case resize happened
  drawFrame(0);

  // Boot animations
  initNavbar();
  initHeroIntro();
  initScrollFrames();
  initReveals();
  initWordReveal();
  initBenefitsAnimation();
  initArchProcessAnimation();
  initFooterAnimation();
}

import LocomotiveScroll from 'locomotive-scroll';

// ── Locomotive & Lenis Smooth Scrolling Bootstrap ────
const locomotiveScroll = new LocomotiveScroll({
  lenisOptions: {
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    gestureDirection: "vertical",
    smoothTouch: true,
    touchMultiplier: 2
  }
});

// Sync with GSAP ScrollTrigger
if (locomotiveScroll.lenisInstance) {
  locomotiveScroll.lenisInstance.on('scroll', ScrollTrigger.update);

  // To avoid conflict with locomotive's internal rAF and GSAP's ticker,
  // we just let locomotive run its rAF, but ensure ScrollTrigger updates on scroll.
}

init();
