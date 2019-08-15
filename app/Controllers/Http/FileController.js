'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Helpers = use('Helpers')
const File = use('App/Models/File')

/**
 * Resourceful controller for interacting with files
 */
class FileController {
  /**
   * Show an existing file.
   * GET files/:id
   */
  async show ({ response, params }) {
    const file = await File.findOrFail(params.id)
    // .file = file name stored in the DB
    return response.download(Helpers.tmpPath(`uploads/${file.file}`))
  }

  /**
   * Create/save a new file.
   * POST files
   */
  async store ({ request, response }) {
    try {
      // property sent by the client called 'file'
      if (!request.file('file')) {
        return
      }

      const upload = request.file('file', { size: '2mb' })
      const fileName = `${Date.now()}.${upload.subtype}`

      // save the file to a temp path
      await upload.move(Helpers.tmpPath('uploads'), { name: fileName })

      if (!upload.moved()) {
        throw upload.error()
      }

      const file = await File.create({
        file: fileName,
        name: upload.clientName,
        type: upload.type,
        subtype: upload.subtype
      })

      return file
    } catch (err) {
      return response.status(err.status).send({
        error: { message: 'Something went wrong in the file upload.' }
      })
    }
  }
}

module.exports = FileController
