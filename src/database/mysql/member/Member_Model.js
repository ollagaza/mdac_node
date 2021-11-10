// make junepark Member_Model.js
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import moment from "moment";
import knex from '../../knex-mysql';

export default class MemberModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'member'
    this.private_fields = [
      'password'
    ]
  }

  getWokerList = async (is_used) => {
    // const select = ['seq', 'user_id', 'user_name', 'reg_date', 'email', knex.raw('\'100\' as wcount') , knex.raw('\'10\' as bcount') , knex.raw('\'30\' as ccount') , knex.raw('\'430\' as dcount')]
    const select = ['seq', 'user_id', 'user_name', 'reg_date', 'email', knex.raw('IFNULL((SELECT SUM(label_cnt) FROM job WHERE member.seq = job.labeler_member_seq AND job.labeler_jobdate IS NULL),0) AS labelcnt') , knex.raw('IFNULL((SELECT COUNT(*) FROM job_worker WHERE member.seq = job_worker.job_member_seq AND job_date IS NULL AND (job_name = \'B\' OR job_name = \'C\' OR job_name = \'D\')),0) AS checkcnt')]
    const oKnex = this.database.select(select).from(this.table_name).where('is_used',is_used);
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
