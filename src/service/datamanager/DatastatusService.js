// make by june
import Project_Model from '../../database/mysql/datamanager/Project_Model';
import Division_Model from '../../database/mysql/datamanager/Division_Model';
import Member_Model from '../../database/mysql/member/Member_Model';
import Job_Model from '../../database/mysql/datamanager/Job_Model';

import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import Util from '../../utils/baseutil'
import ServiceConfig from '../service-config'
import JsonWrapper from '../../wrapper/json-wrapper'
import logger from '../../libs/logger'
import DataManagerModel from "../../database/mysql/datamanager/DataManagerModel";

const ProjectServiceClass = class {
  constructor() {

  }

  getProject_Model = (database = null) => {
    if (database) {
      return new Project_Model(database)
    }
    return new Project_Model(DBMySQL)
  }

  getDivision_Model = (database = null) => {
    if (database) {
      return new Division_Model(database)
    }
    return new Division_Model(DBMySQL)
  }

  getMember_Model = (database = null) => {
    if (database) {
      return new Member_Model(database)
    }
    return new Member_Model(DBMySQL)
  }

  getJob_Model = (database = null) => {
    if (database) {
      return new Job_Model(database)
    }
    return new Job_Model(DBMySQL)
  }

  getProject_List = async (database) => {
    const project_model = this.getProject_Model(database);
    const result = await project_model.getProjectList();
    return result;
  }

  getFirstDivision = async (database, pro_seq) => {
    const division_model = this.getDivision_Model(database);
    const result = await division_model.getFirstDivsionByProseq(pro_seq);
    return result;
  }

  getDivision = async (database, pro_seq, div_seq, is_used) => {
    const division_model = this.getDivision_Model(database);
    const result = await division_model.getDivsionByProseq(pro_seq, div_seq, is_used);
    return result;
  }

  getProject_Class = async (database, seq) => {
    const project_model = this.getProject_Model(database);
    const result = await project_model.getProjectWidthClass(seq);
    return result;
  }

  getWokerList = async (database) => {
    const member_model = this.getMember_Model(database);
    const result = await member_model.getWokerList('Y');
    return result;
  }

  getJobList = async (database, pro_seq, div_seq, req_body) => {
    const member_model = this.getJob_Model(database);
    const result = await member_model.getJobList(pro_seq, div_seq, req_body);
    return result;
  }

}

const project_service = new ProjectServiceClass()

export default project_service
