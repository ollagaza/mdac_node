import MySQLModel from "../../mysql-model";
import logger from "../../../libs/logger";
import Util from "../../../utils/baseutil";
import Constants from "../../../constants/constants";

export default class PlantFileModel extends MySQLModel {
  constructor(database) {
    super(database)
    this.table_name = 'j_file'
  }

  createFile = async (info) => {
    try {
      const seq = await this.create(info, 'seq')
      info.seq = seq
      // logger.debug(seq);
      info.error = 0;
      info.message = '';
    } catch (e) {
      info.error = -1;
      info.message = e.sqlMessage;
    }
    return info
  }

  getImg = async (seq, type) => {
    const file_info = {}
    try{
      const oKnex = this.database.select('*');
      oKnex.from(this.table_name);
      if (type === 'img'){
        oKnex.where('seq', seq);
      } else {
        oKnex.where('plant_seq', seq);
      }
      oKnex.orderBy('filetype', 'desc')
      // oKnex.andWhere('filetype', 0);
      const result = await oKnex;
      // logger.debug(result);

      const rdata = {};
      rdata.ser_dir = result[0].ser_dir;
      rdata.ser_filename = result[0].ser_filename;
      const dir = Util.removePathLastSlash(result[0].ser_dir);
      rdata.ser_path = dir + Constants.SP + result[0].ser_filename;
      rdata.error = 0;
      // logger.debug(rdata);
      return rdata;
    } catch (e) {
      file_info.error = -1;
      file_info.message = e.sqlMessage;
      return file_info;
    }
  }



  getFiles= async (plant_seq) => {
    const file_info = {}
    try{
      const oKnex = this.database.select('*');
      oKnex.from(this.table_name);
      oKnex.where('plant_seq', plant_seq);
      const result = await oKnex;
      const arrData = []
      Object.keys(result).forEach((key) => {
        const rdata = {};
        rdata.seq = result[key].seq;
        rdata.ser_dir = result[key].ser_dir;
        rdata.ser_filename = result[key].ser_filename;
        const dir = Util.removePathLastSlash(result[key].ser_dir);
        rdata.ser_path = dir + Constants.SP + result[key].ser_filename;
        rdata.filetype = result[key].filetype;
        arrData.push(rdata);
      });
      file_info.data = arrData;
      file_info.error = 0;
      file_info.message = '';
    } catch (e) {
      file_info.error = -1;
      file_info.message = e.sqlMessage;
    }
    // logger.debug('file_info', file_info);
    return file_info;
  }
}
