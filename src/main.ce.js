import { defineCustomElement } from 'vue';
import BdpXterm from '@/element/BdpXterm.ce.vue';

window.customElements.define('xterm-bdp', defineCustomElement(BdpXterm));