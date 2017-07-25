const PgStore = require('koa-pg-session')
var dbInfo = (require('./knexfile'));
const store = new PgStore(dbInfo.connection);

module.exports.init = function () {
  return sessionStore.setup()
}

 
module.exports = store