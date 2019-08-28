'use strict'

const Env = use('Env')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Avatar extends Model {
  static get computed () {
    return ['url']
  }

  getUrl ({ id }) {
    return `http://134.209.58.97/avatars/${id}`
    // return `${Env.get('APP_URL')}/avatars/${id}`
  }

  static get visible () {
    return ['id', 'file', 'name', 'type', 'subtype', 'url']
  }

  user () {
    this.belongsTo('App/Models/User')
  }
}

module.exports = Avatar
