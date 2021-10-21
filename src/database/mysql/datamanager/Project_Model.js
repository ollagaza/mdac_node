// make by june
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class ProjectModel extends MySQLModel {
  constructor(database) {
    super(database)

    this.table_name = 'project'
    this.private_fields = []
  }

  getProjectList = async () => {
    let result = {};
    try {
      const select = ['*']
      const oKnex = this.database.select(select);
      oKnex.from(this.table_name);
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
        'FROM job_worker jw ' +
        'LEFT JOIN job jo ON jw.job_seq = jo.seq ' +
        'GROUP BY jw.project_seq';
      oKnex.leftJoin(knex.raw(`(${sum_query}) as sd on sd.project_seq = project.seq`));
      const sum_member = 'select project_seq, count(*) labler_co from(' +
        'select project_seq, job_member_seq from job_worker where job_name=\'A\' group by project_seq, job_member_seq' +
        ') AS psum GROUP BY project_seq'
      oKnex.leftJoin(knex.raw(`(${sum_member}) as sm on sm.project_seq = project.seq`));
      const sum_assi = 'SELECT project_seq, SUM(label_cnt) label_cnt_sum FROM job GROUP BY project_seq';
      oKnex.leftJoin(knex.raw(`(${sum_assi}) as ai on ai.project_seq = project.seq`));
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
