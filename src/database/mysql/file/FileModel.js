import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import moment from "moment";

export default class FileModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'file'
    this.private_fields = [
        'seq', 'project_seq', 'division_seq', 'file_type', 'file_path', 'file_name', 'org_file_name'
    ]
  }

  createOrgFile = async (pseq, dseq, ftype, fpath, fname, ofname) => {
    const file = {
      project_seq: pseq,
      division_seq: dseq,
      file_type: ftype,
      file_path: fpath,
      file_name: fname,
      org_file_name: ofname
    }
    return await this.create(file, 'seq');
  }

  getOrgFiles = async(division_seq) => {
    const select = ['seq', 'project_seq', 'division_seq', 'file_type', 'file_path', 'file_name', 'org_file_name', 'file_size', 'play_time', 'reg_member_seq', 'reg_date']
    const oKnex = this.database.select(select).from(this.table_name).where('division_seq', division_seq);
    const result = await oKnex;
    return new JsonWrapper(result, this.private_fields);
  }  
}