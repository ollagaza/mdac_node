/*
=======================================
'	파일명 : DivisionModel.js
'	작성자 : djyu
'	작성일 : 2021.09.30
'	기능   : division model
'	=====================================
*/
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class DivisionModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'mdc_division'
    this.private_fields = [
      
    ]
  }

  createDivision  = async (division_info) => {
    // logger.debug(project_info.password)
    // const member = project_info.toJSON()
    // project_info.status = '1';

    // logger.debug(project_info)
    
    if(!division_info.parent_division_seq) {
      delete division_info.parent_division_seq
    }
    try{
      const division_info_seq = await this.create(division_info, 'seq')
      division_info.seq = division_info_seq
      division_info.error = 0;
    } catch (e) {
      division_info.error = -1;
      division_info.message = e.sqlMessage;
    }
    return division_info
  }

  updateDivision  = async (division_seq, division_info) => {
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

  getDivision = async (dmode, project_seq, parent_division_seq, division_seq) => {
    const select = ['*']
    
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name)
                
    oKnex.where('seq','<>',0)
    if(dmode === 'CHILD') {
      if(project_seq !== '') {
        oKnex.andWhere('project_seq',project_seq);
      }
      if(parent_division_seq !== '') {
        oKnex.andWhere('parent_division_seq',parent_division_seq);
      }else{
        oKnex.whereNull('parent_division_seq');
      }
    }else{
      if(parent_division_seq==='') {
        if(project_seq !== '') {
          oKnex.andWhere('project_seq',project_seq);
        }
        if(division_seq !== '')
        {
          oKnex.andWhere('seq',division_seq);
        }else{
          oKnex.andWhere('seq',division_seq);
        }
      }else{      
        oKnex.andWhere('parent_division_seq',parent_division_seq);
      }
    }
    oKnex.orderBy('seq','desc');

    const result = await oKnex;
    //return new JsonWrapper(result, this.private_fields)
    return result;
  }
  
  getDivisionInfo = async (start, end, is_used, search_type, keyword, project_seq, division_seq) => {
    const result = {}
    // knex.raw('CONCAT(CASE WHEN a.division_name IS NULL THEN `` ELSE CONCAT(a.division_name,`>`) END, CASE WHEN b.division_name IS NULL THEN `` ELSE CONCAT(b.division_name,>`) END, CASE WHEN c.division_name IS NULL THEN `` ELSE CONCAT(c.division_name,`>`) END, CASE WHEN d.division_name IS NULL THEN `` ELSE CONCAT(d.division_name,`>`) END, CASE WHEN e.division_name IS NULL THEN `` ELSE CONCAT(e.division_name,`>`) END) AS parent_path'),

    const select = [knex.raw(`CASE WHEN TRIM(TRAILING ' > ' FROM CONCAT(CASE WHEN a.division_name IS NULL THEN '' ELSE CONCAT(a.division_name,' > ') END, CASE WHEN b.division_name IS NULL THEN '' ELSE CONCAT(b.division_name,' > ') END, CASE WHEN c.division_name IS NULL THEN '' ELSE CONCAT(c.division_name,' > ') END, CASE WHEN d.division_name IS NULL THEN '' ELSE CONCAT(d.division_name,' > ') END, CASE WHEN e.division_name IS NULL THEN '' ELSE CONCAT(e.division_name,' > ') END)) = '' THEN f.division_name ELSE TRIM(TRAILING ' > ' FROM CONCAT(CASE WHEN a.division_name IS NULL THEN '' ELSE CONCAT(a.division_name,' > ') END, CASE WHEN b.division_name IS NULL THEN '' ELSE CONCAT(b.division_name,' > ') END, CASE WHEN c.division_name IS NULL THEN '' ELSE CONCAT(c.division_name,' > ') END, CASE WHEN d.division_name IS NULL THEN '' ELSE CONCAT(d.division_name,' > ') END, CASE WHEN e.division_name IS NULL THEN '' ELSE CONCAT(e.division_name,' > ') END)) END AS parent_path`),
    knex.raw(`CASE WHEN TRIM(TRAILING '_' FROM CONCAT(CASE WHEN a.division_id IS NULL THEN '' ELSE CONCAT(a.division_id,'_') END, CASE WHEN b.division_id IS NULL THEN '' ELSE CONCAT(b.division_id,'_') END, CASE WHEN c.division_id IS NULL THEN '' ELSE CONCAT(c.division_id,'_') END, CASE WHEN d.division_id IS NULL THEN '' ELSE CONCAT(d.division_id,'_') END, CASE WHEN e.division_id IS NULL THEN '' ELSE CONCAT(e.division_id,'_') END)) = '' THEN f.division_id ELSE TRIM(TRAILING '_' FROM CONCAT(CASE WHEN a.division_id IS NULL THEN '' ELSE CONCAT(a.division_id,'_') END, CASE WHEN b.division_id IS NULL THEN '' ELSE CONCAT(b.division_id,'_') END, CASE WHEN c.division_id IS NULL THEN '' ELSE CONCAT(c.division_id,'_') END, CASE WHEN d.division_id IS NULL THEN '' ELSE CONCAT(d.division_id,'_') END, CASE WHEN e.division_id IS NULL THEN '' ELSE CONCAT(e.division_id,'_') END)) END AS parent_path_id`), 'f.project_seq', 'p.project_name', 'f.seq', 'f.parent_division_seq', 'f.division_id', 'f.division_name', 'f.is_used','f.reg_date']
    
    const oKnex = this.database.select(select);
    oKnex.from({ a: 'mdc_division' }).rightJoin({ b: 'mdc_division'}, function() {
      this.on('a.seq','=','b.parent_division_seq')})
    oKnex.rightJoin({ c: 'mdc_division'}, function() {
      this.on('b.seq','=','c.parent_division_seq')})
    oKnex.rightJoin({ d: 'mdc_division'}, function() {
      this.on('c.seq','=','d.parent_division_seq')})
    oKnex.rightJoin({ e: 'mdc_division'}, function() {
      this.on('d.seq','=','e.parent_division_seq')})
    oKnex.rightJoin({ f: 'mdc_division'}, function() {
      this.on('e.seq','=','f.parent_division_seq')})
    oKnex.join({ p: 'mdc_project'}, function() {
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
  
  // 나중에 지울것. by djyu 2021.09.30
  // getDivisionInfoPaging = async (start, end, is_used, search_type, keyword, project_seq, division_seq) => {
  //   const select = ['division.seq']
  //   const oKnex = this.database.select(select);
  //   oKnex.from('division').join('project', function() {
  //     this.on('division.project_seq','=','project.seq')})
      
  //   oKnex.where('division.seq','<>',0)
  //   if(division_seq === '')
  //   {
  //     if(is_used !== '') {
  //       oKnex.andWhere('division.is_used',is_used)
  //     }
  //     if(project_seq !== '') {
  //       oKnex.andWhere('division.project_seq',project_seq);
  //     }

  //     if(keyword !== '') {
  //       oKnex.andWhere(`division.${search_type}`,'like',`%${keyword}%`);
  //     }
  //     oKnex.orderBy('division.seq','desc');
  //   }else{
  //     oKnex.andWhere('division.seq',division_seq);
  //   }

  //   const oCountKnex = this.database.from(oKnex.clone().as('list'))

  //   if(project_seq === '')
  //   {
  //     oKnex.limit(end).offset(start)
  //   }

  //   // const result = await oKnex;
   
  //   // 총 갯수
  //   const [{ total_count }] = await Promise.all([
  //     oCountKnex.count('* as total_count').first()
  //   ])
    
  //   return total_count;    
  // }
 
  updateDivisionUsed = async (params, arr_division_seq) => {
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

  deleteDivision = async (params, arr_division_seq) => {
    const result = {};
    result.error = 0;
    result.message = '';
    try {  
      const select = ['seq']
      const oKnex = this.database.select(select);
      oKnex.from('mdc_job')
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

  
  getDivsionByProseq = async (pro_seq, div_seq, is_used) => {
    const result = {}
    const select = ['*']
    const oKnex = this.database.select(select)
      .from(this.table_name)
      .where('project_seq', pro_seq)
      .andWhere('is_used','Y');
    if (is_used !== 'A') {
      oKnex.andWhere('is_used', is_used);
    }
    // logger.debug('div_seq', div_seq)
    if (div_seq && div_seq !== '0') {
      oKnex.andWhere('seq', div_seq);
    }
    oKnex.orderBy('parent_division_seq')
    try{
      result.error = 0;
      result.data = await oKnex;
    } catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }
  getDivsumMax= async (seq_list) => {
    const oKnex = this.database.select(knex.raw('job.division_seq, max(jw.job_date) as job_date'))
      .from('mdc_job as job')
      .leftJoin('mdc_job_worker as jw', function(){
        this.on('jw.job_seq', '=', 'job.seq')
      })
      .whereIn('job.division_seq', seq_list)
      .andWhere(knex.raw('jw.job_status = \'A2\''))
      .groupBy('job.division_seq');
    const result = {}
    try{
      result.error = 0;
      result.data = await oKnex;
    } catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }
  getDivsum= async (seq_list) => {
    const result = {}
    const select = [knex.raw('job.division_seq, '+
      'ai.label_cnt_sum, '+
      're.reject_A_sum, '+
      'sum(case when jw.job_status=\'A0\' then 1 END) AS \'A0\', ' +
      'sum(case when jw.job_status=\'A1\' then 1 END) AS \'A1\', ' +
      'sum(case when jw.job_status=\'A2\' then 1 END) AS \'A2\', ' +
      'sum(case when jw.job_status=\'B1\' then 1 END) AS \'B1\', ' +
      'sum(case when jw.job_status=\'B2\' then 1 END) AS \'B2\', ' +
      'sum(case when jw.job_status=\'B5\' then 1 END) AS \'B5\', ' +
      'sum(case when jw.job_status=\'C1\' then 1 END) AS \'C1\', ' +
      'sum(case when jw.job_status=\'C2\' then 1 END) AS \'C2\', ' +
      'sum(case when jw.job_status=\'C5\' then 1 END) AS \'C5\', ' +
      'sum(case when jw.job_status=\'D1\' then 1 END) AS \'D1\', ' +
      'sum(case when jw.job_status=\'D2\' then 1 END) AS \'D2\', ' +
      'sum(case when jw.job_status=\'D5\' then 1 END) AS \'D5\', ' +
      'sum(case when jw.job_status=\'E2\' then 1 END) AS \'E2\' ')]
    const oKnex = this.database.select(select)
      .from('mdc_job as job')
      .leftJoin('mdc_job_worker as jw', function(){
        this.on('jw.job_seq', '=', 'job.seq')
      })
    const sum_assi = 'SELECT division_seq, SUM(label_cnt) label_cnt_sum FROM mdc_job GROUP BY division_seq';
    const sum_reject = 'SELECT mjo.division_seq, count(mjw.seq) reject_A_sum FROM mdc_job as mjo '+
        'left join mdc_job_worker mjw on(mjw.job_seq = mjo.seq) '+
        'where mjw.reject_act = \'A\' GROUP BY mjo.division_seq';
    oKnex.leftJoin(knex.raw(`(${sum_assi}) as ai on ai.division_seq = job.division_seq`));
    oKnex.leftJoin(knex.raw(`(${sum_reject}) as re on re.division_seq = job.division_seq`));
    oKnex.whereIn('job.division_seq', seq_list)
    oKnex.groupBy('job.division_seq')
    try{
      result.error = 0;
      result.data = await oKnex;
    } catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }

  getFirstDivsionByProseq = async (pro_seq) => {
    const result = {}
    const select = ['*']
    const oKnex = this.database.select(select)
      .from(this.table_name)
      .where('project_seq', pro_seq)
      .andWhere('is_used','Y')
      .andWhere(function (){
        this.whereNull('parent_division_seq') ,
        this.orWhere('parent_division_seq', 0)
      });
    try{
      result.error = 0;
      result.data = await oKnex;
    } catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }


  // category List 가져오기 by djyu 2021.11.25
  getCategoryList = async (project_seq) => {
    const select = ['c.seq', 'c.category1_seq', 'c1.codegroup_id', 'c1.codegroup_name', 'c.category2_seq', 'c2.codegroup_id', 'c2.codegroup_name' 
      , 'c.category3_seq', 'c3.codegroup_id', 'c3.codegroup_name'
      , 'c.category4_seq', 'c4.codegroup_id', 'c4.codegroup_name'
      , 'c.category5_seq', 'c5.codegroup_id', 'c5.codegroup_name' , knex.raw(`CASE WHEN TRIM(TRAILING ' > ' FROM CONCAT(CASE WHEN c1.codegroup_name IS NULL THEN '' ELSE CONCAT(c1.codegroup_name,' > ') END, 
      CASE WHEN c2.codegroup_name IS NULL THEN '' ELSE CONCAT(c2.codegroup_name,' > ') END, 
      CASE WHEN c3.codegroup_name IS NULL THEN '' ELSE CONCAT(c3.codegroup_name,' > ') END, 
      CASE WHEN c4.codegroup_name IS NULL THEN '' ELSE CONCAT(c4.codegroup_name,' > ') END, 
      CASE WHEN c5.codegroup_name IS NULL THEN '' ELSE CONCAT(c5.codegroup_name,' > ') END)) != '' THEN 
      TRIM(TRAILING ' > ' FROM CONCAT(CASE WHEN c1.codegroup_name IS NULL THEN '' ELSE CONCAT(c1.codegroup_name,' > ') END, 
      CASE WHEN c2.codegroup_name IS NULL THEN '' ELSE CONCAT(c2.codegroup_name,' > ') END, 
      CASE WHEN c3.codegroup_name IS NULL THEN '' ELSE CONCAT(c3.codegroup_name,' > ') END, 
      CASE WHEN c4.codegroup_name IS NULL THEN '' ELSE CONCAT(c4.codegroup_name,' > ') END, 
      CASE WHEN c5.codegroup_name IS NULL THEN '' ELSE CONCAT(c5.codegroup_name,' > ') END))
      ELSE c1.codegroup_name END AS full_path`)]
    const oKnex = this.database.select(select).from(`mdc_category as c`)
    oKnex.join('mdc_codegroup as c1', function(){
      this.on('c.category1_seq', '=', 'c1.seq')
    })
    oKnex.leftJoin('mdc_codegroup as c2', function(){
      this.on('c.category2_seq', '=', 'c2.seq')
    })
    oKnex.leftJoin('mdc_codegroup as c3', function(){
      this.on('c.category3_seq', '=', 'c3.seq')
    })
    oKnex.leftJoin('mdc_codegroup as c4', function(){
      this.on('c.category4_seq', '=', 'c4.seq')
    })
    oKnex.leftJoin('mdc_codegroup as c5', function(){
      this.on('c.category5_seq', '=', 'c5.seq')
    })

    if(project_seq !== '0') {
      oKnex.where('c.project_seq','=', project_seq)
    }
    const result = {};
    try{
      result.data = await oKnex;
      result.error = 0;
    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }  
}
