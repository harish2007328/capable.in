# Implementation Plan - Logo & Wordmark Update

This plan outlines the steps taken to implement the new "capable" logo and wordmark.

## 1. Asset Creation
- Created `src/assets/logo.svg` containing the raw SVG path for the project icon.

## 2. Component Implementation
- Created `src/components/Logo.jsx`:
    - `LogoIcon`: A functional component for the SVG symbol.
    - `Logo`: A combined component that includes the icon and the "capable" wordmark.
    - Supports `color="white"` (default) and `color="dark"` variants.
    - Implements **Satoshi Medium** font and specific **letter-spacing** (+0.04em).

## 3. Font Integration
- Integrated **Satoshi** font from Fontshare in `index.html`.
- Updated `tailwind.config.js` to include `'Satoshi'` in the `sans` and `display` font families.

## 4. Brand Consistency
- Updated `Header.jsx` to use the new `Logo` component.
- Updated `Sidebar.jsx` to use the new `Logo` component.
- Renamed project title to "capable" in `index.html`.

## 5. Visual Specifications
- **Text**: "capable" (all lowercase).
- **Font**: Satoshi Medium.
- **Letter Spacing**: +0.04em (within the 20-40 tracking range).
- **Color**: White (with a dark variant for light backgrounds).
