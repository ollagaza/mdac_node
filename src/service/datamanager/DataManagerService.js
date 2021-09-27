import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import DataManagerModel from '../../database/mysql/datamanager/DataManagerModel'
import FindPasswordModel from '../../database/mysql/member/FindPasswordModel'
import Util from '../../utils/baseutil'
import ServiceConfig from '../service-config'
import JsonWrapper from '../../wrapper/json-wrapper'
import logger from '../../libs/logger'

const DataManagerServiceClass = class {
  constructor() {

  }
  getDataManagerModel = (database = null) => {
    if (database) {
      return new DataManagerModel(database)
    }
    return new DataManagerModel(DBMySQL)
  }

  getMemberInfoById = async (database, user_id) => {
    const member_model = this.getDataManagerModel(database)
    return await member_model.getMemberInfoById(user_id)
  }

  verify = async (user_id) => {
    const member_model = this.getDataManagerModel(DBMySQL)
    const result = await member_model.getVerify(user_id)
    return result;
  }

  createUser = async (req_body) => {
    const member_model = this.getDataManagerModel(DBMySQL)
    const result = await member_model.createUser(req_body);
    return result;
  }

  updateUser = async (project_seq, req_body) => {
    // logger.debug(req_body);
    const member_model = this.getDataManagerModel(DBMySQL)
    const result = await member_model.updateUser(project_seq, req_body);
    return result;
  }

  updateUserUsed = async (database, project_seq, req_body) => {
    const member_model = this.getDataManagerModel(database)
    const result = await member_model.updateUserUsed(project_seq, req_body);
    return result;
  }

  updateLastLogin = async (database, user_id) => {
    const member_model = this.getDataManagerModel(database)
    return await member_model.updateLastLogin(user_id)
  }

  checkMyToken = (token_info, project_seq) => {
    if (token_info.getId() !== project_seq) {
      if (!token_info.isAdmin()) {
        return false
      }
    }
    return true
  }

  getMemberInfoWithSub = async (database, project_seq, lang = 'kor') => {
    const member_info = await this.getMemberInfo(database, project_seq)
    const member_sub_info = await this.getMemberSubInfo(database, project_seq, lang)

    return {
      member_info,
      member_sub_info
    }
  }

  getMemberInfo = async (database, project_seq) => {
    const { member_info } = await this.getMemberInfoWithModel(database, project_seq)
    return member_info
  }

  getMemberSubInfo = async (database, project_seq, lang = 'kor') => {
    // const member_sub_model = this.getMemberSubModel(database)
    // return await member_sub_model.getMemberSubInfo(project_seq, lang)
    return null
  }

  getMemberInfoWithModel = async (database, project_seq) => {
    const member_model = this.getDataManagerModel(database)
    const member_info = await member_model.getMemberInfo(project_seq)
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


  getProjectInfoList = async (database, start, end, is_used, search_type, keyword, project_seq) => {
    const project_model = this.getDataManagerModel(database)
    const project_info = await project_model.getProjectInfoList(start, end, is_used, search_type, keyword, project_seq)
    const project_paging = await project_model.getProjectInfoListPaging(start, end, is_used, search_type, keyword, project_seq)
    
    return {
      project_info,
      project_paging
    }
  }

  MemberCount = async (database) => {
    const member_model = this.getDataManagerModel(database)
    const result = await member_model.getMembercount();
    logger.debug(result);
    return result;
  }
}


const data_service = new DataManagerServiceClass()

export default data_service
