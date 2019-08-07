import { when } from 'ramda'
import Common from './common-util'

export const remove = (name) => (
  window.sessionStorage.removeItem(name)
)

export default {

  remove: when(
    () => Common.canUseDOM(),
    remove
  )
}
