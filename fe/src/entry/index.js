import Vue from 'vue';
import Index from '../vc/Index';

Vue.devtool = process.env.NODE_ENV === 'development';

const Comp = Vue.extend(Index);
new Comp({}).$mount('#app');
