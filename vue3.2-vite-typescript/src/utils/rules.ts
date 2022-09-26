// 表单自定义校验规则
// 校验邮箱
const validatorEmail = (rule: any, value: any, callback: any) => {
  const mailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
  if (!value) {
    return callback(new Error("邮箱不能为空"));
  }
  setTimeout(() => {
    if (mailReg.test(value)) {
      callback();
    } else {
      callback(new Error("请输入正确的邮箱格式"));
    }
  }, 100);
};
// 校验电话
const validatorPhone = function (rule: any, value: any, callback: any) {
  if (value === "") {
    callback(new Error("手机号不能为空"));
  } else if (!/^1\d{10}$/.test(value)) {
    callback(new Error("手机号格式错误"));
  } else {
    callback();
  }
};
export { validatorEmail, validatorPhone };
