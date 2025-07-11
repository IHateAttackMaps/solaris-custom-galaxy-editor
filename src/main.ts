import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "./assets/root.css";
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-default.css'

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(ToastPlugin);
app.mount('#app');