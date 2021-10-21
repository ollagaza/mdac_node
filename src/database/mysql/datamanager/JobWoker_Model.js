// JobWoker_Model.js
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class MemberModel extends MySQLModel {
  constructor(database) {
    super(database)

    this.table_name = 'job_worker'
  }

  createJobWorker = async (params, notDel = true) => {
    const filter = {};
    filter.job_seq = params.job_seq;
    filter.job_status = params.job_status;
    if (notDel) {
      await this.delete(filter);
    }
    return await this.create(params, 'seq')
  }

  delJobWorker= async (params) => {
    const result = await this.delete(params);
    logger.debug('delJobWoker', result)
    return result;
  }

  updateJobWorker= async (params, job_seq) => {
    const filter = {job_seq};
    const result = await this.update(filter, params);
    logger.debug('updateJobWorker', result)
    return result;
  }

  updateJobWorkerByStatus= async (params, job_seq, status) => {
    const filter = {job_seq: job_seq, job_status: status};
    const result = await this.update(filter, params);
    logger.debug('updateJobWorker', result)
    return result;
  }

  setJobWorker = async (pro_seq, div_seq, req_body, member_seq) => {
    const job_worker = {}
    // pro_seq: '1',
    //   div_seq: '4',
    //   seqlist: [ '5' ],
    //   file_type: 'v',
    //   worker_id: 1,
    //   work_status_send: 'A1',
    //   class_id: 33,
    //   label_cnt: 100
    job_worker.project_seq = req_body.pro_seq;
    job_worker.result_file_pair_key = 0;
    if (req_body.class_seq){
      job_worker.class_seq = req_body.class_seq;
    }
    job_worker.job_name = req_body.work_status_send.substr(0, 1);
    job_worker.job_status = req_body.work_status_send;
    job_worker.job_member_seq = req_body.worker_id;
    job_worker.reg_member_seq = member_seq;
    const result = {};
    const check_filejoblist = req_body.check_filejoblist;
    for (const item of check_filejoblist) {
      const arr_seq = item.split('_');
      let file_seq = 0;
      let job_seq = 0;
      if (arr_seq.length > 1){
        file_seq = parseInt(arr_seq[0], 10);
        job_seq = parseInt(arr_seq[1], 10);
      }
      logger.debug(file_seq, job_seq)
      if (!req_body.job_seq || req_body.job_seq === 0){
        // insert job
        const job = {};
        job.file_seq = file_seq;
        job.project_seq = req_body.pro_seq;
        job.division_seq = req_body.div_seq;
        job.status = 'A1';
        job.reg_member_seq = member_seq;
        logger.debug(job);
        try {
          const job_seq = await this.database
            .from('job')
            .returning('seq')
            .insert(job)
          req_body.job_seq = job_seq;
        }catch (e) {
          result.error = -1;
          result.message = e.sqlMessage;
        }
        logger.debug(job_seq);
      } else {
        req_body.job_seq = job_seq;
        const job_update = {}
        job_update.status = 'A1';
        job_update.labeler_member_seq = req_body.worker_id;
        job_update.mod_member_seq = member_seq;
      }
      try{
        // const job_work_seq = await this.create(job_worker, 'seq')
        result.error = 0;
      } catch (e) {
        result.error = -1;
        result.message = e.sqlMessage;
      }
    }
    return result
  }

  getJobWorkerList = async (job_seq, req_body, member_seq) => {
    try {
      const result = {};
      const select = ['jw.*', 'm.user_name', 'mreg.user_name as reg_member']
      const oKnex = this.database
        .select(select)
        .from('job_worker as jw')
        .leftJoin('member as m', function () {
          this.on('jw.job_member_seq', '=', 'm.seq')
        })
        .leftJoin('member as mreg', function () {
          this.on('jw.reg_member_seq', '=', 'mreg.seq')
        })
        .where('job_seq', job_seq);
      if(req_body.file_type === 'v'){
        oKnex.andWhere('result_file_pair_key', req_body.ref_pair_key);
      }
      oKnex.orderBy('job_status');
      result.list = await oKnex;
      result.error = 0;
      logger.debug('result : ', result);
      return result;
    } catch (e) {
      return {error: -1, message: e};
    }
  }

  getPerList = async (jobworker_seq, reject_pair_key = 0) => {
    let reject_query = '';
    if (reject_pair_key > 0){
      reject_query = ` and jw.result_file_pair_key = ${reject_pair_key} `;
    }
    const query = 'SELECT jw.*, m.user_name, mreg.user_name as reg_member ' +
      'from job_worker AS jw '+
      'left join member as m on(jw.job_member_seq = m.seq) ' +
      'left join member as mreg on(jw.reg_member_seq = mreg.seq) ' +
      `where jw.job_seq = ${jobworker_seq} `+
      reject_query +
      'order by jw.job_status asc';
    try{
      const result = {};
      const oKnex = this.database.raw(query);
      const data = await oKnex;
      result.list = data[0];
      result.error = 0;
      // logger.debug('result : ', result);
      return result;
    } catch (e) {
      logger.error(e);
      return {error: -1, message: e};
    }
  }

}
