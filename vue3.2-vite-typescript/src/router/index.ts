import { createRouter, createWebHistory } from "vue-router";
import { defineAsyncComponent } from "vue";
// 它只会按需加载（即该异步组件在页面中被渲染时）
const Home = defineAsyncComponent(() => import("../components/Home/index.vue"));
const Login = defineAsyncComponent(() => import("../views/Login/index.vue"));
const Users = defineAsyncComponent(() => import("../views/Users/index.vue"));
const AuthorityList = defineAsyncComponent(
  () => import("../views/AuthorityList/index.vue")
);
const Roles = defineAsyncComponent(() => import("../views/Roles/index.vue"));
const GoodsCategory = defineAsyncComponent(
  () => import("../views/GoodsCategory/index.vue")
);
const GoodsParams = defineAsyncComponent(
  () => import("../views/GoodsParams/index.vue")
);
const GoodsList = defineAsyncComponent(
  () => import("../views/GoodsList/index.vue")
);
const AddGoods = defineAsyncComponent(
  () => import("../components/AddGoods/index.vue")
);
const OrderManage = defineAsyncComponent(
  () => import("../views/OrderManage/index.vue")
);
const ReportForms = defineAsyncComponent(
  () => import("../views/ReportForms/index.vue")
);
const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },
  {
    path: "/home",
    component: Home,
    redirect: "/home/users",
    children: [
      { path: "/home/users", component: Users },
      { path: "/home/rights", component: AuthorityList },
      { path: "/home/roles", component: Roles },
      { path: "/home/categories", component: GoodsCategory },
      { path: "/home/params", component: GoodsParams },
      {
        path: "/home/goods",
        component: GoodsList,
      },
      { path: "/home/goods/add", component: AddGoods },
      { path: "/home/orders", component: OrderManage },
      { path: "/home/reports", component: ReportForms },
    ],
  },
];

const router = createRouter({
  // createWebHistory   --路由模式路径不带#号(生产环境下不能直接访问项目,需要nginx转发)
  // createWebHashHistory　　----路由模式路径带#号
  history: createWebHistory(),
  routes,
});

export default router;
