import { nodes, edges, type GraphNode, type GraphEdge, type NodeType } from "../graph";

describe("Graph Data", () => {
  describe("nodes", () => {
    it("should export a non-empty array of nodes", () => {
      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes.length).toBeGreaterThan(0);
    });

    it("should have exactly one center node", () => {
      const centers = nodes.filter((n) => n.type === "center");
      expect(centers).toHaveLength(1);
      expect(centers[0].id).toBe("cozy");
      expect(centers[0].label).toBe("Cozy");
    });

    it("should have the center node with correct identity", () => {
      const center = nodes.find((n) => n.type === "center")!;
      expect(center.description).toBe("Design / Engineering / Product");
      expect(center.role).toBe("Builder");
    });

    it("should contain all direct project nodes", () => {
      const projectIds = [
        "shawars",
        "twetch-arcade",
        "shacenter",
        "urbit-supply",
        "hd2runs",
        "blockz",
        "tien-len",
        "coziest-tools",
        "aitelier",
        "bridge-ws",
        "local-llm-proxy",
      ];
      const actualProjectIds = nodes
        .filter((n) => n.type === "project")
        .map((n) => n.id);

      projectIds.forEach((id) => {
        expect(actualProjectIds).toContain(id);
      });
      expect(actualProjectIds).toHaveLength(projectIds.length);
    });

    it("should contain all studio nodes", () => {
      const studioIds = [
        "ch4p-labs",
        "tome-hq",
        "ouroborai-labs",
        "premia-labs",
        "eleven-yellow",
        "exodus",
        "skills-hub",
      ];
      const actualStudioIds = nodes
        .filter((n) => n.type === "studio")
        .map((n) => n.id);

      studioIds.forEach((id) => {
        expect(actualStudioIds).toContain(id);
      });
      expect(actualStudioIds).toHaveLength(studioIds.length);
    });

    it("should contain all studio-project nodes", () => {
      const studioProjectIds = [
        "ch4p",
        "ch4p-plugin-erc8004",
        "tome",
        "tome-starter",
        "premia",
        "kyan",
        "switchain",
        "monedero",
        "botto",
        "skill-workflow",
        "skill-architect",
        "skill-sanitize",
        "skill-jive",
      ];
      const actualIds = nodes
        .filter((n) => n.type === "studio-project")
        .map((n) => n.id);

      studioProjectIds.forEach((id) => {
        expect(actualIds).toContain(id);
      });
      expect(actualIds).toHaveLength(studioProjectIds.length);
    });

    it("should have unique node IDs", () => {
      const ids = nodes.map((n) => n.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("every node should have required fields", () => {
      nodes.forEach((node) => {
        expect(node.id).toBeDefined();
        expect(typeof node.id).toBe("string");
        expect(node.id.length).toBeGreaterThan(0);

        expect(node.label).toBeDefined();
        expect(typeof node.label).toBe("string");
        expect(node.label.length).toBeGreaterThan(0);

        expect(node.type).toBeDefined();
        expect(["center", "project", "studio", "studio-project"]).toContain(
          node.type
        );
      });
    });

    it("non-center nodes should have a parentId", () => {
      const nonCenter = nodes.filter((n) => n.type !== "center");
      nonCenter.forEach((node) => {
        expect(node.parentId).toBeDefined();
        expect(typeof node.parentId).toBe("string");
      });
    });

    it("parentIds should reference existing node IDs", () => {
      const allIds = new Set(nodes.map((n) => n.id));
      const nodesWithParent = nodes.filter((n) => n.parentId);
      nodesWithParent.forEach((node) => {
        expect(allIds.has(node.parentId!)).toBe(true);
      });
    });

    it("project nodes should link back to cozy as parent", () => {
      const projects = nodes.filter((n) => n.type === "project");
      projects.forEach((p) => {
        expect(p.parentId).toBe("cozy");
      });
    });

    it("studio nodes should link back to cozy as parent", () => {
      const studios = nodes.filter((n) => n.type === "studio");
      studios.forEach((s) => {
        expect(s.parentId).toBe("cozy");
      });
    });

    it("studio-project nodes should link to a studio as parent", () => {
      const studioIds = new Set(
        nodes.filter((n) => n.type === "studio").map((n) => n.id)
      );
      const studioProjects = nodes.filter((n) => n.type === "studio-project");
      studioProjects.forEach((sp) => {
        expect(studioIds.has(sp.parentId!)).toBe(true);
      });
    });

    it("project nodes should have github URL or url", () => {
      const projects = nodes.filter((n) => n.type === "project");
      projects.forEach((p) => {
        expect(p.github || p.url).toBeTruthy();
      });
    });

    it("direct project nodes should have role set to Creator", () => {
      const projects = nodes.filter((n) => n.type === "project");
      projects.forEach((p) => {
        expect(p.role).toBe("Creator");
      });
    });

    it("node type should be a valid NodeType", () => {
      const validTypes: NodeType[] = [
        "center",
        "project",
        "studio",
        "studio-project",
      ];
      nodes.forEach((n) => {
        expect(validTypes).toContain(n.type);
      });
    });
  });

  describe("edges", () => {
    it("should export a non-empty array of edges", () => {
      expect(Array.isArray(edges)).toBe(true);
      expect(edges.length).toBeGreaterThan(0);
    });

    it("every edge should have source, target, and distance", () => {
      edges.forEach((edge) => {
        expect(edge.source).toBeDefined();
        expect(typeof edge.source).toBe("string");
        expect(edge.target).toBeDefined();
        expect(typeof edge.target).toBe("string");
        expect(edge.distance).toBeDefined();
        expect(typeof edge.distance).toBe("number");
        expect(edge.distance).toBeGreaterThan(0);
      });
    });

    it("edge source and target should reference existing nodes", () => {
      const nodeIds = new Set(nodes.map((n) => n.id));
      edges.forEach((edge) => {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      });
    });

    it("should have unique source-target pairs", () => {
      const pairs = edges.map((e) => `${e.source}->${e.target}`);
      const uniquePairs = new Set(pairs);
      expect(uniquePairs.size).toBe(pairs.length);
    });

    it("direct project edges should have distance 1", () => {
      const projectIds = new Set(
        nodes.filter((n) => n.type === "project").map((n) => n.id)
      );
      const projectEdges = edges.filter(
        (e) => e.source === "cozy" && projectIds.has(e.target)
      );
      projectEdges.forEach((e) => {
        expect(e.distance).toBe(1);
      });
    });

    it("studio edges should have distance 2.5", () => {
      const studioIds = new Set(
        nodes.filter((n) => n.type === "studio").map((n) => n.id)
      );
      const studioEdges = edges.filter(
        (e) => e.source === "cozy" && studioIds.has(e.target)
      );
      studioEdges.forEach((e) => {
        expect(e.distance).toBe(2.5);
      });
    });

    it("studio sub-project edges should have distance 0.8", () => {
      const studioIds = new Set(
        nodes.filter((n) => n.type === "studio").map((n) => n.id)
      );
      const subEdges = edges.filter(
        (e) => studioIds.has(e.source) && e.source !== "cozy"
      );
      subEdges.forEach((e) => {
        expect(e.distance).toBe(0.8);
      });
    });

    it("every non-center node should be connected by at least one edge", () => {
      const connectedNodes = new Set<string>();
      edges.forEach((e) => {
        connectedNodes.add(e.source);
        connectedNodes.add(e.target);
      });

      const nonCenter = nodes.filter((n) => n.type !== "center");
      nonCenter.forEach((n) => {
        expect(connectedNodes.has(n.id)).toBe(true);
      });
    });

    it("ch4p-labs should have 2 sub-project edges", () => {
      const ch4pEdges = edges.filter((e) => e.source === "ch4p-labs");
      expect(ch4pEdges).toHaveLength(2);
      expect(ch4pEdges.map((e) => e.target).sort()).toEqual(
        ["ch4p", "ch4p-plugin-erc8004"].sort()
      );
    });

    it("tome-hq should have 2 sub-project edges", () => {
      const tomeEdges = edges.filter((e) => e.source === "tome-hq");
      expect(tomeEdges).toHaveLength(2);
      expect(tomeEdges.map((e) => e.target).sort()).toEqual(
        ["tome", "tome-starter"].sort()
      );
    });

    it("eleven-yellow should have 3 sub-project edges", () => {
      const eyEdges = edges.filter((e) => e.source === "eleven-yellow");
      expect(eyEdges).toHaveLength(3);
      expect(eyEdges.map((e) => e.target).sort()).toEqual(
        ["botto", "monedero", "switchain"].sort()
      );
    });

    it("skills-hub should have 4 sub-project edges", () => {
      const skillEdges = edges.filter((e) => e.source === "skills-hub");
      expect(skillEdges).toHaveLength(4);
    });
  });

  describe("type exports", () => {
    it("GraphNode type should be usable", () => {
      const testNode: GraphNode = {
        id: "test",
        label: "Test",
        type: "project",
      };
      expect(testNode.id).toBe("test");
    });

    it("GraphEdge type should be usable", () => {
      const testEdge: GraphEdge = {
        source: "a",
        target: "b",
        distance: 1,
      };
      expect(testEdge.source).toBe("a");
    });
  });
});
