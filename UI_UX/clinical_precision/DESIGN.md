---
name: Clinical Precision
colors:
  surface: '#FFFFFF'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#454655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757687'
  outline-variant: '#c5c5d8'
  surface-tint: '#3748e7'
  primary: '#001bca'
  on-primary: '#ffffff'
  primary-container: '#2d3fe0'
  on-primary-container: '#c5c9ff'
  inverse-primary: '#bdc2ff'
  secondary: '#525d80'
  on-secondary: '#ffffff'
  secondary-container: '#cad6ff'
  on-secondary-container: '#515c7f'
  tertiary: '#5200b5'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c22dd'
  on-tertiary-container: '#d8c4ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dfe0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000865'
  on-primary-fixed-variant: '#1328d1'
  secondary-fixed: '#dae2ff'
  secondary-fixed-dim: '#bac5ee'
  on-secondary-fixed: '#0d1a39'
  on-secondary-fixed-variant: '#3a4667'
  tertiary-fixed: '#eaddff'
  tertiary-fixed-dim: '#d2bbff'
  on-tertiary-fixed: '#25005a'
  on-tertiary-fixed-variant: '#5a00c6'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  status-success: '#059669'
  status-warning: '#D97706'
  status-danger: '#DC2626'
  text-primary: '#0F172A'
  text-muted: '#64748B'
  ai-accent: '#7C3AED'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
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
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.08em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  sidebar-width: 260px
  sidebar-collapsed: 72px
  gutter: 24px
  margin-desktop: 32px
  margin-mobile: 16px
  stack-dense: 8px
  stack-spacious: 24px
---

## Brand & Style

This design system is engineered for high-stakes medical environments where clarity, trust, and speed of information processing are paramount. The aesthetic follows a **Corporate / Modern** approach with a focus on clinical precision, drawing inspiration from high-end medical diagnostic software.

The visual language balances the "Cold" efficiency required by medical professionals with the "Warm" accessibility needed for patient interactions. Key brand attributes include:
- **Authority:** Deep navy and indigo tones establish a foundation of stability and institutional trust.
- **Intelligence:** A dedicated purple accent identifies AI-augmented insights, distinguishing machine logic from human diagnosis.
- **Clarity:** A high-contrast, density-optimized layout that prioritizes legibility under stress.
- **Organization:** A strict hierarchy of cards and status indicators to guide the clinician’s eye through complex data sets.

## Colors

The palette is anchored by **Deep Navy (#1E2A4A)** for structural navigation and **Blue-Indigo (#2D3FE0)** for primary actions, creating a traditional "Medical Professional" atmosphere. 

### Color Usage
- **Primary & Secondary:** Reserved for branding, global navigation, and high-priority calls to action.
- **AI Accent:** The Purple accent is restricted exclusively to AI-generated insights, automated screenings, and predictive data. It must never be used for standard UI elements.
- **Functional Colors:** Success, Warning, and Danger colors follow standard clinical triaging patterns. Use these for screening statuses (Normal vs. Severe).
- **Surface Strategy:** Use white surfaces against a light slate background to create clear containment for medical records and diagnostic images.

## Typography

This design system utilizes **Inter** for all roles to ensure maximum legibility and a systematic, utilitarian feel. 

- **Professional Density:** Use `body-sm` for data-heavy clinical tables and patient history logs to maximize screen real estate.
- **Patient Mode:** Switch to `body-lg` and `headline-md` for patient-facing interfaces or summary reports to improve readability and reduce anxiety.
- **Emphasis:** Utilize `label-caps` for section headers within cards and `label-bold` for table headers.

## Layout & Spacing

The layout uses a **Fixed-Fluid Hybrid** model. The sidebar remains fixed (with a toggle for collapse), while the main content area utilizes a 12-column fluid grid.

### Layout Principles
- **Clinical View:** Minimize vertical spacing (`stack-dense`) to allow doctors to see more data without scrolling. 
- **Patient View:** Increase margins and internal card padding (`stack-spacious`) to create a calm, approachable experience.
- **Breakpoints:**
  - **Desktop (1280px+):** Full sidebar, 12 columns.
  - **Tablet (768px - 1279px):** Collapsed sidebar, 8 columns.
  - **Mobile (<767px):** Mobile bottom-bar navigation, 4 columns, single-stack cards.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** rather than heavy shadows, maintaining a clean, medical-grade feel.

- **Level 0 (Background):** #F8FAFC. Used for the main application canvas.
- **Level 1 (Sidebar/Secondary Nav):** Deep Navy (#1E2A4A). Provides the strongest visual anchor.
- **Level 2 (Main Cards/Surfaces):** White (#FFFFFF). Uses a subtle, 4% opacity indigo-tinted shadow (0px 2px 4px) to separate patient records from the background.
- **Level 3 (Modals/Popovers):** Higher elevation with an 8% shadow and a 1px border (#E2E8F0) to ensure focus during critical data entry.

## Shapes

The shape language is **Rounded**, striking a balance between modern software aesthetics and the friendliness required for patient interaction.

- **Standard Elements:** 0.5rem (8px) for input fields, buttons, and status badges.
- **Containers:** 1rem (16px) for main content cards and patient profile headers.
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them clearly from interactive buttons.

## Components

### Buttons & Inputs
- **Primary Action:** Solid #2D3FE0 with white text.
- **AI Action:** Gradient or solid #7C3AED with a "sparkle" icon.
- **Inputs:** 1px border (#CBD5E1), turning #2D3FE0 on focus. Label text always uses `label-bold`.

### Status Badges (Pills)
- Use a light background (10% opacity of the status color) with high-contrast bold text for the label.
- *Example:* Approved uses light green background with #059669 text.

### Clinical Cards
- Cards must feature a 4px left-border accent to denote status (e.g., Red for severe, Green for normal).
- **AI Content Indicators:** Cards containing AI analysis must feature a #7C3AED left border and a small "AI" badge in the top-right corner.

### Navigation
- **Sidebar:** Vertical navigation with #1E2A4A background. Active states should use a subtle highlight or a primary-colored indicator bar on the left.
- **Data Tables:** Highly dense, using `body-sm`. Alternate row striping is encouraged for readability in long patient lists.