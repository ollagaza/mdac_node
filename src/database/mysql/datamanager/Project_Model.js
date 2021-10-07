// make by june
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class ProjectModel extends MySQLModel {
  constructor(database) {
    super(database)

    this.table_name = 'project'
    this.private_fields = []
  }

  getProjectList = async () => {
    let result = {};
    try {
      const select = ['*']
      const oKnex = this.database.select(select);
      oKnex.from(this.table_name);
      result.error = 0;
      result.data = await oKnex;
    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }

  getProjectWidthClass = async (seq) => {
    let result = {};
    try {
      const select = ['*']
      const oKnex = this.database.select(select);
      oKnex.from(this.table_name);
      oKnex.where('seq', seq)
      result.error = 0;
      result.data = await oKnex;
    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }
}
