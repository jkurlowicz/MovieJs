"use strict"

var bookshelf = require("../bookshelf");
var bcrypt = require("bcryptjs");

var User = bookshelf.Model.extend({
    tableName: 'user',
    comments: function () {
        return this.hasMany(VideoComment);
    },
    videos: function () {
        return this.hasMany(Video);
    }
});

var Video = bookshelf.Model.extend({
    tableName: 'video',
    comments: function () {
        return this.hasMany(VideoComment);
    },
    user: function () {
        return this.belongsTo(User);
    }
});

var VideoComment = bookshelf.Model.extend({
    tableName: 'comment',
    video: function () {
        return this.belongsTo(Video);
    },
    user: function () {
        return this.belongsTo(User);
    }
});

module.exports = { User, Video, VideoComment };

module.exports.getVideoFromDb = function (videoId) {
    var videoInfo = Video.query({ where: { id: Number(videoId) } })
        .fetch({ require: true })
        .then(function (resData) {
            return resData;
        });

    return videoInfo;
}

module.exports.getUserFromDb = function (login) {
    var UserInfo = User.query({ where: {login: login} })
        .fetch({ require: true })
        .then(function (resData) {
            return resData;
        });

    return UserInfo;
}

module.exports.createUser = function(newUser){
    newUser.save(null, { method: 'insert' });
}