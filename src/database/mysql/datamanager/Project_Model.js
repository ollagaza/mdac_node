// make by june
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class ProjectModel extends MySQLModel {
  constructor(database) {
    super(database)

    this.table_name = 'mdc_project'
    this.private_fields = []
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
