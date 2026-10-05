# 🏃‍♂️ Nike Motion 01 — The Shoe in Motion

An immersive, scroll-driven 3D sneaker experience built with React, Three.js, and GSAP. Watch the shoe come alive through cinematic storytelling, real-time 3D rendering, and buttery-smooth scroll animations.

![Nike Motion 01](https://img.shields.io/badge/Nike-Motion_01-FF4D1C?style=for-the-badge&logo=nike)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-0.186-000000?style=for-the-badge&logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)

## ✨ Features

### 🎬 Cinematic Scroll Experience
- **8 Distinct Chapters** — Hero, Motion, Anatomy, Material, Speed, Athlete, Product, Final
- **Pin & Scrub Animations** — GSAP ScrollTrigger orchestrates every frame
- **Lenis Smooth Scroll** — Buttery 60fps scroll with velocity-reactive elements

### 🎨 Live 3D Shoe
- **Real-time WebGL Rendering** — Three.js + React Three Fiber
- **3 Material Variants** — Midnight, Street, Beach (KHR_materials_variants)
- **Interactive Color Swapping** — Instant material changes
- **Horizontal Clipping Planes** — Anatomical layer explosion effect
- **Demand Rendering** — Only renders when visible (performance optimized)

### 🎞️ Frame Sequence Animation
- **72 Baked Frames** — Rendered on-device or pre-loaded
- **Canvas-based Playback** — Scroll-driven 360° product rotation
- **Adaptive Quality** — Lower frame count on mobile devices

### 💎 Premium UI/UX
- **Frosted Glass Cards** — Backdrop blur + subtle shadows
- **Magnetic Buttons** — GSAP quickTo for smooth cursor following
- **Custom Cursor** — Mix-blend-mode difference effect
- **Velocity-Driven Typography** — Text skews and blurs with scroll speed
- **Responsive Design** — Mobile-first, works on all devices

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19.2.6 + TypeScript |
| **3D Engine** | Three.js 0.186 + React Three Fiber 9.7 |
| **Animation** | GSAP 3.15 + ScrollTrigger |
| **Smooth Scroll** | Lenis 1.3 |
| **Styling** | Tailwind CSS 4.1 |
| **Build Tool** | Vite 7.3 |
| **Fonts** | Anton, Archivo, JetBrains Mono |

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/R0han2906/immersive-sneaker-brand-experience.git
cd immersive-sneaker-brand-experience

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## 📂 Project Structure

```
src/
├── components/
│   ├── hero/          # Hero section with animated titles
│   ├── navigation/    # Fixed navigation bar
│   ├── product/       # Interactive product configurator
│   ├── sections/      # All scroll sections (Motion, Anatomy, etc.)
│   ├── three/         # WebGL components (ShoeStage, ShoeRig)
│   └── ui/            # Reusable UI components
├── hooks/             # Custom React hooks (Lenis, Magnetic, ImageSequence)
├── lib/
│   ├── animations/    # GSAP setup and keyframe definitions
│   ├── three/         # 3D utilities (load shoe, bake sequence, environment)
│   └── sequence/      # Frame sequence management
└── utils/             # Helper functions

```

## 🎯 Key Concepts

### Motion State Architecture
A **single mutable `motion` object** bridges React, GSAP, and Three.js without React state updates in hot paths:

```typescript
// ScrollTrigger writes
motion.hero = progress;
motion.anatomy = progress;

// useFrame reads every RAF
const target = samplePose(motion.hero);
group.position.lerp(target.position, damping);
```

### Demand Rendering
The WebGL canvas only renders when visible:

```typescript
if (motion.stage === 'hidden' && !motion.focused) {
  // Stop rendering after 900ms
}
```

### Scroll-Driven Frames
The Motion section drives a canvas sequence via ScrollTrigger progress:

```typescript
onUpdate: (self) => {
  const frameIndex = Math.round(self.progress * (frames.length - 1));
  drawFrame(frameIndex);
}
```

## 🎨 Color Palette

```css
--color-ink: #0a0a0a      /* Deep black backgrounds */
--color-bone: #f2f0eb     /* Cream white text */
--color-ember: #ff4d1c    /* Nike-inspired accent */
--color-smoke: #8a8a86    /* Subtle gray */
--color-graphite: #161616 /* Dark gray */
```

## 🖼️ Assets

- **3D Model**: [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) — MaterialsVariantsShoe
- **Photography**: [Pexels](https://pexels.com) — Free stock photos
- **Fonts**: [Google Fonts](https://fonts.google.com)

## 🙏 Credits

- **3D Model**: © 2021 Shopify — CC-BY 4.0
- **Inspiration**: Nike product design philosophy
- **Photography**: Pexels contributors (see footer credits)

## ⚠️ Disclaimer

This is an **independent concept project** inspired by Nike. Not affiliated with, endorsed by, or produced for Nike, Inc. All product names, specifications, and prices are fictional. Created for educational and portfolio purposes.

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Portfolio**: [Your Portfolio]
- **GitHub**: [@R0han2906](https://github.com/R0han2906)

---

**Built with ❤️ by Rohan**

*Engineered to move.*
