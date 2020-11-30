import Vue from 'vue';
import VueRouter from 'vue-router';

import Dashboard from '../views/Dashboard';
import Downloads from '../views/Downloads';
import Settings from '../views/Settings';

Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    redirect: '/',
  },
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard
  },
  {
    path: '/downloads',
    name: 'downloads',
    component: Downloads,
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings,
  },
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
