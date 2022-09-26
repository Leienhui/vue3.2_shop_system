import { dataTool } from "echarts";
import { http } from "../utils";
import {
  queryInfoInter,
  UsersInter,
  LoginResInter,
  UpdateUserRoleApiInter,
  RolesInnerDataInter,
  PutTreeInter,
  DeleteRolesAuthoritesInter,
  GoodsResDataGoodsInter,
  AddGoodsCategoryFormInter,
  GoodsCategoryDataInter,
} from "../utils/interface/interface";

const loginApi = async (adminInfo: object) => {
  return await http.post<any, LoginResInter>("login", adminInfo);
};
const getMenuListApi: any = async () => {
  return await http.get("menus");
};
const getUserListApi: any = async (queryInfo: queryInfoInter) => {
  return await http.get("users", { params: queryInfo });
};
const userStateChangeApi: any = async (row: UsersInter) => {
  return await http.put(`users/${row.id}/state/${row.mg_state}`);
};
const deleteUserApi: any = async (row: UsersInter) => {
  return await http.delete(`users/${row.id}`);
};
// 添加用户
const addUserApi: any = async (data: any) => {
  return await http.post("users", {
    username: data.username,
    password: data.password,
    email: data.email,
    mobile: data.mobile,
  });
};
const editUserApi: any = async (data: any) => {
  return await http.put(`users/${data.id}`, {
    email: data.email,
    mobile: data.mobile,
  });
};
const getRolesListApi: any = async () => {
  return await http.get("roles");
};
const updateRolesApi: any = async (data: UpdateUserRoleApiInter) => {
  return await http.put(`users/${data.id}/role`, { rid: data.rid });
};
const getAuthoritesListApi: any = async (data: UpdateUserRoleApiInter) => {
  return await http.get("rights/list ");
};
const addRolesApi: any = async (data: RolesInnerDataInter) => {
  return await http.post("roles", {
    roleName: data.roleName,
    roleDesc: data.roleDesc,
  });
};
const editRolesApi: any = async (data: RolesInnerDataInter) => {
  return await http.put(`roles/${data.id}`, {
    roleName: data.roleName,
    roleDesc: data.roleDesc,
  });
};
const deleteRolesApi: any = async (data: RolesInnerDataInter) => {
  return await http.delete(`roles/${data.id}`);
};
const getAllAuthoritesListApi: any = async () => {
  return await http.get("rights/tree");
};
const updateRolesAuthoritesListApi: any = async (data: PutTreeInter) => {
  return await http.post(`roles/${data.id}/rights`, { rids: data.rids });
};
const deleteRolesAuthoritesApi: any = async (
  data: DeleteRolesAuthoritesInter
) => {
  return await http.delete(`roles/${data.id}/rights/${data.rightId}`);
};
const getReportDataApi: any = async () => {
  return await http.get("reports/type/1");
};
const getOrderListApi: any = async (data: queryInfoInter) => {
  return await http.get("orders", {
    params: data,
  });
};
const getGoodsListApi: any = async (queryInfo: queryInfoInter) => {
  return await http.get("goods", { params: queryInfo });
};
const deleteGoodsListApi: any = async (data: GoodsResDataGoodsInter) => {
  return await http.delete(`goods/${data.goods_id}`);
};
const getGoodsCategoryListApi: any = async () => {
  return await http.get("categories");
};
const getThirdCategoriesAttributesManyApi: any = async (id: number) => {
  return await http.get(`categories/${id}/attributes`, {
    params: { sel: "many" },
  });
};
const getThirdCategoriesAttributesOnlyApi: any = async (id: number) => {
  return await http.get(`categories/${id}/attributes`, {
    params: { sel: "only" },
  });
};

const addGoodsApi: any = async (data: AddGoodsCategoryFormInter) => {
  return await http.post(`goods`, data);
};
const getGoodsInfoByIdApi: any = async (id: number) => {
  return await http.get(`goods/${id}`);
};
const editGoodsCategoriesApi: any = async (data: GoodsCategoryDataInter) => {
  return await http.put(`categories/${data.cat_id}`, {
    cat_name: data.cat_name,
  });
};
const addGoodsCategoriesApi: any = async (data: GoodsCategoryDataInter) => {
  return await http.post(`categories`, {
    cat_name: data.cat_name,
    cat_pid: data.cat_pid,
    cat_level: data.cat_level,
  });
};
const deleteGoodsCategoriesApi: any = async (data: GoodsCategoryDataInter) => {
  return await http.delete(`categories/${data.cat_id}`);
};
const getGoodsParentCategoryListApi: any = async () => {
  return await http.get(`categories`, {
    params: { type: 2 },
  });
};

export {
  loginApi,
  getMenuListApi,
  getUserListApi,
  userStateChangeApi,
  deleteUserApi,
  addUserApi,
  editUserApi,
  getRolesListApi,
  updateRolesApi,
  getAuthoritesListApi,
  addRolesApi,
  editRolesApi,
  deleteRolesApi,
  getAllAuthoritesListApi,
  updateRolesAuthoritesListApi,
  deleteRolesAuthoritesApi,
  getReportDataApi,
  getOrderListApi,
  getGoodsListApi,
  deleteGoodsListApi,
  getGoodsCategoryListApi,
  getThirdCategoriesAttributesManyApi,
  getThirdCategoriesAttributesOnlyApi,
  addGoodsApi,
  getGoodsInfoByIdApi,
  editGoodsCategoriesApi,
  addGoodsCategoriesApi,
  deleteGoodsCategoriesApi,
  getGoodsParentCategoryListApi,
};
