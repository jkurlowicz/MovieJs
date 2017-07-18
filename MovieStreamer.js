'use strict'
var Koa = require("koa")
var Test= require("./User")

const app = new Koa();

app.use(Test.routes());

app.listen(3000);

//export default app;