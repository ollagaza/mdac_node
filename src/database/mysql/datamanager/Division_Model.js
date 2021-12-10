import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';
import logger from "../../../libs/logger";

export default class DivisionModel extends MySQLModel {
  constructor(database) {
    super(database)

    this.table_name = 'mdc_division'
    this.private_fields = []
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
