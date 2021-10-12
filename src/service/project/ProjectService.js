import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
//import ServiceConfig from '../../service/service-config'
//import MemberService from '../../service/member/MemberService'
import logger from "../../libs/logger";
import ProjectModel from '../../database/mysql/project/ProjectModel';
import DivisionModel from '../../database/mysql/project/DivisionModel';
import FileModel from '../../database/mysql/file/FileModel';
import ResultFileModel from '../../database/mysql/file/ResultFileModel';
import JobWorkerModel from '../../database/mysql/project/JobWorkerModel';

const ProjectServiceClass = class {
  constructor() {
    this.log_prefix = '[ProjectServiceClass]'
  }

  getDivisionFullPath = (divisions, key, name) => {
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
          let path = '';
          if (name === null) {
              return data.division_name;
          } else {
              path = `${data.division_name}>${name}`;
          }
          return this.getDivisionFullPath(divisions, data.parent_division_seq, path);
      }
      return this.GetDivisionFullPath(divisions, data.parent_division_seq, path);
    }
  }

  getAllDivisionFullPath = (divisions) => {
      for (let div in divisions) {
        divisions[div].fullpath = this.getDivisionFullPath(divisions, div, '');
      }

    return divisions;
  }

  getProjectModel = (database = null) => {
    if (database) {
      return new ProjectModel(database);
    }
    return new ProjectModel(DBMySQL);
  }

  getDivisionModel = (database = null) => {
    if (database) {
      return new DivisionModel(database);
    }
    return new DivisionModel(DBMySQL);
  }

  getFileModel = (database = null) => {
    if (database) {
      return new FileModel(database);
    }
    return new FileModel(DBMySQL);
  }

  getResultFileModel = (database = null) => {
    if (database) {
      return new ResultFileModel(database);
    }
    return new ResultFileModel(DBMySQL);
  }

  getJobWorkerModel = (database = null) => {
    if (database) {
      return new JobWorkerModel(database);
    }
    return new JobWorkerModel(DBMySQL);
  }

  // method - project
  getProjects = async () => {
    const project_model = this.getProjectModel(DBMySQL);
    const result = await project_model.getProjects();
    logger.debug(result);
    return result;
  }

  // method division
  getDivisions = async (project_seq) => {
    const division_model = this.getDivisionModel(DBMySQL);
    const result = await division_model.getDivisions(project_seq);
    var dicDivision = {};
    for (let item of result) {
      dicDivision[item.seq] = item;
    }
    
    const res = this.getAllDivisionFullPath(dicDivision);
    return res;
  }

  // method - file
  getOrgFilesByDivisionseq = async (division_seq) => {
      const file_model = this.getFileModel(DBMySQL);
      const result = await file_model.getOrgFilesByDivisionseq(division_seq);
      logger.debug(result);
      return result;
  }

  // method - result_file
  getResFilesByJobseq = async (job_seq) => {
    // const file_model = this.getFileModel(database);
    // const files = await file_model.getOrgFiles(division_seq);
    // // get file seq list
    // const res_file_model = this.getResultFileModel(database);
    // const result = await res_file_model.getResFiles(division_seq);
    // // get result file list by file seq list

    const file_model = this.getResultFileModel(DBMySQL);
    const result = await file_model.getResFilesByJobseq(job_seq);
    logger.debug(result);
    return result;
  }

  // method - job_worker
  getJobWorker = async(seq) => {
    const model = this.getJobWorkerModel(DBMySQL);
    const result = await model.getJobWorker(seq);
    return result;
  }

  getJobWorkersByProjectseq = async(project_seq) => {
    const model = this.getJobWorkerModel(DBMySQL);
    const result = await model.getJobWorkersByProjectseq(project_seq);
    return result;
  }

  getJobWorkersByJobseq = async(job_seq) => {
    const model = this.getJobWorkerModel(DBMySQL);
    const result = await model.getJobWorkersByJobseq(job_seq);
    return result;
  }

  createJobWorker = async(project_seq, job_seq, result_file_pair_key, class_seq, job_name, job_status, job_member_seq, job_date, reject_date, reg_member_seq) => {
    const model = this.getJobWorkerModel(DBMySQL);
    return model.createJobWorker(project_seq, job_seq, result_file_pair_key, class_seq, job_name, job_status, job_member_seq, job_date, reject_date, reg_member_seq);
  }
}

const project_service = new ProjectServiceClass()

export default project_service