import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import moment from "moment";
import FileModel from '../../mysql/file/FileModel'

export default class ResultFileModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'result_file'
    this.private_fields = [
        'seq', 'file_seq', 'job_seq', 'file_type', 'file_name'
    ]
  }

  GetFileModel = (database = null) => {
    if (database) {
      return new FileModel(database)
    }
    return new FileModel(DBMySQL)
  }

  GetResFiles = async(division_seq) => {
      // get files
      const file_model = this.GetFileModel(database)
      const files = await file_model.GetOrgFiles(division_seq);
    
      // get result files
    //   const select = ['seq', 'file_seq', 'job_seq', 'file_type', 'file_name', 'down_cnt', 'reg_member_seq', 'reg_date']
    //   const oKnex = this.database.select(select).from(this.table_name).where();
    //   const result = await oKnex;
    //   return new JsonWrapper(result, this.private_fields);
  }
}