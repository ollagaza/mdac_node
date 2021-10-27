// junepark ResultFile_Model.js

import MySQLModel from "../../mysql-model";
import knex from "../../knex-mysql";
import logger from "../../../libs/logger";
import Constants from "../../../constants/constants";

export default class JobLog_Model extends MySQLModel {
  constructor(database) {
    super(database)
    this.table_name = 'result_file'
  }

  updateRFile = async (seq, params) => {
    const filter = { seq: seq, file_type: 'i' }
    return await this.update(filter, params)
  }

  updatePairRFile = async (pair_key, params) => {
    const filter = { pair_key: pair_key, file_type: 'i' }
    return await this.update(filter, params)
  }


  updateRejectFile = async (params, seq) => {
    const filter = { pair_key: seq }
    return await this.update(filter, params)
  }

  updateRejectFileJobseq = async (params, seq) => {
    const filter = { pair_key: seq, status: 'A1' }
    return await this.update(filter, params)
  }

  createRejectFile = async (job_seq, reject_pair_key, reg_member_seq) => {
    const oKnex = this.database
      .select('*')
      .from(this.table_name)
      .where('job_seq', '=', job_seq)
      .andWhere('pair_key', '=', reject_pair_key)
      .andWhere(knex.raw('file_type = \'i\''));
    const data = await oKnex;
    const cdata = {};
    if (data.length > 0 ) {
      cdata.file_seq = data[0].file_seq;
      cdata.job_seq = data[0].job_seq;
      cdata.file_type = data[0].file_type;
      cdata.file_name = data[0].file_name;
      cdata.reg_member_seq = reg_member_seq;
      cdata.down_cnt = 0;
      cdata.reject_seq = reject_pair_key;
      cdata.reject_act = 'A';
      cdata.status = 'A1';
      const pair_key = await this.create(cdata, 'pair_key');
      // const params = {pair_key, 'seq'}
      // const filter = {job_seq: cdata.job_seq, status: 'A1', reject_seq: reject_pair_key}
      await this.database.raw(`update result_file set pair_key = seq where job_seq = ${cdata.job_seq} and status = 'A1' and reject_seq = ${reject_pair_key}`)
      return pair_key;
    }
    return 0;
  }

  getResultFile = async (job_seq, file_type, pair_key = 0) => {
    const oKnex = this.database
      .select('*')
      .from(this.table_name)
      .where('job_seq', '=', job_seq)
    if(file_type !== 'a') {
      oKnex.andWhere('file_type', '=', file_type)
    }
    if (pair_key !== 0) {
      oKnex.andWhere('pair_key', '=', pair_key)
    }
    return await oKnex;
  }

  getImg = async (seq) => {
    const oKnex = this.database
      .select('*')
      .from(this.table_name)
      .where('seq', '=', seq);
    oKnex.andWhere( knex.raw('file_type = \'i\''));
    const result = await oKnex;
    const file_info = {};
    file_info.full_name = result[0].file_path;
    file_info.error = 0;
    return file_info;
  }

}
