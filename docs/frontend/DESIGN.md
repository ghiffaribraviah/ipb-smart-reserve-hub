---
name: Emerald Reserve System
colors:
  surface: '#f9f9f7'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#414848'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#717878'
  outline-variant: '#c1c8c7'
  surface-tint: '#466463'
  primary: '#001919'
  on-primary: '#ffffff'
  primary-container: '#0f2e2e'
  on-primary-container: '#789696'
  inverse-primary: '#adcdcc'
  secondary: '#006c47'
  on-secondary: '#ffffff'
  secondary-container: '#8bf5bd'
  on-secondary-container: '#00714a'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#d1a522'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c8e9e8'
  primary-fixed-dim: '#adcdcc'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#2e4c4c'
  secondary-fixed: '#8ef7c0'
  secondary-fixed-dim: '#71dba5'
  on-secondary-fixed: '#002112'
  on-secondary-fixed-variant: '#005234'
  tertiary-fixed: '#ffdf94'
  tertiary-fixed-dim: '#efc13e'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#f9f9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
typography:
  h1:
    fontFamily: Satoshi
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Satoshi
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  h3:
    fontFamily: Satoshi
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Satoshi
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Satoshi
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Satoshi
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Satoshi
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is rooted in the "Smart, Reliable, and Sustainable" ethos. It balances institutional trust with modern environmental consciousness. The visual style follows a **Corporate / Modern** aesthetic with subtle **Minimalist** influences, prioritizing clarity and ease of use for facility management and reservation workflows. 

The interface should feel airy and organized, using generous whitespace and high-quality photography of architectural spaces. The tone is professional yet approachable, utilizing organic curves and a harmonious green-centric palette to evoke a sense of "growth" and "smart stewardship."

## Colors

The palette is anchored by **Dark Emerald (#0F2E2E)**, providing a sophisticated and deep foundation for typography and structural elements. **Mint Green (#2F9E6E)** serves as the primary action color, symbolizing vitality and sustainability.

**Forest Green (#1E5E4E)** is used for mid-tone surfaces and hover states to provide depth. The **Amber Accent (#F4C542)** is reserved for high-visibility highlights, such as "Pending" statuses or specific call-to-action indicators, ensuring they stand out against the dominant greens. The background uses a soft, off-white **Neutral (#F7F7F5)** to reduce eye strain compared to pure white.

## Typography

The design system exclusively utilizes **Satoshi**. Its geometric structure and high x-height offer exceptional legibility for both dense data tables and large-scale marketing headlines. 

- **Headlines:** Use Bold weights for H1 and H2 to establish strong hierarchy. Apply slight negative letter spacing for headlines to maintain a compact, modern feel.
- **Body Text:** Use Regular weight for primary content. The line height is set to 1.6 to ensure comfortable reading of campus policies or space descriptions.
- **Labels:** Use Medium or Bold weights in smaller sizes for UI labels, tags, and status indicators.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop (12 columns) and a fluid model for mobile. A 4px baseline grid ensures vertical rhythm across all components.

Layouts should prioritize "Safe Zones"—large internal paddings within cards and containers to maintain a clean, uncluttered look. Margins between major sections should be 48px (xl) to allow the content to breathe, while internal component spacing should stay within the 8px to 16px range.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and extremely soft **Ambient Shadows**. 

- **Surface Levels:** The primary background is the off-white neutral. Cards and modals sit one "level" up using pure white (#FFFFFF). 
- **Shadows:** Avoid harsh, black shadows. Use a deep emerald tint for shadows (e.g., #0F2E2E at 4-8% opacity) with a large blur radius (12px - 24px) to create a soft, natural lift.
- **Depth through Color:** Dark Emerald can be used as a high-contrast background for sections like footers or navigation sidebars to visually anchor the layout.

## Shapes

The shape language is defined by **Rounded** edges that mirror the organic "leaf" and "circle" motifs in the brand's graphic elements. 

Standard components (buttons, input fields) use a 0.5rem (8px) radius. Larger containers, such as feature cards or modal windows, should use the 1rem (16px) `rounded-lg` setting. For specialized elements like search bars or primary "Pill" buttons, the 1.5rem `rounded-xl` setting should be used to emphasize a friendly, accessible feel.

## Components

- **Buttons:** Primary buttons use Mint Green with white text. Secondary buttons use a Dark Emerald outline or a subtle grey-fill background. All buttons should have a minimum height of 44px for accessibility.
- **Chips/Tags:** Used for status (Available, Booked, Pending). "Available" uses a Mint Green background; "Pending" uses the Amber Accent; "Booked" uses a neutral dark grey.
- **Cards:** Cards should feature a white background, 16px border radius, and a subtle emerald-tinted shadow. Content inside cards should have 24px of padding.
- **Input Fields:** Search bars and text inputs use a light grey stroke (#E0E0E0) that shifts to Mint Green on focus. Icons (like the search magnifying glass) should be Dark Emerald.
- **Navigation:** Bottom navigation for mobile or top-bar navigation for web uses Dark Emerald backgrounds with Mint Green for active states, incorporating rounded "indicator" backgrounds for the active icon.
- **Lists:** Reservation lists should use clear dividers or alternating light-grey row tints to separate data points clearly without adding visual noise.