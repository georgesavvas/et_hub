import FarmUsage from "./FarmUsage";
import ProjectReels from "./ProjectReels";
import RenderList from "./RenderList";
import VoltBrowser from "./VoltBrowser";

export const widgets = {
  projects: {
    config: {
      name: "Project Reels",
    },
    w: 4,
    h: 2,
    component: ProjectReels,
  },
  voltbrowser: {
    config: {
      name: "Volt Browser",
    },
    w: 4,
    h: 2,
    component: VoltBrowser,
  },
  farmusage: {
    config: {
      name: "Farm Usage",
    },
    w: 4,
    h: 2,
    component: FarmUsage,
  },
  renderlist: {
    config: {
      name: "Render List",
    },
    w: 4,
    h: 2,
    component: RenderList,
  },
  // apps: Apps,
  // licenses: Licenses,
  // notes: Notes,
  // todo: Todo,
  // workstation: Workstation,
};

export default widgets;
