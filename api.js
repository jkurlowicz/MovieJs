'use strict'

const Router = require("koa-router");
const BusUploader = require("koa-busboy")
const dbModels = require("./models/dbTables");
const Stream = require("koa-stream");
const Path = require("path");
const fs = require('fs');
const extname = Path.extname;

const router = new Router();
const folderPath = "./upload";
const uploader = BusUploader({
    dest: folderPath
})

router.get("/videos", async (ctx, next) => {
    const results = await dbModels.Video.fetchAll();
    ctx.body = results;
});

router.post("/videos", uploader, async (ctx, next) => {
    if (ctx.isAuthenticated()) {
        if (!ctx.request.body.videotitle) {
            //do sth
        }
        else {
            let fileReadStream = ctx.request.files[0];
            if (fileReadStream) {
                console.log('jest plik');
                var newVideo = new dbModels.Video({
                    path: getFileName(fileReadStream.path),
                    title: ctx.request.body.videotitle,
                    description: ctx.request.body.vidoedescription,
                    user_id: ctx.state.user.id
                });

                newVideo.save(null, { method: 'insert' });
            }else{
                console.log("ni ma filmu");
            }
        }
    }
});

router.delete("/videos/:videoId", async (ctx, next) => {
    if (ctx.isAuthenticated()) {
        if (!isFinite(ctx.params.videoId)) {
            //return error
        } else {
            await dbModels.Video.forge({ id: ctx.params.videoId })
                .fetch({ require: true })
                .then(function (video) {
                    video.destroy();
                });
        }
    }
});

router.get("/videos/:videoId/stream", async (ctx, next) => {
    if (!isFinite(ctx.params.videoId)) {
        console.log("return error");
    } else {
        var videoInfo = await dbModels.getVideoFromDb(ctx.params.videoId);
        console.log(videoInfo.attributes.path);
        const fpath = getVideoPath(videoInfo.attributes.path);
        const fstat = await stat(fpath);

        if (fstat.isFile()) {
            ctx.type = extname(fpath);
            ctx.body = fs.createReadStream(fpath);
        }
    }
});

router.get("/videos/:videoId/comments", async (ctx, next) => {
    if (!isFinite(ctx.params.videoId)) {
        //return error
    } else {
        const results = await dbModels.VideoComment.query({ where: { video_id: ctx.params.videoId } })
            .fetchAll({ require: true });
        ctx.body = results;
    }
});

router.post("/videos/:videoId/comments", async (ctx, next) => {
    if (ctx.isAuthenticated()) {
        if (!ctx.request.body.content || !isFinite(ctx.params.videoId)) {
            //do sth
        }
        else {
            var newVideoComment = new dbModels.VideoComment({
                content: ctx.request.body.content,
                video_id: ctx.params.videoId,
                user_id: ctx.state.user.id
            });
            await newVideoComment.save(null, { method: 'insert' });
            ctx.redirect("/view_movie/"+ctx.params.videoId)
        }
    }
});

router.get("/users/:userId/videos", async (ctx, next) => {
    if (!isFinite(ctx.params.userId)) {
        //return error
    } else {
        await dbModels.Video.query({ where: { user_id: ctx.params.userId } })
            .fetchAll({ require: true })
            .then(function (resData) {
                resData.forEach(function (model) {
                    console.log(model.attributes)
                })
            });
    }
});

router.get("/users/:userId/comments", async (ctx, next) => {
    if (!isFinite(ctx.params.userId)) {
        //return error
    } else {
        await dbModels.VideoComment.query({ where: { user_id: ctx.params.userId } })
            .fetchAll({ require: true })
            .then(function (resData) {
                resData.forEach(function (model) {
                    console.log(model.attributes)
                })
            });
    }
});

router.delete("/comments/:commentId", async (ctx, next) => {
    if (ctx.isAuthenticated()) {
        if (!isFinite(ctx.params.commentId)) {
            //return error
        } else {
            await dbModels.VideoComment.forge({ id: ctx.params.commentId })
                .fetch({ require: true })
                .then(function (comment) {
                    comment.destroy();
                });
        }
    }
});

function stat(file) {
    return new Promise(function (resolve, reject) {
        fs.stat(file, function (err, stat) {
            if (err) {
                reject(err);
            } else {
                resolve(stat);
            }
        });
    });
}

function getFileName(path) {
    var fileName = path.substring(path.lastIndexOf("/") + 1);
    return fileName.trim();
}

function getVideoPath(fileName) {
    console.log(Path.join(__dirname, folderPath, fileName));
    return Path.join(__dirname, folderPath, fileName);
}

module.exports = router;
