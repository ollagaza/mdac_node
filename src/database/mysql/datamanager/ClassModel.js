import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class ClassModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'class'
    this.private_fields = [
      
    ]
  }

  createClass  = async (class_info) => {
    // logger.debug(project_info.password)
    // const member = project_info.toJSON()
    // project_info.status = '1';

    // logger.debug(project_info)
    try{
      const class_info_seq = await this.create(class_info, 'seq')
      class_info.seq = class_info_seq
      class_info.error = 0;
    } catch (e) {
      class_info.error = -1;
      class_info.message = e.sqlMessage;
    }
    return class_info
  }

  updateClass  = async (class_seq, class_info) => {
    // logger.debug(project_info.password)
    // const member = project_info.toJSON()
    // logger.debug(project_info)
    const update_param = {};
    update_param.project_seq = class_info.project_seq;
    update_param.class_id = class_info.class_id;
    update_param.class_name = class_info.class_name;
    update_param.is_used = class_info.is_used;
    update_param.reg_member_seq = class_info.reg_member_seq;
    try{
      const class_info_seq = await this.update({ seq: class_seq }, update_param)
      class_info.error = 0;
    } catch (e) {
      class_info.error = -1;
      class_info.message = e.sqlMessage;
    }
    return class_info
  }

  getClassInfo = async (start, end, is_used, search_type, keyword, project_seq, class_seq) => {

    // const query_result = await this.findOne({ is_used: is_used })
    // if (query_result && query_result.reg_date) {
    //   query_result.reg_date = Util.dateFormat(query_result.reg_date.getTime())
    // }
    // // return new MemberInfo(query_result, this.private_fields)
    // return new JsonWrapper(query_result, this.private_fields)

    const select = ['c.seq','c.project_seq','p.project_name','c.class_id','c.class_name','c.is_used','c.reg_date']
    const oKnex = this.database.select(select);
    oKnex.from({c: 'class'}).join({p: 'project'}, function() {
      this.on('c.project_seq','=','p.seq')});

    if(class_seq === '')
    {
      if(is_used !== '') {
      }
      if(project_seq !== '') {
        oKnex.where('c.project_seq',project_seq);
      }

      if(keyword !== '') {
        oKnex.where(`c.${search_type}`,'like',`%${keyword}%`);
      }
      oKnex.orderBy('c.seq','desc');
      oKnex.limit(end).offset(start)
    }else{
      oKnex.where('c.seq',class_seq);
    }

    const result = await oKnex;
    return result;
    //return new JsonWrapper(result, this.private_fields)
  }
  
  getClassInfoPaging = async (start, end, is_used, search_type, keyword, project_seq, class_seq) => {
    const select = ['c.seq']
    const oKnex = this.database.select(select);
    oKnex.from({c: 'class'}).join({p: 'project'}, function() {
      this.on('c.project_seq','=','p.seq')})

    if(class_seq === '')
    {
      if(is_used !== '') {
        oKnex.where('c.is_used',is_used)
      }
      if(project_seq !== '') {
        oKnex.where('c.project_seq',project_seq);
      }

      if(keyword !== '') {
        oKnex.where(`c.${search_type}`,'like',`%${keyword}%`);
      }
      oKnex.orderBy('c.seq','desc');
    }else{
      oKnex.where('c.seq',class_seq);
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
    // const rslt = {}
    // rslt.aaa = result;
    // rslt.bbb = total_count;
    return total_count
  }
 
  updateClassUsed = async (params, arr_class_seq) => {
    const result = {};
    result.error = 0;
    result.mesage = '';
    try {
      const result = await this.database
        .from(this.table_name)
        .whereIn('seq', arr_class_seq)
        .update(params);
      // logger.debug(result);
    }catch (e) {
      result.error = 0;
      result.mesage = '';
    }
    return result;
  }

  deleteClass = async (params, arr_class_seq) => {
    const result = {};
    result.error = 0;
    result.mesage = '';
    try {
      const result = await this.database
        .from(this.table_name)
        .whereIn('seq', arr_class_seq)
        .delete(params);
      // logger.debug(result);
    }catch (e) {
      result.error = 0;
      result.mesage = '';
    }
    return result;
  }

}
