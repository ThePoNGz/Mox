# Mox Design Language: "Atmospheric Precision"

> **Version 1.0** — Living document based on visual references.
> **Core Aesthetic**: A synthesis of soft organic "glass" interfaces and raw industrial/technical precision.

## 1. Design Philosophy
The Mox interface exists at the intersection of **Tool** and **Object**.
- **Atmospheric**: It is not just "flat UI". It occupies space. Depth is conveyed through blurring (glassmorphism), layering, and soft light simulation rather than heavy drop shadows.
- **Precision**: Contrasting the softness are "machine-like" elements—pixelated fonts, tick marks, rulers, and monospaced data—reminding the user that this is a high-accuracy instrument.

---

## 2. Color System: "Void & Vapor"

The system is primarily **monochromatic**, relying on value (light/dark) differences rather than hue to separate layers.

### 2.1. Dark Mode ("The Void") — *From Set 1*
Used for deep focus, night usage, or "Pro" contexts.
| Token | Hex | Role |
| :--- | :--- | :--- |
| `bg-void` | `#000000` | True black background. Infinite depth. |
| `bg-cinder` | `#24292e` | Primary surface. Sidebars, sheets. |
| `bg-chimney`| `#4a5156` | Elevated surface. Cards, inputs. |
| `text-mist` | `#bdc7ce` | Primary text. High legibility but not harsh white. |
| `text-ash` | `#808a92` | Secondary text. Metadata, labels. |

### 2.2. Light Mode ("The Vapor") — *From Set 2*
Used for clarity, day usage, and "Airy" contexts.
| Token | Hex | Role |
| :--- | :--- | :--- |
| `bg-snow` | `#F9F9FB` | Off-white background. Not blinding white. |
| `bg-fog` | `#EBECEC` | Surface layer. Cards with soft transparency. |
| `bg-smoke` | `#DCDDDF` | Interactive elements, pressed states. |
| `text-coal` | `#1A1A1A` | Primary text. Stark contrast. |
| `text-stone` | `#888888` | Secondary text. |

### 2.3. Functional Accents ("The Spark")
Small, intentional splashes of color used strictly for **status** or **active states**. Never decorative.
- **Signal Orange**: `#FF5500` (Notification dots, "Urgent", Selection markers).
- **Bio Yellow**: `#D8E639` or `#FEE951` (Toggles, "Active" states, positive confirmation).
- **Electric Blue**: `#007AFF` (Links, classic interactive elements — *use sparingly*).

---

## 3. Surface Materials

We do not use solid colors alone. We use "materials" that define how light interacts with the UI.

### 3.1. "Aerogel" (Glass)
Used for floating panels, modals, and sticky headers.
- **Effect**: `backdrop-filter: blur(20px)`
- **Opacity**: 70-85%
- **Border**: 1px inner stroke `rgba(255,255,255, 0.08)` (Dark) or `rgba(0,0,0, 0.04)` (Light).
- **Feel**: "Frosted", physical, tangible.

### 3.2. "Machined Metal" (Solid)
Used for the main canvas and base cards.
- **Texture**: Smooth matte.
- **Border**: None or excessively subtle (`border-width: 0.5px`).
- **Shadow**: `0px 4px 24px rgba(0,0,0,0.06)` (Very diffused, purely for lift).

---

## 4. Typography: "Human vs. Machine"

We use two distinct typefaces to separate **content** from **data**.

### 4.1. Primary: The Human (Sans-Serif)
For readable content (titles, body text, buttons).
- **Family**: `Inter`, `Geist Sans`, or `SF Pro`.
- **Characteristics**: Neutral, highly legible, variable weight.
- **Usage**: 90% of the UI.

### 4.2. Secondary: The Machine (Pixel / Mono)
For technical metadata (dates, coordinates, values, decorative headers).
- **Family**: `Geist Mono`, `JetBrains Mono`, or a pixel font (like *W95FA* or *Departure Mono*).
- **Characteristics**: Raw, technical, "digital artifact".
- **Usage**:
    - Large decorative numbers (e.g., the "17" or "60%" in Set 2).
    - Status labels (e.g., "EQUALISER", "BASS").
    - Tiny metadata (timestamps, version numbers).

---

## 5. Shape Language & Layout

### 5.1. The "Super-Ellipse" (Squircle)
- **Radius**: generous rounding.
    - Outer containers: `24px` - `32px`.
    - Inner cards: `12px` - `16px`.
    - Buttons: `999px` (Pills).
- **Philosophy**: Organic softness housing digital logic.

### 5.2. "Technical Ornamentation"
To prevent the "soft" look from becoming too generic, we add "instrument" details:
- **Rulers & Scales**: Tick marks along edges (image 4).
- **Barcodes**: Stylized vertical lines for data density.
- **Grids**: Faint background grids (`opacity: 0.03`) to imply structure.
- **Dot Matrix**: Dotted patterns for textures.

### 5.3. Layout Physics
- **Floating**: Elements rarely touch the edges of the screen. They "float" with padding (`16px` or `20px` margins).
- **Bento Grids**: Content is compartmentalized into self-contained blocks (rectangles of various sizes).

---

## 6. Interaction & Motion
- **Feedback**: Instant, snappy response to touch.
- **Transition**: `spring(damping: 20, mass: 1)` — Physics-based. No linear tweens.
- **Micro-interactions**:
    - Buttons scale down slightly (`0.96`) on press.
    - Glass surfaces "shimmer" or brighten slightly on hover.

---

## 7. Component Spec (Examples)

### The "Control Pill" (Toggle/Button)
- **Shape**: Full radius (Capsule).
- **Bg**: `bg-smoke` (Inactive) -> `Accent Color` (Active).
- **Icon**: Minimal line icon.

### The "Data Card"
- **Bg**: `bg-fog` (Light) or `bg-cinder` (Dark).
- **Border**: 1px subtle stroke.
- **Content**:
    - Label in *Mono* (uppercase, small).
    - Value in *Sans* (Huge, bold).
    - Visual: A graph curve or progress bar at the bottom.
