/*
=======================================
'	파일명 : ProjectModel.js
'	작성자 : djyu
'	작성일 : 2021.09.30
'	기능   : project model
'	=====================================
*/
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class ProjectModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'mdc_project'
    this.private_fields = [
      
    ]
  }

  createProject  = async (project_info) => {
    // logger.debug(project_info.password)
    // const member = project_info.toJSON()
    // project_info.status = '1';

    // logger.debug(project_info)
    try{
      const project_info_seq = await this.create(project_info, 'seq')
      project_info.seq = project_info_seq
      project_info.error = 0;
    } catch (e) {
      project_info.error = -1;
      project_info.message = e.sqlMessage;
    }
    return project_info
  }

  updateProject  = async (project_seq, project_info) => {
    // logger.debug(project_info.password)
    // const member = project_info.toJSON()
    // logger.debug(project_info)
    const update_param = {};
    update_param.project_name = project_info.project_name;
    update_param.is_class = project_info.is_class;
    update_param.memo = project_info.memo;
    update_param.status = project_info.status;
    update_param.reason = project_info.reason;
    update_param.reg_member_seq = project_info.reg_member_seq;
    try{
      const project_info_seq = await this.update({ seq: project_seq }, update_param)
      project_info.error = 0;
    } catch (e) {
      project_info.error = -1;
      project_info.message = e.sqlMessage;
    }
    return project_info
  }

  getProjectInfo = async (start, end, status, search_type, keyword, project_seq) => {
    const result = {}

    const select = ['seq','project_name', 'is_class', 'status', 'memo', 'reason', 'reg_member_seq','reg_date', 
      //knex.raw('(select count(*) FROM job) as ttt'),
      knex.raw(`(	SELECT COUNT(DISTINCT labeler_member_seq) FROM mdc_job WHERE labeler_member_seq IS NOT NULL AND labeler_regdate IS NOT NULL AND project_seq=project.seq ) AS labeler_cnt`),
      knex.raw(`( SELECT COUNT(DISTINCT job_member_seq) FROM mdc_job_worker WHERE project_seq=project.seq AND (job_name='B' OR job_name='C' OR job_name='D')) AS checker_cnt`)
    ]
    const oKnex = this.database.select(select);
    oKnex.from(`${this.table_name} as project`)

    let subquery = {};

    if(project_seq === '')
    {
      if(status !== '') {
        oKnex.where('status',status);
      }
      if(keyword !== '') {
        if(search_type==='LABELER') { // labeler 검색
          subquery = knex.raw(`SELECT DISTINCT J.project_seq FROM mdc_job J JOIN mdc_member M ON J.labeler_member_seq=M.seq WHERE M.user_name LIKE '%${keyword}%' AND J.labeler_member_seq IS NOT NULL`)
          oKnex.andWhere('seq', 'in', subquery)      
        }else if(search_type==='CHECKER') { // checker 검색
          // subquery[0] = knex.raw(`SELECT DISTINCT J.project_seq FROM job J JOIN member M ON J.checker1_member_seq=M.seq WHERE M.user_name LIKE '%${keyword}%' AND J.checker1_member_seq IS NOT NULL`)
          // subquery[1] = knex.raw(`SELECT DISTINCT J.project_seq FROM job J JOIN member M ON J.checker2_member_seq=M.seq WHERE M.user_name LIKE '%${keyword}%' AND J.checker2_member_seq IS NOT NULL`)
          // subquery[2] = knex.raw(`SELECT DISTINCT J.project_seq FROM job J JOIN member M ON J.checker2_member_seq=M.seq WHERE M.user_name LIKE '%${keyword}%' AND J.checker2_member_seq IS NOT NULL`)
          // oKnex.andWhere(function() {
          //   this.where('seq', 'in', subquery[0]).orWhere('seq', 'in', subquery[1]).orWhere('seq', 'in', subquery[2])    
          // })

          subquery = knex.raw(`SELECT DISTINCT J.project_seq FROM mdc_job_worker J JOIN mdc_member M ON J.job_member_seq=M.seq AND (J.job_name='B' OR J.job_name='C' OR J.job_name='D') WHERE M.user_name LIKE '%${keyword}%' AND J.job_member_seq IS NOT NULL`)
          oKnex.andWhere('seq', 'in', subquery)      

        }else{
          oKnex.where(`${search_type}`,'like',`%${keyword}%`);
        }
      }
    }
    const oCountKnex = this.database.from(oKnex.clone().as('list'))

    if(project_seq === '')
    {
      oKnex.orderBy('seq','desc');
      if(end !== '') {
        oKnex.limit(end).offset(start)
      }
    }else{
      oKnex.where('seq',project_seq);
    }

    result.project_info = await oKnex;
   
    // 총 갯수
    const { total_count } = await oCountKnex.count('* as total_count').first()

    result.paging = total_count
    return result
    //return new JsonWrapper(result, this.private_fields)
  }
  
  getProjectInfoPaging = async (start, end, status, search_type, keyword, project_seq) => {
    const select = ['*']
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name).where('seq','<>',0);

    if(project_seq === '')
    {
      if(status !== '') {
        oKnex.where('status',status);
      }
      if(keyword !== '') {
        oKnex.where(`${search_type}`,'like',`%${keyword}%`);
      }
      oKnex.orderBy('seq','desc');
    }else{
      oKnex.where('seq',project_seq);
    }

    const oCountKnex = this.database.from(oKnex.clone().as('list'))

    if(project_seq === '')
    {
      if(end !== '') {
        oKnex.limit(end).offset(start)
      }
    }

    //const result = await oKnex;
   
    // 총 갯수
    const [{ total_count }] = await Promise.all([
      oCountKnex.count('* as total_count').first()
    ])
    
    return total_count;    
  }

  getProjectMembercount = async () => {
    const oKnex = this.database.select([
      this.database.raw('count(*) `all_count`'),
      this.database.raw('count(case when status = `1` then 1 end) `ing_count`'),
      this.database.raw('count(case when status = `2` then 1 end) `stop_count`'),
      this.database.raw('count(case when status = `3` then 1 end) `end_count`'),
    ])
      .from('project')
    const result = await oKnex
    if (result[0]){
      return result[0];
    }
    return {};
  }
 
}
