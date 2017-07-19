'use strict';
exports.up = function(knex) {
  return knex.schema.createTableIfNotExists('user', function(table) {
      table.increments('id').primary();
      table.string('login');
      table.string('password');
      table.string('emailAddress');
    }).createTableIfNotExists('video', function(table){
      table.increments('id').primary();
      table.string('path');
      table.string('title');
      table.string('description');
      table.integer('user_id').references('user.id')
    }).createTableIfNotExists('comment', function(table) {
      table.increments('id').primary();
      table.string('content');
      table.integer('video_id').references('video.id');
      table.integer('user_id').references('user.id')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('user')
    .dropTable('video')
    .dropTable('comment');
};