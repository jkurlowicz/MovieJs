'use strict'

var Router = require("koa-router");
var dbModels = require("./models/dbTables");

const router = new Router()

router.get("/videos", async (ctx, next) => {
  await dbModels.Video.fetchAll().then(function(results){
    ctx.body = results;
  });
});

router.post("/videos", async (ctx,next) =>{
  if(!ctx.request.body.title ||
      !ctx.request.body.description){
      console.log("puste parametry");      
  }
  else{
    console.log(dbModels.Video);
    var newVideo = new dbModels.Video({title: ctx.request.body.title, 
      description: ctx.request.body.description,
      user_id: 1});
    newVideo.save(null, {method: 'insert'}); 
  }
});

router.delete("/comments/:commentId", async (ctx,next) =>{
    await dbModels.VideoComment.forge({id: ctx.params.commentId})
    .fetch({require: true})
    .then(function (comment){
        comment.destroy();
    });
});

router.get("/users/:userId/videos", async (ctx, next) => {
    await dbModels.Video.query({where: {user_id: ctx.params.userId}})
    .fetchAll({require: true})
    .then(function (resData){
        resData.forEach(function (model) {
            console.log(model.attributes)
        }) 
    });
});

router.get("/users/:userId/comments", async (ctx, next) => {
    await dbModels.VideoComment.query({where: {user_id: ctx.params.userId}})
    .fetchAll({require: true})
    .then(function (resData){
        resData.forEach(function (model) {
            console.log(model.attributes)
        }) 
    });
});

function getBody(ctx){
    return new Promise(function(resolve,reject){
        var data = "";
        ctx.on("data", function (chunk) {
            data += chunk;
        })
        ctx.on("end", function (chunk) {
            resolve(data);
        })
    })
}

module.exports = router;
