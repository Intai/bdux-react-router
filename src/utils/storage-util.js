import R from 'ramda'
import Common from './common-util'

export const remove = (name) => (
  window.sessionStorage.removeItem(name)
)

export default {

  remove: R.when(
    () => Common.canUseDOM(),
    remove
  )
}
