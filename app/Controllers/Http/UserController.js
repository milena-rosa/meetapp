'use strict'

const Hash = use('Hash')
const User = use('App/Models/User')

class UserController {
  async store ({ request }) {
    const data = request.only(['name', 'email', 'password', 'avatar_id'])

    const user = await User.create(data)
    await user.load('avatar')

    return user
  }

  async update ({ request, response, auth }) {
    try {
      const data = request.all()
      const user = await User.findOrFail(auth.user.id)

      if (data.oldPassword !== undefined && data.password !== undefined) {
        const isSame = await Hash.verify(data.oldPassword, user.password)
        if (!isSame) {
          return response.status(401).send({
            error: {
              message: 'Verify old password.'
            }
          })
        }

        if (data.password !== data.password_confirmation) {
          return response.status(401).send({
            error: {
              message: 'Password confirmation does not match.'
            }
          })
        }
      }

      if (data.email !== user.email) {
        const emailTaken = await User.findBy('email', data.email)
        if (emailTaken) {
          return response.status(400).send({
            error: {
              message: 'The given e-mail has been already taken.'
            }
          })
        }
      }

      await user.merge({
        name: data.name,
        email: data.email,
        password: data.password,
        avatar_id: data.avatar_id
      })
      await user.save()

      await user.load('avatar')
      return user
    } catch (err) {
      return response.status(400).send({
        error: {
          message: 'Something went wrong while updating your data.',
          err: err.message
        }
      })
    }
  }
}

module.exports = UserController
