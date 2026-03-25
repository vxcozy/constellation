export type NodeType = "center" | "project" | "studio" | "studio-project";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  description?: string;       // brief tagline shown in card header
  fullDescription?: string;   // longer bio/description paragraph
  role?: string;
  contributions?: string;
  period?: string;             // e.g. "2021 — Present"
  url?: string;
  github?: string;
  parentId?: string;
  image?: string;              // avatar image URL
  tags?: string[];             // category tags shown as chips
}

export interface GraphEdge {
  source: string;
  target: string;
  distance: number; // relative spoke length
}

// ─── Nodes ──────────────────────────────────────────────────────────────────
//
// Replace these example nodes with your own projects, studios, and work history.
// See CLAUDE.md for full documentation on node types and edge distances.
//

export const nodes: GraphNode[] = [
  // ── Center ──
  // This is you — the hub of the constellation.
  {
    id: "me",
    label: "Your Name",
    type: "center",
    description: "Your tagline here",
    fullDescription: "A longer bio paragraph about yourself, your work, and what you're passionate about.",
    role: "Builder",
    period: "2020 — Present",
    // image: "https://github.com/yourusername.png",
    tags: ["Design", "Engineering", "Product"],
  },

  // ── Direct Projects (inner ring, distance 1.0) ──
  // Personal projects directly connected to you.
  {
    id: "project-alpha",
    label: "Project Alpha",
    type: "project",
    description: "A brief tagline for Project Alpha",
    fullDescription: "Longer description of what Project Alpha is, what it does, and why it matters.",
    role: "Creator",
    period: "2024",
    url: "https://example.com",
    // github: "https://github.com/you/project-alpha",
    parentId: "me",
    tags: ["Web", "Open Source"],
  },
  {
    id: "project-beta",
    label: "Project Beta",
    type: "project",
    description: "Another personal project",
    fullDescription: "Description of Project Beta — what problem it solves and how.",
    role: "Creator",
    period: "2023 — Present",
    github: "https://github.com/you/project-beta",
    parentId: "me",
    tags: ["CLI", "DevTools"],
  },
  {
    id: "project-gamma",
    label: "Project Gamma",
    type: "project",
    description: "Side project or experiment",
    fullDescription: "A side project exploring new ideas or technologies.",
    role: "Creator",
    period: "2024",
    parentId: "me",
    tags: ["Experiment"],
  },

  // ── Creator Studio (mid ring, distance 1.5) ──
  // A studio or organization you founded.
  {
    id: "my-studio",
    label: "My Studio",
    type: "studio",
    description: "A studio you created",
    fullDescription: "Description of the studio — its mission, what it builds, and its vision.",
    role: "Creator",
    period: "2022 — Present",
    // url: "https://mystudio.dev",
    // image: "https://github.com/my-studio-org.png",
    parentId: "me",
    tags: ["Studio", "Products"],
  },
  {
    id: "studio-app",
    label: "Studio App",
    type: "studio-project",
    description: "Main product of the studio",
    fullDescription: "The flagship product built under the studio umbrella.",
    role: "Creator",
    period: "2023 — Present",
    parentId: "my-studio",
    tags: ["App", "SaaS"],
  },
  {
    id: "studio-docs",
    label: "Studio Docs",
    type: "studio-project",
    description: "Documentation site",
    fullDescription: "Documentation and developer guides for the studio's products.",
    role: "Creator",
    period: "2023",
    parentId: "my-studio",
    tags: ["Docs"],
  },

  // ── Contributor Studio (outer ring, distance 2.0) ──
  // An organization you contributed to but didn't found.
  {
    id: "partner-org",
    label: "Partner Org",
    type: "studio",
    description: "Organization you contributed to",
    fullDescription: "Description of the partner org and what they do.",
    role: "Contributor",
    period: "2021 — 2023",
    // url: "https://partner.org",
    // image: "https://github.com/partner-org.png",
    parentId: "me",
    tags: ["Open Source", "Infrastructure"],
  },
  {
    id: "partner-project",
    label: "Partner Project",
    type: "studio-project",
    description: "A project within the partner org",
    fullDescription: "Your contributions to this project within the partner organization.",
    role: "Contributor",
    period: "2022",
    parentId: "partner-org",
    tags: ["Backend", "API"],
  },

  // ── Another Contributor Org ──
  {
    id: "prev-company",
    label: "Previous Co.",
    type: "studio",
    description: "A company you worked at",
    fullDescription: "Description of the company and your role there.",
    role: "Senior Engineer",
    period: "2019 — 2021",
    parentId: "me",
    tags: ["Startup", "Fintech"],
  },
];

// ─── Edges ──────────────────────────────────────────────────────────────────
//
// distance controls how far from center:
//   1.0 = inner ring (personal projects)
//   1.5 = mid ring (creator studios)
//   2.0 = outer ring (contributor studios)
//   0.8 = sub-project orbiting its parent studio
//

export const edges: GraphEdge[] = [
  // Direct projects → inner ring
  { source: "me", target: "project-alpha", distance: 1 },
  { source: "me", target: "project-beta", distance: 1 },
  { source: "me", target: "project-gamma", distance: 1 },

  // Creator studio → mid ring
  { source: "me", target: "my-studio", distance: 1.5 },

  // Contributor orgs → outer ring
  { source: "me", target: "partner-org", distance: 2.0 },
  { source: "me", target: "prev-company", distance: 2.0 },

  // Studio sub-projects
  { source: "my-studio", target: "studio-app", distance: 0.8 },
  { source: "my-studio", target: "studio-docs", distance: 0.8 },
  { source: "partner-org", target: "partner-project", distance: 0.8 },
];
