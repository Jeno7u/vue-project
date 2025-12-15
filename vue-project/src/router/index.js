import { createWebHistory, createRouter } from "vue-router";
import PaletteGenerator from "../components/PaletteGenerator.vue";
import PaletteLibrary from "../components/PaletteLibrary.vue";
import ExportPanel from "../components/ExportPanel.vue";

const routes = [
    { path: "/", name: "Generator", component: PaletteGenerator },
    { path: "/library", name: "Library", component: PaletteLibrary },
    { path: "/export", name: "Export", component: ExportPanel },
];

const router = createRouter({ history: createWebHistory(), routes });
export default router;
