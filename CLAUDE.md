# Constellation

Interactive 3D portfolio graph built with Next.js 15, React Three Fiber v9, and Three.js r172.

## Tutorials

### Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. You'll see a hub-and-spoke 3D graph with example placeholder nodes radiating outward in three tiers.

### Adding a new project

1. Open `src/data/graph.ts`
2. Add a node to the `nodes` array:
   ```ts
   {
     id: "my-project",
     label: "My Project",
     type: "project",          // project | studio | studio-project
     description: "Short tagline",
     fullDescription: "Longer bio paragraph",
     role: "Creator",
     period: "2024 — Present",
     github: "https://github.com/...",
     url: "https://...",        // optional website
     image: "https://github.com/org.png", // avatar (GitHub, favicon, or local)
     parentId: "me",            // connects to center node
     tags: ["Tag1", "Tag2"],
   }
   ```
3. Add an edge to the `edges` array:
   ```ts
   { source: "me", target: "my-project", distance: 1 }
   ```
4. The graph updates on save via HMR.

### Adding a studio with sub-projects

1. Add the studio node (type `"studio"`, parentId = center node id)
2. Add sub-project nodes (type `"studio-project"`, parentId = studio id)
3. Add edges: `center → studio` (distance 1.5 for creator, 2.0 for contributor) and `studio → sub-project` (distance 0.8)

### Adding profile images

Images are sourced in priority order:
- **GitHub orgs/users**: `https://github.com/{username}.png`
- **Website favicons**: `https://www.google.com/s2/favicons?domain=example.com&sz=64`
- **Local files**: place in `public/images/` and use `/images/filename.png`
- **Fallback**: nodes without images show initials automatically

### Personalizing the template

1. **Center node**: edit the first node in `graph.ts` — change label, description, image
2. **Header**: edit `src/components/Canvas3D.tsx` — update name and subtitle text
3. **Social links**: same file — change X and GitHub URLs
4. **Metadata**: edit `src/app/layout.tsx` — title, description, OG tags, domain
5. **Favicon**: replace `src/app/icon.svg`

## How-to Guides

### How to adjust node spacing

Edit `src/lib/layout.ts`:
- `BASE_RADIUS` (default 2.8): multiplied by edge distance to set tier radii
- `SUB_RADIUS` (default 1.5): distance of sub-projects from their parent
- Edge `distance` values in `graph.ts`: 1.0 (inner), 1.5 (mid), 2.0 (outer)

### How to change visual style

- **Node sizes**: `NODE_SIZES` in `src/components/GraphNode.tsx`
- **Label sizes**: `LABEL_SIZES` in `src/components/GraphNode.tsx`
- **Node opacity**: `opacity` variable in GraphNode (default 0.55 for cloudy look)
- **Edge style**: `LineDashedMaterial` config in `src/components/GraphEdge.tsx` (0.18 base opacity)
- **Particles**: `CoreParticles` (dense center cluster) and `Particles` (ambient) counts in `src/components/GraphScene.tsx`
- **Neural web**: strand count, opacity, and bounds shrink factor in `GraphScene.tsx`
- **Card transparency**: background rgba values in `src/components/NodeCard.tsx`

### How to add social links

Edit the social links section in `src/components/Canvas3D.tsx`. Add an `<a>` with an inline SVG icon inside the social links `<div>`.

## Reference

### Project structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout, Geist fonts, metadata
│   ├── page.tsx          # Main page, dynamic imports Canvas3D (ssr: false)
│   └── globals.css       # CSS vars, base styles
├── components/
│   ├── Canvas3D.tsx      # R3F Canvas, OrbitControls, HTML overlays, social links
│   ├── GraphScene.tsx    # Scene graph: nodes, edges, neural web, particles
│   ├── GraphNode.tsx     # Node sphere + glow rings + billboard label
│   ├── GraphEdge.tsx     # Dashed edge line with opacity transitions
│   ├── NodeCard.tsx      # Profile card sidebar (right panel / mobile bottom sheet)
│   └── ThemeProvider.tsx # Dark/light theme context
├── data/
│   └── graph.ts          # Node/edge data model — edit this to add your content
└── lib/
    ├── layout.ts         # Fibonacci-sphere layout engine
    └── animation.ts      # Pure animation utility functions
```

### Node data model

```ts
interface GraphNode {
  id: string;
  label: string;
  type: NodeType;           // "center" | "project" | "studio" | "studio-project"
  description?: string;     // brief tagline shown in card header
  fullDescription?: string; // longer bio paragraph
  role?: string;
  period?: string;          // e.g. "2021 — Present"
  url?: string;
  github?: string;
  parentId?: string;
  image?: string;           // avatar image URL
  tags?: string[];          // category tags shown as chips
}
```

### Node types

| Type | Description | Size | Tier |
|------|-------------|------|------|
| `center` | Central hub (you) | 0.3 | Origin |
| `project` | Direct personal project | 0.08 | Inner (distance 1.0) |
| `studio` | Studio/org hub | 0.15 | Mid (1.5) or Outer (2.0) |
| `studio-project` | Sub-project of a studio | 0.06 | Orbits parent at SUB_RADIUS |

### Edge distances

| Distance | Radius | Use case |
|----------|--------|----------|
| 1.0 | 2.8 | Direct personal projects |
| 1.5 | 4.2 | Studios/orgs you created |
| 2.0 | 5.6 | Studios/orgs you contributed to |
| 0.8 | 1.5 | Sub-projects orbiting their parent |

### Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **3D**: React Three Fiber v9 + @react-three/drei v10 + Three.js r172
- **Styling**: Tailwind CSS v4 + Geist font family
- **Hosting**: Vercel (or any Node.js host)

### Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
```

## Explanation

### Layout engine

Nodes are positioned on concentric fibonacci spheres. The `computeLayout()` function groups center-connected edges by their `distance` value, then places each group on a sphere of radius `BASE_RADIUS * distance`. Sub-projects orbit their parent at `SUB_RADIUS` using angular distribution. A seeded PRNG (seed 42) ensures deterministic, reproducible positions.

### Three-tier hub-and-spoke model

The graph uses three distance tiers to visually communicate relationship:
- **Inner ring** (distance 1.0): personal projects directly connected to center
- **Mid ring** (distance 1.5): studios/orgs where you are the creator
- **Outer ring** (distance 2.0): studios/orgs where you are a contributor

### Interaction model

**Hover**: Labels appear on the hovered node (opacity 1.0) and connected nodes (0.6). The full edge path from the node up to the center highlights. Non-connected nodes and edges dim. A profile card slides in from the right (desktop) or bottom (mobile).

**Click**: Clicking a node pins the profile card, making it static and scrollable. The card shows avatar, type badge, name, tagline, role, period, link, tags, connection count, and full bio. A close button (X) in the top-right corner dismisses the pinned card. When pinned, the link at the bottom becomes clickable.

### Visual design

- **Monochrome**: pure black/light backgrounds, white/grey nodes and text
- **Cloudy nodes**: core spheres at 55% opacity with additive-blended glow rings
- **Dashed edges**: `LineDashedMaterial` at 0.18 base opacity, 0.5 highlighted
- **Neural web**: 35 ambient cubic bezier strands within node bounding region, pulsing independently
- **Dual particle systems**: dense core cluster ("solar storm") + sparse ambient (2000 total)
- **Profile cards**: glass-morphism sidebar with backdrop blur
- **Labels**: monospace, uppercase, wide letter-spacing (0.12), uniform size, hidden by default
- **Dark/light mode**: full theme support with persistent toggle
- **WCAG**: all text meets AA contrast minimums

### React StrictMode

`reactStrictMode` is disabled in `next.config.ts` because React 19 StrictMode's double-mount cycle causes WebGL context loss with R3F v9. This only affects development; production builds are unaffected.
