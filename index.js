'use strict'
const Koa = require('koa')
const BodyParser = require('koa-bodyparser')
const Json = require('koa-json')
const Router = require('koa-router');
const serve = require('koa-static');
const Pug = require('koa-pug')
const Passport = require('koa-passport');
const Session = require('koa-session2');
const Api = require('./api')
const dbModels = require('./models/dbTables');
const sessionstore = require('./session');

const app = new Koa();
const router = new Router();

app.use(serve('assets'));

app.use(Session({
    key: 'SESSIONID'
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
    app // equals to pug.use(app) and app.use(pug.middleware)
});

router.get('/', async (ctx, next) => {
    ctx.render('navbar', { user_loged_in: ctx.isAuthenticated() });
});

router.get('/register', async (ctx, next) => {
    ctx.render("register", { title: "Register" });
});

router.post('/register', async (ctx, next) => {
    var errors;
    if (!ctx.request.body.username || !ctx.request.body.password || !ctx.request.body.email) {
        errors = 'invalid data';
    } else {
        var newUser = new dbModels.User({
            login: ctx.request.body.username,
            password: ctx.request.body.password,
            emailAddress: ctx.request.body.email
        });
        await dbModels.createUser(newUser);
        ctx.redirect('/login');
    }

    console.log(newUser);

    if (errors) {
        ctx.render('register', {
            errors: errors
        });
    }
});

router.get('/login', async (ctx, next) => {
    ctx.render('login', { title: 'Login' });
});

router.post('/login', makeLogin);

router.get('/logout', async (ctx, next) => {
    ctx.logout();
    ctx.redirect('/');
});

router.get('/video_form', async (ctx, next) => {
    ctx.render('video_form', { title: 'Video form' });
});

router.get('/view_movie/:videoId', async (ctx, next) => {
    var video = await dbModels.getVideoFromDb(ctx.params.videoId);
    ctx.render('video_view', {
        video_title: video.attributes.title,
        video_id: ctx.params.videoId,
        user_loged_in: ctx.isAuthenticated()
    });
});

pug.locals.someKey = 'very_secret765GfvF$'
app.use(BodyParser({ strict: false, limit: '100mb' }));
app.use(Json());
app.use(Api.routes());
app.use(router.routes());

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
            ctx.redirect('/');
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