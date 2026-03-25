# Constellation

Interactive 3D portfolio graph — a hub-and-spoke constellation for showcasing your projects, studios, and work history.

Built with Next.js 15, React Three Fiber, and Three.js.

## Features

- **Hub-and-spoke graph** — three-tier node hierarchy on concentric fibonacci spheres
- **Profile cards** — glass-morphism cards with avatar, role, period, tags, bio, and connection count
- **Neural web** — ambient cubic bezier strands pulsing within the node cluster
- **Dual particle systems** — dense "solar storm" core + sparse ambient field
- **Dark/light mode** — persistent theme toggle
- **Responsive** — optimized for mobile, tablet, and desktop
- **WCAG AA** — accessible contrast ratios and keyboard navigation

## Quick start

```bash
npx create-next-app@latest my-portfolio --example https://github.com/vxcozy/constellation
cd my-portfolio
npm install
npm run dev
```

Or click **"Use this template"** on GitHub, then clone your new repo.

Open `http://localhost:3000` — you'll see a constellation with example placeholder nodes.

## Customization

### 1. Add your data

Edit `src/data/graph.ts` — replace the example nodes with your own projects:

```ts
{
  id: "my-project",
  label: "My Project",
  type: "project",
  description: "Short tagline",
  fullDescription: "Longer description paragraph.",
  role: "Creator",
  period: "2024 — Present",
  url: "https://myproject.com",
  parentId: "me",       // connects to center node
  tags: ["Web", "AI"],
}
```

### 2. Update your identity

- **Header text**: `src/components/Canvas3D.tsx` — change name and subtitle
- **Social links**: same file — update X and GitHub URLs
- **Metadata**: `src/app/layout.tsx` — title, description, OG tags
- **Favicon**: replace `src/app/icon.svg`

### 3. Deploy

```bash
npm run build   # verify production build
```

Deploy to Vercel, Netlify, or any Node.js host.

## Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed development documentation covering:
- **Tutorials** — step-by-step guides for adding nodes, studios, and images
- **How-to guides** — adjusting spacing, visual style, and social links
- **Reference** — project structure, data model, node types, edge distances
- **Explanation** — layout engine, interaction model, visual design decisions

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| 3D | React Three Fiber v9 + @react-three/drei v10 + Three.js r172 |
| Styling | Tailwind CSS v4 + Geist font family |

## License

MIT
