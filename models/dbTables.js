"use strict"

var bookshelf = require("../bookshelf");

var User = bookshelf.Model.extend({
    tableName: 'user',
    comments: function() {
        return this.hasMany(VideoComment);
    },
    videos: function() {
        return this.hasMany(Video);
    }
});

var Video = bookshelf.Model.extend({
    tableName: 'video',
    comments: function() {
        return this.hasMany(VideoComment);
    },
    user: function() {
        return this.belongsTo(User);
    }
});

var VideoComment = bookshelf.Model.extend({
    tableName: 'comment',
    video: function() {
        return this.belongsTo(Video);
    },
    user: function() {
        return this.belongsTo(User);
    }
});

module.exports = User, Video, VideoComment;