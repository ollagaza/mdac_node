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
      log_code: code,
      log_text: text,
      used_ipaddress: ip,
    }
    // log.debug(memberLog.log_code)
    return await this.create(memberLog, 'seq')
  }
}
