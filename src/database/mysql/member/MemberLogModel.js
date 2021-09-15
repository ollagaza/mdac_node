import MySQLModel from '../../mysql-model'
import log from '../../../libs/logger'

export default class MemberLogModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'member_log'
    this.selectable_fields = ['*']
    this.log_prefix = '[MemberLogModel]'
  }

  createMemberLog = async (member_seq = null, code, text, ip) => {
    const memberLog = {
      member_seq: member_seq,
      mod_member_seq: member_seq,
      log_type: code,
      memo: text,
      ip_addr: ip,
    }
    // log.debug(memberLog.log_code)
    return await this.create(memberLog, 'seq')
  }
}
