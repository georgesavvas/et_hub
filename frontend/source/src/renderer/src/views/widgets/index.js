import Apps from "./Apps";
import Licenses from "./Licenses";
import Notes from "./Notes";
import ProjectReels from "./ProjectReels";
import Todo from "./Todo";
import VoltBrowser from "./VoltBrowser";
import Workstation from "./Workstation";

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
  // apps: Apps,
  // licenses: Licenses,
  // notes: Notes,
  // todo: Todo,
  // workstation: Workstation,
}

export default widgets;
