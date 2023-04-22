const express = require('express')
const router = express.Router()

// 导入用户路由处理函数模块
const timelineHandler = require('../router_handler/timeline')

router.get('/getTimeline', timelineHandler.getTimeline)
router.post('/addTimeline', timelineHandler.addTimeline)

module.exports = router
