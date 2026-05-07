# Emerald Reserve System - Design Specification

This document defines the visual language and component patterns for the Emerald Reserve student facility reservation platform.

## Brand Identity
**Emerald Reserve** represents smart stewardship and academic excellence. The visual direction is professional, clean, and trustworthy, utilizing a deep botanical green paired with vibrant emerald accents.

## Visual Tokens

### Colors
- **Primary (Deep Green):** `#0F2E2E` - Used for headers, footers, and high-contrast surfaces.
- **Accent (Emerald):** `#00C896` - Used for primary actions, success states, and key highlights.
- **Surface (Off-White):** `#F5F7F5` - The primary background color for a clean, non-glare reading experience.
- **Secondary Surface:** `#FFFFFF` - Used for cards and input fields.
- **Border:** `#E0E0E0` - Subtle separation for layout containers.
- **Text (Primary):** `#0F2E2E` - High-contrast text for maximum readability.
- **Text (Secondary):** `#4A4A4A` - Used for labels and supporting information.

### Typography
- **Typeface:** Satoshi (Sans-serif)
- **Headings:** Bold, tracking -2%, utilizing deep green for hierarchy.
- **Body:** Regular/Medium, optimized for legibility in dense form layouts.
- **Labels:** Semibold, uppercase for small-scale utility text.

### Shape & Rhythm
- **Corner Radius:** 12px (Standard), 24px (Large Containers/Hero).
- **Spacing System:** 8px base grid.
- **Max Width:** 1920px (Full screen) with content containers constrained for optimal readability.

## Core Components

### 1. Navigation
- **Top Bar:** Fixed, utilizing surface color with subtle border. Features product branding on the left and utility actions (search, notifications, profile) on the right.
- **Stepper:** A linear progress indicator used in multi-step flows (Reservations).

### 2. Forms & Inputs
- **Custom Time Input:** Direct text entry for reservation windows with system-level availability validation.
- **Document Upload:** Drag-and-drop zone with list-view for uploaded assets.
- **Action Buttons:** Large, rounded (12px), utilizing the Emerald accent color.

### 3. Cards
- **Facility Card:** Features high-quality imagery, capacity metadata, and a secondary action for details.
- **Reservation Card:** Single-column layout for history, emphasizing status badges (Verified, Pending, Rejected).

### 4. Status Badges
- **Verified:** Emerald background with dark text.
- **Pending:** Neutral grey background.
- **Rejected/Action Required:** Soft red/amber alerts.
