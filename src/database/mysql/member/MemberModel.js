import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import moment from "moment";
import knex from '../../knex-mysql';

export default class MemberModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'member'
    this.private_fields = [
      'password'
    ]
  }

  createUser  = async (member_info) => {
    // logger.debug(member_info.password)
    // const member = member_info.toJSON()
    member_info.password = this.encryptPassword(member_info.password)
    //member_info.content_id = Util.getContentId();
    //member_info.user_nickname = member_info.user_id;
    //member_info.gender = 1;
    member_info.is_admin = 'N';
    member_info.is_used = 'Y';
    member_info.user_type = 'P';
    delete member_info.mod_member_seq; // 변수 삭제(없는 필드-로그용)
    // logger.debug(member_info)
    try{
      const member_info_seq = await this.create(member_info, 'seq')
      member_info.password = '';
      member_info.seq = member_info_seq
      member_info.error = 0;
    } catch (e) {
      member_info.error = -1;
      member_info.message = e.sqlMessage;
    }
    return member_info
  }

  updateLastLogin  = async (member_seq) => {
    const today = new Date();
    const nowtime =  moment(new Date()).format('YYYY-MM-DD HH:MM:ss');
    const update_param = {lastlogin: nowtime}
    const member_info_seq = await this.update({ seq: member_seq }, update_param)

    return member_info_seq
  }

  updateUser  = async (member_seq, member_info) => {
    // logger.debug(member_info.password)
    // const member = member_info.toJSON()
    // logger.debug(member_info)
    const update_param = {};
    update_param.user_name = member_info.user_name;
    if(member_info.password) {
      update_param.password = this.encryptPassword(member_info.password);
    }
    update_param.phone = member_info.phone;
    update_param.email = member_info.email;
    update_param.memo = member_info.memo;
    update_param.is_used = member_info.is_used;
    update_param.reason = member_info.reason;

    
    try{
      const member_info_seq = await this.update({ seq: member_seq }, update_param)
      member_info.error = 0;
      member_info.message = "ok"
    } catch (e) {
      member_info.error = -1;
      member_info.message = e.sqlMessage;
    }
    return member_info
  }

  updateUsersUsed = async (params, arr_member_seq) => {
    const result = {};
    result.error = 0;
    result.mesage = '';
    try {
      const result = await this.database
        .from(this.table_name)
        .whereIn('seq', arr_member_seq)
        .update(params);
      // logger.debug(result);
    }catch (e) {
      result.error = -1;
      result.message = '업데이트 오류가 발생했습니다.  관리자에게 문의해 주세요';
    }
    return result;
  }

  updateUserUsed  = async (member_seq, member_info) => {
    const update_param = {};
    update_param.used =  member_info.is_used;
    //update_param.admin_text = member_info.admin_text;
    // logger.debug(member_info, update_param);
    if (update_param.used===undefined){
      member_info.error = -1;
      member_info.message = 'error';
      return  member_info
    }
    try{
      const member_info_seq = await this.update({ seq: member_seq }, update_param)
      member_info.error = 0;
    } catch (e) {
      member_info.error = -1;
      member_info.message = e.sqlMessage;
    }
    return member_info
  }

  getMemberInfoById = async (user_id) => {
    const query_result = await this.findOne({'user_id': user_id})
    // logger.debug('[query_result]', query_result);
    if (query_result && query_result.regist_date) {
      // console.log(Date.now())
      let parts = query_result.regist_date.match(/(\d+)/g)
      let date = new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5])

      query_result.regist_date = Util.dateFormat(date)
      // query_result.regist_date = Util.dateFormat(query_result.regist_date.getTime())
    }
    return new JsonWrapper(query_result, this.private_fields)
  }

  encryptPassword = (password) => {
    if (Util.isEmpty(password)) {
      return null
    } else {
      return Util.hash(`mt_${Util.md5(password)}_eg`)
    }
  }

  getVerify = async (user_id) => {
    try{
      const oKnex = this.database.count('* as co');
      oKnex.from(this.table_name);
      oKnex.where('user_id', user_id);
      const result = await oKnex
      // logger.debug(result);
      const out = new StdObject(0, 'OK', 200);
      // result.forEach
      let co = -1;
      Object.keys(result).forEach((key) => {
        co = result[key].co;
      });
      // logger.debug(co);
      out.add('co', co)
      return out;
    } catch (e) {
      throw  new StdObject(-1, e, 500);
    }
  }

  getMemberInfo = async (member_seq) => {
    const query_result = await this.findOne({ seq: member_seq })
    if (query_result && query_result.reg_date) {
      query_result.reg_date = Util.dateFormat(query_result.reg_date.getTime())
    }
    // return new MemberInfo(query_result, this.private_fields)
    return new JsonWrapper(query_result, this.private_fields)
  } 

  getMemberInfoList = async (start, end, is_used, search_type, keyword, member_seq) => {

    // const query_result = await this.findOne({ is_used: is_used })
    // if (query_result && query_result.reg_date) {
    //   query_result.reg_date = Util.dateFormat(query_result.reg_date.getTime())
    // }
    // // return new MemberInfo(query_result, this.private_fields)
    // return new JsonWrapper(query_result, this.private_fields)

    const select = ['seq','user_id', 'user_name', 'email', 'phone', 'is_used','is_admin', 'memo', 'reason', 'reg_date', 'mod_date', 'lastlogin']
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name).where('seq','<>',0);

    if(member_seq === '')
    {
      if(is_used !== '') {
        oKnex.where('is_used',is_used);
      }
      if(keyword !== '') {
        oKnex.where(`${search_type}`,'like',`%${keyword}%`);
      }
      oKnex.orderBy('is_admin','desc');
      oKnex.orderBy('seq','desc');

      if(end !== '') {
        oKnex.limit(end).offset(start)
      }      
    }else{
      oKnex.where('seq',member_seq);
    }


    const result = await oKnex;
    return result;
    //return new JsonWrapper(result, this.private_fields)
  }
  
  getMemberInfoListPaging = async (start, end, is_used, search_type, keyword, member_seq) => {


    const select = ['*']
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name).where('seq','<>',0);

    if(member_seq === '')
    {
      if(is_used !== '') {
        oKnex.where('is_used',is_used);
      }
      if(keyword !== '') {
        oKnex.where(`${search_type}`,'like',`%${keyword}%`);
      }
      oKnex.orderBy('seq','desc');
    }else{
      oKnex.where('seq',member_seq);
    }

    const oCountKnex = this.database.from(oKnex.clone().as('list'))

    if(member_seq === '')
    {
      oKnex.limit(end).offset(start)
    }

    const result = await oKnex;
   
    // 총 갯수
    const [{ total_count }] = await Promise.all([
      oCountKnex.count('* as total_count').first()
    ])
    
    return total_count;    
  }
  
  hisMember = async (member_seq) => {

    const select = ['member_log.seq','mod_member_seq','user_name', 'log_type','log_text','ip_addr','member_log.reg_date']
    const oKnex = this.database.select(select);
    oKnex.from(`${this.table_name}_log`)
    oKnex.innerJoin('member',function() {
      this.on('member.seq','member_log.mod_member_seq')
    })
    oKnex.where('member_seq',member_seq);
    oKnex.orderBy('reg_date','desc');

    const result = await oKnex;
    return result;
  }

  findMemberId = async (member_info) => {
    member_info.setAutoTrim(true)
    const member = member_info.toJSON()
    const find_user_result = await this.findOne({ user_name: member.user_name, email: member.email })

    if (!find_user_result || !find_user_result.seq) {
      throw new StdObject(-1, '등록된 회원 정보가 없습니다.', 400)
    }
    return new JsonWrapper(find_user_result, []);
  }

  changePassword = async (member_seq, new_password) => {
    return await this.update({ seq: member_seq }, { password: this.encryptPassword(new_password) })
  }

  searchMembers = async (filter) => {
    const search_user_results = await this.findPaginated(filter, null, null, null, filter.page_navigation);
    if (!search_user_results.data || search_user_results.data.length === 0) {
      return new StdObject(-1, '등록된 회원 정보가 없습니다.', 400)
    }
    return search_user_results
  }

  getMembercount = async (project_seq, start_date, end_date) => {
    const result = {}

    const select = 'CALL spGetWorker(?,?,?);'
    const oKnex = this.database.raw(select, [project_seq,start_date,end_date])

    result.member_count = await oKnex;
    return result;
  }

  getMember_1 = async (is_used) => {
    const select = ['user_id', 'user_name', 'reg_date', 'email']
    const oKnex = this.database.select(select).from(this.table_name).where('is_used',is_used).limit(5);
    const result = await oKnex;
    return result;
  }
 
  deleteUser = async (params, arr_member_seq) => {
    const result = {};
    result.error = 0;
    result.mesage = '';
    try {
      const result = await this.database
        .from(this.table_name)
        .whereIn('seq', arr_member_seq)
        .delete(params);
      // logger.debug(result);
    }catch (e) {
      result.error = -1;
      result.message = '삭제 오류가 발생했습니다.  관리자에게 문의해 주세요';
    }
    return result;
  }

}
