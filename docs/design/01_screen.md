---
name: Ride Connect
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 20px
  touch-target: 48px
---

## Brand & Style
The design system for this product centers on a "Premium Utility" narrative, bridging the gap between Material Design 3’s functional logic and Apple’s Human Interface Guidelines' aesthetic refinement. The brand personality is dependable, frictionless, and sophisticated, targeting urban commuters and professional drivers who require high-performance tools that feel luxurious yet accessible.

The visual style is **Modern/Minimalist with Glassmorphic accents**. It prioritizes high-clarity layouts, generous whitespace, and tactile feedback to ensure the mobile-first experience feels native and responsive. The interface evokes a sense of "calm efficiency" through a strictly organized hierarchy and soft, intentional depth.

## Colors
The palette is anchored by a pristine **White (#FFFFFF)** background to maintain a high-end, airy feel. **Primary Blue (#2563EB)** is used surgically for action-oriented elements and brand recognition, while **Success Green** and **Warning Amber** provide semantic clarity for status updates. 

**Subtle Gray (#F3F4F6)** serves as the "Surface" color, used to distinguish secondary containers from the main canvas. For text, use a deep slate (near-black) for high legibility, avoiding pure black to reduce eye strain. Gradients are prohibited, except within glassmorphic background blurs where subtle translucency is required.

## Typography
This design system utilizes **Inter** across all levels to leverage its exceptional legibility and neutral, modern character. 

- **Headlines:** Use tight letter spacing and bold weights to create a strong visual anchor.
- **Body Text:** Standard weight (400) with generous line-height ensures high readability during movement (in-vehicle use).
- **Labels:** Uppercase application is reserved for micro-copy and utility labels to create contrast without increasing font size.
- **Scaling:** On mobile devices, `headline-lg` should automatically scale down to `headline-lg-mobile` to prevent awkward line breaks.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for one-handed mobile usage. A 4px base unit governs all dimensions, ensuring a rhythmic mathematical balance.

- **Margins:** 20px side margins provide a safe area for thumb placement.
- **Touch Targets:** All interactive elements (buttons, toggles, links) must maintain a minimum height/width of 48px.
- **Stacking:** Elements are stacked vertically with `16px` (md) gaps for secondary info and `24px` (lg) gaps for primary section breaks.
- **Safe Areas:** Navigation and critical actions are placed within the "Natural Thumb Zone" (bottom 60% of the screen).

## Elevation & Depth
Hierarchy is established through **Ambient Shadows** and **Glassmorphism**. 

- **Level 0 (Background):** Solid White.
- **Level 1 (Cards):** Subsurface Gray (#F3F4F6) or White with a very soft, diffused shadow (Blur: 20px, Y: 4, Opacity: 4% Black).
- **Level 2 (Glassmorphic):** Used for persistent elements like the Bottom Navigation Bar or active floating cards. Apply a `backdrop-filter: blur(12px)` with a semi-transparent white fill (Alpha: 80%) and a 1px inner border (Alpha: 10% White) to simulate a physical edge.
- **Transitions:** Elevation should increase visually during "Press" states through subtle scale-down (98%) rather than shadow deepening.

## Shapes
The shape language is defined by **Soft/Rounded Geometry**. 

Standard UI components like inputs and small buttons use a 0.5rem (8px) radius. However, core layout containers and cards utilize **rounded-xl (24px)** or **rounded-lg (16px)** to mirror the hardware curvature of modern smartphones. This continuity between software and hardware creates a more immersive, premium feel.

## Components
- **Buttons:** Primary buttons are 56px high (Large) with `rounded-lg` corners and a solid Primary Blue fill. Labels are centered, semi-bold.
- **Cards:** Modern cards feature a 1px subtle border (#E5E7EB) and 20px internal padding. Glassmorphic cards are reserved for floating map overlays.
- **Inputs:** Text fields use a light gray background (#F3F4F6) with 0px borders in rest state, transitioning to a 2px Primary Blue border on focus.
- **Icons:** Use 24px line icons with a 2px stroke weight. Icons should be monochrome (Slate 500) until active, where they adopt the Primary Blue.
- **Animations:** 
    - *Page Transitions:* 300ms Slide-up with a subtle Fade-in.
    - *Interactions:* 150ms "Squish" effect on button press.
    - *Feedback:* Toggles use a spring-physics slide for a tactile feel.
- **Bottom Navigation:** A persistent, glassmorphic bar containing Home, Vehicle, QR (prominent center action), Location, and Profile.