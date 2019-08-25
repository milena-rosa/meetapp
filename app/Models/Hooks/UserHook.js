'use strict'

const Hash = use('Hash')
const Kue = use('Kue')
const Job = use('App/Jobs/ResetPasswordMail')

const UserHook = (module.exports = {})

/**
 * Hash using password as a hook.
 */
UserHook.hashPassword = async userInstance => {
  if (userInstance.dirty.password) {
    userInstance.password = await Hash.make(userInstance.password)
  }
}

/**
 * Hash using password as a hook.
 */
UserHook.sendResetPasswordMail = async userInstance => {
  if (userInstance.dirty.token) {
    Kue.dispatch(Job.key, { user: userInstance }, { attempts: 3 })
  }
}

// link: `${request.input('redirect_url')}?token=${user.token}`
