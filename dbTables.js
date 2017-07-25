'use strict'

var Router = require("koa-router");
var User = require("./models/dbTables");

const router = new Router()

router.get('/user', async (ctx, next) => {
  ctx.body = 'dupa'
  User.fetchAll().then(function(results){
    results.forEach(function (model) {
            ctx.body = 'test'
            console.log(model.attributes);
        }) 
  });
});

module.exports = router;
