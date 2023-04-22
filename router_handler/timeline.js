/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */

const db = require("../db/index");

exports.getTimeline = (req, res) => {
  const sql = 'SELECT * FROM timeline ORDER BY time ASC';
  db.query(sql, (err, results) => {
    if (err) return res.cc(err);

    return res.send({
      code: 200,
      message: "success",
      data: results
    });
  })
}

exports.addTimeline = (req, res) => {
  const sql = 'INSERT INTO timeline SET ?';
  console.log('req :>> ', req.body);
  db.query(sql, [req.body], (err, results) => {
    if (err) return res.cc(err);

    if (results.affectedRows !== 1) {
      return res.cc("添加数据失败，请稍后再试！");
    }

    return res.send({
      code: 200,
      message: "success",
      data: results
    });
  })
}
