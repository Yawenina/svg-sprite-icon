import Vue from 'vue';
import Icon from './Icon.vue';
import App from './App.vue';

// generate context module: https://webpack.js.org/guides/dependency-management/#require-context
const request = require.context('./assets/icons', false, /\.svg$/);
console.log('request', request);
console.log('request.keys', request.keys());
console.log('request.id', request.id);
console.log('request.resolve()', request.resolve('./store.svg'));
console.log('request.resolve', request.resolve);
// require every module
request.keys().forEach(request);


Vue.component('icon', Icon);

new Vue({
  render: h => h(App),
}).$mount('#app');

