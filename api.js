'use strict'

var Router = require("koa-router");
var dbModels = require("./models/dbTables");
//var BodyParser = require("koa-bodyparser");

const router = new Router()

router.get('/videos', async (ctx, next) => {
  await dbModels.Video.fetchAll().then(function(results){
    ctx.body = results;
    //ctx.body.toJSON({results.});
    //ctx.response.toJSON({results}); 
  });
});

router.post('/videos', async (ctx,next) =>{
 // var data = await getBody(ctx.request);
 // console.log(data);
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

function getBody(ctx){
    return new Promise(function(resolve,reject){
        var data = '';
        ctx.on('data', function (chunk) {
            data += chunk;
        })
        ctx.on('end', function (chunk) {
            resolve(data);
        })
    })
}

module.exports = router;
