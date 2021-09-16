import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import moment from "moment";

export default class DivisionModel extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'division'
    this.private_fields = [
        'seq', 'project_seq', 'parent_division_seq', 'division_id', 'division_name', 'is_used'
    ]
  }
  // getDivision
  GetDivisions = async(project_seq) => {
    const select = ['seq', 'project_seq', 'parent_division_seq', 'division_id', 'division_name', 'is_used', 'reg_member_seq', 'reg_date']
    // const select = ['*']
    const oKnex = this.database.select(select).from(this.table_name).where("project_seq", project_seq);
    const result = await oKnex;
    return new JsonWrapper(result, this.private_fields);
  }
}