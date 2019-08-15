'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Subscription extends Model {
  static boot () {
    super.boot()

    // send email to the meetup organizer when subscription is created
    this.addHook('afterSave', 'SubscriptionHook.sendNewSubscriptionMail')
  }

  static get visible () {
    return ['id', 'user_id', 'meetup_id']
  }

  meetup () {
    return this.belongsTo('App/Models/Meetup')
  }

  user () {
    return this.belongsTo('App/Models/User')
  }
}

module.exports = Subscription
