/*
=======================================
'	파일명 : CodeGroupModel.js
'	작성자 : djyu
'	작성일 : 2021.11.15
'	기능   : code group model
'	=====================================
*/
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class CodegroupModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'mdc_codegroup'
    this.private_fields = [
      
    ]
  }

  createCodegroup  = async (codegroup_info) => {
    try{
      const codegroup_info_seq = await this.create(codegroup_info, 'seq')
      codegroup_info.seq = codegroup_info_seq
      codegroup_info.error = 0;
    } catch (e) {
      codegroup_info.error = -1;
      codegroup_info.message = e.sqlMessage;
    }
    return codegroup_info
  }

  updateCodegroup  = async (codegroup_seq, codegroup_info) => {
    const update_param = {};
    update_param.codegroup_id = codegroup_info.codegroup_id;
    update_param.codegroup_name = codegroup_info.codegroup_name;
    update_param.is_used = codegroup_info.is_used;
    update_param.sort_no = codegroup_info.sort_no;
    update_param.reg_member_seq = codegroup_info.reg_member_seq;
    try{
      const codegroup_info_seq = await this.update({ seq: codegroup_seq }, update_param)
      codegroup_info.error = 0;
    } catch (e) {
      codegroup_info.error = -1;
      codegroup_info.message = e.sqlMessage;
    }
    return codegroup_info
  }

  getCodegroup = async (ref_codegroup, codegroup_seq) => {
    const select = ['*']
    
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name)
    
    if(codegroup_seq !== '')
    {
      oKnex.where('seq',codegroup_seq);
    }else{
      oKnex.where('ref_codegroup',ref_codegroup);
    }

    oKnex.orderBy('sort_no','ASC');

    const result = await oKnex;
    //return new JsonWrapper(result, this.private_fields)
    return result;
  }
  
  getCodegroupInfo = async (start, end, is_used, search_type, keyword, ref_codegroup, codegroup_seq) => {
    const result = {}

    const select = ['*']
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name)
  
    if(codegroup_seq !== '')
    {
      oKnex.where('seq',codegroup_seq);
    } else {
      oKnex.where('ref_codegroup',ref_codegroup);
      if(is_used !== '') {
        oKnex.andWhere('is_used',is_used)
      }

      if(keyword !== '') {
        oKnex.andWhere(`${search_type}`,'like',`%${keyword}%`);
      }
    }
    
    const oCountKnex = this.database.from(oKnex.clone().as('list'))

    oKnex.orderBy('sort_no','asc');

    if(codegroup_seq === '')
    {
      oKnex.limit(end).offset(start)
    }

    // const mKNex = this.database.raw(`CALL spGetDivisionInfo`)
    result.codegroup_info = await oKnex;

    // 총 갯수
    const { total_count } = await oCountKnex.count('* as total_count').first()

    result.paging = total_count
    return result;
  }
  
  updateCodegroupUsed = async (params, arr_codegroup_seq) => {
    const result = {};
    result.error = 0;
    result.message = '';
    try {
      const result = await this.database
        .from(this.table_name)
        .whereIn('seq', arr_codegroup_seq)
        .update(params);
      // logger.debug(result);
    }catch (e) {
      result.error = -1;
      result.message = '업데이트 오류가 발생했습니다.  관리자에게 문의해 주세요';
    }
    return result;
  }

  deleteCodegroup = async (params, arr_codegroup_seq) => {
    const result = {};
    result.error = 0;
    result.message = '';
    try {  
      const select = ['seq']
      const oKnex = this.database.select(select);
      oKnex.from('mdc_job')
      oKnex.whereIn('division_seq', arr_codegroup_seq)
  
      // 총 갯수
      const { total_count } = await oKnex.count('* as total_count').first()

      if(total_count > 0) {
        result.error = -1;
        result.message = '선택한 코드그룹에 할당된 작업이 있어 삭제가 불가합니다';
      } else {
        const result = await this.database
          .from(this.table_name)
          .whereIn('seq', arr_codegroup_seq)
          .delete(params);
        // logger.debug(result);
      }
      
    }catch (e) {
      result.error = -1;
      result.message = '삭제 오류가 발생했습니다.  관리자에게 문의해 주세요';
    }
    return result;
  }
}
