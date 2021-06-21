import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login'
import Home from '../components/home'
Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    component: Login
  },
  {
    path:'/login',
    component:Login
  },
  {
    path:'/home',
    component:Home
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
