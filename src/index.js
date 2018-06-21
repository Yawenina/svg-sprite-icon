console.log('hi');

import Vue from 'vue';
import Icon from './Icon.vue';
import App from './App.vue';

import store from './assets/icons/store.svg';
console.log(store);

Vue.component('icon', Icon);

new Vue({
  render: h => h(App),
}).$mount('#app');

