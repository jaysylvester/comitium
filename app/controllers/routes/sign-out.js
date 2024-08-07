// sign out controller

export const handler = (params, request) => {

  if ( params.session.user_id ) {
    app.models.user.log({
      userID: params.session.user_id,
      action: 'Sign out',
      ip: app.helpers.util.ip(request.remoteAddress)
    })
  }

  return {
    view: params.url.reason || 'sign-out',
    cookie: {
      comitium_id: {
        expires: 'now'
      }
    },
    session: {
      expires: 'now'
    }
  }
}
