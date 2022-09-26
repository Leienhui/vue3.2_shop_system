// 封装axios
// 实例化  请求拦截器 响应拦截器

import axios from "axios";

import { getToken } from "./token";
import { history } from "./history";
const http = axios.create({
  baseURL: "http://127.0.0.1:8888/api/private/v1/",
  timeout: 5000,
});

// 添加请求拦截器
http.interceptors.request.use(
  (config: any) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
http.interceptors.response.use(
  (response) => {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    const { data } = response;
    if (data.meta.status === 400) {
      history.push("/login");
      location.reload();
    }
    return response;
  },
  (error) => {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    // if (error.response.status === 401 || error.response.status === 400) {
    //   // 跳回到登录 reactRouter默认状态下 并不支持在组件之外完成路由跳转
    //   // 需要自己来实现
    //   history.push("/login");
    // }
    return Promise.reject(error);
  }
);

export { http };
