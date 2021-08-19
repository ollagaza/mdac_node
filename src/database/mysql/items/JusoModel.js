import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import Constants from "../../../constants/constants";

export default class JusoModel extends MySQLModel {
  constructor(database) {
    super(database)

    this.table_name = 'juso_item'
  }


  getJuso = async () => {
    const file_info = {};
    try{
      const oKnex = this.database.select('*');
      oKnex.from(this.table_name);
      oKnex.where('par_seq','0');
      const result = await oKnex;
      const redata = [];
      Object.keys(result).forEach((key) => {
        const rdata = {};
        rdata.seq = result[key].seq;
        rdata.item_seq = result[key].item_seq;
        rdata.item_name = result[key].item_name;
        redata.push(rdata);
      })
      file_info.error = 0;
      file_info.data = redata;
      // logger.debug(file_info);
    } catch (e) {
      file_info.error = -1;
      file_info.message = e.sqlMessage;
    }
    return file_info
  }

  getGugun = async (sido) => {
    const file_info = {};
    try{
      const oKnex = this.database.select('*');
      oKnex.from(this.table_name);
      oKnex.where('par_seq', sido);
      const result = await oKnex;
      const redata = [];
      Object.keys(result).forEach((key) => {
        const rdata = {};
        rdata.seq = result[key].seq;
        rdata.item_seq = result[key].item_seq;
        rdata.item_name = result[key].item_name;
        redata.push(rdata);
      })
      file_info.error = 0;
      file_info.data = redata;
      // logger.debug(file_info);
    } catch (e) {
      file_info.error = -1;
      file_info.message = e.sqlMessage;
    }
    return file_info
  }
}
