'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

const { isBefore, parseISO, format } = require('date-fns')
const ptBR = require('date-fns/locale/pt-BR')

const Model = use('Model')

class Meetup extends Model {
  static get computed () {
    return ['past', 'formattedDate']
  }

  // virtual field "PAST" => verify if the event's date has already passed
  getPast ({ date }) {
    if (typeof date === 'string') {
      return isBefore(parseISO(date), new Date())
    }
    return isBefore(date, new Date())
  }

  // virtual field "FORMATTEDDATE" => format the date to the correct zoned time
  getFormattedDate ({ date }) {
    if (typeof date === 'string') {
      return format(parseISO(date), "d 'de' MMMM', às' HH'h'mm", {
        locale: ptBR
      })
    }
    return format(date, "d 'de' MMMM', às' HH'h'mm", {
      locale: ptBR
    })
  }

  static get visible () {
    return [
      'id',
      'title',
      'description',
      'location',
      'date',
      'past',
      'file_id',
      'formattedDate'
    ]
  }

  user () {
    return this.belongsTo('App/Models/User')
  }

  subscriptions () {
    return this.hasMany('App/Models/Subscription')
  }

  file () {
    return this.belongsTo('App/Models/File')
  }
}

module.exports = Meetup
