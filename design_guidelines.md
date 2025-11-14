# Design Guidelines: URL Shortener with Analytics & QR Codes

## Design Approach

**System Selected:** Fluent Design / Modern Dashboard Pattern  
**Justification:** Utility-focused productivity tool requiring clarity, efficiency, and data visualization. Drawing inspiration from tools like Bitly, Linear, and Vercel's dashboard patterns.

**Core Principles:**
- Data-first clarity over visual flourish
- Instant comprehension of metrics and status
- Efficient workflows for creating and managing URLs
- Professional, trustworthy aesthetic

---

## Typography

**Font Stack:** Inter (via Google Fonts)
- **Headings:** 600-700 weight, sizes: 2xl (dashboard), xl (sections), lg (cards)
- **Body:** 400-500 weight, base size
- **Data/Metrics:** 500-700 weight (for emphasis), mono for codes/URLs
- **Small text:** sm for labels, metadata

---

## Layout System

**Spacing Units:** Tailwind 2, 4, 6, 8, 12, 16 for consistency
- Component padding: p-6 to p-8
- Section gaps: gap-6 to gap-8
- Card spacing: p-6
- Form fields: space-y-4

**Container Structure:**
- Max width: max-w-7xl
- Dashboard grid: 12-column responsive layout
- Two-column split for create/preview sections

---

## Component Library

### 1. Dashboard Header
- Logo/brand left-aligned
- Primary action button (+ Create Short URL) prominently placed top-right
- User profile/settings icon far right

### 2. URL Creation Card (Primary Feature)
- Prominent card at top of dashboard
- Form fields stacked vertically on mobile, horizontal on desktop
- Input for destination URL (full width)
- Optional custom slug input with domain prefix shown
- Generate QR Code toggle switch
- Large primary CTA button
- Live preview of generated short URL below form

### 3. URL List/Table View
- Table with columns: Short URL (clickable), Destination, Clicks, Created, Actions
- Copy button integrated into each row
- QR code icon button for quick access
- Delete/edit actions on hover
- Search/filter bar above table
- Pagination at bottom

### 4. Analytics Cards (3-column grid on desktop)
- Total URLs created
- Total clicks (all-time)
- Clicks today
- Large number display with small label underneath

### 5. Individual URL Detail Panel
- Triggered by clicking a short URL from table
- Two-column layout: Left (URL info + QR), Right (Analytics chart)
- URL metadata: creation date, destination, short code
- QR code display with download button
- Click analytics: line chart showing clicks over time
- Referrer sources table
- Geographic data (if tracked)

### 6. QR Code Component
- Square display (256x256px default)
- Download button directly below
- Format options: PNG, SVG (button group)
- Clean border around QR code

### 7. Empty States
- Centered icon + message when no URLs exist
- Clear CTA to create first URL
- Simple, encouraging tone

---

## Navigation Structure

**Single-page dashboard layout:**
- All URLs list (default view)
- Click URL to see detailed analytics
- Modal or slide-over panel for URL creation
- No complex navigation needed

---

## Responsive Behavior

**Mobile (base):**
- Stack all columns to single column
- Table converts to card-based list
- Analytics cards stack vertically
- Creation form full-width

**Tablet (md):**
- 2-column analytics grid
- Condensed table view

**Desktop (lg+):**
- Full 3-column analytics
- Full table with all columns
- Side-by-side creation/preview

---

## Form Design

**Input Fields:**
- Clear labels above inputs
- Placeholder text for guidance
- Subtle border, focus state with ring
- Error states with red border + message below
- Success states with green border

**Buttons:**
- Primary: Bold, full-width on mobile, auto-width on desktop
- Secondary: Outlined style for copy/download actions
- Danger: For delete actions (red treatment)

---

## Data Visualization

**Click Analytics Chart:**
- Line chart with gradient fill
- X-axis: Time (last 7/30 days toggle)
- Y-axis: Click count
- Hover tooltips for precise values
- Use charting library (Chart.js or similar)

**Metrics Display:**
- Large numbers (3xl-4xl font size)
- Small labels underneath
- Icon paired with each metric
- Subtle background card

---

## Key Interactions

- Smooth transitions between list and detail views
- Instant copy-to-clipboard feedback (toast notification)
- QR code appears immediately when URL is created
- Real-time URL validation in creation form
- Hover states on table rows
- Click tracking updates in real-time (if using WebSocket/polling)

---

## Icons

**Library:** Heroicons (via CDN)
- Link icon for URLs
- Chart icon for analytics
- QR code icon
- Copy icon
- Download icon
- Trash icon for delete
- External link icon

---

## Accessibility

- Keyboard navigation for table rows
- Focus indicators on all interactive elements
- ARIA labels for icon buttons
- Screen reader announcements for copy success
- High contrast text for readability

---

## Images

**No hero image needed** - This is a utility dashboard, not a landing page. Focus entirely on functional UI components and data display.