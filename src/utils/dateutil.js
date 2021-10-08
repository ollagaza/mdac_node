// declare function moment(inp?: moment.MomentInput, strict?: boolean): moment.Moment;
import moment, { months } from 'moment'

const log_prefix = '[dateutil]'

export default {
    'getToday' : () => moment(new Date()).format('YYYYMMDD')
}