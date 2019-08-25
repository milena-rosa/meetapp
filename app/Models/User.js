'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class User extends Model {
  static boot () {
    super.boot()

    this.addHook('beforeSave', 'UserHook.hashPassword')
    this.addHook('beforeSave', 'UserHook.sendResetPasswordMail')
  }

  static get visible () {
    return ['id', 'name', 'email', 'token']
  }

  tokens () {
    return this.hasMany('App/Models/Token')
  }

  avatar () {
    return this.belongsTo('App/Models/Avatar')
  }

  meetups () {
    return this.hasMany('App/Models/Meetup')
  }

  subscriptions () {
    return this.hasMany('App/Models/Subscription')
  }
}

module.exports = User
