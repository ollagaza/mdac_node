import _ from 'lodash'
import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import ServiceConfig from '../../service/service-config'
import MemberService from "./MemberService";
import MemberModel from '../../database/mysql/member/MemberModel'
import MemberInfo from '../../wrapper/member/MemberInfo'
import logger from "../../libs/logger";
import SendMail from "../../libs/send-mail";
import Util from "../../utils/baseutil";
import MemberTemplate from "../../template/mail/member.template";

const AdminMemberServiceClass = class {
  getMemberModel = (database = null) => {
    if (database) {
      return new MemberModel(database)
    }
    return new MemberModel(DBMySQL)
  }

  getMemberList = async (database, searchObj, page_navigation) => {
    const member_model = this.getMemberModel(database)
    const filter = {
      is_new: true,
      query: [],
      page_navigation: page_navigation,
    }
    _.forEach(searchObj, (value, key) => {
      filter.query[key] = value
    })
    // logger.debug('query', filter.query)
    const search_users = await member_model.searchMembers(filter)
    // if (search_users.error !== -1) {
    //   const member_seq = _.concat('in', _.map(search_users.data, 'seq'))
    //
    // }
    const res = []
    _.keyBy(search_users.data, data => {
      delete data.password;
      res.push(data);
    })
    search_users.data = res;
    return search_users
  }
  updateUsersUsed = async (database, req_body) => {
    const arr_member_seq = req_body.params.users;
    const used = req_body.params.used;
    // logger.debug('updateUsersUsed 1', req_body.params.used, used);
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
    // logger.debug('updateUsersUsed 1', req_body.params.used, used);
    let reason = req_body.params.reason;
    const params = {}
    params.is_used = used;

    const member_model = this.getMemberModel(database)
    const result = await member_model.deleteUser(params, arr_member_seq);
    
    return result;
  }  
}



const admin_member_service = new AdminMemberServiceClass()

export default admin_member_service
