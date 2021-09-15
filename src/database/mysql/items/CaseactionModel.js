import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import Constants from "../../../constants/constants";

export default class ItemsModel extends MySQLModel {
  constructor(database) {
    super(database)
    this.table_name = 'j_caseaction'
  }

  createCaseAction = async (params) => {
    const result = {error:0, message:''};
    try {
      result.seq = await this.create(params, 'seq')
    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }

  updateCaseAction = async (params, seq) => {
    const result = {error:0, message:''};
    try {
      await this.database
        .from(this.table_name)
        .where('seq', seq)
        .update(params);
    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }

  getCodeToSeq = async (itemcode) => {
    const oKnex = this.database.select('*');
    oKnex.from(this.table_name);
    oKnex.where('itemcode', itemcode);
    const result = await oKnex;
    let seq = -1;
    if (result && result.length > 0) {
      seq = result[0].seq;
    }
    return seq;
  }

  getCodeToInfo = async (itemcode) => {
    const result_item = {error: 0, message:'' };
    try {
      const result = await this.database.select('*')
        .from(this.table_name)
        .where('itemcode', itemcode);
      result_item.result = result;
      return result_item;
    }catch (e) {
      result_item.error = -1;
      result_item.message = e;
      return result_item;
    }

  }

}
