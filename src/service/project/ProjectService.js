import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
//import ServiceConfig from '../../service/service-config'
//import MemberService from '../../service/member/MemberService'
import logger from "../../libs/logger";
import ProjectModel from '../../database/mysql/project/ProjectModel';
import DivisionModel from '../../database/mysql/project/DivisionModel';
import FileModel from '../../database/mysql/file/FileModel';
import ResultFileModel from '../../database/mysql/file/ResultFileModel';

const ProjectServiceClass = class {
  constructor() {
    this.log_prefix = '[ProjectServiceClass]'
  }

  GetDivisionFullPath = (divisions, key, name) => {
    //   for (let division of divisions) {
    //       console.log(division);
    //       division.fullpath = 'test';
    //   }
      
    let data = divisions[key];
    if (data.parent_division_seq === null) {
      let res = `${data.division_name}>${name}`
      return res;
    } else {
      let path = '';
      if (name === null) {
        return data.division_name;
      } else {
        path = `${data.division_name}>${name}`;
      }
      return this.GetDivisionFullPath(divisions, data.parent_division_seq, path);
    }
  }

  GetAllDivisionFullPath = (divisions) => {
    for (let div in divisions) {
      divisions[div].fullpath = this.GetDivisionFullPath(divisions, div, '');
    }

    return divisions;
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
    var dicDivision = {};
    for (let item of result) {
      dicDivision[item.seq] = item;
    }
    
    // result = this.GetAllDivisionFullPath(dicDivision);
    // return result;
    const res = this.GetAllDivisionFullPath(dicDivision);
    return res;
  }

  GetOrgFiles = async (database, division_seq) => {
    const file_model = this.GetFileModel(database);
    const result = await file_model.GetOrgFiles(division_seq);
    logger.debug(result);
    return result;
  }

  GetLabelingFiles = async (database, division_seq) => {
    const file_model = this.GetFileModel(database);
    const files = await file_model.GetOrgFiles(division_seq);
    // get file seq list

    const res_file_model = this.GetResultFileModel(database);
    const result = await res_file_model.GetResFiles(division_seq);
    // get result file list by file seq list

    logger.debug(result);
    return result;
  }

}

const project_service = new ProjectServiceClass()

export default project_service