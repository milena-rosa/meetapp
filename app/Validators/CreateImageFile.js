'use strict'

const Antl = use('Antl')

class CreateFile {
  get validateAll () {
    return true
  }

  get messages () {
    return Antl.list('validation')
  }

  async fails (errorMessages) {
    return this.ctx.response.status(400).json(errorMessages)
  }

  get rules () {
    return {
      file: 'file|file_ext:png,jpg,jpeg|file_size:2mb|file_types:image'
    }
  }
}

module.exports = CreateFile
