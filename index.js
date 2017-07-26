'use strict'
var Koa = require("koa")
var BodyParser = require("koa-bodyparser")
var Json = require("koa-json")
var Router = require("koa-router");
var serve = require("koa-static");
var Pug = require("koa-pug")
var Passport = require("koa-passport");
var Session = require("koa-session2");
var Convert = require("koa-convert");
var Api = require("./api")
var dbModels = require("./models/dbTables");
var sessionstore = require("./session");

const app = new Koa();
const routerNonApi = new Router();

app.use(serve('assets'));

app.use(Session({
    key: "SESSIONID",
}));

app.use(Passport.initialize())
app.use(Passport.session())

const pug = new Pug({
    viewPath: './views',
    debug: false,
    pretty: false,
    compileDebug: false,
    helperPath: [
        { _: require('lodash') }
    ],
    app: app // equals to pug.use(app) and app.use(pug.middleware)
})

routerNonApi.get("/", async (ctx, next) => {
    console.log(ctx.state.user);
    ctx.render("navbar", { userLogedIn: ctx.isAuthenticated() });
});

routerNonApi.get("/register", async (ctx, next) => {
    ctx.render("register", { title: "Register" });
});

routerNonApi.post("/register", async (ctx, next) => {
    var errors;
    if (!ctx.request.body.username || !ctx.request.body.password || !ctx.request.body.email) {
        errors = "invalid data";
    } else {
        var newUser = new dbModels.User({
            login: ctx.request.body.username,
            password: ctx.request.body.password,
            emailAddress: ctx.request.body.email
        });
        await dbModels.createUser(newUser);
        ctx.redirect("/login");
    }

    console.log(newUser);

    if (errors) {
        ctx.render("register", {
            errors: errors
        });
    }
});

routerNonApi.get("/login", async (ctx, next) => {
    ctx.render("login", { title: "Login" });
});

routerNonApi.post("/login", makeLogin);

routerNonApi.get("/logout", async (ctx, next) => {
    ctx.logout();
    ctx.redirect("/");
});

routerNonApi.get("/video_form", async (ctx, next) => {
    ctx.render("video_form", { title: "Video form" });
});

routerNonApi.get("/view_movie/:videoId", async (ctx, next) => {
    var videoTitle = await dbModels.getVideoFromDb(ctx.params.videoId);
    ctx.render("video_view", {
        video_title: videoTitle.attributes.title,
        video_id: ctx.params.videoId,
        userLogedIn: ctx.isAuthenticated()
    });

});
// routerNonApi.post("/add_video", async (ctx, next) => {
//     var errors;
//     if (!ctx.request.body.videotitle) {
//         errors = "invalid data";
//     } else {
//         console.log("dziala");
//     }

//     if (errors) {
//         ctx.render("video_form", {
//             errors: errors
//         });
//     }
// });

pug.locals.someKey = 'very_secret765GfvF$'
app.use(BodyParser({ strict: false, limit: '100mb' }));
app.use(Json());
app.use(Api.routes());
app.use(routerNonApi.routes());

Passport.serializeUser((user, done) => {
    done(null, { id: user.attributes.id })
})

Passport.deserializeUser((user, done) => {
    done(null, user)
})

app.listen(3000);

async function makeLogin(ctx) {
    const { username, password } = ctx.request.body
    try {
        const user = await dbModels.getUserFromDb(username);
        if (!user) {
            ctx.status = 401
            return ctx.body = { errors: [{ title: 'User not found', status: 401 }] }
        }

        var matches = dbModels.comparePasswords(password, user.attributes.password);
        if (matches) {
            ctx.redirect("/");
            return ctx.login(user)
        } else {
            console.log('u, p', username, password)
            ctx.status = 401
            return ctx.body = { errors: [{ title: 'Password does not match', status: 401 }] }
        }
    } catch (err) {
        ctx.status = 500
        return ctx.body = { errors: [{ title: err.message, status: 500, stack: err.stack }] }
    }
}

