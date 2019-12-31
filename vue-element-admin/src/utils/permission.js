import store from '@/store'

/**
 * @param {Array} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue
 */
export default function checkPermission(permission) {
  const myPermissions = store.getters.permissions
  return myPermissions.indexOf(permission) > -1
}
