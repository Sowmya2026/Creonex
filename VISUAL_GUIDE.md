# Creonex.viz Website - Visual Guide

## 🎨 Design System

### Color Palette

**Primary Colors:**
- Purple Gradient: `#667eea → #764ba2`
- Pink Gradient: `#f093fb → #f5576c`
- Blue Gradient: `#4facfe → #00f2fe`

**Background Colors:**
- Dark Background: `#0a0a0f`
- Card Background: `#13131a`
- Card Hover: `#1a1a24`

**Text Colors:**
- Primary Text: `#ffffff`
- Secondary Text: `#a0a0b8`
- Muted Text: `#6b6b80`

### Typography

**Fonts:**
- Headings: `Playfair Display` (serif)
- Body: `Outfit` (sans-serif)

**Font Sizes:**
- Hero Title: 2.5rem - 4.5rem (responsive)
- Section Title: 2rem - 3.5rem (responsive)
- Body Text: 1rem - 1.25rem

### Spacing System

- XS: 0.5rem (8px)
- SM: 1rem (16px)
- MD: 2rem (32px)
- LG: 4rem (64px)
- XL: 6rem (96px)

### Border Radius

- Small: 8px
- Medium: 16px
- Large: 24px
- Extra Large: 32px (pills)

## 📱 Sections Overview

### 1. Navigation Bar
- **Fixed position** at top
- **Glassmorphism effect** with backdrop blur
- **Mobile hamburger menu** for small screens
- **Smooth scroll** to sections
- **Active link highlighting**

### 2. Hero Section
- **Full viewport height**
- **Animated gradient orbs** floating in background
- **Gradient text effects** on key words
- **Feature pills** with icons
- **Dual CTA buttons** (primary + secondary)
- **Scroll indicator** at bottom

### 3. Customer Services
- **Three service cards** in grid layout
- **Featured card** (Wedding) with special styling
- **Hover effects** with elevation
- **Benefits grid** below cards
- **Glassmorphism cards** with borders

### 4. How We Work
- **3-step process** visualization
- **Numbered cards** with gradient numbers
- **Arrow indicators** between steps (desktop only)
- **Important note section** with warnings
- **Pink gradient** for note section

### 5. Brand Services
- **Premium card** with gradient header
- **Brand tags** for target audience
- **Collaboration section** with grid layout
- **Two-column feature** comparison
- **Hover animations** on all cards

### 6. Contact Section
- **Centered layout** with gradient background
- **Single focus card** for Instagram CTA
- **Instagram icon** with brand colors
- **Pink gradient button** for social link
- **Hover effects** with glow

### 7. Footer
- **Dark background** with border
- **Two-column layout** (brand + links)
- **Responsive** stacking on mobile
- **Copyright notice** with current year

## ✨ Interactive Features

### Animations

1. **Fade In Up** - Hero content on load
2. **Float Animation** - Gradient orbs continuously
3. **Wave Animation** - Greeting emoji
4. **Scroll Animations** - Sections fade in on scroll
5. **Parallax Effect** - Orbs move with scroll
6. **Hover Effects** - All interactive elements

### Transitions

- **Fast**: 0.2s (small interactions)
- **Normal**: 0.3s (most elements)
- **Slow**: 0.5s (complex animations)

### Hover States

- **Cards**: Translate up + border glow
- **Buttons**: Translate up + shadow increase
- **Links**: Underline animation
- **Pills**: Background brighten

## 📱 Responsive Breakpoints

### Desktop (1200px+)
- Full navigation menu
- Multi-column grids
- Large typography
- All animations enabled

### Tablet (768px - 1199px)
- Responsive grids
- Adjusted spacing
- Optimized font sizes

### Mobile (< 768px)
- Hamburger menu
- Single column layout
- Stacked elements
- Touch-optimized buttons
- Hidden process arrows

## 🎯 Key Features

### Performance
- ✅ GPU-accelerated animations (transform/opacity)
- ✅ Debounced scroll events
- ✅ Intersection Observer for lazy animations
- ✅ Preloaded critical fonts
- ✅ Optimized image loading

### Accessibility
- ✅ Semantic HTML5 elements
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Proper heading hierarchy

### SEO
- ✅ Meta descriptions
- ✅ Open Graph tags
- ✅ Semantic structure
- ✅ Descriptive titles
- ✅ Alt text ready

## 🛠️ Customization Guide

### Changing Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2);
    --dark-bg: #YOUR_DARK_COLOR;
    /* ... etc */
}
```

### Updating Content

All content is in `index.html`. Look for these sections:
- `<section id="home">` - Hero
- `<section id="services">` - Services
- `<section id="how-it-works">` - Process
- `<section id="brands">` - Brand Services
- `<section id="contact">` - Contact

### Adding New Sections

1. Add HTML section with unique ID
2. Add navigation link in navbar
3. Style in `styles.css`
4. Add to scroll observer in `script.js`

## 📊 Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Gradients | ✅ | ✅ | ✅ | ✅ |
| Backdrop Filter | ✅ | ✅ | ✅ | ✅ |
| CSS Grid | ✅ | ✅ | ✅ | ✅ |
| Flexbox | ✅ | ✅ | ✅ | ✅ |
| Smooth Scroll | ✅ | ✅ | ✅ | ✅ |
| Intersection Observer | ✅ | ✅ | ✅ | ✅ |

## 🚀 Performance Metrics

**Target Scores:**
- Lighthouse Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

**Optimization Tips:**
- Images should be WebP format
- Enable gzip compression
- Minify CSS/JS for production
- Use CDN for fonts
- Enable browser caching

## 📝 Content Guidelines

### Tone of Voice
- Professional yet friendly
- Creative and inspiring
- Clear and concise
- Action-oriented

### Writing Style
- Short paragraphs
- Bullet points for features
- Active voice
- Benefit-focused

---

**Last Updated:** December 2025
**Version:** 1.0.0
