// make my junepark
// make junepark Member_Model.js
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class MemberModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'job'
  }

  createJob = async (params) =>{
    const job_work_seq = await this.create(params, 'seq');
    try {
      await this.database.raw('UPDATE job SET reject_seq = seq WHERE IFNULL(reject_seq,-1) = -1');
    }catch (e) {
      logger.error('ee', e);
    }
    return job_work_seq;
  }

  updateJob = async (params, seq) =>{
    const filter = {seq: seq};
    const job_work_co = await this.update(filter, params)
    // logger.debug('job_worker', job_work_co);
    return job_work_co;
  }

  updateJobByFilters = async (filters, params) =>{
    const job_work_co = await this.update(filters, params)
    // logger.debug('job_worker', job_work_co);
    return job_work_co;
  }

  deleteJob = async (seq) =>{
    const filter = {seq: seq};
    const job_work_co = await this.delete(filter)
    logger.debug('del job', job_work_co);
    return job_work_co;
  }

  getJobList = async (pro_seq, div_seq, req_body) => {
    const select = ['*'];
    let join_div = '';
    if (div_seq){
      join_div = `and file.division_seq = ${div_seq}`;
    }
    const oKnex = this.database
      .select(select)
      .from(this.table_name)
      .leftJoin('file',function() {
        this.on('file.seq','job.file_seq')
          .andOn(knex.raw(`file.project_seq = ${pro_seq} ${join_div}`))
      })
      .where('job.project_seq',pro_seq);
    if (div_seq){
      oKnex.andWhere('job.division_seq', div_seq);
    }
    logger.debug(req_body.work_status);
    if (req_body && req_body.work_status && req_body.work_status !== '-1') {
      oKnex.andWhere('job.status', req_body.work_status);
    }

    const result = {};
    try{
      result.data = await oKnex;
      result.error = 0;
    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }

  getJobListByMemberseq = async (member_seq, status) => {
    const select = ['*'];
    const oKnex = this.database
      .select(select)
      .from(this.table_name)
      .where("labeler_member_seq", member_seq)
      .whereIn("status", status);
      // .andWhere('status', status);
    return await oKnex;
    // const result = {};
    // try{
    //   result.data = await oKnex;
    //   result.error = 0;
    // }catch (e) {
    //   result.error = -1;
    //   result.message = e;
    // }
    // return result;
  }

  getJobListByMemberFile = async (member_seq, file_seq, status) => {
    const select = ['*'];
    const oKnex = this.database
      .select(select)
      .from(this.table_name)
      .where("labeler_member_seq", member_seq)
      .andWhere("file_seq", file_seq)
      .whereIn("status", status);
    return await oKnex;
  }

  getJobBySeq = async(job_seq) => {
    const select = ['*'];
    const oKnex = this.database
      .select(select)
      .from(this.table_name)
      .where("seq", job_seq)
      .first();
    return await oKnex;
  }



}


