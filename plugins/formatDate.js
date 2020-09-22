import moment from 'moment'
import 'moment/locale/fr'

export default (context, inject) => {
  inject('formatDate', (date) => moment(date).format('ll'))
}
