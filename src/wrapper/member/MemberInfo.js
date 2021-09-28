import JsonWrapper from '../json-wrapper'
import Util from '../../utils/baseutil'

const default_key_list = [
  'seq', 'user_id', 'user_name', 'password', 'email',
  'phone', 'is_used', 'is_admin',
  'memo', 'reason', 'reg_date', 'mod_date', 'lastlogin'
];

const nopass_key_list = [
  'seq', 'user_id', 'user_name', 'password', 'email',
  'phone', 'is_used', 'is_admin',
  'memo', 'reason', 'reg_date', 'mod_date', 'lastlogin'
];

export default class MemberInfo extends JsonWrapper {
  constructor(data = null) {
    super(data, nopass_key_list)
    // this.setKeys(nopass_key_list);
  }
}
