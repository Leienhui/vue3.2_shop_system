// 封装ls存取token

const key = 'token'

const setToken:any = (token:string) => {
  return window.sessionStorage.setItem(key, token)
}

const getToken:any = () => {
  return window.sessionStorage.getItem(key)
}

const removeToken:any = () => {
  return window.sessionStorage.removeItem(key)
}

export {
  setToken,
  getToken,
  removeToken
}