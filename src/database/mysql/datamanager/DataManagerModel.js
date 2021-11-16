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

    this.table_name = 'mdc_project'
    this.private_fields = [
      
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
    //member_info.user_type = 'P';

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

  updateProject  = async (member_seq, member_info) => {
    // logger.debug(member_info.password)
    // const member = member_info.toJSON()
    // logger.debug(member_info)
    const update_param = {};
    update_param.user_name = member_info.user_name;
    update_param.phone = member_info.phone;
    update_param.email = member_info.email;
    update_param.memo = member_info.memo;
    update_param.is_used = member_info.is_used;
    update_param.reason = member_info.reason;
    try{
      const member_info_seq = await this.update({ seq: member_seq }, update_param)
      member_info.error = 0;
    } catch (e) {
      member_info.error = -1;
      member_info.message = e.sqlMessage;
    }
    return member_info
  }

  updateProjectsUsed = async (params, arr_member_seq) => {
    const result = {};
    result.error = 0;
    result.message = '';
    try {
      const result = await this.database
        .from(this.table_name)
        .whereIn('seq', arr_member_seq)
        .update(params);
      // logger.debug(result);
    }catch (e) {
      result.error = 0;
      result.message = '';
    }
    return result;
  }

  updateProjectUsed  = async (member_seq, member_info) => {
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
      query_result.regist_date = Util.dateFormat(query_result.regist_date.getTime())
    }
    return new JsonWrapper(query_result, this.private_fields)
  }

  getMemberInfo = async (member_seq) => {
    const query_result = await this.findOne({ seq: member_seq })
    if (query_result && query_result.reg_date) {
      query_result.reg_date = Util.dateFormat(query_result.reg_date.getTime())
    }
    // return new MemberInfo(query_result, this.private_fields)
    return new JsonWrapper(query_result, this.private_fields)
  } 

  getProjectInfoList = async (start, end, status, search_type, keyword, project_seq) => {

    // const query_result = await this.findOne({ is_used: is_used })
    // if (query_result && query_result.reg_date) {
    //   query_result.reg_date = Util.dateFormat(query_result.reg_date.getTime())
    // }
    // // return new MemberInfo(query_result, this.private_fields)
    // return new JsonWrapper(query_result, this.private_fields)

    const select = ['seq','project_name', 'is_class', 'status', 'memo', 'reg_member_seq','reg_date']
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name).where('seq','<>',0);

    if(project_seq === '')
    {
      if(status !== '') {
        oKnex.where('status',status);
      }
      if(keyword !== '') {
        oKnex.where(`${search_type}`,'like',`%${keyword}%`);
      }
      oKnex.orderBy('seq','desc');
      oKnex.limit(end).offset(start)
    }else{
      oKnex.where('seq',project_seq);
    }


    const result = await oKnex;
    return result;
    //return new JsonWrapper(result, this.private_fields)
  }
  
  getProjectInfoListPaging = async (start, end, status, search_type, keyword, project_seq) => {
    const select = ['*']
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name).where('seq','<>',0);

    if(project_seq === '')
    {
      if(status !== '') {
        oKnex.where('status',status);
      }
      if(keyword !== '') {
        oKnex.where(`${search_type}`,'like',`%${keyword}%`);
      }
      oKnex.orderBy('seq','desc');
    }else{
      oKnex.where('seq',project_seq);
    }

    const oCountKnex = this.database.from(oKnex.clone().as('list'))

    if(project_seq === '')
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
  
  searchProjects = async (filter) => {
    const search_user_results = await this.findPaginated(filter, null, null, null, filter.page_navigation);
    if (!search_user_results.data || search_user_results.data.length === 0) {
      return new StdObject(-1, '등록된 회원 정보가 없습니다.', 400)
    }
    return search_user_results
  }

  getMembercount = async () => {
    const oKnex = this.database.select([
      this.database.raw('count(*) `all_count`'),
      this.database.raw('count(case when is_used = `0` then 1 end) `appr_count`'),
      this.database.raw('count(case when is_used = `Y` then 1 end) `used_count`'),
      this.database.raw('count(case when is_used = `N` then 1 end) `stop_count`'),
      //this.database.raw('count(case when is_used in ('3, 6') then 1 end) `reject_count`'),
    ])
      .from('project')
    const result = await oKnex
    if (result[0]){
      return result[0];
    }
    return {};
  }
 
}
