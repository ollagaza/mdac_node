import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
//import ServiceConfig from '../../service/service-config'
//import MemberService from '../../service/member/MemberService'
import log from '../../libs/logger'
import logger from "../../libs/logger";
import ProjectModel from '../../database/mysql/project/ProjectModel';
import DivisionModel from '../../database/mysql/project/DivisionModel';

const ProjectServiceClass = class {
  constructor() {
    this.log_prefix = '[ProjectServiceClass]'
  }

  GetProjectModel = (database = null) => {
    if (database) {
      return new ProjectModel(database)
    }
    return new ProjectModel(DBMySQL)
  }

  GetDivisionModel = (database = null) => {
    if (database) {
      return new DivisionModel(database)
    }
    return new DivisionModel(DBMySQL)
  }

  GetProject = async (database) => {
    const project_model = this.GetProjectModel(database)
    const result = await project_model.GetProjects();
    logger.debug(result);
    return result;
  }

  GetDivision = async (database, project_seq) => {
    const division_model = this.GetDivisionModel(database)
    const result = await division_model.GetDivisions(project_seq);
    logger.debug(result);
    return result;
  }

}

const project_service = new ProjectServiceClass()

export default project_service