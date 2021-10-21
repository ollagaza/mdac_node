// make by june
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class ClassModel extends MySQLModel {
  constructor(database) {
    super(database)

    this.table_name = 'class'
    this.private_fields = []
  }
  getClass_list= async (pro_seq) => {
    const select = ['*']
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name)
    oKnex.where('project_seq', pro_seq)
    oKnex.andWhere(knex.raw('is_used=\'Y\''))
    let result = {};
    try{
      result.error = 0;
      result.data = await oKnex;
    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }
}
