// junepark JobLog_Model.js

import MySQLModel from "../../mysql-model";

export default class JobLog_Model extends MySQLModel {
  constructor(database) {
    super(database)

    this.table_name = 'mdc_job_log'
  }

  createJobLogWorker = async (params) => {
    return await this.create(params, 'seq')
  }

  createJobLogWorker = async (seq, jobname, job_member, reg_member, job_text) => {
    const params = {}
    params.job_seq = seq
    let jname = jobname;
    if (jobname.length > 1){
      jname = jobname.substr(0, 1);
    }
    params.job_name = jname
    if(job_member.length < 1) {
      job_member = -1
    }
    if(reg_member.length < 1) {
      reg_member = -1
    }
    params.job_member_seq = job_member
    params.reg_member_seq = reg_member
    params.job_text = job_text

    return await this.create(params, 'seq')
  }

}
