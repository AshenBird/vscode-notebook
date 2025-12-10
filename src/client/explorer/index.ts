import { createApp } from "vue";
// import { ViteSSG } from 'vite-ssg/single-page';
import App from "./App.vue";
// import "./assets/style/index.scss";
// @ts-ignore

const el = document.getElementById("app") as HTMLElement;

createApp(App).mount(el);
// export const createApp = ViteSSG(
//   // the root component
//   App
// );
