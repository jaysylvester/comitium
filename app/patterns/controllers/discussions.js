// discussions controller

'use strict'

const config = {
  global: {
    legalFormats: {
      json: true
    }
  }
}

module.exports = {
  handler : handler,
  head    : head,
  config  : config
}


async function handler(params) {
  let categories = await app.models.discussions.categories(params.session.group_id)

  categories.forEach( function (item) {
    item.subcategories.forEach( function (item) {
      if ( app.toolbox.moment(item.last_post_created).isAfter(params.session.last_activity) && item.last_post_author_id !== params.session.user_id ) {
        item.unread = true
      }
    })
  })

  return {
    public: {
      categories: categories
      // Breadcrumbs will return when the today/home page is done
      // breadcrumbs: app.models.discussions.breadcrumbs()
    },
    include: {
      announcements: {
        route: '/announcements/end/4',
        view: 'compact'
      }
    }
  }
}


function head() {
  return app.models.discussions.metaData()
}
