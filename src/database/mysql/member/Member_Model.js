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
    const select = ['user_id', 'user_name', 'reg_date', 'email', knex.raw('\'100\' as wcount') , knex.raw('\'10\' as bcount') , knex.raw('\'30\' as ccount') , knex.raw('\'430\' as dcount')]
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
