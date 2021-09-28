import DBMySQL from '../../database/knex-mysql'
import logger from '../../libs/logger'
import MemberLogModel from '../../database/mysql/member/MemberLogModel'
// import GroupService from './GroupService'

// 1001 - 사용자생성 1002 - 사용자정보 수정 9998- 잘못된사용자 9999 -
// 1009 - 로그아웃.
const MemberLogServiceClass = class {
  constructor () {
    this.log_prefix = '[MemberLogServiceClass]'
  }

  getMemberLogModel = (database = null) => {
    if (database) {
      return new MemberLogModel(database)
    }
    return new MemberLogModel(DBMySQL)
  }

<<<<<<< HEAD
  createMemberLog = async (req, member_seq = null, code = '0000', text = '') => {
=======
  createMemberLog = async (req, member_seq = null, mod_member_seq, code = '0000', text = '') => {
>>>>>>> 2f6467e9af1401a91d29a4baf4010cc67056f9c6
    const ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const member_log_model = this.getMemberLogModel(DBMySQL)
<<<<<<< HEAD
    return member_log_model.createMemberLog(member_seq, code, text, ip)
  }

  memberModifyLog = async (req, member_seq) => {
    try {
      await this.createMemberLog(req, member_seq, '1002', 'Info Mod');
=======
    return member_log_model.createMemberLog(member_seq, mod_member_seq, code, text, ip)
  }

  memberModifyLog = async (req, member_seq, mod_member_seq) => {
    try {
      const ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

      
    logger.debug('memberModifyLog');
      await this.createMemberLog(req, member_seq, mod_member_seq, '1002', 'Info Mod', ip);
>>>>>>> 2f6467e9af1401a91d29a4baf4010cc67056f9c6
    } catch (error) {
      logger.error(this.log_prefix, '[memberModifyLog]', error);
    }
  }

  memberLogout = async (req, member_seq, leave_text) => {
    try {
<<<<<<< HEAD
      await this.createMemberLog(req, member_seq, '1009', leave_text)
=======
      await this.createMemberLog(req, member_seq, 0, '1009', leave_text)
>>>>>>> 2f6467e9af1401a91d29a4baf4010cc67056f9c6
    } catch (error) {
      logger.error(this.log_prefix, '[memberLeaveLog]', error)
    }
  }

  memberLeaveLog = async (req, member_seq, leave_text) => {
    try {
<<<<<<< HEAD
      await this.createMemberLog(req, member_seq, '9999', leave_text)
=======
      await this.createMemberLog(req, member_seq, member_seq, '9999', leave_text)
>>>>>>> 2f6467e9af1401a91d29a4baf4010cc67056f9c6
    } catch (error) {
      logger.error(this.log_prefix, '[memberLeaveLog]', error)
    }
  }
}

const member_log_service = new MemberLogServiceClass()

export default member_log_service
