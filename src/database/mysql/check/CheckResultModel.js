import MySQLModel from "../../mysql-model";
import logger from "../../../libs/logger";
import PlantInfo from "../../../wrapper/plant/PlantInfo";

export default class CheckResultModel extends MySQLModel {
  constructor(database) {
    super(database)
    this.table_name = 'j_checkresult'
  }

  createResult = async (info) => {
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


  updateList = async(filter, params) => {
    const info = {};
    try{
      await this.update(filter, params)
      info.error = 0;
    } catch (e) {
      info.error = -1;
      info.message = e.sqlMessage;
    }
    return info;
  }
}
