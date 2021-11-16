/*
=======================================
'	파일명 : StatisticsModel.js
'	작성자 : djyu
'	작성일 : 2021.10.01
'	기능   : statistics model
'	=====================================
*/
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class StatisticsModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'mdc_job'
    this.private_fields = [
      
    ]
  }
  getStatistics = async (search_seq, project_seq, search_type, start_date, end_date, worker, status) => {
    const result = {}

    // let select = `SELECT project_seq, project_name, SUM(total) AS total, SUM(ing) AS ing, SUM(complete) AS complete, SUM(reject) AS reject
    //   , TRIM(TRUNCATE(SUM(complete)/SUM(total)*100.,2))+0 AS per_complete
    // FROM (
    //   SELECT '1', p.seq AS project_seq, p.project_name, COUNT(checker1_member_seq) AS total
    //   , (SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker1_member_seq IS NOT NULL AND checker1_member_seq <> '' AND checker1_jobdate IS NULL) AS ing
    //   , (SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker1_member_seq IS NOT NULL AND checker1_member_seq <> '' AND checker1_jobdate IS NOT NULL) AS complete
    //   , (SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker1_member_seq IS NOT NULL AND checker1_member_seq <> '' AND labeler_jobdate IS NOT NULL AND checker1_status='3') AS reject
    //   , TRIM(TRUNCATE((SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND (checker1_member_seq IS NOT NULL OR checker1_member_seq <> '') AND labeler_jobdate IS NOT NULL AND checker1_status='3') / COUNT(checker1_member_seq) * 100.,2))+0 AS perReject
    //   , TRIM(TRUNCATE((SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND (checker1_member_seq IS NOT NULL OR checker1_member_seq <> '') AND checker1_jobdate IS NOT NULL) / COUNT(checker1_member_seq) * 100.,2))+0 AS perComplete
    //   FROM job j JOIN project p 
    //   ON j.project_seq = p.seq 
    //   GROUP BY j.project_seq
    //   UNION ALL
    //   SELECT '2', p.seq AS project_seq, p.project_name, COUNT(checker2_member_seq) AS total
    //   , (SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker2_member_seq IS NOT NULL AND checker2_member_seq <> '' AND checker2_jobdate IS NULL) AS ing
    //   , (SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker2_member_seq IS NOT NULL AND checker2_member_seq <> '' AND checker2_jobdate IS NOT NULL) AS complete
    //   , (SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker2_member_seq IS NOT NULL AND checker2_member_seq <> '' AND labeler_jobdate IS NOT NULL AND checker2_status='3') AS reject
    //   , TRIM(TRUNCATE((SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker2_member_seq IS NOT NULL AND checker2_member_seq <> '' AND labeler_jobdate IS NOT NULL AND checker2_status='3') / COUNT(checker2_member_seq) * 100.,2))+0 AS perReject
    //   , TRIM(TRUNCATE((SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker2_member_seq IS NOT NULL AND checker2_member_seq <> '' AND checker2_jobdate IS NOT NULL) / COUNT(checker2_member_seq) * 100.,2))+0 AS perComplete
    //   FROM job j JOIN project p 
    //   ON j.project_seq = p.seq 
    //   GROUP BY j.project_seq
    //   UNION ALL
    //   SELECT '3', p.seq AS project_seq, p.project_name, COUNT(checker3_member_seq) AS total
    //   , (SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker3_member_seq IS NOT NULL AND checker3_member_seq <> '' AND checker3_jobdate IS NULL) AS ing
    //   , (SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker3_member_seq IS NOT NULL AND checker3_member_seq <> '' AND checker3_jobdate IS NOT NULL) AS complete
    //   , (SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker3_member_seq IS NOT NULL AND checker3_member_seq <> '' AND labeler_jobdate IS NOT NULL AND checker3_status='3') AS reject
    //   , TRIM(TRUNCATE((SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker3_member_seq IS NOT NULL AND checker3_member_seq <> '' AND labeler_jobdate IS NOT NULL AND checker3_status='3') / COUNT(checker3_member_seq) * 100.,2))+0 AS perReject
    //   , TRIM(TRUNCATE((SELECT COUNT(*) FROM job WHERE project_seq = p.seq AND checker3_member_seq IS NOT NULL AND checker3_member_seq <> '' AND checker3_jobdate IS NOT NULL) / COUNT(checker3_member_seq) * 100.,2))+0 AS perComplete
    //   FROM job j JOIN project p 
    //   ON j.project_seq = p.seq 
    //   GROUP BY j.project_seq
    // ) CHECKER where project_seq=1
    // GROUP BY project_seq`

    const select = 'CALL spGetStatistics(?,?,?,?,?,?,?);'
    const oKnex = this.database.raw(select, [search_seq,project_seq,search_type,start_date,end_date,worker,status])
                
    // oKnex.where('f.seq','<>',0)
    // if(project_seq === '')
    // {
    //   oKnex.andWhere('f.is_used',is_used)
    //   oKnex.andWhere(`f.${search_type}`,'like',`%${keyword}%`);
    // }
    
    // oKnex.orderBy('project_seq','asc');
    // oKnex.orderBy('parent_path','asc')
    // oKnex.limit(end).offset(start)

    result.statistics_info = await oKnex;
    return result;
  }

  getTest = async () => {
    const result = {}

    const select = ['project_seq AS label',`class_seq AS data`]
    const oKnex = this.database.select(select);
    oKnex.from('mdc_job').limit(3)
                
    // oKnex.where('f.seq','<>',0)
    // if(project_seq === '')
    // {
    //   oKnex.andWhere('f.is_used',is_used)
    //   oKnex.andWhere(`f.${search_type}`,'like',`%${keyword}%`);
    // }
    
    // oKnex.orderBy('project_seq','asc');
    // oKnex.orderBy('parent_path','asc')
    // oKnex.limit(end).offset(start)

    result.statistics_info = await oKnex;
    return result;
  }  
}
