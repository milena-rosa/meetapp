'use strict'

const User = use('App/Models/User')

class SessionController {
  async store ({ request, response, auth }) {
    try {
      const { email, password } = request.all()

      // create token jwt
      const token = await auth.attempt(email, password)

      const user = await User.findBy('email', email)
      await user.load('avatar')

      return {
        user,
        token
      }
    } catch (err) {
      return response.status(err.status).send(err.message)
    }
  }
}

module.exports = SessionController
