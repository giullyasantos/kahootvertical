# Neobrutalist Design System

## 🎨 Complete Visual Overhaul

### Design Identity
**Bold. Brutal. Bright.**
- Background: `#F7D043` (bright yellow)
- Text: `#000000` (pure black)
- Cards: White with 4px solid black borders
- Shadows: `4px 4px 0px #000` (offset, not blur)
- Font: **Bricolage Grotesque** (bold weights: 700-800)
- NO gradients, NO glassmorphism, NO glows

### Typography
- Font Family: Bricolage Grotesque
- Weights: 400, 600, 700, 800
- Primary text: Black (#000)
- Font weight: Bold (700) for body, Black (800) for headings
- All text: UPPERCASE for emphasis
- Text shadows: `6px 6px 0px rgba(0,0,0,0.15)` for large titles

### Color Palette
- **Primary**: Black (#000000)
- **Background**: Yellow (#F7D043)
- **Surface**: White (#FFFFFF)
- **Accent**: Purple (sparingly, only for highlights if needed)
- **Error**: Red background (#FEE2E2) with black text
- **Success**: Keep answer colors (red/blue/yellow/green)

### Layout Principles
- **Generous spacing**: 32px+ padding inside cards
- **Tall inputs**: 56px+ height (py-6)
- **Large text**: 2xl+ for body, 5xl+ for headings
- **Breathing room**: space-y-6 to space-y-8 between elements
- **Max widths**: max-w-lg for forms, max-w-3xl for content

## 🏗️ Component System

### Cards
```tsx
className="brutal-card p-10" 
// = white bg + 4px black border + 6px 6px 0px black shadow + rounded-xl
```

### Buttons
```tsx
// Primary (Black bg, white text)
className="brutal-btn bg-black text-white py-6 px-10 rounded-xl text-2xl font-black uppercase"

// Secondary (White bg, black text)
className="brutal-btn bg-white text-black py-6 px-10 rounded-xl text-2xl font-black uppercase"

// Hover behavior:
// - translate(2px, 2px) + reduce shadow to 2px 2px
// Active: translate(4px, 4px) + shadow to 0px
```

### Inputs
```tsx
className="brutal-input w-full text-2xl font-bold px-8 py-6 rounded-xl uppercase"
// = white bg + 3px black border + 3px 3px 0px black shadow
// focus: shadow increases to 4px 4px 0px
```

### Shadows
```css
.brutal-shadow: 4px 4px 0px #000
.brutal-shadow-lg: 6px 6px 0px #000
.brutal-shadow-xl: 8px 8px 0px #000
```

### Borders
```css
.brutal-border: 3px solid #000
.brutal-border-thick: 4px solid #000
```

## ✅ Pages Complete

### 1. Landing Page (/)
**Features:**
- Yellow background (#F7D043)
- Massive black title: "MINISTRY GAME" (text-8xl/9xl, font-black)
- Text shadow for depth
- Two large buttons:
  - "SER HOST" - black bg, white text
  - "ENTRAR NO JOGO" - white bg, black text
- Both with brutal shadows + hover/active states
- Uppercase everything
- Generous spacing (space-y-16)

### 2. Join Page (/join)

**Enter Code Step:**
- White card with brutal shadow
- Title: "ENTRAR" (text-5xl, font-black, uppercase)
- Code input: massive (text-6xl), centered, tracking-widest
- Name input: large (text-2xl), uppercase placeholder
- Error: red background card with shake animation
- Continue button: black bg, full width
- All inputs have brutal-input styling (56px+ height)
- 40px+ padding inside card

**Team Selection Step:**
- Same card styling
- Player name shown with underline decoration (decoration-4)
- Team cards in grid:
  - White backgrounds
  - 8px emoji (text-7xl)
  - 3xl team name
  - Brutal borders + shadows
  - Hover: scale up + lift + yellow background
- Create team form:
  - Nested white card inside main card
  - Emoji grid (5 columns)
  - Selected emoji: black background with shadow + scale
  - Large touch targets (p-6 on emoji buttons)
- All text uppercase

## 🎬 Animations

### Implemented
```css
/* Shake for errors */
@keyframes shake {
  0%, 100% { translateX(0) }
  25% { translateX(-8px) }
  75% { translateX(8px) }
}

/* Pop-in for cards */
@keyframes pop-in {
  0% { opacity: 0; scale: 0.8; translateY(20px) }
  100% { opacity: 1; scale: 1; translateY(0) }
}

/* Count up for scores */
@keyframes count-up {
  from { opacity: 0; translateY(20px); scale: 0.9 }
  to { opacity: 1; translateY(0); scale: 1 }
}

/* Bounce */
@keyframes bounce {
  0%, 100% { translateY(0) }
  50% { translateY(-10px) }
}
```

### Framer Motion
- Page entrances: `initial={{ opacity: 0, y: 30 }}` → `animate={{ opacity: 1, y: 0 }}`
- Button interactions: `whileHover={{ scale: 1.02 }}` + `whileTap={{ scale: 0.98 }}`
- Staggered team cards: `transition={{ delay: index * 0.1 }}`
- Error exit animations: AnimatePresence

## 🎯 Pending Pages

### Host Pages (3)
- [ ] `/host` - Create room dashboard
- [ ] `/host/lobby` - Room code display + team columns
- [ ] `/host/game` - Quiz telão (2x2 answer grid, circular timer)
- [ ] `/host/roulette` - Name wheel, scoring buttons

### Player Pages (2)
- [ ] `/play` - Quiz screen (4 full-width answer buttons)
- [ ] `/play-roulette` - Difficulty wheel, superpower buttons

## 📐 Spacing Scale

```
Padding inside cards: p-10 (40px)
Button padding: py-6 px-10 (24px 40px)
Input padding: px-8 py-6 (32px 24px)
Stack spacing: space-y-8 (32px)
Grid gaps: gap-6 (24px)
```

## 🎨 Design Rules

### DO ✅
- Use uppercase for all important text
- Bold weights only (700-800)
- 4px black borders everywhere
- Offset shadows (no blur)
- Large touch targets (56px+ height)
- Generous padding (32px+)
- White cards on yellow background
- Black or white buttons only

### DON'T ❌
- No gradients
- No glassmorphism
- No glows or blur shadows
- No rounded-full (use rounded-xl max)
- No small text (18px minimum)
- No tight spacing
- No dark backgrounds
- No purple except as minor accent

## 🚀 Implementation Status

**Completed:**
- ✅ Global CSS with neobrutalist utilities
- ✅ Font: Bricolage Grotesque loaded
- ✅ Landing page redesigned
- ✅ Join page (both steps) redesigned
- ✅ Build passing

**Next:**
- Host pages (3)
- Player pages (2)
- Roulette wheel graphic
- Confetti effects
- Score count-up animations

---

**Visual Identity:** Bold, brutal, high-energy. Every element demands attention.
**Target:** Awwwards-worthy neobrutalist design.
