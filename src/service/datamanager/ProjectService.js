import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import ProjectModel from '../../database/mysql/datamanager/ProjectModel'
import Util from '../../utils/baseutil'
import ServiceConfig from '../service-config'
import JsonWrapper from '../../wrapper/json-wrapper'
import logger from '../../libs/logger'

const ProjectServiceClass = class {
  constructor() {

  }
  getProjectModel = (database = null) => {
    if (database) {
      return new ProjectModel(database)
    }
    return new ProjectModel(DBMySQL)
  }

  createProject = async (req_body) => {
    const project_model = this.getProjectModel(DBMySQL)
    const result = await project_model.createProject(req_body);
    return result;
  }

  updateProject = async (project_seq, req_body) => {
    // logger.debug(req_body);
    const project_model = this.getProjectModel(DBMySQL)
    const result = await project_model.updateProject(project_seq, req_body);
    return result;
  }

  getProjectInfo = async (database, start, end, status, search_type, keyword, project_seq) => {
    const project_model = this.getProjectModel(database)
    const project_info = await project_model.getProjectInfo(start, end, status, search_type, keyword, project_seq)
    const project_paging = await project_model.getProjectInfoPaging(start, end, status, search_type, keyword, project_seq)
    
    return {
      project_info,
      project_paging
    }
  }

  ProjectMemberCount = async (database) => {
    const project_model = this.getProjectModel(database)
    const result = await project_model.getProjectMembercount();
    logger.debug(result);
    return result;
  }
}


const project_service = new ProjectServiceClass()

export default project_service
