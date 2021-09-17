import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
//import ServiceConfig from '../../service/service-config'
//import MemberService from '../../service/member/MemberService'
import log from '../../libs/logger'
import logger from "../../libs/logger";
import ProjectModel from '../../database/mysql/project/ProjectModel';
import DivisionModel from '../../database/mysql/project/DivisionModel';
import FileModel from '../../database/mysql/file/FileModel';
import ResultFileModel from '../../database/mysql/file/ResultFileModel';

const ProjectServiceClass = class {
  constructor() {
    this.log_prefix = '[ProjectServiceClass]'
  }

  GetProjectModel = (database = null) => {
    if (database) {
      return new ProjectModel(database);
    }
    return new ProjectModel(DBMySQL);
  }

  GetDivisionModel = (database = null) => {
    if (database) {
      return new DivisionModel(database);
    }
    return new DivisionModel(DBMySQL);
  }

  GetFileModel = (database = null) => {
    if (database) {
      return new FileModel(database);
    }
    return new FileModel(DBMySQL);
  }

  GetResultFileModel = (database = null) => {
    if (database) {
      return new ResultFileModel(database);
    }
    return new ResultFileModel(DBMySQL);
  }

  GetProjects = async (database) => {
    const project_model = this.GetProjectModel(database);
    const result = await project_model.GetProjects();
    logger.debug(result);
    return result;
  }

  GetDivisions = async (database, project_seq) => {
    const division_model = this.GetDivisionModel(database);
    const result = await division_model.GetDivisions(project_seq);
    for (let item of result) {
        console.log(item.toJson);
    }

    logger.debug(result);
    return result;
  }

  GetOrgFiles = async (database, division_seq) => {
      const file_model = this.GetFileModel(database);
      const result = await file_model.GetOrgFiles(division_seq);
      logger.debug(result);
      return result;
  }

  GetLabelingFiles = async (database, division_seq) => {
    const file_model = this.GetResultFileModel(database);
    const result = await file_model.GetResFiles(division_seq);
    // get result file list by file seq
    logger.debug(result);
    return result;
  }

}

const project_service = new ProjectServiceClass()

export default project_service