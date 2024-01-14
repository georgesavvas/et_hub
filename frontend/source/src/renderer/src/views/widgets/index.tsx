import { lazy } from "react";

export const widgets = {
  projects: {
    config: {
      name: "Project Reels",
    },
    w: 4,
    h: 2,
    component: lazy(() => import("./ProjectReels")),
  },
  voltbrowser: {
    config: {
      name: "Volt Browser",
    },
    w: 4,
    h: 2,
    component: lazy(() => import("./VoltBrowser")),
  },
  farmusage: {
    config: {
      name: "Farm Usage",
    },
    w: 4,
    h: 2,
    component: lazy(() => import("./FarmUsage")),
  },
  renderlist: {
    config: {
      name: "Render List",
    },
    w: 4,
    h: 2,
    component: lazy(() => import("./RenderList")),
  },
  // apps: Apps,
  // licenses: Licenses,
  // notes: Notes,
  // todo: Todo,
  // workstation: Workstation,
};

export default widgets;
