import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';
import logger from "../../../libs/logger";

export default class DivisionModel extends MySQLModel {
  constructor(database) {
    super(database)

    this.table_name = 'division'
    this.private_fields = []
  }
  getDivsionByProseq = async (pro_seq, div_seq, is_used) => {
    const result = {}
    const select = ['*']
    const oKnex = this.database.select(select)
      .from(this.table_name)
      .where('project_seq', pro_seq)
      .andWhere('is_used','Y');
    if (is_used !== 'A') {
      oKnex.andWhere('is_used', is_used);
    }
    logger.debug('div_seq', div_seq)
    if (div_seq && div_seq !== '0') {
      oKnex.andWhere('seq', div_seq);
    }
    oKnex.orderBy('parent_division_seq')
    try{
      result.error = 0;
      result.data = await oKnex;
    } catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }

  getFirstDivsionByProseq = async (pro_seq) => {
    const result = {}
    const select = ['*']
    const oKnex = this.database.select(select)
      .from(this.table_name)
      .where('project_seq', pro_seq)
      .andWhere('is_used','Y')
      .andWhere(function (){
        this.whereNull('parent_division_seq') ,
        this.orWhere('parent_division_seq', 0)
      });
    try{
      result.error = 0;
      result.data = await oKnex;
    } catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }

}
