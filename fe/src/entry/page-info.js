import Vue from 'vue';
import PageInfo from '../vc/PageInfo';

Vue.devtool = process.env.NODE_ENV === 'development';

const Comp = Vue.extend(PageInfo);
new Comp({}).$mount('#app');
