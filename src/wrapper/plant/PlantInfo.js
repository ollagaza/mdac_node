import JsonWrapper from '../json-wrapper'
import Util from '../../utils/baseutil'

const default_key_list = [
  'seq', 'member_seq', 'title', 'item_seq', 'plant_status', 'plant_day',
  'status', 'error', 'content_id', 'reg_day', 'othername', 'jitemname',
  'result_text', 'result_code'
];

export default class PlantInfo extends JsonWrapper {
  constructor(data = null, private_keys = []) {
    super(data, private_keys)
    this.setKeys(default_key_list)

    if (data) {
      if (data._no) {
        this.list_no = data._no
      }
    }

    if (this.plant_day) {
      this.reg_diff_hour = Util.hourDifference(this.plant_day, 'Y-m-d')
      this.plant_day = Util.dateFormat(this.plant_day.getTime())
    }
    if (this.reg_day) {
      this.reg_day = Util.dateFormat(this.reg_day.getTime())
    }
  }
}
