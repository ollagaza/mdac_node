import JsonWrapper from '../json-wrapper'
import Util from '../../utils/baseutil'

const default_key_list = [
  'seq', 'project_name', 'is_class',
  'status', 'memo', 'reason', 'reg_member_seq', 'reg_date'
];

const nopass_key_list = [
  'seq', 'project_name', 'is_class',
  'status', 'memo', 'reason', 'reg_member_seq', 'reg_date'
];

export default class ProjectInfo extends JsonWrapper {
  constructor(data = null) {
    super(data, nopass_key_list)
    // this.setKeys(nopass_key_list);
  }
}
