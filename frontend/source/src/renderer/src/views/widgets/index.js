import Apps from "./Apps";
import Licenses from "./Licenses";
import Notes from "./Notes";
import ProjectReels from "./ProjectReels";
import Todo from "./Todo";
import VoltBrowser from "./VoltBrowser";
import Workstation from "./Workstation";

export const widgets = {
  projects: {
    name: "Project Reels",
    component: ProjectReels,
  },
  voltBrowser: {
    name: "Volt Browser",
    component: VoltBrowser,
  },
  // apps: Apps,
  // licenses: Licenses,
  // notes: Notes,
  // todo: Todo,
  // workstation: Workstation,
}

export default widgets;
