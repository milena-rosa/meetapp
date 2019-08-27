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
      let updatedData = {
        name: data.name || user.name,
        avatar_id: data.avatar_id || user.avatar_id
      }

      if (data.oldPassword === undefined && data.password !== undefined) {
        return response.status(401).send({
          error: {
            message: 'Please, confirm your old password.'
          }
        })
      }

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

        updatedData = {
          ...updatedData,
          password: data.password
        }
      }

      if (data.email !== undefined && data.email !== user.email) {
        const emailTaken = await User.findBy('email', data.email)
        if (emailTaken) {
          return response.status(400).send({
            error: {
              message: 'The given e-mail has been already taken.'
            }
          })
        }

        updatedData = {
          ...updatedData,
          email: data.email
        }
      }

      await user.merge(updatedData)
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
