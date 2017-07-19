'use strict'
var Koa = require("koa")
var Test= require("./dbTables")
var Video = require("./video")

const app = new Koa();

app.use(Test.routes());
//app.use(Video.routes());

app.listen(3000);

//export default app;