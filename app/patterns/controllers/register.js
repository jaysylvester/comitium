// register controller

'use strict'

module.exports = {
  handler       : handler,
  form          : form,
  complete      : complete,
  verification  : verification
}


function handler(params) {
  params.form.username = ''
  params.form.email = ''
  params.form.password = ''
  params.form.tos = false

  return {
    content: {
      verification: verification()
    }
  }
}


async function form(params, context) {
  if ( params.request.method === 'POST' ) {
    params.form.tos = params.form.tos || false

    if ( parseInt(params.form.first_int, 10) + parseInt(params.form.second_int, 10) !== parseInt(params.form.verification, 10) ) {
      return {
        content: {
          message: 'Are you a bot? If not, please try again.',
          verification: verification()
        }
      }
    }

    let register = await app.models.user.create(params.form)

    if ( register.success ) {
      let mail = await app.models.content.mail({
        template: 'Registration',
        replace: {
          activationUrl: app.config.comitium.baseUrl + 'user/action/activate/id/' + register.id + '/activationCode/' + register.activationCode,
          username: register.username
        }
      })

      app.toolbox.mail.sendMail({
        from: app.config.comitium.email,
        to: register.email,
        subject: mail.subject,
        text: mail.text
      })

      return {
        redirect: app.config.comitium.basePath + 'register/action/complete'
      }
    } else {
      return {
        content: {
          message: register.message,
          verification: verification()
        }
      }
    }
  // If it's a GET, fall back to the default action
  } else {
    return handler(params, context)
  }
}


function complete() {
  return {
    view: 'complete'
  }
}


function verification() {
  let verification = {}
  verification.firstInt  = app.toolbox.helpers.getRandomIntInclusive(0, 10)
  verification.secondInt = app.toolbox.helpers.getRandomIntInclusive(1, 10)
  verification.options   = [ verification.firstInt + verification.secondInt ]

  while ( verification.options.length < 8 ) {
    let value = app.toolbox.helpers.getRandomIntInclusive(1, 20)

    if ( verification.options.indexOf(value) === -1 ) {
      verification.options.push(value)
    }
  }

  verification.options.sort((a, b) => a - b)
  return verification
}
