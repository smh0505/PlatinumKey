import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import VueKonva from 'vue-konva'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(VueKonva)
app.mount('#app')