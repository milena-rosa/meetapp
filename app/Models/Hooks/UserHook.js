'use strict'

const Hash = use('Hash')

const UserHook = (module.exports = {})

/**
 * Hash using password as a hook.
 */
UserHook.hashPassword = async userInstance => {
  if (userInstance.dirty.password) {
    userInstance.password = await Hash.make(userInstance.password)
  }
}
