/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */

const db = require("../db/index");
const bcrypt = require("bcryptjs");
// 用这个包来生成 Token 字符串
const jwt = require("jsonwebtoken");

// 导入配置文件
const config = require("../config");

// 注册用户的处理函数
exports.regUser = (req, res) => {
  const userinfo = req.body;

  if (!userinfo.username || !userinfo.password) {
    return res.send({
      code: 500,
      message: "用户名或者密码不能为空",
    });
  }

  const sql = `select * from ev_users where username=?`;

  db.query(sql, [userinfo.username], function (err, results) {
    // 执行 SQL 语句失败
    if (err) {
      return res.cc(err);
    }
    // 用户名被占用
    if (results.length > 0) {
      return res.cc("用户名被占用，请更换其他用户名！");
    }

    // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
    userinfo.password = bcrypt.hashSync(userinfo.password, 10);

    const sql = "insert into ev_users set ?";
    db.query(
      sql,
      { username: userinfo.username, password: userinfo.password },
      function (err, results) {
        // 执行 SQL 语句失败
        if (err) return res.send(err);
        // SQL 语句执行成功，但影响行数不为 1
        if (results.affectedRows !== 1) {
          return res.cc("注册用户失败，请稍后再试！");
        }
        // 注册成功
        res.cc("注册成功！", 0);
      }
    );
  });
};

// 登录的处理函数
exports.login = (req, res) => {
  const userinfo = req.body;

  const sql = `select * from ev_users where username=?`;
  db.query(sql, userinfo.username, function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err);
    // 执行 SQL 语句成功，但是查询到数据条数不等于 1
    if (results.length !== 1) return res.cc("登录失败！");
    // 拿着用户输入的密码,和数据库中存储的密码进行对比
    const compareResult = bcrypt.compareSync(
      userinfo.password,
      results[0].password
    );

    // 如果对比的结果等于 false, 则证明用户输入的密码错误
    if (!compareResult) {
      return res.cc("登录失败！");
    }

    // 剔除完毕之后，user 中只保留了用户的 id, username, nickname, email 这四个属性的值
    const user = { ...results[0], password: "", user_pic: "" };
    // 生成 Token 字符串
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {
      expiresIn: "72h", // token 有效期为 10 个小时
      algorithm: "HS256",
    });
    res.send({
        code: 200,
        message: '登录成功！',
        // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
        result: 'Bearer ' + tokenStr,
      })
      
  });
};
