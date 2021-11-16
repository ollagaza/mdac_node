import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import moment from "moment";

export default class ClassModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'mdc_class'
    this.private_fields = [
        'seq', 'project_seq', 'class_id', 'class_name', 'is_used', 'reg_member_seq', 'reg_date'
    ]
  }

  // getclass
  getClassByProject = async(project_seq) => {
    const select = ['seq', 'project_seq', 'class_id', 'class_name', 'is_used', 'reg_member_seq', 'reg_date']
    const oKnex = this.database
        .select(select)
        .from(this.table_name)
        .where('project_seq', project_seq);
    const result = await oKnex;
    // return new JsonWrapper(result, this.private_fields);
    return result;
  }
}