import Util from '../../utils/baseutil'
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
import JobModel from '../../database/mysql/datamanager/JobModel';
import ClassModel from '../../database/mysql/datamanager/ClassModel';
import MemberModel from '../../database/mysql/member/MemberModel';

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

  getJobModel = (database = null) => {
    if (database) {
      return new JobModel(database);
    }
    return new JobModel(DBMySQL);
  }

  getClassModel = (database = null) => {
    if (database) {
      return new ClassModel(database);
    }
    return new ClassModel(DBMySQL);
  }

  getMemberModel = (database = null) => {
    if (database) {
      return new MemberModel(database);
    }
    return new MemberModel(DBMySQL);
  }

  // method - projectgetJobListByMemberseq
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
    return Object.values(Object.values(res));
  }

  // method - file
  getOrgFilesByDivisionseq = async (division_seq) => {
      const file_model = this.getFileModel(DBMySQL);
      const result = await file_model.getOrgFilesByDivisionseq(division_seq);
      // make download url
      // for (let item of result) {
      //   item.download_url = '';
      // }

      // logger.debug(result);
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

  getResFilesByFileseq = async (file_seq) => {
    const file_model = this.getResultFileModel(DBMySQL);
    const result = await file_model.getResFilesByFileseq(file_seq);
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

  getJobWorkersByJobseqStatus = async(job_seq, job_status) => {
    const model = this.getJobWorkerModel(DBMySQL);
    const result = await model.getJobWorkersByJobseqStatus(job_seq, job_status);
    return result;
  }

  createJobWorker = async(project_seq, job_seq, result_file_pair_key, class_seq, job_name, job_status, job_member_seq, job_date, reject_date, reg_member_seq) => {
    const model = this.getJobWorkerModel(DBMySQL);
    return await model.createJobWorker(project_seq, job_seq, result_file_pair_key, class_seq, job_name, job_status, job_member_seq, job_date, reject_date, reg_member_seq);
  }

  // ?????????????????? -- ?????? ?????? ??????... job ?????? ???????
  // - ?????? ????????? ?????? ??????(?????? ?????? ??????) - ?????? ??????? A0 or A1
  getJobListByMemberseq = async(member_seq, status) => {
    const model = this.getJobModel(DBMySQL);
    return await model.getJobListByMemberseq(member_seq, status);
  }

  getJobListByJobworkerMember = async(member_seq, status) => {
    const model = this.getJobModel(DBMySQL);
    return await model.getJobListByJobworkerMember(member_seq, status);
  }

  getJobListByMemberFile = async(member_seq, file_seq, status) => {
    const model = this.getJobModel(DBMySQL);
    return await model.getJobListByMemberFile(member_seq, file_seq, status);
  }

  setJobStatusByWorkerCnt = async(seq, status) => {
    const modelJobworker = this.getJobWorkerModel(DBMySQL);
    const jobworkers = await modelJobworker.getJobWorkersByJobseq(seq);
    // const modelJob = this.getJobModel(DBMySQL);
    // const job = await modelJob.getJobBySeq(seq);
    // if (job.label_cnt == )
    const filter = {};
    filter.seq = seq;
    filter.label_cnt = jobworkers.length;
    const params = {};
    params.status = status;
    params.labeler_jobdate = Util.currentFormattedDate();
    const modelJob = this.getJobModel(DBMySQL);
    return modelJob.updateJobByFilters(filter, params);
  }

  setJobStatus = async(seq, status) => {
    const params = {};
    params.status = status;
    const modelJob = this.getJobModel(DBMySQL);
    return modelJob.updateJob(params, seq);
  }

  // ???????????????????????? - ?????? ??????
  // - ?????? : A(?????????), B(??????1), C(??????2), D(??????3), E(??????)
  // - ?????? : 0(??????), 1(??????), 2(??????), 5(??????)
  // setJobWorkerStatus = async(seq, job_name, job_status) => {
  //   const model = this.getJobWorkerModel(DBMySQL);
  //   return await model.setJobWorkerStatus(seq, job_name, job_status);
  // }
  setJobWorkerStatus = async(seq, job_status) => {
    const model = this.getJobWorkerModel(DBMySQL);
    return await model.setJobWorkerStatus(seq, job_status);
  }

  getJobByJobseq = async(job_seq) => {
    const model = this.getJobModel(DBMySQL);
    return await model.getJobBySeq(job_seq);
  }

  // ?????????????????????????????? - ????????? ?????? ??????
  getClassByProjectseq = async(project_seq) => {
    const model = this.getClassModel(DBMySQL);
    return await model.getClassListByProjectseq(project_seq);
  }

  getClassByClass = async(class_seq) => {
    const model = this.getClassModel(DBMySQL);
    return await model.getClass(class_seq);
  }

  // result file upload - ??????
  // - image, video ?????? ?????? ?????? - job_worker

  getMembers = async() => {
    const model = this.getMemberModel(DBMySQL);
    return await model.getWokerList('Y');
  }

}

const project_service = new ProjectServiceClass()

export default project_service