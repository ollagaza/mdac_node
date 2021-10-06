import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import moment from "moment";

export default class ProjectModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'project'
    this.private_fields = [
        'seq', 'project_name', 'is_class', 'status', 'memo'
    ]
  }

  // getProject
  getProjects = async() => {
    const select = ['seq', 'project_name', 'is_class', 'status', 'memo', 'reg_member_seq', 'reg_date']
    const oKnex = this.database.select(select).from(this.table_name);
    const result = await oKnex;
    // return new JsonWrapper(result, this.private_fields);
    return result;
  }
}