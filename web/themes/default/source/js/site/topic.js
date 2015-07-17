OT.topic = ( function (Modernizr, OT) {
  'use strict';

	var actions = {

      handler: function () {
        // if ( document.querySelectorAll('main nav.topic.actions li').length > 2 ) {
        //   methods.topicMenu();
        // }
      },

      start: function () {
        // OT.global.ajaxFormBinding({
        //   formSelector: '#topic-write-form'
        // });
        // methods.postContent();
      },

      reply: function () {
        // OT.global.ajaxFormBinding({
        //   formSelector: '#topic-reply-form'
        // });
        // methods.postContent();
      },

		},

    methods = {

			init: function () {

			},

      // topicMenu: function () {
      //   var menu = document.querySelector('main nav.topic.actions ul'),
      //       moreButton = document.createElement('li'),
      //       moreAnchor = document.createElement('a');

      //   moreButton.className = 'more';
      //   moreButton.appendChild(moreAnchor);
      //   moreAnchor.appendChild(document.createTextNode('More...'));
      //   menu.appendChild(moreButton);

      //   OT.global.menu({
      //     menu: 'main nav.topic.actions',
      //     trigger: 'main nav.topic.actions li.more a',
      //     position: 'right',
      //     clone: true,
      //     keepClass: false
      //   });

      // },

      postContent: function () {
        var postContent = document.getElementById('post-content'),
            postContentText = postContent.value;

        postContent.addEventListener('focus', function (e) {
          if ( postContent.value === postContentText ) {
            postContent.value = '';
          }
        });
        postContent.addEventListener('blur', function (e) {
          if ( postContent.value === '' ) {
            postContent.value = postContentText;
          }
        });
      }

    };

	//	Public methods
	return {
		init: methods.init,
    handler: actions.handler,
    start: actions.start,
    startForm: actions.start,
    reply: actions.reply,
    replyForm: actions.reply
	};

})(Modernizr, OT);
