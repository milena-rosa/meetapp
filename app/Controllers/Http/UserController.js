'use strict'

const Hash = use('Hash')
const User = use('App/Models/User')

class UserController {
  async store ({ request }) {
    const data = request.only(['name', 'email', 'password'])

    const user = await User.create(data)
    return user
  }

  async update ({ request, response, auth }) {
    try {
      const { oldPassword } = request.all()
      const user = await User.findOrFail(auth.user.id)

      if (oldPassword === undefined) {
        return response.status(400).send({
          error: {
            message: 'You need to validate your password in order to update it.'
          }
        })
      }

      const isSame = await Hash.verify(oldPassword, user.password)
      if (!isSame) {
        return response.status(401).send({
          error: {
            message: 'Verify old password.'
          }
        })
      }

      const data = request.only(['name', 'email', 'password'])
      await user.merge(data)

      await user.save()

      return user
    } catch (err) {
      return response.status(400).send({
        error: {
          message: 'Something went wrong while updating your data.'
        }
      })
    }
  }
}

module.exports = UserController
