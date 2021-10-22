import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import MemberModel from '../../database/mysql/member/MemberModel'
import FindPasswordModel from '../../database/mysql/member/FindPasswordModel'
import Util from '../../utils/baseutil'
import ServiceConfig from '../../service/service-config'
import JsonWrapper from '../../wrapper/json-wrapper'
import logger from '../../libs/logger'
import SendMail from '../../libs/send-mail'
import MemberTemplate from '../../template/mail/member.template'

const MemberServiceClass = class {
  constructor() {

  }
  getMemberModel = (database = null) => {
    if (database) {
      return new MemberModel(database)
    }
    return new MemberModel(DBMySQL)
  }

  getMemberInfoById = async (database, user_id) => {
    const member_model = this.getMemberModel(database)
    return await member_model.getMemberInfoById(user_id)
  }

  verify = async (user_id) => {
    const member_model = this.getMemberModel(DBMySQL)
    const result = await member_model.getVerify(user_id)
    return result;
  }

  createUser = async (req_body) => {
    const member_model = this.getMemberModel(DBMySQL)
    const result = await member_model.createUser(req_body);
    return result;
  }

  updateUser = async (member_seq, req_body) => {
    // logger.debug(req_body);
    const member_model = this.getMemberModel(DBMySQL)
    const result = await member_model.updateUser(member_seq, req_body);
    return result;
  }

  updateUserUsed = async (database, member_seq, req_body) => {
    const member_model = this.getMemberModel(database)
    const result = await member_model.updateUserUsed(member_seq, req_body);
    return result;
  }

  updateLastLogin = async (database, user_id) => {
    const member_model = this.getMemberModel(database)
    return await member_model.updateLastLogin(user_id)
  }

  checkMyToken = (token_info, member_seq) => {
    if (token_info.getId() !== member_seq) {
      if (!token_info.isAdmin()) {
        return false
      }
    }
    return true
  }

  getMemberInfoWithSub = async (database, member_seq, lang = 'kor') => {
    const member_info = await this.getMemberInfo(database, member_seq)
    const member_sub_info = await this.getMemberSubInfo(database, member_seq, lang)

    return {
      member_info,
      member_sub_info
    }
  }

  getMemberInfo = async (database, member_seq) => {
    const { member_info } = await this.getMemberInfoWithModel(database, member_seq)
    return member_info
  }

  getMemberSubInfo = async (database, member_seq, lang = 'kor') => {
    // const member_sub_model = this.getMemberSubModel(database)
    // return await member_sub_model.getMemberSubInfo(member_seq, lang)
    return null
  }

  getMemberInfoWithModel = async (database, member_seq) => {
    const member_model = this.getMemberModel(database)
    const member_info = await member_model.getMemberInfo(member_seq)
    if (member_info.isEmpty() || !member_info.seq) {
      throw new StdObject(-1, '회원정보가 존재하지 않습니다.', 400)
    }
    if (!member_info.isEmpty() && !Util.isEmpty(member_info.profile_image_path)) {
      member_info.addKey('profile_image_url')
      member_info.profile_image_url = Util.getUrlPrefix(ServiceConfig.get('static_storage_prefix'), member_info.profile_image_path)
    }

    return {
      member_model,
      member_info
    }
  }


  getMemberInfoList = async (database, start, end, is_used, search_type, keyword, member_seq) => {
    const member_model = this.getMemberModel(database)
    const member_info = await member_model.getMemberInfoList(start, end, is_used, search_type, keyword, member_seq)
    const member_paging = await member_model.getMemberInfoListPaging(start, end, is_used, search_type, keyword, member_seq)

    return {
      member_info,
      member_paging
    }
  }

  hisMember = async (database, member_seq) => {
    const output = new StdObject()

    const member_model = this.getMemberModel(database)
    const member_info = await member_model.hisMember(member_seq)

    return member_info
  }

  findMemberId = async (database, request_body) => {
    const member_info = new JsonWrapper(request_body, [])
    // logger.debug(member_info.hasValue('user_name'));
    if (!member_info.hasValue('user_name')){
      return new StdObject(-1, '잘못된 요청입니다.', 400)
    }
    if (!member_info.hasValue('email_address')){
      return new StdObject(-1, '잘못된 요청입니다.', 400)
    }

    const output = new StdObject()

    const member_model = this.getMemberModel(database)
    const find_member_info = await member_model.findMemberId(member_info)
    if (find_member_info && find_member_info.seq) {
      output.add('user_id', find_member_info.user_id)
      output.add('user_name', find_member_info.user_name)
      output.add('email_address', find_member_info.email_address)
      output.add('is_find', true)
    } else {
      output.add('is_find', false)
    }

    return output
  }

  sendAuthCode = async (database, request_body) => {
    const member_info = new JsonWrapper(request_body, [])
    if (!member_info.hasValue('user_name')){
      return new StdObject(-1, '잘못된 요청입니다.', 400)
    }
    if (!member_info.hasValue('email_address')){
      return new StdObject(-1, '잘못된 요청입니다.', 400)
    }
    if (!member_info.hasValue('user_id')){
      return new StdObject(-1, '잘못된 요청입니다.', 400)
    }

    const output = new StdObject()

    const member_model = this.getMemberModel(database)
    const find_member_info = await member_model.findMemberId(member_info)

    if (find_member_info && find_member_info.seq) {
      const remain_time = 600
      const expire_time = Math.floor(Date.now() / 1000) + remain_time

      const auth_info = await new FindPasswordModel(database).createAuthInfo(find_member_info.seq, find_member_info.email_address, expire_time)
      output.add('seq', auth_info.seq)
      output.add('check_code', auth_info.check_code)
      output.add('remain_time', remain_time)
      // logger.debug('[test1]')
      const template_data = {
        'user_name': find_member_info.user_name,
        'user_id': find_member_info.user_id,
        'email_address': find_member_info.email_address,
        'send_code': auth_info.send_code,
        'url_prefix': request_body.url_prefix,
        'request_domain': request_body.request_domain
      }
      // logger.debug('[test2]', template_data)
      const send_mail_result = await new SendMail().sendMailHtml([find_member_info.email_address], '지인 비밀번호 인증코드 입니다.', MemberTemplate.findUserInfo(template_data))
      // logger.debug('[test3]')
      if (send_mail_result.isSuccess() === false) {
        throw send_mail_result
      }

      output.add('is_send', true)
    } else {
      output.add('is_send', false)
    }

    return output
  }

  resetPassword = async (database, request_body) => {
    if (request_body.password !== request_body.password_confirm) {
      throw new StdObject(-1, '입력한 비밀번호가 일치하지 않습니다.', 400)
    }
    const find_password_model = new FindPasswordModel(database)
    const auth_info = await find_password_model.findAuthInfo(request_body.seq)
    if (!auth_info) {
      throw new StdObject(-1, '인증정보를 찾을 수 없습니다.', 400)
    }
    if (auth_info.is_verify === 1) {
      const member_model = this.getMemberModel(database)
      await member_model.changePassword(auth_info.member_seq, request_body.password)
    } else {
      throw new StdObject(-2, '인증정보가 존재하지 않습니다.', 400)
    }
    const output = new StdObject()
    output.add('is_change', true)
    return output
  }

  checkAuthCode = async (database, request_body) => {
    const find_password_model = new FindPasswordModel(database)
    const auth_info = await find_password_model.findAuthInfo(request_body.seq)
    if (!auth_info) {
      throw new StdObject(-1, '인증정보를 찾을 수 없습니다.', 400)
    }
    if (auth_info.send_code === request_body.send_code && auth_info.check_code === request_body.check_code) {
      await find_password_model.setVerify(request_body.seq)
    } else {
      throw new StdObject(-1, '인증코드가 일치하지 않습니다.', 400)
    }
    const output = new StdObject()
    output.add('is_verify', true)
    return output
  }

  changePassword = async (database, member_seq, request_body, is_admin = false) => {
    const { member_info, member_model } = await this.getMemberInfoWithModel(database, member_seq)
    if (!member_info || member_info.isEmpty()) {
      throw new StdObject(100, '등록된 회원이 아닙니다.', 400)
    }
    if (!request_body.is_admin_modify && !is_admin) {
      if (Util.trim(request_body.old_password) === '') {
        throw new StdObject(-1, '잘못된 요청입니다.', 400)
      }

      if (request_body.password !== request_body.password_confirm) {
        throw new StdObject(-1, '입력한 비밀번호가 일치하지 않습니다.', 400)
      }

      await this.checkPassword(database, member_info, request_body.old_password, false)
    }
    await member_model.changePassword(member_seq, request_body.password)
    return true
  }

  checkPassword = async (database, member_info, password, db_update = true) => {
    const member_model = this.getMemberModel(database)
    logger.debug(member_info.password, member_model.encryptPassword(password))
    if (member_info.password !== member_model.encryptPassword(password)) {
      throw new StdObject(-1, '회원정보가 일치하지 않습니다.', 400)
    }
    if (db_update) {
      await member_model.updateLastLogin(member_info.seq)
    }
  }

  MemberCount = async (database, project_seq, start_date, end_date) => {
    const member_model = this.getMemberModel(database)
    const result = await member_model.getMembercount(project_seq,  start_date, end_date);
    logger.debug(result);
    return result;
  }

  Member_1 = async (database) => {
    const member_model = this.getMemberModel(database)
    const result = await member_model.getMember_1();
    logger.debug(result);
    return result;
  }

  updateUsersUsed = async (database, req_body) => {
    const arr_member_seq = req_body.params.users;
    const used = req_body.params.used;
    logger.debug('updateUsersUsed 1', req_body.params.used, used);
    let reason = req_body.params.reason;
    const params = {}
    params.is_used = used;
    if (reason === undefined){
      reason = '';
    }
    params.reason = reason;

    const member_model = this.getMemberModel(database)
    const result = await member_model.updateUsersUsed(params, arr_member_seq);
    // 메일 발송 부분 주석처리 by djyu 2021.09.17
    // if (result.error ===0 && reason.length > 0){
    //   const send_mail = new SendMail()
    //   // logger.debug(arr_member_seq);
    //   for (const key of Object.keys(arr_member_seq)) {
    //     const seq = arr_member_seq[key];
    //     const find_member_info = await MemberService.getMemberInfo(database, seq);

    //     // logger.debug('seq', seq, find_member_info.email);
    //     if (find_member_info.email_address && find_member_info.email.length > 0) {
    //       const mail_to = [find_member_info.email_address]
    //       const subject = '[알림] 회원 강제 탈퇴 안내'
    //       const template_data = {
    //         'user_name': find_member_info.user_name,
    //         'user_id': find_member_info.user_id,
    //         'email_address': find_member_info.email,
    //         'rejectText': reason,
    //         'service_name': 'Data Manager System',
    //         'request_domain': 'http://jjin.com',
    //       }
    //       try {
    //         const send_mail_result = await send_mail.sendMailHtml(mail_to, subject, MemberTemplate.memberUsed2(template_data))
    //         // logger.debug('send_mail_result', send_mail_result);
    //       } catch (e) {
    //         logger.error('send email ', e);
    //       }
    //     }
    //   }
    // }
    return result;
  }

  deleteUser = async (database, req_body) => {
    const arr_member_seq = req_body.params.users;
    const used = req_body.params.used;

    let reason = req_body.params.reason;
    const params = {}
    params.is_used = used;

    const member_model = this.getMemberModel(database)
    const result = await member_model.deleteUser(params, arr_member_seq);

    return result;
  }
}



const member_service = new MemberServiceClass()

export default member_service
