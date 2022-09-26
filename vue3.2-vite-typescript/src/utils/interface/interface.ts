import { MetaInter } from "./metaInterface";
export interface RealDataInter {
  authName: string;
  children: Array<RealDataInter>;
  id: number;
  order: number;
  path: string;
}
export interface DataInter {
  data: Array<RealDataInter>;
  meta: MetaInter;
}
export interface UsersInter {
  create_time: number;
  email: string;
  id: number;
  mg_state: boolean;
  mobile: string;
  role_name: string;
  username: string;
}
export interface UserDataInter {
  pagenum: number;
  total: number;
  users: Array<UsersInter>;
}
export interface UserResInter {
  data: UserDataInter;
  meta: MetaInter;
}
export interface LoginInnerDataInter {
  token: string;
  email: string;
  id: number;
  mobile: string;
  rid: number;
  username: string;
}
export interface LoginResDataInter {
  data: LoginInnerDataInter;
  meta: MetaInter;
}
export interface LoginResInter {
  data: LoginResDataInter;
}

export interface RolesResInter {
  data: Array<RolesInnerDataInter>;
  meta: MetaInter;
}

export interface RolesInnerDataInter {
  children: Array<RolesInnerDataInter>;
  id: number;
  roleDesc: string;
  roleName: string;
}
export interface UpdateUserRoleApiInter {
  id: number;
  rid: number;
}

export interface AuthorityListResInter {
  data: Array<AuthorityListResDataInter>;
  meta: MetaInter;
}
export interface AuthorityListResDataInter {
  authName: string;
  id: number;
  level: string;
  path: string;
  pid: number;
}
export interface TreeInter {
  id: number;
  label: string;
  children?: TreeInter[];
}
export interface PutTreeInter {
  id: number;
  rids: string;
}
export interface DeleteRolesAuthoritesInter {
  id: number;
  rightId: number;
}
export interface OrderResInter {
  data: OrderResDataInter;
  meta: MetaInter;
}
export interface OrderResDataInter {
  goods: Array<OrderResDataGoodsInter>;
  pagenum: string;
  total: number;
}

export interface OrderResDataGoodsInter {
  consignee_addr: string;
  create_time: number;
  is_send: string;
  order_fapiao_company: string;
  order_fapiao_content: string;
  order_fapiao_title: string;
  order_id: number;
  order_number: string;
  order_pay: string;
  order_price: number;
  pay_status: string;
  trade_no: string;
  update_time: number;
  user_id: number;
}
export interface queryInfoInter {
  pagenum: number;
  pagesize: number;
  query: string;
}
export interface GoodsResInter {
  data: GoodsResDataInter;
  meta: MetaInter;
}
export interface GoodsResDataInter {
  goods: Array<GoodsResDataGoodsInter>;
  pagenum: string;
  total: number;
}
export interface GoodsResDataGoodsInter {
  add_time: number;
  cat_id: number;
  cat_one_id: number;
  cat_three_id: number;
  cat_two_id: number;
  goods_id: number;
  goods_name: string;
  goods_number: number;
  goods_price: number;
  goods_state: number;
  goods_weight: number;
  hot_mumber: number;
  is_promote: boolean;
  upd_time: number;
}
export interface GoodsCategoryResInter {
  data: Array<GoodsCategoryDataInter>;
  meta: MetaInter;
}
export interface GoodsCategoryDataInter {
  cat_deleted: boolean;
  cat_id: number;
  cat_level: number;
  cat_name: string;
  cat_pid: number;
}
export interface AddGoodsCategoryFormInter {
  goods_name: string;
  goods_price: number;
  goods_number: number;
  goods_weight: number;
  goods_cat: Array<string>;
  pics: Array<string>;
  goods_introduce: string;
  attrs: Array<string>;
}

export interface GoodsAttributesResInter {
  data: Array<GoodsAttributesDataInter>;
  meta: MetaInter;
}
export interface GoodsAttributesDataInter {
  attr_id: number;
  attr_name: string;
  attr_sel: string;
  attr_vals: string;
  attr_vals_arr: string[];
  attr_write: string;
  cat_id: number;
  delete_time: number;
}

export interface UploadResInter {
  data: UploadDataInter;
  meta: MetaInter;
}
export interface UploadDataInter {
  tmp_path: string;
  url: string;
}
