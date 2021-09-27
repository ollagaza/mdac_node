import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class DivisionModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'division'
    this.private_fields = [
      
    ]
  }

  createDivision  = async (division_info) => {
    // logger.debug(project_info.password)
    // const member = project_info.toJSON()
    // project_info.status = '1';

    // logger.debug(project_info)
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

  getDivisionInfo = async (start, end, is_used, search_type, keyword, project_seq, division_seq) => {

    // const query_result = await this.findOne({ is_used: is_used })
    // if (query_result && query_result.reg_date) {
    //   query_result.reg_date = Util.dateFormat(query_result.reg_date.getTime())
    // }
    // // return new MemberInfo(query_result, this.private_fields)
    // return new JsonWrapper(query_result, this.private_fields)

    const select = ['CONCAT(CASE WHEN a.division_name IS NULL THEN `` ELSE CONCAT(a.division_name,`>`) END, CASE WHEN b.division_name IS NULL THEN `` ELSE CONCAT(b.division_name,>`) END, CASE WHEN c.division_name IS NULL THEN `` ELSE CONCAT(c.division_name,`>`) END, CASE WHEN d.division_name IS NULL THEN `` ELSE CONCAT(d.division_name,`>`) END, CASE WHEN e.division_name IS NULL THEN `` ELSE CONCAT(e.division_name,`>`) END) AS parent_path','division.project_seq','project.project_name','division.division_id','division.division_name','division.is_used','division.reg_date']
    const oKnex = this.database.select(select);
    oKnex.from('division').join('project', function() {
      this.on('division.project_seq','=','project.seq')})

    if(division_seq === '')
    {
      if(is_used !== '') {
        oKnex.where('division.is_used',is_used)
      }
      if(project_seq !== '') {
        oKnex.where('division.project_seq',project_seq);
      }

      if(keyword !== '') {
        oKnex.where(`division.${search_type}`,'like',`%${keyword}%`);
      }
      oKnex.orderBy('division.seq','desc');
      oKnex.limit(end).offset(start)
    }else{
      oKnex.where('division.seq',division_seq);
    }

    const result = await oKnex;
    return result;
    //return new JsonWrapper(result, this.private_fields)
  }
  
  getDivisionInfoPaging = async (start, end, is_used, search_type, keyword, project_seq, division_seq) => {
    const select = ['division.seq']
    const oKnex = this.database.select(select);
    oKnex.from('division').join('project', function() {
      this.on('division.project_seq','=','project.seq')})

    if(division_seq === '')
    {
      if(is_used !== '') {
        oKnex.where('division.is_used',is_used)
      }
      if(project_seq !== '') {
        oKnex.where('division.project_seq',project_seq);
      }

      if(keyword !== '') {
        oKnex.where(`division.${search_type}`,'like',`%${keyword}%`);
      }
      oKnex.orderBy('division.seq','desc');
    }else{
      oKnex.where('division.seq',division_seq);
    }

    const oCountKnex = this.database.from(oKnex.clone().as('list'))

    if(project_seq === '')
    {
      oKnex.limit(end).offset(start)
    }

    const result = await oKnex;
   
    // 총 갯수
    const [{ total_count }] = await Promise.all([
      oCountKnex.count('* as total_count').first()
    ])
    
    return total_count;    
  }
 
  updateDivisionUsed = async (params, arr_division_seq) => {
    const result = {};
    result.error = 0;
    result.mesage = '';
    try {
      const result = await this.database
        .from(this.table_name)
        .whereIn('seq', arr_division_seq)
        .update(params);
      // logger.debug(result);
    }catch (e) {
      result.error = 0;
      result.mesage = '';
    }
    return result;
  }

  deleteDivision = async (params, arr_division_seq) => {
    const result = {};
    result.error = 0;
    result.mesage = '';
    try {
      const result = await this.database
        .from(this.table_name)
        .whereIn('seq', arr_division_seq)
        .delete(params);
      // logger.debug(result);
    }catch (e) {
      result.error = 0;
      result.mesage = '';
    }
    return result;
  }

}
