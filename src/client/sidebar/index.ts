import { createApp } from "vue";
import App from "./App.vue";
// import "./assets/style/index.css";

const el = document.getElementById("app") as HTMLElement;

const app = createApp(App);
app.mount(el);
