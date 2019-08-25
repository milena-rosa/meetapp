'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Helpers = use('Helpers')
const Avatar = use('App/Models/Avatar')

/**
 * Resourceful controller for interacting with avatars
 */
class AvatarController {
  /**
   * Create/save a new avatar.
   * POST avatars
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

      const file = await Avatar.create({
        file: fileName,
        name: upload.clientName,
        type: upload.type,
        subtype: upload.subtype
      })

      return file
    } catch (err) {
      return response.status(err.status).send({
        error: { message: 'Something went wrong in the avatar upload.' }
      })
    }
  }

  /**
   * Display a single avatar.
   * GET avatars/:id
   */
  async show ({ response, params }) {
    const avatar = await Avatar.findOrFail(params.id)
    return response.download(Helpers.tmpPath(`uploads/${avatar.file}`))
  }
}

module.exports = AvatarController
