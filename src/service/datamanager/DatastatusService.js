// make by june
import Project_Model from '../../database/mysql/datamanager/Project_Model';
import Division_Model from '../../database/mysql/datamanager/Division_Model';
import Member_Model from '../../database/mysql/member/Member_Model';
import Job_Model from '../../database/mysql/datamanager/Job_Model';
import File_Model from '../../database/mysql/datamanager/File_Model';
import Class_Model from '../../database/mysql/datamanager/Class_Model';
import JobWoker_Model from '../../database/mysql/datamanager/JobWoker_Model';
import JobLog_Model from '../../database/mysql/datamanager/JobLog_Model';
import ResultFile_Model from '../../database/mysql/datamanager/ResultFile_Model';

import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import Util from '../../utils/baseutil'
import ServiceConfig from '../service-config'
import JsonWrapper from '../../wrapper/json-wrapper'
import logger from '../../libs/logger'
import moment from "moment/moment";
import Constants from "../../constants/constants";
import path from "path";
import fs from "fs";
import mime from "mime";
import { spawn, spawnSync, exec } from 'child_process';


const ProjectServiceClass = class {
  constructor() {

  }

  getResultFile_Model = (database = null) => {
    if (database) {
      return new ResultFile_Model(database)
    }
    return new ResultFile_Model(DBMySQL)
  }

  getJobWorker_Model = (database = null) => {
    if (database) {
      return new JobWoker_Model(database)
    }
    return new JobWoker_Model(DBMySQL)
  }

  getJobLog_Model = (database = null) => {
    if (database) {
      return new JobLog_Model(database)
    }
    return new JobLog_Model(DBMySQL)
  }

  getProject_Model = (database = null) => {
    if (database) {
      return new Project_Model(database)
    }
    return new Project_Model(DBMySQL)
  }

  getDivision_Model = (database = null) => {
    if (database) {
      return new Division_Model(database)
    }
    return new Division_Model(DBMySQL)
  }

  getMember_Model = (database = null) => {
    if (database) {
      return new Member_Model(database)
    }
    return new Member_Model(DBMySQL)
  }

  getJob_Model = (database = null) => {
    if (database) {
      return new Job_Model(database)
    }
    return new Job_Model(DBMySQL)
  }

  getFile_Model = (database = null) => {
    if (database) {
      return new File_Model(database)
    }
    return new File_Model(DBMySQL)
  }

  getClass_Model = (database = null) => {
    if (database) {
      return new Class_Model(database)
    }
    return new Class_Model(DBMySQL)
  }

  getProject_List = async (database) => {
    const project_model = this.getProject_Model(database);
    const result = await project_model.getProjectList();
    return result;
  }

  getFirstDivision = async (database, pro_seq) => {
    const division_model = this.getDivision_Model(database);
    const result = await division_model.getFirstDivsionByProseq(pro_seq);
    return result;
  }

  getDivision = async (database, pro_seq, div_seq, is_used) => {
    const division_model = this.getDivision_Model(database);
    const result = await division_model.getDivsionByProseq(pro_seq, div_seq, is_used);
    return result;
  }

  getDivSum = async (database, req_body) => {
    const seq_list = [];
    for (const item of req_body.list_view){
      seq_list.push(item.seq);
    }
    // logger.debug(seq_list);
    const division_model = this.getDivision_Model(database);
    const result = {};
    result.data = await division_model.getDivsum(seq_list);
    result.max = await division_model.getDivsumMax(seq_list);
    return result;
  }

  getProject_Class = async (database, seq) => {
    const project_model = this.getProject_Model(database);
    const result = await project_model.getProjectWidthClass(seq);
    return result;
  }

  getWokerList = async (database) => {
    const member_model = this.getMember_Model(database);
    const result = await member_model.getWokerList('Y');
    return result;
  }

  getFileList = async (database, pro_seq, div_seq, req_body) => {
    const file_model = this.getFile_Model(database);
    return await file_model.getList(pro_seq, div_seq, req_body);
    // return result;
  }

  getClassList = async (database, pro_seq) => {
    const class_model = this.getClass_Model(database);
    return await class_model.getClass_list(pro_seq);
  }

  setWorkIn = async (database, pro_seq, div_seq, req_body, member_seq) => {
    // logger.debug('setWorkIn' ,req_body);
    const jobLog_Model = this.getJobLog_Model(database);
    await database.transaction(async (transaction) => {
      const resultFile_Model = this.getResultFile_Model(transaction);
      const jobwoker_model = this.getJobWorker_Model(transaction);

      const jobworker = {};
      const view_type = req_body.view_type;
      const file_type = req_body.file_type;
      jobworker.project_seq = req_body.pro_seq;
      jobworker.result_file_pair_key = 0;
      if (req_body.class_seq){
        jobworker.class_seq = req_body.class_seq;
      }
      jobworker.job_name = req_body.work_status_send.substr(0, 1);
      jobworker.job_status = req_body.work_status_send;

      //반려는 작업자 없이 ..
      if (req_body.work_status_send.substr(1, 1) !== 5) {
        jobworker.job_member_seq = req_body.worker_id;
      }
      jobworker.reg_member_seq = member_seq;

      let result_data = {};
      const check_filejoblist = req_body.check_filejoblist;
      for (const item of check_filejoblist) {
        let file_seq = 0;
        let job_seq = 0;
        let rf_pair_key = 0;
        jobworker.reject_seq = item.reject_seq ? item.reject_seq : -1;
        jobworker.reject_act = item.reject_act ? item.reject_act : null;
        if (file_type === 'v' && view_type === 'v'){
          job_seq = parseInt(item.seq, 10);
          rf_pair_key = parseInt(item.rf_pair_key, 10);
          jobworker.result_file_pair_key = rf_pair_key;
          file_seq = parseInt(req_body.file_seq, 10);
        } else {
          file_seq = parseInt(item.seq, 10);
          job_seq = parseInt(item.job_seq, 10);
        }
        if (!job_seq || job_seq === 0) {
          result_data = await this.jobIn(transaction, jobworker.reject_act, -1, file_seq, req_body, 'A1', member_seq);
          job_seq = result_data.job_seq;
        } else {
          const status_type = item.status.substr(1,1); // 현재상태...
          console.log(`status_type===${status_type}`)
          // 반려후 재 입력..
          if (status_type === '5') { // 현재상태 반려 -> 재입력중이다.
            logger.debug('A1')
            const job_react = {reject_act: 'R', reject_seq: rf_pair_key};
            await jobwoker_model.updateJobWorker(job_react, job_seq);
            if (view_type === 'v') {
              // rejectfile update -> act : R, rejectfile create -> act : A, jobworker create
              jobworker.job_seq = job_seq;
              await this.refileIn(transaction, req_body, file_seq, jobworker, rf_pair_key, member_seq);
            } else {
              logger.debug('A2')
              // jobworker update -> act : R, jobworker create -> act : A, job create
              jobworker.reject_act = 'A';
              jobworker.reject_seq = job_seq;
              logger.debug(jobworker);
              logger.debug('A2-1')
              const result_jobin = await this.jobIn(transaction, jobworker.reject_act, job_seq, file_seq, req_body, 'A1', member_seq);
              logger.debug('A2-2', result_jobin)
              jobworker.job_seq = result_jobin.job_seq;
              logger.debug('A2-2', jobworker)
              await jobwoker_model.createJobWorker(jobworker)
            }
            logger.debug('A3')
            const str = req_body.work_status_send+ ' / ' + jobworker.job_seq;
            await this.createJobLogWorker(database, jobworker, member_seq, `rein [${str}]` );
            logger.debug('A4')
            // return;
          } else {
            // logger.debug(item.status, jobworker.job_status)
            //반려
            if (jobworker.job_status === 'Z5') {
              if (item.status === 'B1' || item.status === 'C1' || item.status === 'D1') {
                jobworker.job_status = item.status.substr(0, 1) + '5';
                jobworker.job_name = item.status.substr(0, 1) ;
              }
              const nowtime =  moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
              const jobworker_react = {job_status: jobworker.job_status , job_date: nowtime};
              await jobwoker_model.updateJobWorkerByStatus(jobworker_react, job_seq, item.status );
            }
            //완료
            if (jobworker.job_status === 'E2'){
              jobworker.job_member_seq = member_seq;
              jobworker.job_seq = job_seq;
              await jobwoker_model.createJobWorker(jobworker, false);
            }
            if (view_type === 'v') { // 비디오 인서트일때는 아무것도 안함.
              logger.debug('job rf update', req_body);
              jobworker.job_seq = job_seq;
              result_data = await this.rfUpdate(transaction, jobworker, job_seq, req_body, rf_pair_key, member_seq);
            } else {
              // logger.debug('job update not v');
              result_data = await this.jobUpdate(transaction, jobworker, job_seq, req_body, member_seq);
            }
            const str = req_body.work_status_send+ ' / ' + jobworker.job_seq;
            await this.createJobLogWorker(database, jobworker, member_seq, `work [${str}]` );
          }
        }
        // logger.debug(pro_seq, div_seq, req_body, member_seq)
      }
    });
    return new StdObject(0, '', 200);
  }

  refileIn = async(database, req_body, file_seq, jobworker, rf_pair_key, member_seq) => {
    const resultFile_Model = this.getResultFile_Model(database);
    const jobwoker_model = this.getJobWorker_Model(database);
    const job_model = this.getJob_Model(database);

    const job_react = {reject_act: 'R', reject_seq: rf_pair_key};
    await resultFile_Model.updateRejectFile(job_react, rf_pair_key);
    const result_rf_pair_key = await resultFile_Model.createRejectFile(jobworker.job_seq, rf_pair_key, member_seq);

    const job = {};
    jobworker.reject_act = 'A';
    jobworker.reject_seq = rf_pair_key;
    job.file_seq = file_seq;
    job.project_seq = req_body.pro_seq;
    job.division_seq = req_body.div_seq;
    job.status = 'A1';
    job.reg_member_seq = member_seq;
    job.class_seq = req_body.class_seq;
    job.labeler_member_seq = req_body.worker_id;
    job.labeler_regdate = moment().format("YYYY-MM-DD hh:mm:ss");
    job.label_cnt = 1;
    job.reject_act = jobworker.reject_act;
    job.reject_seq = jobworker.job_seq;
    jobworker.job_seq = await job_model.createJob(job);

    jobworker.result_file_pair_key = result_rf_pair_key;
    jobworker.project_seq = req_body.pro_seq;
    jobworker.class_seq = req_body.class_seq;
    jobworker.job_name = 'A';
    jobworker.job_status = 'A1';
    jobworker.job_member_seq = req_body.worker_id;
    jobworker.reg_member_seq = member_seq;
    await jobwoker_model.createJobWorker(jobworker, false);

    const params = {job_seq: jobworker.job_seq}
    await resultFile_Model.updateRejectFileJobseq(params, result_rf_pair_key);
  }

  createJobLogWorker = async(database, jobworker, member_seq, str) => {
    logger.debug('createJobLogWorker')
    const jobLog_Model = this.getJobLog_Model(database);
    await jobLog_Model.createJobLogWorker(jobworker.job_seq, jobworker.job_status,
      jobworker.job_member_seq, member_seq, str);
  }

  rfUpdate = async(database, jobworker, job_seq, req_body, rf_pair_key, member_seq) => {
    const result = {};
    try {
      const resultFile_Model = this.getResultFile_Model(database);
      const jobwoker_model = this.getJobWorker_Model(database);
      const job_update = {};
      job_update.status = req_body.work_status_send;
      if (req_body.work_status_send === 'Z5') {
        job_update.status = jobworker.job_status;
      }
      result.error = 0;
      try {
        result.update_co = await resultFile_Model.updatePairRFile(rf_pair_key, job_update);
      }catch (e) {
        logger.error('job_update', job_update, e);
        result.error = -1;
        result.message = e.sqlMessage;
      }
      if (req_body.work_status_send !== 'E2' && req_body.work_status_send.substr(1, 1) == 1) {
        try {
          jobworker = await jobwoker_model.createJobWorker(jobworker)
          const str = JSON.stringify(jobworker);
          await this.createJobLogWorker(database, jobworker, member_seq, `create [${str}]` );
          result.error = 0;
        } catch (e) {
          logger.error(jobworker, e);
          result.error = -1;
          result.message = e.sqlMessage;
        }
      }

    } catch (e) {
      logger.error(e);
      result.error = -1;
      result.message = e.sqlMessage;
    }
  }

  jobUpdate = async(database, jobworker, job_seq, req_body, member_seq) => {
    // jobworker.job_seq = job_seq;
    const job_model = this.getJob_Model(database);
    const jobwoker_model = this.getJobWorker_Model(database);
    const result = {};
    const job_update = {}
    job_update.status = req_body.work_status_send;
    if (req_body.work_status_send === 'Z5') {
      job_update.status = jobworker.job_status;
    }
    if (req_body.work_status_send === 'A1') {
      job_update.labeler_member_seq = req_body.worker_id;
    }
    job_update.mod_member_seq = member_seq;
    // logger.debug(job_update);
    try {
      await job_model.updateJob(job_update, job_seq);
      jobworker.job_seq = job_seq;
      if (req_body.work_status_send !== 'A1') {
        jobworker = await jobwoker_model.createJobWorker(jobworker)
      }
      const str = JSON.stringify(jobworker);
      await this.createJobLogWorker(database, jobworker, member_seq, `update [${str}]` );
    } catch (e) {
      logger.error(e);
      result.error = -1;
      result.message = e.sqlMessage;
    }
    return result;
  }

  jobIn = async(database, reject_act, job_seq, file_seq, req_body, status, member_seq) => {
    const result = {};
    const job = {};
    job.file_seq = file_seq;
    job.project_seq = req_body.pro_seq;
    job.division_seq = req_body.div_seq;
    job.status = status;
    job.reg_member_seq = member_seq;
    job.class_seq = req_body.class_seq;
    job.labeler_member_seq = req_body.worker_id;
    job.labeler_regdate = moment().format("YYYY-MM-DD hh:mm:ss");
    job.label_cnt = req_body.label_cnt ? req_body.label_cnt : 0;
    job.reject_seq = job_seq;
    job.reject_act = reject_act;
    if (req_body.file_type === 'i'){
      job.label_cnt = 1;
    }
    const job_model = this.getJob_Model(database);
    try {
      const job_seq = await job_model.createJob(job);
      result.error = 0;
      result.job_seq = job_seq;
    } catch (e) {
      logger.error('job_model.createJob' + e);
      result.error = -1;
      result.message = e.sqlMessage;
    }
    return result;
  }

  delWork = async (database, pro_seq, div_seq, req_body, member_seq) => {
    const result = {};
    const file_type = req_body.file_type;
    const jobLog_Model = this.getJobLog_Model(database);
    const check_filejoblist = req_body.check_filejoblist;
    await database.transaction(async (transaction) => {
      const job_model = this.getJob_Model(transaction);
      const jobwoker_model = this.getJobWorker_Model(transaction);
      for (const item of check_filejoblist) {
        const arr_seq = item.split('_');
        let file_seq = 0;
        let job_seq = 0;
        if (arr_seq.length > 1) {
          file_seq = parseInt(arr_seq[0], 10);
          job_seq = parseInt(arr_seq[1], 10);
          try {
            if (file_type === 'v') {
              await job_model.deleteJob(job_seq);
            } else {
              const job_update = {};
              job_update.status = 'A0';
              job_update.labeler_member_seq = -1;
              job_update.mod_member_seq = member_seq;
              const upresult = await job_model.updateJob(job_update, job_seq);
              // logger.debug('upresult', upresult)
            }
            const del_params = {job_seq: job_seq};
            const del_result = await jobwoker_model.delJobWorker(del_params);
            const str = JSON.stringify(del_params);
            await jobLog_Model.createJobLogWorker(del_params.job_seq, '', '', member_seq, `delete type[${file_type}] [${str}]` );
            // logger.debug('del_result', str);
          }catch (e) {
            logger.error('eeeeeee', e);
            return new StdObject(-1, e, 200);
          }
        }
      }
    });
    // logger.debug('end ');
    return new StdObject(0, 'ok', 200);
  }

  getFileView = async (database, pro_seq, div_seq, req_body, member_seq) => {
    const file_seq = req_body.file_seq ? req_body.file_seq : -1;
    // logger.debug( req_body, file_seq );
    if (parseInt(file_seq, 10) < 0) {
      return new StdObject(-1, '올바른 파라멘타가 아닙니다.', 500);
    }
    const file_model = this.getFile_Model(database);
    return await file_model.getView(pro_seq, div_seq, req_body);
  }
  //isresult 오리지널 0 결과 - 1
  getImgBySeq = async (database, seq, isresult) => {
    const mediapath = Util.removePathLastSlash(ServiceConfig.get('media_directory'));
    const file_model = this.getFile_Model(database);
    const result_model = this.getResultFile_Model(database);
    let filedata = {}
    let img_path = '';
    const output = {};
    if (isresult === 'o'){
      filedata = await file_model.getImg(seq);
      // img_path = mediapath + Constants.SP + filedata.full_name;
      img_path = filedata.full_name;
    } else {
      filedata = await result_model.getImg(seq);
      img_path = filedata.file_name;
    }
    // logger.debug('img_path', img_path)
    output.img_path = img_path;
    output.error = 0;
    if (!(await Util.fileExists(img_path))) {
      const null_img = path.resolve('src','img','null.png');
      output.img_path = null_img;
      output.error = 0;
      // return new StdObject(-1, '', 500);
    }
    return output;
  }

  getVedioImgBySeq = async (database, seq, isresult) => {
    const mediapath = Util.removePathLastSlash(ServiceConfig.get('media_directory'));
    const file_model = this.getFile_Model(database);
    const result_model = this.getResultFile_Model(database);
    let filedata = {}
    let img_path = '';
    const output = {};
    if (isresult === 'o'){
      filedata = await file_model.getVedioImg(seq);
      logger.debug(filedata)
      // img_path = mediapath + Constants.SP + filedata.full_name;
      img_path = filedata.full_name;
    } else {
      // logger.debug('결과')
      filedata = await result_model.getImg(seq);
      img_path = filedata.file_name;
    }
    logger.debug('img_path', img_path);
    output.img_path = img_path;
    output.error = 0;
    const null_img = path.resolve('src','img','null.png');
    if (!(await Util.fileExists(img_path))) {
      output.img_path = null_img;
      output.error = 0;
      // return new StdObject(-1, '', 500);
    } else {
      const path_name = path.parse(img_path);
      const img_name = path_name.dir+ Constants.SP + path_name.name + '.png'
      // logger.debug(img_name);
      if (!(await Util.fileExists(img_name))) {
        // const run_file = `-i ${img_path} -ss 00:00:01 -vcodec png -vframes 1 ${img_name}`
        // const process = spawnSync(Constants.FFMPEG_EXE, ['-i', img_path, '-ss', '00:00:01', '-vcodec', 'png', '-vframes', '1', img_name]);
        // process.stdout.on("data", function (data) {
        //   logger.debug(data.toString());
        // }); // 실행 결과
        //
        // process.stderr.on("data", function (data) {
        //   logger.debug(data.toString());
        // });
        // logger.debug(run_file);
        const img_name = await this.makeImg(img_path);
        // logger.debug(img_name);
        output.img_path = img_name;
        output.error = 0;
      } else {
        output.img_path = img_name;
        output.error = 0;
      }
    }
    return output;
  }

  makeImg = async (vedio_name) => {
    logger.debug('vedio_name', vedio_name);
    return new Promise((resolve, reject) => {
      const path_name = path.parse(vedio_name);
      const img_name = path_name.dir+ Constants.SP + path_name.name + '.png'

      const process = spawn(Constants.FFMPEG_EXE, ['-i', vedio_name, '-ss', '00:00:01', '-vcodec',
        'png', '-vframes', '1', img_name]);
      process.stdout.setEncoding('utf8');
      process.stdout.on('data', function (data, error) {
        logger.debug('data = ', data);
        logger.debug('error = ', error);
      }); // 실행 결과
      process.stderr.setEncoding("utf8")
      process.stderr.on('data', function (data) {
        logger.error(data.toString());
        // reject(data.toString());
      });
      process.on('close', function () {
        logger.debug('close');
        resolve(img_name);
      });
    });
  }


  getHis = async (database, job_seq, req_body, member_seq) => {
    if(!job_seq || job_seq==='null'){
      job_seq = null;
    }
    if(req_body.file_type === 'v') {
      const out = await this.getHisVideo(database, job_seq, req_body, member_seq);
      return out;
    } else {
      const out = await this.getHisImg(database, job_seq, req_body, member_seq);
      return out;
    }
  }

  getHisVideo = async(database, job_seq, req_body, member_seq) => {
    const jobworker_model = this.getJobWorker_Model(database);
    const resultfile_model = this.getResultFile_Model(database);
    const output = new StdObject(0, '' , 200)

    const result = await jobworker_model.getJobWorkerList(job_seq, req_body, member_seq)
    output.error = result.error;
    output.message = result.message;
    if (result.error === 0 ) {
      const fileList = await resultfile_model.getResultFile(job_seq, 'a', req_body.ref_pair_key);
      for (const item of fileList){
        item.base = path.parse(item.file_name).base;
      }
      output.add('filelist', fileList);
      output.add('list', result.list);
      if(req_body.reject_pair_key > 0) {
        const perlist = await jobworker_model.getPerList(job_seq, req_body.reject_pair_key);
        output.add('perlist', perlist.list);
      }
      // for(const item of result.list) {
      //   logger.debug('my item', item);
      //   if (item.reject_act === 'A' && item.job_name === 'A') {
      //     const perlist = await jobworker_model.getPerList(job_seq, item.reject_pair_key);
      //     output.add('perlist', perlist.list);
      //     break;
      //   }
      // }
    }
    return output;
  }

  getHisImg = async(database, job_seq, req_body, member_seq) => {
    const jobworker_model = this.getJobWorker_Model(database);
    const resultfile_model = this.getResultFile_Model(database);
    const output = new StdObject(0, '' , 200)
    const result = await jobworker_model.getJobWorkerList(job_seq, req_body, member_seq)
    output.error = result.error;
    output.message = result.message;
    if (result.error === 0 ){
      if(job_seq) {
        const fileList = await resultfile_model.getResultFile(job_seq, 'a');
        for (const item of fileList) {
          item.base = path.parse(item.file_name).base;
        }
        output.add('filelist', fileList);
      }
      output.add('reg_file', result.reg_file);
      if (result.list) {
        output.add('list', result.list);
        for (const item of result.list) {
          // logger.debug('my item', item);
          if (item.reject_act === 'A' && item.job_name === 'A') {
            const perlist = await jobworker_model.getPerList(item.reject_seq);
            output.add('perlist', perlist.list);
            break;
          }
        }
      }
      return output;
    }
    return output;
  }

  resultDown = async (database, job_seq, req_body, res) => {
    const resultfile_model = this.getResultFile_Model(database);
    let file_type = req_body.file_type;
    if (!file_type) {
      file_type = 'i';
    }
    const result = {};
    const fileList = await resultfile_model.getResultFile(job_seq, file_type);
    // logger.debug(fileList);
    result.message = 'not found file';
    result.error = -1;
    if (fileList && fileList.length > 0) {
      const file_name = fileList[0].file_name;
      // logger.debug(fileList);
      if (file_name) {
        if (fs.existsSync(file_name)) {
          const stats = fs.statSync(file_name);
          const fileSizeInBytes = stats.size;
          // logger.debug(stats);
          const path_file = path.parse(file_name);
          let org_name = path_file.base;
          org_name = org_name.replace(/ /g,'_')
          const mimetype = mime.getType(file_name);
          res.setHeader('Content-disposition', 'attachment; filename=' + org_name); // 다운받아질 파일명 설정
          res.setHeader('Content-length', fileSizeInBytes);
          res.setHeader('Content-type', mimetype); // 파일 형식 지정
          const filestream = fs.createReadStream(file_name);
          // logger.debug(file_name)
          // logger.debug(org_name)
          filestream.pipe(res);

          // res.sendFile(file_name);
          result.error = 0;
          return result;
        } else {
          result.error = -2;
          result.message = 'file not found';
        }
      }
    }
    return result;
  }
}

const project_service = new ProjectServiceClass()

export default project_service
