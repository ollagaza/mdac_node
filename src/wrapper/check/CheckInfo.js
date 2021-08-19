import JsonWrapper from '../json-wrapper'
import Util from '../../utils/baseutil'

const default_key_list = [
  'seq', 'member_seq', 'req_orgcode', 'req_orgname', 'req_doctor', 'req_phone',
  'req_address', 'patient_name', 'patient_age', 'patient_sex', 'in_date',
  'status', 'progress', 'is_img', 'is_csv', 'reg_date', 'mod_date', 'req_title'
];

export default class CheckInfo extends JsonWrapper {
  constructor(data = null, private_keys = []) {
    super(data, private_keys)
    this.setKeys(default_key_list)

    if (data) {
      if (data._no) {
        this.list_no = data._no
      }
    }

    if (this.reg_date) {
      this.reg_diff_hour = Util.hourDifference(this.reg_date, 'Y-m-d')
      this.reg_date = Util.dateFormat(this.reg_date.getTime())
    }
    if (this.modify_date) {
      this.modify_date = Util.dateFormat(this.modify_date.getTime())
    }
  }
}
