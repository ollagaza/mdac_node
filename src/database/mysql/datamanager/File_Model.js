// make junepark File_Model.js
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';
import Constants from "../../../constants/constants";

export default class File_Model extends MySQLModel {
  constructor(database) {
    super(database)
    this.table_name = 'file'
  }
  getImg = async (seq) => {
    const file_info = {}
    try{
      const oKnex = this.database.select('*');
      oKnex.from(this.table_name);
      oKnex.where('seq', seq);
      // oKnex.andWhere('file_type', 'i');
      const result = await oKnex;
      // logger.debug(result);

      const rdata = {};
      rdata.file_path = result[0].file_path;
      rdata.file_name = result[0].file_name;
      const dir = Util.removePathLastSlash(result[0].file_path);
      file_info.full_name =  dir + Constants.SP + result[0].file_name;
      file_info.error = 0;
      // logger.debug(file_info);
      return file_info;
    } catch (e) {
      file_info.error = -1;
      file_info.message = e.sqlMessage;
      return file_info;
    }
  }
  getVedioImg = async (seq) => {
    const file_info = {}
    try{
      const oKnex = this.database.select('*');
      oKnex.from(this.table_name);
      oKnex.where('seq', seq);
      oKnex.andWhere('file_type', 'v');
      const result = await oKnex;
      // logger.debug(result);

      const rdata = {};
      rdata.file_path = result[0].file_path;
      rdata.file_name = result[0].file_name;
      const dir = Util.removePathLastSlash(result[0].file_path);
      file_info.full_name =  dir + Constants.SP + result[0].file_name;
      file_info.error = 0;
      // logger.debug(file_info);
      return file_info;
    } catch (e) {
      file_info.error = -1;
      file_info.message = e.sqlMessage;
      return file_info;
    }
  }
  getList= async (pro_seq, div_seq, req_body) => {
    let select = [
      'file.seq', 'file.project_seq', 'file.division_seq', 'file.file_type', 'file.file_path',
      'file.file_name', 'file.org_file_name', 'file.file_size', 'file.play_time', 'file.reg_date',
      'job.seq as job_seq', 'job.class_seq', 'job.status', 'job.label_cnt', 'job.labeler_member_seq',
      'job.labeler_method', 'job.labeler_regdate', 'job.labeler_jobdate',
      'wa.reject_act as reject_act', 'wa.reject_seq as reject_seq',
      'm1.user_name',
      'ma.user_name as ma_name', 'mb.user_name as mb_name', 'mc.user_name as mc_name', 'md.user_name as md_name'
    ];

    if (req_body.file_type === 'v') {
      select = [
        'file.seq', 'file.project_seq', 'file.division_seq', 'file.file_type', 'file.file_path',
        'file.file_name', 'file.org_file_name', 'file.file_size', 'file.play_time', 'file.reg_date',
        'job.seq as job_seq', 'job.class_seq', 'job.label_cnt', 'job.labeler_member_seq',
        'job.labeler_method', 'job.labeler_regdate', 'job.labeler_jobdate', 'm1.user_name',
        knex.raw('0 as reject_act'),
        knex.raw('0 as reject_seq'),
        knex.raw('ifnull(smax.max_status, \'A1\') as status'),
        knex.raw('null as mb_name'), knex.raw('null as mc_name'), knex.raw('null as md_name'),
        'sd.A0', 'sd.A1', 'sd.A2', 'sd.B1', 'sd.B2', 'sd.B5', 'sd.C1', 'sd.C2', 'sd.C5',
        'sd.D1', 'sd.D2', 'sd.D5', 'sd.E2'
      ];
    }
    //, 'A1', 'A2', 'A5', 'B1', 'B2', 'B5', 'C1', 'C2', 'c5', 'D1', 'D2', 'D5', 'E2'

    const request_paging = req_body.paging ? req_body.paging : {}
    const paging = {}
    paging.list_count = request_paging.list_count ? request_paging.list_count : 20
    paging.cur_page = request_paging.cur_page ? request_paging.cur_page : 1
    paging.page_count = request_paging.page_count ? request_paging.page_count : 10
    paging.no_paging = request_paging.no_paging ? request_paging.no_paging : 'Y'
    // logger.debug(this.log_prefix, '[getGroupMemberList]', paging)
    const oKnex = this.database
      .select(select)
      .from(this.table_name);
    oKnex.leftJoin('job', function (){
      this.on('job.file_seq', '=', 'file.seq')
        .andOn('job.project_seq', '=', 'file.project_seq')
      if (div_seq){
        this.andOn('job.division_seq', '=', 'file.division_seq')
      }
    })
    oKnex.leftJoin('member as m1', function (){
      this.on('job.labeler_member_seq', '=', 'm1.seq')
    })
    if (req_body.file_type === 'v') {
      // oKnex.leftJoin( knex.raw('(select  project_seq, job_seq, MAX(job_status) max_status FROM job_worker GROUP BY project_seq, job_seq) as smax on smax.job_seq = job.seq'));
      oKnex.leftJoin( knex.raw('(select  file_seq, job_seq, MAX(status) max_status FROM result_file where file_type = \'i\' GROUP BY file_seq, job_seq) as smax on smax.job_seq = job.seq'));
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
        `WHERE jw.project_seq = ${pro_seq} ` +
        'GROUP BY jw.project_seq, jw.job_seq, jw.class_seq ';
      oKnex.leftJoin(knex.raw(`(${sum_query}) as sd on sd.job_seq = job.seq`));
    }
    if (req_body.file_type !== 'v') {
      oKnex.leftJoin('job_worker as wa', function (){
        this.on(knex.raw('wa.job_name = \'A\''))
        this.andOn('job.seq', '=', 'wa.job_seq')
      })
      oKnex.leftJoin('member as ma', function () {
        this.on('wa.job_member_seq', '=', 'ma.seq')
      })
      oKnex.leftJoin('job_worker as wb', function (){
        this.on(knex.raw('wb.job_name = \'B\''))
        this.andOn('job.seq', '=', 'wb.job_seq')
      })
      oKnex.leftJoin('member as mb', function () {
        this.on('wb.job_member_seq', '=', 'mb.seq')
      })
      oKnex.leftJoin('job_worker as wc', function () {
        this.on(knex.raw('wc.job_name = \'C\''))
        this.andOn('job.seq', '=', 'wc.job_seq')
      })
      oKnex.leftJoin('member as mc', function () {
        this.on('wc.job_member_seq', '=', 'mc.seq')
      })
      oKnex.leftJoin('job_worker as wd', function () {
        this.on(knex.raw('wd.job_name = \'D\''))
        this.andOn('job.seq', '=', 'wd.job_seq')
      })
      oKnex.leftJoin('member as md', function () {
        this.on('wd.job_member_seq', '=', 'md.seq')
      })
    }
    oKnex.where('file.project_seq', pro_seq)
    if (div_seq){
      oKnex.andWhere('file.division_seq', div_seq)
    }
    if (req_body && req_body.file_type) {
      oKnex.andWhere('file.file_type', req_body.file_type)
    }
    if (req_body && req_body.work_status && req_body.work_status !== '-1'){
      let where_status = `job.status = '${req_body.work_status}'`;
      if (req_body.work_status === 'Z5') {
        if (req_body.file_type !== 'v') {
          where_status = `job.status in ('B5','C5','D5')`;
        } else {
          where_status = `ifnull(smax.max_status, 'A1') in ('B5','C5','D5')`;
        }
      } else {
        if (req_body.file_type !== 'v') {
          where_status = `job.status = '${req_body.work_status}'`;
        } else {
          where_status = `ifnull(smax.max_status, 'A1') = '${req_body.work_status}'`;
        }
      }
      oKnex.andWhere(knex.raw(where_status));
    }
    oKnex.orderBy('file.reg_date', 'desc');
    oKnex.orderBy('job.labeler_regdate', 'desc');

    let result = {};
    try {
      result = await this.queryPaginated(oKnex, paging.list_count, paging.cur_page, paging.page_count, paging.no_paging);
      result.error = 0;
    }catch (e) {
      result.error = -1;
      result.message = e;
    }

    return result;
  }

  getView = async (pro_seq, div_seq, req_body) => {
    logger.debug('getView')
    const select = [
      'file.seq', 'file.project_seq', 'file.division_seq', 'file.file_type', 'file.file_path',
      'file.file_name', 'file.org_file_name', 'file.file_size', 'file.play_time', 'file.reg_date',
      'job.seq as job_seq', 'job.class_seq', 'job.status', 'job.label_cnt', 'job.labeler_member_seq',
      'job.labeler_method', 'job.labeler_regdate', 'job.labeler_jobdate', 'job.reject_act as job_reject_act', 'job.reject_seq as job_reject_seq',
      'm1.user_name', 'ma.user_name as ma_name', 'mb.user_name as mb_name', 'mc.user_name as mc_name', 'md.user_name as md_name',
      'wa.job_status as wa_job_status','wb.job_status as wb_job_status', 'wc.job_status as wc_job_status', 'wd.job_status as wd_job_status',
      'rf.seq as rf_seq', 'rf.pair_key as rf_pair_key', 'rf.file_type as rf_file_type', 'rf.file_name as rf_file_name', 'rf.down_cnt as rf_down_cnt',
      'rf.reg_member_seq as  rf_reg_member_seq', 'rf.reg_date as rf_reg_date', 'rf.status as rf_status',
      'rf.reject_act', 'rf.reject_seq'
    ];
    // let join_div = '';
    // if (div_seq){
    //   join_div = `and file.division_seq = ${div_seq}`;
    // }
    const file_seq = req_body.file_seq ? req_body.file_seq : -1;
    // logger.debug(req_body);
    const request_paging = req_body.paging ? req_body.paging : {}
    const paging = {}
    paging.list_count = request_paging.list_count ? request_paging.list_count : 20
    paging.cur_page = request_paging.cur_page ? request_paging.cur_page : 1
    paging.page_count = request_paging.page_count ? request_paging.page_count : 10
    paging.no_paging = request_paging.no_paging ? request_paging.no_paging : 'Y'
    // logger.debug(this.log_prefix, '[getGroupMemberList]', paging)
    const oKnex = this.database
      .select(select)
      .from(this.table_name);
    oKnex.leftJoin('job', function (){
      this.on('job.file_seq', '=', 'file.seq')
        .andOn('job.project_seq', '=', 'file.project_seq')
      if (div_seq){
        this.andOn('job.division_seq', '=', 'file.division_seq')
      }
    })
    oKnex.leftJoin('result_file as rf', function (){
      this.on('file.seq', '=', 'rf.file_seq')
        .andOn('job.seq', '=', 'rf.job_seq')
    })
    oKnex.leftJoin('member as m1', function (){
      this.on('job.labeler_member_seq', '=', 'm1.seq')
    })
    oKnex.leftJoin('job_worker as wa', function (){
      this.on('rf.pair_key', '=', 'wa.result_file_pair_key')
      this.andOn(knex.raw('wa.job_name = \'A\''))
    })
    oKnex.leftJoin('member as ma', function (){
      this.on('wa.job_member_seq', '=', 'ma.seq')
    })
    oKnex.leftJoin('job_worker as wb', function (){
      this.on('rf.pair_key', '=', 'wb.result_file_pair_key')
      this.andOn(knex.raw('wb.job_name = \'B\''))
    })
    oKnex.leftJoin('member as mb', function (){
      this.on('wb.job_member_seq', '=', 'mb.seq')
    })
    oKnex.leftJoin('job_worker as wc', function (){
      this.on('rf.pair_key', '=', 'wc.result_file_pair_key')
      this.andOn(knex.raw('wc.job_name = \'C\''))
    })
    oKnex.leftJoin('member as mc', function (){
      this.on('wc.job_member_seq', '=', 'mc.seq')
    })
    oKnex.leftJoin('job_worker as wd', function (){
      this.on('rf.pair_key', '=', 'wd.result_file_pair_key')
      this.andOn(knex.raw('wd.job_name = \'D\''))
    })
    oKnex.leftJoin('member as md', function (){
      this.on('wd.job_member_seq', '=', 'md.seq')
    })

    oKnex.where('file.project_seq', pro_seq)
    oKnex.andWhere('file.seq', file_seq)
    oKnex.andWhere(knex.raw(' ifnull(rf.file_type, \'i\') = \'i\''))
    if (div_seq){
      oKnex.andWhere('file.division_seq', div_seq)
    }
    if (req_body && req_body.file_type) {
      oKnex.andWhere('file.file_type', req_body.file_type)
    }
    if (req_body && req_body.work_status && req_body.work_status !== '-1'){
      oKnex.andWhere('rf.status', req_body.work_status)
    }
    oKnex.orderBy('job.reject_seq', 'desc')
    oKnex.orderBy('job.seq', 'asc')
    oKnex.orderBy('rf.reject_seq', 'desc')
    oKnex.orderBy('rf.reject_act', 'asc')

    let result = {};
    try {
      // result.data = await oKnex;
      result = await this.queryPaginated(oKnex, paging.list_count, paging.cur_page, paging.page_count, paging.no_paging);
      result.error = 0;
      // logger.debug(this.log_prefix, '[getGroupMemberList]', result)
    }catch (e) {
      result.error = -1;
      result.message = e;
    }

    return result;
  }
}
