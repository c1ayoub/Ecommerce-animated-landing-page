# Task Plan: Optimize Animations & Text Reveals

1. [x] **Text Reveal Animation:** Create a text reveal effect (like line-by-line slide-up with clip) for the new `#problem` section heading and paragraphs.
2. [x] **Global Element Reactions:** Ensure every section/element has an entrance animation (e.g. adding `.reveal` classes to previously static elements like buttons, nav, footer items, etc.).
3. [x] **GSAP Stagger Updates:** Update `main.js` to handle line-by-line text reveals safely without premium GSAP plugins (using a basic wrapper or CSS `clip-path` sliding).
4. [x] **HTML Class Adjustments:** Update `index.html` to ensure elements like the "Morning Dilemma", Footer elements, and Product Titles have staggered entrance commands.
