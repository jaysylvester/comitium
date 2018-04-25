// private topics model

'use strict';

module.exports = {
  stats: stats,
  topics: topics,
  unread: unread,
  breadcrumbs: breadcrumbs,
  metaData: metaData
};


function stats(userID, emitter) {
  // See if this user's private topic stats are already cached
  var cacheKey = 'models-private-topics-stats',
      scope = 'private-topics-' + userID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
    // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      stats: function (emitter) {
        app.toolbox.dbPool.connect(function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select count("topicID") as "topics" from "topicInvitations" where "userID" = $1;',
              [ userID ],
              function (err, result) {
                done();
                if ( err ) {
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', result.rows);
                }
              }
            );
          }
        });
      }
    }, function (output) {

      if ( output.listen.success ) {
        output.stats[0].topicsFormatted = app.toolbox.numeral(output.stats[0].topics).format('0,0');

        // Cache the discussion info object for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: output.stats[0]
          });
        }

        emitter.emit('ready', output.stats[0]);
      } else {
        emitter.emit('error', output.listen);
      }
    });
  }
}



function unread(args, emitter) {
  // See if this user's unread private topics are already cached
  var cacheKey = 'private-topics-unread',
      scope = 'private-topics-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve it from the database and cache it
  } else {
    app.listen({
      unread: function (emitter) {
        app.toolbox.dbPool.connect(function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query({
                name: 'private_topics_unread',
                text: 'select p."topicID" from posts p join "topicInvitations" ti on ti."userID" = $1 and ti."left" = false and p."topicID" = ti."topicID" and p.id = ( select id from posts where "topicID" = ti."topicID" and "userID" <> $1 order by created desc limit 1 ) left join "topicViews" tv on ti."topicID" = tv."topicID" and tv."userID" = $1 where tv.time < p.created or tv.time is null;',
                values: [ args.userID ]
              }, function (err, result) {
                done();
                if ( err ) {
                  emitter.emit('error', err);
                } else {
                  if ( result.rows.length ) {
                    emitter.emit('ready', result.rows);
                  } else {
                    emitter.emit('ready', false);
                  }
                }
            });
          }
        });
      }
    }, function (output) {

      if ( output.listen.success ) {
        // Cache the data for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: output.unread
          });
        }

        emitter.emit('ready', output.unread);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}



function topics(args, emitter) {
  // See if this topic subset is already cached
  var start = args.start || 0,
      end = args.end || 25,
      cacheKey = 'topics-' + start + '-' + end,
      scope = 'private-topics-' + args.userID,
      cached = app.cache.get({ scope: scope, key: cacheKey });

  // If it's cached, return the cache object
  if ( cached ) {
    emitter.emit('ready', cached);
  // If it's not cached, retrieve the subset and cache it
  } else {
    app.listen({
      topics: function (emitter) {
        app.toolbox.dbPool.connect(function (err, client, done) {
          if ( err ) {
            emitter.emit('error', err);
          } else {
            client.query(
              'select t.id, t."sticky", t."replies", t."titleHtml", ti.accepted, ti.left, p."created" as "postDate", p2.id as "lastPostID", p2."created" as "lastPostCreated", u."id" as "topicStarterID", u."username" as "topicStarter", u."groupID" as "topicStarterGroupID", u."url" as "topicStarterUrl", u2."id" as "lastPostAuthorID", u2."username" as "lastPostAuthor", u2."url" as "lastPostAuthorUrl" ' +
              'from topics t ' +
              'join "topicInvitations" ti on ti."userID" = $1 ' +
              'and ti.left = false ' +
              'join posts p on p."topicID" = ti."topicID" ' +
              'and p."id" = ( select id from posts where "topicID" = t.id and draft = false order by created asc limit 1 ) ' +
              'join users u on u.id = p."userID" ' +
              'join posts p2 on p2."topicID" = ti."topicID" ' +
              'and p2."id" = ( select id from posts where "topicID" = t.id and draft = false order by created desc limit 1 ) ' +
              'join users u2 on u2.id = p2."userID" ' +
              'and t.draft = false and t.private = true ' +
              'order by p2.created desc ' +
              'limit $2 offset $3;',
              [ args.userID, end - start, start ],
              function (err, result) {
                done();
                if ( err ) {
                  emitter.emit('error', err);
                } else {
                  emitter.emit('ready', result.rows);
                }
              }
            );
          }
        });
      }
    }, function (output) {
      if ( output.listen.success ) {
        output.topics.forEach( function (item) {
          item['repliesFormatted'] = app.toolbox.numeral(item['replies']).format('0,0');
          item['postDateFormatted'] = app.toolbox.moment.tz(item['postDate'], 'America/New_York').format('D-MMM-YYYY');
          item['lastPostCreatedFormatted'] = app.toolbox.moment.tz(item['lastPostCreated'], 'America/New_York').format('D-MMM-YYYY');
        })

        // Cache the subset for future requests
        if ( !app.cache.exists({ scope: scope, key: cacheKey }) ) {
          app.cache.set({
            key: cacheKey,
            scope: scope,
            value: output.topics
          });
        }

        emitter.emit('ready', output.topics);
      } else {
        emitter.emit('error', output.listen);
      }

    });
  }
}


function breadcrumbs() {
  return {
    a: {
      name: 'Home',
      url: app.config.comitium.basePath
    },
    b: {
      name: 'Discussion Categories',
      url: 'discussions'
    }
  };
}


function metaData() {
  return {
    title: 'Discussion View',
    description: 'This is the discussion view template.',
    keywords: 'discussion, view'
  };
}
