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
    update_param.project_code = project_info.project_code;
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

    const select = ['seq','project_code','project_name', 'is_class', 'status', 'memo', 'reason', 'reg_member_seq','reg_date', 
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
 

  getProjectList = async () => {
    let result = {};
    try {
      const select = ['*']
      const oKnex = this.database.select(select);
      oKnex.from(`${this.table_name} as project`);
      const sum_query = ' SELECT jw.project_seq, jw.job_seq, jw.class_seq, ' +
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
        'sum(case when jw.job_status=\'E2\' then 1 END) AS \'E2\' ' +
        'FROM mdc_job_worker jw ' +
        'Inner JOIN mdc_job jo ON jw.job_seq = jo.seq ' +
        'GROUP BY jw.project_seq';
      oKnex.leftJoin(knex.raw(`(${sum_query}) as sd on sd.project_seq = project.seq`));
      const sum_member = 'select project_seq, count(*) labler_co from(' +
        'select project_seq, job_member_seq from mdc_job_worker where job_name=\'A\' group by project_seq, job_member_seq' +
        ') AS psum GROUP BY project_seq'
      const reject_co = 'select project_seq, count(*) reject_A_co from(' +
          'select project_seq, job_member_seq from mdc_job_worker where job_name=\'A\' and reject_act = \'A\' group by project_seq, job_member_seq' +
          ') AS psum GROUP BY project_seq'
      oKnex.leftJoin(knex.raw(`(${sum_member}) as sm on sm.project_seq = project.seq`));
      oKnex.leftJoin(knex.raw(`(${reject_co}) as re on re.project_seq = project.seq`));
      const sum_assi = 'SELECT project_seq, SUM(label_cnt) label_cnt_sum FROM mdc_job GROUP BY project_seq';
      oKnex.leftJoin(knex.raw(`(${sum_assi}) as ai on ai.project_seq = project.seq`));

      result.error = 0;
      // , dense_rank() over(order BY p.seq ASC, category1_seq ASC) AS ranking
      const oKnex2 = this.database.withRecursive('test', 
      
        this.database.raw(`SELECT '0' AS levels, 0 AS depth_cnt, 0 AS cnt, project.seq, project.project_name, project.is_class, project.status, project.memo, project.reason, project.reg_member_seq, project.reg_date
      , sd.*, labler_co, reject_A_co, label_cnt_sum, file_cnt
      , '' AS codegroup_seq, '' AS category_seq
      from mdc_project as project
      left join ( SELECT jw.project_seq, '' as cg_seq, jw.job_seq, jw.class_seq, sum(case when jw.job_status='A0' then 1 END) AS 'A0'
      , sum(case when jw.job_status='A1' then 1 END) AS 'A1'
      , sum(case when jw.job_status='A2' then 1 END) AS 'A2'
      , sum(case when jw.job_status='B1' then 1 END) AS 'B1'
      , sum(case when jw.job_status='B2' then 1 END) AS 'B2'
      , sum(case when jw.job_status='B5' then 1 END) AS 'B5'
      , sum(case when jw.job_status='C1' then 1 END) AS 'C1'
      , sum(case when jw.job_status='C2' then 1 END) AS 'C2'
      , sum(case when jw.job_status='C5' then 1 END) AS 'C5'
      , sum(case when jw.job_status='D1' then 1 END) AS 'D1'
      , sum(case when jw.job_status='D2' then 1 END) AS 'D2'
      , sum(case when jw.job_status='D5' then 1 END) AS 'D5'
      , sum(case when jw.job_status='E2' then 1 END) AS 'E2' 
      FROM mdc_job_worker jw Inner JOIN mdc_job jo ON jw.job_seq = jo.seq 
      GROUP BY jw.project_seq) as sd on sd.project_seq = project.seq 
      LEFT JOIN (SELECT project_seq, COUNT(project_seq) file_cnt
        FROM mdc_file
        GROUP BY project_seq
      ) as mf ON  mf.project_seq = project.seq
      LEFT JOIN (SELECT project_seq, COUNT(DISTINCT labeler_member_seq) labler_co 
        FROM mdc_job mj
        WHERE labeler_member_seq IS NOT NULL AND labeler_regdate IS NOT NULL GROUP BY project_seq
      ) as sm ON  sm.project_seq = project.seq
      left join (select project_seq, count(*) reject_A_co from(select project_seq, job_member_seq from mdc_job_worker where job_name='A' and reject_act = 'A' group by project_seq, job_member_seq) AS psum GROUP BY project_seq) as re on re.project_seq = project.seq left join (SELECT project_seq, SUM(label_cnt) label_cnt_sum FROM mdc_job GROUP BY project_seq) as ai on ai.project_seq = project.seq

    UNION ALL
    
    SELECT DISTINCT '1' as levels, depth_cnt, category1_seq as cnt, p.seq, CONCAT('┗ ', cg.codegroup_name,' | ',cg.codegroup_id), p.is_class, p.status, p.memo, p.reason, p.reg_member_seq, p.reg_date
    , sd.*, labler_co, reject_A_co, label_cnt_sum, file_cnt
    , category1_seq AS codegroup_seq, case when '1' = depth_cnt THEN c.seq ELSE '' END AS category_seq  
    FROM mdc_category c JOIN mdc_project p ON c.project_seq=p.seq 
    JOIN mdc_codegroup cg ON c.category1_seq=cg.seq 
    LEFT JOIN  ( SELECT jw.project_seq, cg2.seq, jw.job_seq, jw.class_seq, sum(case when jw.job_status='A0' then 1 END) AS 'A0'
    , sum(case when jw.job_status='A1' then 1 END) AS 'A1'
    , sum(case when jw.job_status='A2' then 1 END) AS 'A2'
    , sum(case when jw.job_status='B1' then 1 END) AS 'B1'
    , sum(case when jw.job_status='B2' then 1 END) AS 'B2'
    , sum(case when jw.job_status='B5' then 1 END) AS 'B5'
    , sum(case when jw.job_status='C1' then 1 END) AS 'C1'
    , sum(case when jw.job_status='C2' then 1 END) AS 'C2'
    , sum(case when jw.job_status='C5' then 1 END) AS 'C5'
    , sum(case when jw.job_status='D1' then 1 END) AS 'D1'
    , sum(case when jw.job_status='D2' then 1 END) AS 'D2'
    , sum(case when jw.job_status='D5' then 1 END) AS 'D5'
    , sum(case when jw.job_status='E2' then 1 END) AS 'E2' 
    FROM mdc_job_worker jw Inner JOIN mdc_job jo ON jw.job_seq = jo.seq 
    INNER JOIN mdc_category ct ON jo.project_seq = ct.project_seq AND jo.division_seq=ct.seq
    JOIN mdc_codegroup cg2 ON cg2.seq = ct.category1_seq 
    GROUP BY jw.project_seq, cg2.seq) as sd on sd.project_seq = p.seq AND sd.seq=c.category1_seq    
    LEFT JOIN (SELECT mf.project_seq, category1_seq AS category_seq, COUNT(division_seq) file_cnt
    FROM mdc_file mf JOIN mdc_category mc
      ON mf.project_seq = mc.project_seq AND mf.division_seq = mc.seq 
      GROUP BY mf.project_seq, category1_seq
    ) as mf ON  mf.project_seq = p.seq AND mf.category_seq = c.category1_seq
    LEFT JOIN (SELECT mj.project_seq, category1_seq AS category_seq, COUNT(DISTINCT labeler_member_seq) labler_co 
      FROM mdc_job mj JOIN mdc_category mc 
      ON mj.project_seq = mc.project_seq AND mj.division_seq = mc.seq WHERE labeler_member_seq IS NOT NULL AND labeler_regdate IS NOT NULL GROUP BY mj.project_seq, category1_seq
    ) as sm ON  sm.project_seq = p.seq and sm.category_seq = c.category1_seq
    LEFT JOIN (select project_seq, count(*) reject_A_co from(
      select project_seq, job_member_seq from mdc_job_worker where job_name='A' and reject_act = 'A' group by project_seq, job_member_seq
    ) AS psum 
    GROUP BY project_seq) as re on re.project_seq = p.seq 
    LEFT JOIN (SELECT mj.project_seq, category1_seq AS category_seq, SUM(label_cnt) label_cnt_sum FROM mdc_job mj JOIN mdc_category mc ON mj.project_seq = mc.project_seq AND mj.division_seq=mc.seq GROUP BY project_seq, category1_seq) as ai on ai.project_seq = p.seq and ai.category_seq = c.category1_seq
    where category1_seq IS not null

    UNION ALL

    SELECT DISTINCT '2' as levels, depth_cnt, CONCAT(category1_seq,'-', category2_seq) as cnt, p.seq, CONCAT('┗ ', cg.codegroup_name,' | ',cg.codegroup_id), p.is_class, p.status, p.memo, p.reason, p.reg_member_seq, p.reg_date
    , sd.*, labler_co, reject_A_co, label_cnt_sum, file_cnt
    , category2_seq AS codegroup_seq, case when '2' = depth_cnt THEN c.seq ELSE '' END AS category_seq  
    FROM mdc_category c JOIN mdc_project p ON c.project_seq=p.seq 
    JOIN mdc_codegroup cg ON c.category2_seq=cg.seq 
    LEFT JOIN  ( SELECT jw.project_seq, cg2.seq, jw.job_seq, jw.class_seq, sum(case when jw.job_status='A0' then 1 END) AS 'A0'
    , sum(case when jw.job_status='A1' then 1 END) AS 'A1'
    , sum(case when jw.job_status='A2' then 1 END) AS 'A2'
    , sum(case when jw.job_status='B1' then 1 END) AS 'B1'
    , sum(case when jw.job_status='B2' then 1 END) AS 'B2'
    , sum(case when jw.job_status='B5' then 1 END) AS 'B5'
    , sum(case when jw.job_status='C1' then 1 END) AS 'C1'
    , sum(case when jw.job_status='C2' then 1 END) AS 'C2'
    , sum(case when jw.job_status='C5' then 1 END) AS 'C5'
    , sum(case when jw.job_status='D1' then 1 END) AS 'D1'
    , sum(case when jw.job_status='D2' then 1 END) AS 'D2'
    , sum(case when jw.job_status='D5' then 1 END) AS 'D5'
    , sum(case when jw.job_status='E2' then 1 END) AS 'E2' 
    FROM mdc_job_worker jw Inner JOIN mdc_job jo ON jw.job_seq = jo.seq 
    INNER JOIN mdc_category ct ON jo.project_seq = ct.project_seq AND jo.division_seq=ct.seq
    JOIN mdc_codegroup cg2 ON cg2.seq = ct.category2_seq 
    GROUP BY jw.project_seq, cg2.seq) as sd on sd.project_seq = p.seq AND sd.seq=c.category2_seq
    LEFT JOIN (SELECT mf.project_seq, category2_seq AS category_seq, COUNT(division_seq) file_cnt
    FROM mdc_file mf JOIN mdc_category mc
      ON mf.project_seq = mc.project_seq AND mf.division_seq = mc.seq 
      GROUP BY mf.project_seq, category2_seq
    ) as mf ON  mf.project_seq = p.seq AND mf.category_seq = c.category2_seq 
    LEFT JOIN (SELECT mj.project_seq, category2_seq AS category_seq, COUNT(DISTINCT labeler_member_seq) labler_co 
      FROM mdc_job mj JOIN mdc_category mc 
      ON mj.project_seq = mc.project_seq AND mj.division_seq = mc.seq WHERE labeler_member_seq IS NOT NULL AND labeler_regdate IS NOT NULL GROUP BY mj.project_seq, category2_seq
    ) as sm ON  sm.project_seq = p.seq and sm.category_seq = c.category2_seq
    LEFT JOIN (select project_seq, count(*) reject_A_co from(
      select project_seq, job_member_seq from mdc_job_worker where job_name='A' and reject_act = 'A' group by project_seq, job_member_seq
    ) AS psum 
    GROUP BY project_seq) as re on re.project_seq = p.seq 
    LEFT JOIN (SELECT mj.project_seq, category2_seq AS category_seq, SUM(label_cnt) label_cnt_sum FROM mdc_job mj JOIN mdc_category mc ON mj.project_seq = mc.project_seq AND mj.division_seq=mc.seq GROUP BY project_seq, category2_seq) as ai on ai.project_seq = p.seq and ai.category_seq = c.category2_seq
    WHERE category2_seq IS not null

    UNION ALL
    
    SELECT DISTINCT '3' as levels, depth_cnt, CONCAT(category1_seq,'-', category2_seq,'-', category3_seq) as cnt, p.seq, CONCAT('┗ ', cg.codegroup_name,' | ',cg.codegroup_id), p.is_class, p.status, p.memo, p.reason, p.reg_member_seq, p.reg_date
    , sd.*, labler_co, reject_A_co, label_cnt_sum, file_cnt
    , category3_seq AS codegroup_seq, case when '3' = depth_cnt THEN c.seq ELSE '' END AS category_seq  
    FROM mdc_category c JOIN mdc_project p ON c.project_seq=p.seq 
    JOIN mdc_codegroup cg ON c.category3_seq=cg.seq 
    LEFT JOIN  ( SELECT jw.project_seq, cg2.seq, jw.job_seq, jw.class_seq, sum(case when jw.job_status='A0' then 1 END) AS 'A0'
    , sum(case when jw.job_status='A1' then 1 END) AS 'A1'
    , sum(case when jw.job_status='A2' then 1 END) AS 'A2'
    , sum(case when jw.job_status='B1' then 1 END) AS 'B1'
    , sum(case when jw.job_status='B2' then 1 END) AS 'B2'
    , sum(case when jw.job_status='B5' then 1 END) AS 'B5'
    , sum(case when jw.job_status='C1' then 1 END) AS 'C1'
    , sum(case when jw.job_status='C2' then 1 END) AS 'C2'
    , sum(case when jw.job_status='C5' then 1 END) AS 'C5'
    , sum(case when jw.job_status='D1' then 1 END) AS 'D1'
    , sum(case when jw.job_status='D2' then 1 END) AS 'D2'
    , sum(case when jw.job_status='D5' then 1 END) AS 'D5'
    , sum(case when jw.job_status='E2' then 1 END) AS 'E2' 
    FROM mdc_job_worker jw Inner JOIN mdc_job jo ON jw.job_seq = jo.seq 
    INNER JOIN mdc_category ct ON jo.project_seq = ct.project_seq AND jo.division_seq=ct.seq
    JOIN mdc_codegroup cg2 ON cg2.seq = ct.category3_seq
    GROUP BY jw.project_seq, cg2.seq) as sd on sd.project_seq = p.seq AND sd.seq=c.category3_seq
    LEFT JOIN (SELECT mf.project_seq, category3_seq AS category_seq, COUNT(division_seq) file_cnt
      FROM mdc_file mf JOIN mdc_category mc
      ON mf.project_seq = mc.project_seq AND mf.division_seq = mc.seq 
    GROUP BY mf.project_seq, category3_seq
    ) as mf ON  mf.project_seq = p.seq AND mf.category_seq = c.category3_seq
    LEFT JOIN (SELECT mj.project_seq, category3_seq AS category_seq, COUNT(DISTINCT labeler_member_seq) labler_co 
      FROM mdc_job mj JOIN mdc_category mc 
      ON mj.project_seq = mc.project_seq AND mj.division_seq = mc.seq WHERE labeler_member_seq IS NOT NULL AND labeler_regdate IS NOT NULL GROUP BY mj.project_seq, category3_seq
    ) as sm ON  sm.project_seq = p.seq and sm.category_seq = c.category3_seq
    LEFT JOIN (select project_seq, count(*) reject_A_co from(
      select project_seq, job_member_seq from mdc_job_worker where job_name='A' and reject_act = 'A' group by project_seq, job_member_seq
    ) AS psum 
    GROUP BY project_seq) as re on re.project_seq = p.seq 
    LEFT JOIN (SELECT mj.project_seq, category3_seq AS category_seq, SUM(label_cnt) label_cnt_sum FROM mdc_job mj JOIN mdc_category mc ON mj.project_seq = mc.project_seq AND mj.division_seq=mc.seq GROUP BY project_seq, category3_seq) as ai on ai.project_seq = p.seq and ai.category_seq = c.category3_seq
    WHERE category3_seq IS not null
    UNION ALL
    
    SELECT DISTINCT '4' as levels, depth_cnt, CONCAT(category1_seq,'-', category2_seq,'-', category3_seq,'-', category4_seq) as cnt, p.seq, CONCAT('┗ ', cg.codegroup_name,' | ',cg.codegroup_id), p.is_class, p.status, p.memo, p.reason, p.reg_member_seq, p.reg_date
    , sd.*, labler_co, reject_A_co, label_cnt_sum, file_cnt
    , category4_seq AS codegroup_seq, case when '4' = depth_cnt THEN c.seq ELSE '' END AS category_seq  
    FROM mdc_category c JOIN mdc_project p ON c.project_seq=p.seq 
    JOIN mdc_codegroup cg ON c.category4_seq=cg.seq 
    LEFT JOIN  ( SELECT jw.project_seq, cg2.seq, jw.job_seq, jw.class_seq, sum(case when jw.job_status='A0' then 1 END) AS 'A0'
    , sum(case when jw.job_status='A1' then 1 END) AS 'A1'
    , sum(case when jw.job_status='A2' then 1 END) AS 'A2'
    , sum(case when jw.job_status='B1' then 1 END) AS 'B1'
    , sum(case when jw.job_status='B2' then 1 END) AS 'B2'
    , sum(case when jw.job_status='B5' then 1 END) AS 'B5'
    , sum(case when jw.job_status='C1' then 1 END) AS 'C1'
    , sum(case when jw.job_status='C2' then 1 END) AS 'C2'
    , sum(case when jw.job_status='C5' then 1 END) AS 'C5'
    , sum(case when jw.job_status='D1' then 1 END) AS 'D1'
    , sum(case when jw.job_status='D2' then 1 END) AS 'D2'
    , sum(case when jw.job_status='D5' then 1 END) AS 'D5'
    , sum(case when jw.job_status='E2' then 1 END) AS 'E2' 
    FROM mdc_job_worker jw Inner JOIN mdc_job jo ON jw.job_seq = jo.seq 
    INNER JOIN mdc_category ct ON jo.project_seq = ct.project_seq AND jo.division_seq=ct.seq
    JOIN mdc_codegroup cg2 ON cg2.seq = ct.category4_seq
    GROUP BY jw.project_seq, cg2.seq) as sd on sd.project_seq = p.seq AND sd.seq=c.category4_seq
    LEFT JOIN (SELECT mf.project_seq, category4_seq AS category_seq, COUNT(division_seq) file_cnt
    FROM mdc_file mf JOIN mdc_category mc
      ON mf.project_seq = mc.project_seq AND mf.division_seq = mc.seq 
      GROUP BY mf.project_seq, category4_seq
    ) as mf ON  mf.project_seq = p.seq AND mf.category_seq = c.category4_seq 
    LEFT JOIN (SELECT mj.project_seq, category4_seq AS category_seq, COUNT(DISTINCT labeler_member_seq) labler_co 
      FROM mdc_job mj JOIN mdc_category mc 
      ON mj.project_seq = mc.project_seq AND mj.division_seq = mc.seq WHERE labeler_member_seq IS NOT NULL AND labeler_regdate IS NOT NULL GROUP BY mj.project_seq, category4_seq
    ) as sm ON  sm.project_seq = p.seq and sm.category_seq = c.category4_seq
    LEFT JOIN (select project_seq, count(*) reject_A_co from(
      select project_seq, job_member_seq from mdc_job_worker where job_name='A' and reject_act = 'A' group by project_seq, job_member_seq
    ) AS psum 
    GROUP BY project_seq) as re on re.project_seq = p.seq 
    LEFT JOIN (SELECT mj.project_seq, category4_seq AS category_seq, SUM(label_cnt) label_cnt_sum FROM mdc_job mj JOIN mdc_category mc ON mj.project_seq = mc.project_seq AND mj.division_seq=mc.seq GROUP BY project_seq, category4_seq) as ai on ai.project_seq = p.seq and ai.category_seq = c.category4_seq
    WHERE category4_seq IS not null
    UNION ALL
    
    SELECT DISTINCT '5' as levels, depth_cnt, CONCAT(category1_seq,'-', category2_seq,'-', category3_seq,'-', category4_seq,'-', category5_seq) as cnt, p.seq, CONCAT('┗ ', cg.codegroup_name,' | ',cg.codegroup_id), p.is_class, p.status, p.memo, p.reason, p.reg_member_seq, p.reg_date
    , sd.*, labler_co, reject_A_co, label_cnt_sum, file_cnt
    , category5_seq AS codegroup_seq, case when '5' = depth_cnt THEN c.seq ELSE '' END AS category_seq  
    FROM mdc_category c JOIN mdc_project p ON c.project_seq=p.seq 
    JOIN mdc_codegroup cg ON c.category5_seq=cg.seq 
    LEFT JOIN  ( SELECT jw.project_seq, cg2.seq, jw.job_seq, jw.class_seq, sum(case when jw.job_status='A0' then 1 END) AS 'A0'
    , sum(case when jw.job_status='A1' then 1 END) AS 'A1'
    , sum(case when jw.job_status='A2' then 1 END) AS 'A2'
    , sum(case when jw.job_status='B1' then 1 END) AS 'B1'
    , sum(case when jw.job_status='B2' then 1 END) AS 'B2'
    , sum(case when jw.job_status='B5' then 1 END) AS 'B5'
    , sum(case when jw.job_status='C1' then 1 END) AS 'C1'
    , sum(case when jw.job_status='C2' then 1 END) AS 'C2'
    , sum(case when jw.job_status='C5' then 1 END) AS 'C5'
    , sum(case when jw.job_status='D1' then 1 END) AS 'D1'
    , sum(case when jw.job_status='D2' then 1 END) AS 'D2'
    , sum(case when jw.job_status='D5' then 1 END) AS 'D5'
    , sum(case when jw.job_status='E2' then 1 END) AS 'E2' 
    FROM mdc_job_worker jw Inner JOIN mdc_job jo ON jw.job_seq = jo.seq 
    INNER JOIN mdc_category ct ON jo.project_seq = ct.project_seq AND jo.division_seq=ct.seq
    JOIN mdc_codegroup cg2 ON cg2.seq = ct.category5_seq
    GROUP BY jw.project_seq, cg2.seq) as sd on sd.project_seq = p.seq AND sd.seq=c.category5_seq
    LEFT JOIN (SELECT mf.project_seq, category5_seq AS category_seq, COUNT(division_seq) file_cnt
    FROM mdc_file mf JOIN mdc_category mc
      ON mf.project_seq = mc.project_seq AND mf.division_seq = mc.seq 
      GROUP BY mf.project_seq, category5_seq
    ) as mf ON  mf.project_seq = p.seq AND mf.category_seq = c.category5_seq 
    LEFT JOIN (SELECT mj.project_seq, category5_seq AS category_seq, COUNT(DISTINCT labeler_member_seq) labler_co 
      FROM mdc_job mj JOIN mdc_category mc 
      ON mj.project_seq = mc.project_seq AND mj.division_seq = mc.seq WHERE labeler_member_seq IS NOT NULL AND labeler_regdate IS NOT NULL GROUP BY mj.project_seq, category5_seq
    ) as sm ON  sm.project_seq = p.seq and sm.category_seq = c.category5_seq
    LEFT JOIN (select project_seq, count(*) reject_A_co from(
      select project_seq, job_member_seq from mdc_job_worker where job_name='A' and reject_act = 'A' group by project_seq, job_member_seq
    ) AS psum 
    GROUP BY project_seq) as re on re.project_seq = p.seq 
    LEFT JOIN (SELECT mj.project_seq, category5_seq AS category_seq, SUM(label_cnt) label_cnt_sum FROM mdc_job mj JOIN mdc_category mc ON mj.project_seq = mc.project_seq AND mj.division_seq=mc.seq GROUP BY project_seq, category5_seq) as ai on ai.project_seq = p.seq and ai.category_seq = c.category5_seq
    WHERE category5_seq IS not null
    ORDER BY seq, cnt
    `)).select('*').from('test')

      result.data = await oKnex2;
      // const oKnex2 = this.database.select(select);
      // oKnex2.from('mdc_category')
      // result.category = await oKnex2;

    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }


  getProjectCategoryList = async (req_body) => {
    let result = {};
    const project_seq = req_body.project_seq
    const depth_no = req_body.depth_no
    const category_seq = req_body.category_seq

    try {
      const oKnex = this.database
      .unionAll(function () {
        this.distinct(['project_seq', `category${depth_no}_seq as category_seq`, 'codegroup_id', 'codegroup_name', knex.raw(`2 as depth_no`)])
          .from('mdc_category as category')
          .join('mdc_codegroup as codegroup', function () {
            this.on('category.category1_seq','=','codegroup.seq')  
          })
          this.where('category.project_seq', project_seq)
        }, true)

        if(depth_no === 2) {
          oKnex.unionAll(function () {
            this.distinct(['project_seq', `category2_seq as category_seq`, 'codegroup_id', 'codegroup_name', knex.raw(`3 as depth_no`)])
              .from('mdc_category as category')
              .join('mdc_codegroup as codegroup', function () {
                this.on('category.category2_seq','=','codegroup.seq')
              })
              this.where('category1_seq', category_seq)
              this.andWhere('category.project_seq', project_seq)
            }, true)
          }
        
          if(depth_no === 3) {
            oKnex.unionAll(function () {
              this.distinct(['project_seq', `category3_seq as category_seq`, 'codegroup_id', 'codegroup_name', knex.raw(`4 as depth_no`)])
                .from('mdc_category as category')
                .join('mdc_codegroup as codegroup', function () {
                  this.on('category.category3_seq','=','codegroup.seq')
                })
                this.where('category2_seq', category_seq)
                this.andWhere('category.project_seq', project_seq)
              }, true)
            }
          
  


      // const select = ['project_seq', `category${depth_no}_seq as category_seq`, 'codegroup_id', 'codegroup_name', knex.raw(`${Number(depth_no)+1} as depth_no`)]
      // const oKnex = this.database.distinct(select);
      // oKnex.from(`mdc_category as category`);
      // if(depth_no === '1' || depth_no === '') {
      //   })        
      // }
      
      // if(depth_no === 2) {
      //   if(category_seq) {
      //     oKnex.join('mdc_codegroup as codegroup', function () {
      //       this.on('category.category2_seq','=','codegroup.seq')
      //     })
      //     oKnex.where('category1_seq', category_seq)
      //   }
      // }
      // if(depth_no === 3) {
      //   if(category_seq) {
      //     oKnex.join('mdc_codegroup as codegroup', function () {
      //       this.on('category.category3_seq','=','codegroup.seq')
      //     })
      //     oKnex.where('category2_seq', category_seq)
      //   }
      // }
      // if(depth_no === 4) {
      //   if(category_seq) {
      //     oKnex.join('mdc_codegroup as codegroup', function () {
      //       this.on('category.category4_seq','=','codegroup.seq')
      //     })
      //     oKnex.where('category3_seq', category_seq)
      //   }
      // }
      // if(depth_no === 5) {
      //   if(category_seq) {
      //     oKnex.join('mdc_codegroup as codegroup', function () {
      //       this.on('category.category5_seq','=','codegroup.seq')
      //     })
      //     oKnex.where('category4_seq', category_seq)
      //   }
      // }

      // oKnex.andWhere('category.project_seq', project_seq)
      result.error = 0;
      result.data = await oKnex;
    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }

  getProjectWidthClass = async (seq) => {
    let result = {};
    try {
      const select = ['*']
      const oKnex = this.database.select(select);
      oKnex.from(this.table_name);
      oKnex.where('seq', seq)
      result.error = 0;
      result.data = await oKnex;
    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }  
}
