'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

const { isBefore, parseISO } = require('date-fns')

const Model = use('Model')

class Meetup extends Model {
  static get computed () {
    return ['past']
  }

  // virtual field "PAST" => verify if the event's date has already passed
  getPast ({ date }) {
    if (typeof date === 'string') {
      return isBefore(parseISO(date), new Date())
    }
    return isBefore(date, new Date())
  }

  static get visible () {
    return ['id', 'title', 'description', 'location', 'date', 'past', 'file_id']
  }

  user () {
    return this.belongsTo('App/Models/User')
  }

  // subscriptions () {
  // return this.hasMany('App/Models/Subscription')
  // }

  file () {
    return this.belongsTo('App/Models/File')
  }
}

module.exports = Meetup
