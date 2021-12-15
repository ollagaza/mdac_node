/*
=======================================
'	파일명 : ClassModel.js
'	작성자 : djyu
'	작성일 : 2021.09.30
'	기능   : class model
'	=====================================
*/
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class ClassModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'mdc_class'
    this.private_fields = [
      
    ]
  }

  createClass  = async (class_info) => {
    // logger.debug(project_info.password)
    // const member = project_info.toJSON()
    // project_info.status = '1';

    // logger.debug(project_info)
    try{
      const class_info_seq = await this.create(class_info, 'seq')
      class_info.seq = class_info_seq
      class_info.error = 0;
    } catch (e) {
      class_info.error = -1;
      class_info.message = e.sqlMessage;
    }
    return class_info
  }

  updateClass  = async (class_seq, class_info) => {
    // logger.debug(project_info.password)
    // const member = project_info.toJSON()
    // logger.debug(project_info)
    const update_param = {};
    update_param.project_seq = class_info.project_seq;
    update_param.class_id = class_info.class_id;
    update_param.class_name = class_info.class_name;
    update_param.is_used = class_info.is_used;
    update_param.reg_member_seq = class_info.reg_member_seq;
    try{
      const class_info_seq = await this.update({ seq: class_seq }, update_param)
      class_info.error = 0;
    } catch (e) {
      class_info.error = -1;
      class_info.message = e.sqlMessage;
    }
    return class_info
  }

  getClassInfo = async (start, end, is_used, search_type, keyword, project_seq, class_seq) => {
    const result = {}
    
    const select = ['c.seq','c.project_seq','p.project_name','c.class_id','c.class_name','c.is_used','c.reg_date']
    const oKnex = this.database.select(select);
    oKnex.from({c: 'mdc_class'}).join({p: 'mdc_project'}, function() {
      this.on('c.project_seq','=','p.seq')});

    if(class_seq === '')
    {
      if(is_used !== '') {
      }
      if(project_seq !== '') {
        oKnex.where('c.project_seq',project_seq);
      }

      if(keyword !== '') {
        oKnex.where(`c.${search_type}`,'like',`%${keyword}%`);
      }
    }
    const oCountKnex = this.database.from(oKnex.clone().as('list'))
    if(class_seq === '')
    {
      oKnex.orderBy('c.seq','desc');
      oKnex.limit(end).offset(start)
    }else{
      oKnex.where('c.seq',class_seq);
    }

    result.class_info = await oKnex;
   
    // 총 갯수
    const { total_count } = await oCountKnex.count('* as total_count').first()

    result.paging = total_count
    return result
  }
  
  // 나중에 지울거.. by djyu 2021.09.30
  // getClassInfoPaging = async (start, end, is_used, search_type, keyword, project_seq, class_seq) => {
  //   const select = ['c.seq']
  //   const oKnex = this.database.select(select);
  //   oKnex.from({c: 'class'}).join({p: 'project'}, function() {
  //     this.on('c.project_seq','=','p.seq')})

  //   if(class_seq === '')
  //   {
  //     if(is_used !== '') {
  //       oKnex.where('c.is_used',is_used)
  //     }
  //     if(project_seq !== '') {
  //       oKnex.where('c.project_seq',project_seq);
  //     }

  //     if(keyword !== '') {
  //       oKnex.where(`c.${search_type}`,'like',`%${keyword}%`);
  //     }
  //     oKnex.orderBy('c.seq','desc');
  //   }else{
  //     oKnex.where('c.seq',class_seq);
  //   }

  //   const oCountKnex = this.database.from(oKnex.clone().as('list'))

  //   if(project_seq === '')
  //   {
  //     oKnex.limit(end).offset(start)
  //   }

  //   const result = await oKnex;
   
  //   // 총 갯수
  //   const [{ total_count }] = await Promise.all([
  //     oCountKnex.count('* as total_count').first()
  //   ])
  //   // const rslt = {}
  //   // rslt.aaa = result;
  //   // rslt.bbb = total_count;
  //   return total_count
  // }
 
  updateClassUsed = async (params, arr_class_seq) => {
    const result = {};
    result.error = 0;
    result.message = '';
    try {
      const result = await this.database
        .from(this.table_name)
        .whereIn('seq', arr_class_seq)
        .update(params);
      // logger.debug(result);
    }catch (e) {
      result.error = -1;
      result.message = '업데이트 오류가 발생했습니다.  관리자에게 문의해 주세요';
    }
    return result;
  }

  deleteClass = async (params, arr_class_seq) => {
    const result = {};
    result.error = 0;
    result.message = '';
    try {
  
      const select = ['seq']
      const oKnex = this.database.select(select);
      oKnex.from('mdc_job')
      oKnex.whereIn('class_seq', arr_class_seq)
  
      // 총 갯수
      const { total_count } = await oKnex.count('* as total_count').first()

      if(total_count > 0) {
        result.error = -1;
        result.message = '선택한 클래스에 할당된 작업이 있어 삭제가 불가합니다';
      } else {
        const result = await this.database
          .from(this.table_name)
          .whereIn('seq', arr_class_seq)
          .delete(params);
        // logger.debug(result);
      }
    }catch (e) {
      result.error = -1;
      result.message = '삭제 오류가 발생했습니다.  관리자에게 문의해 주세요';
    }
    return result;
  }

  getClassListByProjectseq = async(project_seq) => {
    const select = ['*'];
    const oKnex = this.database
      .select(select)
      .from(this.table_name)
      .where("project_seq", project_seq);
    return await oKnex;
  }

  getClass = async(seq) => {
    const select = ['*'];
    const oKnex = this.database
      .select(select)
      .from(this.table_name)
      .where("seq", seq);
    return await oKnex;
  }
  
  getClass_list= async (pro_seq) => {
    const select = ['*']
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name)
    oKnex.where('project_seq', pro_seq)
    oKnex.andWhere(knex.raw('is_used=\'Y\''))
    let result = {};
    try{
      result.error = 0;
      result.data = await oKnex;
    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }
}
