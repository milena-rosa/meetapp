'use strict'

const Antl = use('Antl')

class UserCreate {
  get validateAll () {
    return true
  }

  get rules () {
    return {
      name: 'required|min:3',
      email: 'required|email|unique:users',
      password: 'required|min:8|confirmed'
    }
  }

  get messages () {
    return Antl.list('validation')
  }
}

module.exports = UserCreate
