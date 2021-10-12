import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import moment from "moment";
import MysqlModel from '../../mysql-model';

export default class JobWorkerModel extends MysqlModel {
    constructor (database) {
        super(database);

        this.table_name = 'job_worker';
        this.private_fields = [
            'seq', 'project_seq', 'job_seq', 'result_file_pair_key', 'class_seq', 'job_name', 'job_status', 'job_member_seq'

        ];
    }

    createJobWorker = async(project_seq, job_seq, result_file_pair_key, class_seq, job_name, job_status, job_member_seq, job_date, reject_date, reg_member_seq) => {
        const data = {
            project_seq: project_seq,
            job_seq: job_seq,
            result_file_pair_key: result_file_pair_key,
            class_seq: class_seq,
            job_name: job_name,
            job_status: job_status,
            job_member_seq: job_member_seq,
            job_date: job_date,
            reject_date: reject_date,
            reg_member_seq: reg_member_seq
        }
        return await this.create(data, 'seq');
    }

    getJobWorker = async(seq) => {
        const select = ['seq', 'project_seq', 'job_seq', 'result_file_pair_key', 'class_seq', 'job_name', 'job_status', 'job_member_seq', 'reg_date', 'job_date', 'reject_date', 'reg_member_seq']
        const oKnex = this.database.select(select).from(this.table_name).where("seq", seq).first();
        const result = await oKnex;
        return result;
    }

    getJobWorkersByProjectseq = async(project_seq) => {
        const select = ['seq', 'project_seq', 'job_seq', 'result_file_pair_key', 'class_seq', 'job_name', 'job_status', 'job_member_seq', 'reg_date', 'job_date', 'reject_date', 'reg_member_seq']
        const oKnex = this.database.select(select).from(this.table_name).where("project_seq", project_seq);
        const result = await oKnex;
        return result;
    }

    getJobWorkersByJobseq = async(job_seq) => {
        const select = ['seq', 'project_seq', 'job_seq', 'result_file_pair_key', 'class_seq', 'job_name', 'job_status', 'job_member_seq', 'reg_date', 'job_date', 'reject_date', 'reg_member_seq']
        const oKnex = this.database.select(select).from(this.table_name).where("job_seq", job_seq);
        const result = await oKnex;
        return result;
    }
    
}