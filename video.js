'use strict'

console.log("Hello world!");
var Router = require("koa-router");
const router = new Router()

router.get('/video', async (ctx, next) => {
  ctx.body = 'Video'
});

module.exports = router;