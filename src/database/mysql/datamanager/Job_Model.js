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

}


