import Vue from 'vue';
import Login from '../vc/Login';

Vue.devtool = process.env.NODE_ENV === 'development';

const Comp = Vue.extend(Login);
new Comp({}).$mount('#app');
