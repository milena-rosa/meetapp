'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

class User extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeSave', async userInstance => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  static get visible () {
    return ['id', 'name', 'email', 'token', 'password']
  }

  tokens () {
    return this.hasMany('App/Models/Token')
  }

  meetups () {
    return this.hasMany('App/Models/Meetup')
  }

  subscriptions () {
    return this.hasMany('App/Models/Subscription')
  }
}

module.exports = User
