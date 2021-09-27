import MySQLModel from '../../mysql-model'
import log from '../../../libs/logger'

export default class MemberLogModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'member_log'
    this.selectable_fields = ['*']
    this.log_prefix = '[MemberLogModel]'
  }

<<<<<<< HEAD
  createMemberLog = async (member_seq = null, code, text, ip) => {
    const memberLog = {
      member_seq: member_seq,
      log_code: code,
      log_text: text,
      used_ipaddress: ip,
=======
  createMemberLog = async (member_seq = null, mod_member_seq, code, text, ip) => {
    const memberLog = {
      member_seq: member_seq,
      mod_member_seq: mod_member_seq,
      log_type: code,
      log_text: text,
      ip_addr: ip,
>>>>>>> 2f6467e9af1401a91d29a4baf4010cc67056f9c6
    }
    // log.debug(memberLog.log_code)
    return await this.create(memberLog, 'seq')
  }
}
