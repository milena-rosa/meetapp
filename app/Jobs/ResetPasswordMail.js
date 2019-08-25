'use strict'

const Mail = use('Mail')

class ResetPasswordMail {
  static get concurrency () {
    return 1
  }

  static get key () {
    return 'ResetPasswordMail-job'
  }

  async handle ({ user }) {
    console.log(`Job: ${ResetPasswordMail.key}`)

    await Mail.send(
      ['emails.forgot_password', 'emails.forgot_password-text'],
      {
        name: user.name,
        email: user.email,
        token: user.token
        // link: `${redirectUrl}?token=${user.token}`
      },
      message => {
        message
          .to(user.email)
          .from('noreply@meetapp.com', 'MeetApp')
          .subject('Recuperação de senha')
      }
    )
  }
}

module.exports = ResetPasswordMail
