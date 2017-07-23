'use strict'

var Router = require("koa-router");
var BusUploader = require("koa-busboy")
var dbModels = require("./models/dbTables");
var Stream = require("koa-stream");
var Path = require("path");
const fs = require('fs');
const extname = Path.extname;

const router = new Router();
const folderPath = "./upload";
const uploader = BusUploader({
    dest: folderPath
})

router.get("/videos", async (ctx, next) => {
  await dbModels.Video.fetchAll().then(function(results){
    ctx.body = results;
  });
});

router.post("/videos", uploader, async (ctx,next) =>{
    if(!ctx.request.body.title ||
      !ctx.request.body.description){
      console.log("puste parametry");      
  }
  else{
   // console.log(dbModels.Video);
    let fileReadStream = ctx.request.files[0];

    var newVideo = new dbModels.Video({
      path: getFileName(fileReadStream.path),
      title: ctx.request.body.title, 
      description: ctx.request.body.description,
      user_id: 1});
    newVideo.save(null, {method: 'insert'}); 
  }
});

router.get("/videos/:videoId/comments", async (ctx,next) => {
    await dbModels.VideoComment.query({where: {video_id: ctx.params.videoId}})
    .fetchAll({require: true})
    .then(function (resData){
        resData.forEach(function (model) {
            console.log(model.attributes)
        }) 
    });
});

router.post("/videos/:videoId/comments", async (ctx,next) => {
    if(!ctx.request.body.content){
      console.log("puste parametry");      
  }
  else{
    //console.log(dbModels.VideoComment);
    var newVideoComment = new dbModels.VideoComment({
        content: ctx.request.body.content, 
        video_id: ctx.params.videoId,
        user_id: ctx.request.body.userId});
    newVideoComment.save(null, {method: 'insert'}); 
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

router.get("/videos/:videoId/stream", async (ctx, next) => {
    var videoInfo = await getVideoFromDb(ctx.params.videoId);
    console.log(Path.join(__dirname, '/upload'));
    const fpath = Path.join(__dirname, "/upload/"+videoInfo.attributes.path);
    const fstat = await stat(fpath);

    if (fstat.isFile()) {
        ctx.type = extname(fpath);
        ctx.body = fs.createReadStream(fpath);
    }
    //await Stream.file(ctx, videoInfo.attributes.path, {root: Path.join(__dirname, '/upload')});
});

function stat(file) {
  return new Promise(function(resolve, reject) {
    fs.stat(file, function(err, stat) {
      if (err) {
        reject(err);
      } else {
        resolve(stat);
      }
    });
  });
}

function getVideoFromDb(videoId){
    var videoInfo = dbModels.Video.query({where: {id: Number(videoId)}})
    .fetch({require: true})
    .then(function (resData){
        return resData;
    });

    return videoInfo;
}

function getFileName(path){
    var fileName = path.substring(path.lastIndexOf("/")+1);
    return fileName.trim();
}

module.exports = router;
