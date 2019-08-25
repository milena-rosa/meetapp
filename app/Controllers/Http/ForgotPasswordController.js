'use strict'

const crypto = require('crypto')
const { isAfter, subDays } = require('date-fns')

// const Mail = use('Mail')
const User = use('App/Models/User')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      // const redirectUrl = request.input('redirect_url')

      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      // await Mail.send(
      //   ['emails.forgot_password', 'emails.forgot_password-text'],
      //   {
      //     name: user.name,
      //     email,
      //     token: user.token,
      //     link: `${request.input('redirect_url')}?token=${user.token}`
      //   },
      //   message => {
      //     message
      //       .to(user.email)
      //       .from('noreply@meetapp.com', 'MeetApp')
      //       .subject('Recuperação de senha')
      //   }
      // )
    } catch (err) {
      return response.status(err.status).send({
        error: {
          message: 'Something went wrong. Verify if your e-mail is correct.'
        }
      })
    }
  }

  async update ({ request, response }) {
    try {
      const { token, password } = request.all()
      const user = await User.findByOrFail('token', token)

      // verify if token is older than 2 days
      const tokenExpired = isAfter(
        subDays(new Date(), 2),
        user.token_created_at
      )

      if (tokenExpired) {
        return response.status(401).send({
          error: {
            message: 'The given token has already expired.'
          }
        })
      }

      // restart fields related with the recovery token
      user.token = null
      user.token_created_at = null
      // update the password field with the password sent through the requisition
      user.password = password

      await user.save()

      return user
    } catch (err) {
      return response.status(err.status).send({
        error: {
          message: 'Something went wrong.'
        }
      })
    }
  }
}

module.exports = ForgotPasswordController
