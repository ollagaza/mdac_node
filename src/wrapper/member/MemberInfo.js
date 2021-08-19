import JsonWrapper from '../json-wrapper'
import Util from '../../utils/baseutil'

const default_key_list = [
  'seq', 'regist_date', 'modify_date', 'user_id', 'content_id',
  'password', 'user_nickname', 'user_name', 'user_first_name', 'user_last_name',
  'gender', 'email_address', 'mail_acceptance', 'birth_day', 'cellphone',
  'tel', 'user_media_path', 'certkey', 'used', 'treatcode',
  'treatname', 'admin_code', 'admin_text',
  'stop_start_date', 'stop_end_date', 'admin_info', 'lastlogin', 'etc1',
  'etc2', 'etc3', 'etc4', 'etc5', 'user_type', 'used_admin', 'profile_image_path', 'foreigner'
];

const nopass_key_list = [
  'seq', 'regist_date', 'modify_date', 'user_id', 'content_id',
  'user_nickname', 'user_name', 'user_first_name', 'user_last_name',
  'gender', 'email_address', 'mail_acceptance', 'birth_day', 'cellphone',
  'tel', 'user_media_path', 'certkey', 'used', 'treatcode',
  'treatname', 'admin_code', 'admin_text',
  'stop_start_date', 'stop_end_date', 'admin_info', 'lastlogin', 'etc1',
  'etc2', 'etc3', 'etc4', 'etc5', 'user_type', 'used_admin', 'profile_image_path', 'foreigner'
];

export default class MemberInfo extends JsonWrapper {
  constructor(data = null) {
    super(data, nopass_key_list)
    // this.setKeys(nopass_key_list);
  }
}
