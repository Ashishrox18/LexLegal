# LexAI Accessibility — WCAG 2.1 AA Compliance

## Compliance Checklist

- [x] **Skip to Main Content Link**: First focusable element in `app/layout.tsx` pointing to `#main-content`.
- [x] **Prefers-Reduced-Motion**: Overrides all CSS animations and Framer Motion transitions when `prefers-reduced-motion: reduce` is detected in OS/browser.
- [x] **Visible Focus Indicators**: Custom `:focus-visible` styles with 2px solid primary outline and offset across interactive elements.
- [x] **Screen Reader Support**: `aria-live="polite"` on loading containers, `aria-busy="true"` on dynamic cards, `role="alert"` on error banners.
- [x] **Form Labels**: All `<textarea>` and `<input>` elements have explicit `<label htmlFor="...">` associations.
- [x] **ARIA Roles & States**:
  - `RiskGauge`: `role="img"` + descriptive `aria-label="Risk score: X out of 100"`.
  - Filter Tabs: `role="tablist"`, `role="tab"`, `aria-selected`.
  - Accordions: `aria-expanded` toggles on legal excerpts.
- [x] **Contrast Ratio**: Meets minimum 4.5:1 contrast for normal text and 3:1 for large display headings on dark theme backgrounds.
- [x] **Color Neutrality**: Red, yellow, and green flags are always paired with text badges ("Red Flag", "Yellow Flag", "Green Protection") and distinct icons.

---

## Testing Tools
- **Automated**: `jest-axe` integration scans key pages (`landing`, `decode`, `prepare`).
- **Keyboard Navigation**: Verified full keyboard accessibility via `Tab`, `Shift+Tab`, `Enter`, and `Space`.
- **Screen Reader**: Spot-checked with macOS VoiceOver.
