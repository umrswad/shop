import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/login'
const Login = () => import(/* webpackChunkName: "login_home_welcome"*/ '../components/login')

// import Home from '../components/home'
const Home = () => import(/* webpackChunkName: "login_home_welcome"*/ '../components/home')

// import Welcome from '../components/welcome'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome"*/ '../components/welcome')


// import Users from '../components/user/users'
const Users = () => import(/* webpackChunkName: "users_rights_roles"*/ '../components/user/users')

// import Rights from '../components/power/rights'
const Rights = () => import(/* webpackChunkName: "users_rights_roles"*/ '../components/power/rights')

// import roles from "../components/power/roles";
const roles = () => import(/* webpackChunkName: "users_rights_roles"*/ '../components/power/roles')


// import Cate from "../components/goods/cate"
const Cate = () => import(/* webpackChunkName: "cate_params"*/ '../components/goods/cate')

// import Params from "../components/goods/params"
const Params = () => import(/* webpackChunkName: "cate_params"*/ '../components/goods/params')


// import GoodsList from "../components/goods/list"
const GoodsList = () => import(/* webpackChunkName: "goodslist_add"*/ '../components/goods/list')

// import Add from "../components/goods/add"
const Add = () => import(/* webpackChunkName: "goodslist_add"*/ '../components/goods/add')


// import Order from "../components/order/order"
const Order = () => import(/* webpackChunkName: "order_report"*/ '../components/order/order')

// import Report from "../components/report/report"
const Report = () => import(/* webpackChunkName: "order_report"*/ '../components/report/report')

Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    // component: Login,
    redirect:'/login'
  },
  {
    path:'/login',
    component:Login
  },
  {
    path:'/home',
    component:Home,
    redirect:'/welcome',
    children:[
      {
        path:'/welcome',
        component:Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path:'/rights',
        component:Rights
      },
      {
        path:'/roles',
        component:roles
      },
      {
        path:'/categories',
        component:Cate
      },
      {
        path:'/params',
        component:Params
      },
      {
        path:'/goods',
        component:GoodsList
      },
      {
        path:'/goods/add',
        component:Add
      },
      {
        path:'/orders',
        component:Order
      },
      {
        path:'/reports',
        component:Report
      }

    ]
  }
]
const router = new VueRouter({
  routes
})

//挂载路由导航守卫
router.beforeEach((to,from,next)=>{
  //to 将要访问的路径
  //from 代表从哪个路径跳转而来
  //next 是一个函数，表示方行
  //   next() 方行     next（'/login'） 强制跳转
  if (to.path === '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
