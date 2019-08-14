'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

const Env = use('Env')
const Model = use('Model')

class File extends Model {
  // virtual field
  static get computed () {
    return ['url']
  }

  getUrl ({ id }) {
    return `${Env.get('APP_URL')}/files/${id}`
  }

  static get visible () {
    return ['id', 'file', 'name', 'type', 'subtype', 'url']
  }

  meetup () {
    this.belongsTo('App/Models/Meetup')
  }
}

module.exports = File
