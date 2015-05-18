// Security checks to verify if users have access to a given controller/action/view

'use strict';

module.exports = {
  challenge: challenge,
  signInRedirect: signInRedirect,
  privateTopicsView: privateTopicsView,
  privateTopicStart: privateTopicStart,
  privateTopicView: privateTopicView,
  discussionView: discussionView,
  discussionPost: discussionPost,
  discussionReply: discussionReply,
  topicLock: topicLock,
  topicMerge: topicMerge,
  topicMove: topicMove,
  topicMoveForm: topicMoveForm,
  topicReply: topicReply,
  topicTrash: topicTrash,
  topicView: topicView,
  postView: postView,
  postEdit: postEdit,
  postLock: postLock,
  postTrash: postTrash
};


// Use challenge() for actions that don't require authentication, but have different
// access privileges based on the group ID. If they're not logged in, send them to
// the sign in form. If they are, respond with a 403 Forbidden.
function challenge(groupID, emitter) {

  if ( groupID === 1 ) {
    emitter.emit('ready', {
      redirect: app.config.main.baseUrl + '/sign-in'
    });
  } else {
    emitter.emit('error', {
      statusCode: 403
    });
  }

}



function signInRedirect(params, url) {

  return params.request.headers.referer && params.request.headers.referer.search('/sign-in') < 0 ? params.request.headers.referer : url;

}



function privateTopicStart(args, emitter) {

  app.listen({
    userInfo: function (emitter) {
      app.models.user.info({
        userID: args.userID
      }, emitter);
    },
    userIsIgnored: function (emitter) {
      var methods = {};

      if ( args.invitees ) {
        args.invitees.forEach( function (item, index, array) {
          methods[item] = function (emitter) {
            app.models.user.isIgnored({
              username: args.username,
              ignoredBy: item
            }, emitter);
          };
        });

        app.listen(methods, function (output) {
          var ignored = false;

          if ( output.listen.success ) {
            delete output.listen;
            for ( var property in output ) {
              if ( property === true ) {
                ignored = true;
                emitter.emit('error', {
                  statusCode: 403,
                  message: property + ' has you on their ignore list, so you can\'t invite them to a private topic.'
                });
              }
            }
            if ( !ignored ) {
              emitter.emit('ready', false);
            }
          } else {
            emitter.emit('error', output.listen);
          }
        });
      } else {
        emitter.emit('ready', false);
      }
    }
  }, function (output) {
    var message = '';

    if ( output.listen.success ) {
      if ( output.userInfo.talkPrivately && !output.userIsIgnored ) {
        emitter.emit('ready', true);
      } else {
        if ( !output.userInfo.talkPrivately ) {
          if ( output.userInfo.group === 'New Members' ) {
            message = 'New members require a minimum of 5 posts before they can start private topics.';
          } else {
            message = 'Your private topic privileges have been revoked. Please contact an administrator for details.';
          }
        }
        emitter.emit('error', {
          statusCode: 403,
          message: message
        });
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function privateTopicsView(session, emitter) {

  if ( session.talkPrivately ) {
    emitter.emit('ready', true);
  } else {
    emitter.emit('error', {
      statusCode: 403
    });
  }

}



function privateTopicView(topicID, session, emitter) {

  app.listen({
    userIsInvited: function (emitter) {
      app.models.topic.hasInvitee({
        topicID: topicID,
        userID: session.userID
      }, emitter);
    }
  }, function (output) {
    if ( output.listen.success ) {
      if ( session.talkPrivately && output.userIsInvited ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }
    } else {
      emitter.emit('error', output.listen);
    }
  });

}



function discussionView(discussion, groupID, emitter) {

	app.listen('waterfall', {
    discussionInfo: function (emitter) {
      app.models.discussion.info(discussion, emitter);
    },
    discussionPermissions: function (previous, emitter) {
      if ( previous.discussionInfo ) {
        app.models.group.discussionPermissions(discussion, groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionPermissions.read ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function discussionPost(discussion, groupID, emitter) {

	app.listen('waterfall', {
    discussionInfo: function (emitter) {
      app.models.discussion.info(discussion, emitter);
    },
    discussionPermissions: function (previous, emitter) {
      if ( previous.discussionInfo ) {
        app.models.group.discussionPermissions(discussion, groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionPermissions.post ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function discussionReply(discussion, groupID, emitter) {

	app.listen('waterfall', {
    discussionInfo: function (emitter) {
      app.models.discussion.info(discussion, emitter);
    },
    discussionPermissions: function (previous, emitter) {
      if ( previous.discussionInfo ) {
        app.models.group.discussionPermissions(discussion, groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionPermissions.reply ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      emitter.emit('error', output.listen);

    }

  });

}



function topicLock(topic, session, emitter) {

	app.listen('waterfall', {
    topicInfo: function (emitter) {
      if ( session.moderateDiscussions ) {
        app.models.topic.info(topic, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topicInfo ) {
        app.toolbox.access.discussionView(previous.topicInfo.discussionUrl, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the topic exists but the group doesn't have lock access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topicInfo ) {
        app.toolbox.access.challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function topicMerge(topic, session, emitter) {

	app.listen('waterfall', {
    topicInfo: function (emitter) {
      if ( session.moderateDiscussions ) {
        app.models.topic.info(topic, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topicInfo ) {
        app.toolbox.access.discussionView(previous.topicInfo.discussionUrl, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the topic exists but the group doesn't have merge access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topicInfo ) {
        app.toolbox.access.challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function topicMove(topic, session, emitter) {

	app.listen('waterfall', {
    topicInfo: function (emitter) {
      if ( session.moderateDiscussions ) {
        app.models.topic.info(topic, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topicInfo ) {
        if ( session.moderateDiscussions ) {
          app.toolbox.access.discussionView(previous.topicInfo.discussionUrl, session.groupID, emitter);
        } else {
          emitter.emit('error', {
            statusCode: 403
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the topic exists but the group doesn't have move access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topicInfo ) {
        app.toolbox.access.challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function topicMoveForm(topic, discussion, session, emitter) {

	app.listen('waterfall', {
    topicInfo: function (emitter) {
      if ( session.moderateDiscussions ) {
        app.models.topic.info(topic, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topicInfo ) {
        if ( session.moderateDiscussions ) {
          app.toolbox.access.discussionView(previous.topicInfo.discussionUrl, session.groupID, emitter);
        } else {
          emitter.emit('error', {
            statusCode: 403
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    discussionMoveView: function (previous, emitter) {
      app.toolbox.access.discussionView(discussion, session.groupID, emitter);
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView && output.discussionMoveView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the topic exists but the group doesn't have move access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topicInfo ) {
        app.toolbox.access.challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function topicReply(topic, session, emitter) {

	app.listen('waterfall', {
    topicInfo: function (emitter) {
      app.models.topic.info(topic, emitter);
    },
    discussionReply: function (previous, emitter) {
      if ( previous.topicInfo ) {
        if ( !previous.topicInfo.lockedByID || session.moderateDiscussions ) {
          app.toolbox.access.discussionReply(previous.topicInfo.discussionUrl, session.groupID, emitter);
        } else {
          emitter.emit('error', {
            statusCode: 403
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', true);

    } else {

      // If the topic exists but the group doesn't have reply access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topicInfo ) {
        app.toolbox.access.challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function topicTrash(topic, session, emitter) {

	app.listen('waterfall', {
    topicInfo: function (emitter) {
      if ( session.moderateDiscussions ) {
        app.models.topic.info(topic, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topicInfo ) {
        app.toolbox.access.discussionView(previous.topicInfo.discussionUrl, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the topic exists but the group doesn't have trash access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topicInfo ) {
        app.toolbox.access.challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function topicView(topic, groupID, emitter) {

	app.listen('waterfall', {
    topicInfo: function (emitter) {
      app.models.topic.info(topic, emitter);
    },
    discussionView: function (previous, emitter) {
      if ( previous.topicInfo ) {
        app.toolbox.access.discussionView(previous.topicInfo.discussionUrl, groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', true);

    } else {

      // If the topic exists but the group doesn't have read access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.topicInfo ) {
        app.toolbox.access.challenge(groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function postView(post, groupID, emitter) {

	app.listen('waterfall', {
    postInfo: function (emitter) {
      app.models.post.info(post, emitter);
    },
    topicInfo: function (previous, emitter) {
      if ( previous.postInfo ) {
        app.models.topic.info(previous.postInfo.topicUrl, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topicInfo ) {
        app.toolbox.access.discussionView(previous.topicInfo.discussionUrl, groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      emitter.emit('ready', true);

    } else {

      // If the topic exists but the group doesn't have read access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.postInfo ) {
        app.toolbox.access.challenge(groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function postEdit(post, session, emitter) {

	app.listen('waterfall', {
    postInfo: function (emitter) {
      app.models.post.info(post, emitter);
    },
    topicInfo: function (previous, emitter) {
      if ( previous.postInfo ) {
        console.log(session.username);
        console.log(previous.postInfo.author);
        if ( ( session.username === previous.postInfo.author && !previous.postInfo.lockedByID ) || session.moderateDiscussions ) {
          app.models.topic.info(previous.postInfo.topicUrl, emitter);
        } else {
          emitter.emit('error', {
            statusCode: 403
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topicInfo ) {
        app.toolbox.access.discussionView(previous.topicInfo.discussionUrl, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the post exists but the group doesn't have edit access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.postInfo ) {
        app.toolbox.access.challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function postLock(post, session, emitter) {

	app.listen('waterfall', {
    postInfo: function (emitter) {
      app.models.post.info(post, emitter);
    },
    topicInfo: function (previous, emitter) {
      if ( previous.postInfo ) {
        if ( session.moderateDiscussions ) {
          app.models.topic.info(previous.postInfo.topicUrl, emitter);
        } else {
          emitter.emit('error', {
            statusCode: 403
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topicInfo ) {
        app.toolbox.access.discussionView(previous.topicInfo.discussionUrl, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the post exists but the group doesn't have lock access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.postInfo ) {
        app.toolbox.access.challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}



function postTrash(post, session, emitter) {

	app.listen('waterfall', {
    postInfo: function (emitter) {
      app.models.post.info(post, emitter);
    },
    topicInfo: function (previous, emitter) {
      if ( previous.postInfo ) {
        if ( session.moderateDiscussions ) {
          app.models.topic.info(previous.postInfo.topicUrl, emitter);
        } else {
          emitter.emit('error', {
            statusCode: 403
          });
        }
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    },
    discussionView: function (previous, emitter) {
      if ( previous.topicInfo ) {
        app.toolbox.access.discussionView(previous.topicInfo.discussionUrl, session.groupID, emitter);
      } else {
        emitter.emit('error', {
          statusCode: 404
        });
      }
    }
  }, function (output) {

    if ( output.listen.success ) {

      if ( output.discussionView ) {
        emitter.emit('ready', true);
      } else {
        emitter.emit('error', {
          statusCode: 403
        });
      }

    } else {

      // If the post exists but the group doesn't have trash access, redirect
      // unauthenticated users to the sign in page, or throw a 403 for authenticated
      // users
      if ( output.postInfo ) {
        app.toolbox.access.challenge(session.groupID, emitter);
      // Otherwise, 404
      } else {
        emitter.emit('error', output.listen);
      }

    }

  });

}
