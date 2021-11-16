/*
=======================================
'	파일명 : CategoryModel.js
'	작성자 : djyu
'	작성일 : 2021.11.15
'	기능   : category model
'	=====================================
*/
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class CategoryModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'category_type'
    this.private_fields = [
      
    ]
  }

  createCategory  = async (category_info) => {
    
    if(!category_info.parent_division_seq) {
      delete category_info.parent_division_seq
    }
    try{
      const division_info_seq = await this.create(category_info, 'seq')
      category_info.seq = division_info_seq
      category_info.error = 0;
    } catch (e) {
      category_info.error = -1;
      category_info.message = e.sqlMessage;
    }
    return category_info
  }

  updateCategory  = async (division_seq, division_info) => {
    // logger.debug(project_info.password)
    // const member = project_info.toJSON()
    // logger.debug(project_info)
    const update_param = {};
    update_param.project_seq = division_info.project_seq;
    update_param.division_id = division_info.division_id;
    update_param.division_name = division_info.division_name;
    update_param.is_used = division_info.is_used;
    update_param.reg_member_seq = division_info.reg_member_seq;
    try{
      const division_info_seq = await this.update({ seq: division_seq }, update_param)
      division_info.error = 0;
    } catch (e) {
      division_info.error = -1;
      division_info.message = e.sqlMessage;
    }
    return division_info
  }

  getCategory = async (dmode, category_seq) => {
    const select = ['*']
    
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name)
    
    oKnex.whereNull('ref_category')

    if(category_seq !== '')
    {
      oKnex.andWhere('seq',category_seq);
    }

    oKnex.orderBy('sort_no','ASC');

    const result = await oKnex;
    //return new JsonWrapper(result, this.private_fields)
    return result;
  }
  
  getCategoryInfo = async (start, end, is_used, search_type, keyword, project_seq, division_seq) => {
    const result = {}
    // knex.raw('CONCAT(CASE WHEN a.division_name IS NULL THEN `` ELSE CONCAT(a.division_name,`>`) END, CASE WHEN b.division_name IS NULL THEN `` ELSE CONCAT(b.division_name,>`) END, CASE WHEN c.division_name IS NULL THEN `` ELSE CONCAT(c.division_name,`>`) END, CASE WHEN d.division_name IS NULL THEN `` ELSE CONCAT(d.division_name,`>`) END, CASE WHEN e.division_name IS NULL THEN `` ELSE CONCAT(e.division_name,`>`) END) AS parent_path'),

    const select = [knex.raw(`CASE WHEN TRIM(TRAILING ' > ' FROM CONCAT(CASE WHEN a.division_name IS NULL THEN '' ELSE CONCAT(a.division_name,' > ') END, CASE WHEN b.division_name IS NULL THEN '' ELSE CONCAT(b.division_name,' > ') END, CASE WHEN c.division_name IS NULL THEN '' ELSE CONCAT(c.division_name,' > ') END, CASE WHEN d.division_name IS NULL THEN '' ELSE CONCAT(d.division_name,' > ') END, CASE WHEN e.division_name IS NULL THEN '' ELSE CONCAT(e.division_name,' > ') END)) = '' THEN f.division_name ELSE TRIM(TRAILING ' > ' FROM CONCAT(CASE WHEN a.division_name IS NULL THEN '' ELSE CONCAT(a.division_name,' > ') END, CASE WHEN b.division_name IS NULL THEN '' ELSE CONCAT(b.division_name,' > ') END, CASE WHEN c.division_name IS NULL THEN '' ELSE CONCAT(c.division_name,' > ') END, CASE WHEN d.division_name IS NULL THEN '' ELSE CONCAT(d.division_name,' > ') END, CASE WHEN e.division_name IS NULL THEN '' ELSE CONCAT(e.division_name,' > ') END)) END AS parent_path`),
    knex.raw(`CASE WHEN TRIM(TRAILING '_' FROM CONCAT(CASE WHEN a.division_id IS NULL THEN '' ELSE CONCAT(a.division_id,'_') END, CASE WHEN b.division_id IS NULL THEN '' ELSE CONCAT(b.division_id,'_') END, CASE WHEN c.division_id IS NULL THEN '' ELSE CONCAT(c.division_id,'_') END, CASE WHEN d.division_id IS NULL THEN '' ELSE CONCAT(d.division_id,'_') END, CASE WHEN e.division_id IS NULL THEN '' ELSE CONCAT(e.division_id,'_') END)) = '' THEN f.division_id ELSE TRIM(TRAILING '_' FROM CONCAT(CASE WHEN a.division_id IS NULL THEN '' ELSE CONCAT(a.division_id,'_') END, CASE WHEN b.division_id IS NULL THEN '' ELSE CONCAT(b.division_id,'_') END, CASE WHEN c.division_id IS NULL THEN '' ELSE CONCAT(c.division_id,'_') END, CASE WHEN d.division_id IS NULL THEN '' ELSE CONCAT(d.division_id,'_') END, CASE WHEN e.division_id IS NULL THEN '' ELSE CONCAT(e.division_id,'_') END)) END AS parent_path_id`), 'f.project_seq', 'p.project_name', 'f.seq', 'f.parent_division_seq', 'f.division_id', 'f.division_name', 'f.is_used','f.reg_date']
    
    const oKnex = this.database.select(select);
    oKnex.from({ a: 'division' }).rightJoin({ b: 'division'}, function() {
      this.on('a.seq','=','b.parent_division_seq')})
    oKnex.rightJoin({ c: 'division'}, function() {
      this.on('b.seq','=','c.parent_division_seq')})
    oKnex.rightJoin({ d: 'division'}, function() {
      this.on('c.seq','=','d.parent_division_seq')})
    oKnex.rightJoin({ e: 'division'}, function() {
      this.on('d.seq','=','e.parent_division_seq')})
    oKnex.rightJoin({ f: 'division'}, function() {
      this.on('e.seq','=','f.parent_division_seq')})
    oKnex.join({ p: 'project'}, function() {
      this.on('p.seq','=','f.project_seq')})
                
    oKnex.where('f.seq','<>',0)
    if(division_seq === '')
    {
      if(is_used !== '') {
        oKnex.andWhere('f.is_used',is_used)
      }
      if(project_seq !== '') {
        oKnex.andWhere('f.project_seq',project_seq);
      }

      if(keyword !== '') {
        oKnex.andWhere(`f.${search_type}`,'like',`%${keyword}%`);
      }
    }
    
    const oCountKnex = this.database.from(oKnex.clone().as('list'))

    oKnex.orderBy('project_seq','asc');
    oKnex.orderBy('parent_path','asc');
    // oKnex.orderBy('parent_path','asc');
    if(division_seq === '')
    {
      oKnex.limit(end).offset(start)
    }else{
      oKnex.andWhere('f.seq',division_seq);
    }

    // const mKNex = this.database.raw(`CALL spGetDivisionInfo`)
    result.division_info = await oKnex;

    // 총 갯수
    const { total_count } = await oCountKnex.count('* as total_count').first()

    result.paging = total_count
    return result;
  }
  
  updateCategoryUsed = async (params, arr_division_seq) => {
    const result = {};
    result.error = 0;
    result.message = '';
    try {
      const result = await this.database
        .from(this.table_name)
        .whereIn('seq', arr_division_seq)
        .update(params);
      // logger.debug(result);
    }catch (e) {
      result.error = -1;
      result.message = '업데이트 오류가 발생했습니다.  관리자에게 문의해 주세요';
    }
    return result;
  }

  deleteCategory = async (params, arr_division_seq) => {
    const result = {};
    result.error = 0;
    result.message = '';
    try {  
      const select = ['seq']
      const oKnex = this.database.select(select);
      oKnex.from('job')
      oKnex.whereIn('division_seq', arr_division_seq)
  
      // 총 갯수
      const { total_count } = await oKnex.count('* as total_count').first()

      if(total_count > 0) {
        result.error = -1;
        result.message = '선택한 분류에 할당된 작업이 있어 삭제가 불가합니다';
      } else {
        const result = await this.database
          .from(this.table_name)
          .whereIn('seq', arr_division_seq)
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
