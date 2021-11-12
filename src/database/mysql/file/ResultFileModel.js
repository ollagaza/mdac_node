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
        'seq', 'file_seq', 'job_seq', 'file_type', 'file_name', 'org_file_name', 'file_path', 'file_size', 'pair_key'
    ]
  }

  // 추가 필요 column - org_file_name, file_path

  getFileModel = (database = null) => {
    if (database) {
      return new FileModel(database)
    }
    return new FileModel(DBMySQL)
  }
  
  createResFile = async (fseq, jseq, ftype, fname, pairKey, orgfilename, filepath, filesize) => {
    const file = {
      file_seq: fseq,
      job_seq: jseq,
      file_type: ftype,
      file_name: fname,
      pair_key: pairKey,
      org_file_name: orgfilename,
      file_path: filepath,
      file_size: filesize
    }
    return await this.create(file, 'seq');
  }

  createResFileData = async (fseq, jseq, memberseq, pairkey, resdata, status) => {
    let file_type = 'x'

    try { 
      let json = JSON.parse(resdata)
      file_type = (typeof json === 'object') ? 'j' : 'x'
    } catch (e) { 
      file_type = 'x'
    } 

    const file = {
      file_seq: fseq,
      file_type: file_type,
      job_seq: jseq,
      reg_member_seq: memberseq,
      pair_key: pairkey,
      res_data: resdata,
      status: status
    }
    return await this.create(file, 'seq');
  }

  getResFileBySeq = async (seq) => {
    const select = ['seq', 'file_seq', 'job_seq', 'file_type', 'file_name', 'down_cnt', 'reg_member_seq', 'reg_date', 'org_file_name', 'file_path', 'file_size', 'pair_key']
    const oKnex = this.database
      .select(select)
      .from(this.table_name)
      .where('seq', seq)
      .first();
    const result = await oKnex;
    return result;
  }

  getResFilesByFileseq = async (file_seq) => {
    const select = ['seq', 'file_seq', 'job_seq', 'file_type', 'file_name', 'down_cnt', 'reg_member_seq', 'reg_date', 'org_file_name', 'file_path', 'file_size', 'pair_key']
    const oKnex = this.database
      .select(select)
      .from(this.table_name)
      .where('file_seq', file_seq);
    const result = await oKnex;
    return result;
    // const result = await this.findOne({ seq: seq });
    // console.log(result);
    // return new JsonWrapper(result, this.private_fields);
  }

  getResFilesByJobseq = async (job_seq) => {
    const select = ['seq', 'file_seq', 'job_seq', 'file_type', 'file_name', 'down_cnt', 'reg_member_seq', 'reg_date', 'org_file_name', 'file_path', 'file_size', 'pair_key']
    const oKnex = this.database
      .select(select)
      .from(this.table_name)
      .where('job_seq', job_seq);
    const result = await oKnex;
    return result;
  }

  getResFiles = async(division_seq) => {
      // get files
      const file_model = this.getFileModel(database)
      const files = await file_model.getOrgFiles(division_seq);
      // get result files by file_seq
    
      // get result files
    //   const select = ['seq', 'file_seq', 'job_seq', 'file_type', 'file_name', 'down_cnt', 'reg_member_seq', 'reg_date']
    //   const oKnex = this.database.select(select).from(this.table_name).where();
    //   const result = await oKnex;
    //   return new JsonWrapper(result, this.private_fields);
  }

  getMaxResFileParkKey = async() => {
    // const select = ['pair_key'];
    // const oKnex = this.database.select(select).from(this.table_name);
    const oKnex = this.database.max('pair_key as val').from(this.table_name).first();
    const result = await oKnex;
    return result;
  }
}