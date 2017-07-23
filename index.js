'use strict'
var Koa = require("koa")
var BodyParser = require("koa-bodyparser")
var Json = require("koa-json")
//var BusUploader = require("koa-busboy")
var Api= require("./api")
var Video = require("./video")

const app = new Koa();
app.use(BodyParser({strict:false, limit: '100mb'}));
app.use(Json());
// app.use(ctx =>{
//     ctx.body = ctx.request.body;
//     console.log("poczatek");
// });
app.use(Api.routes());
//app.use(Video.routes());

app.listen(3000);

//export default app;