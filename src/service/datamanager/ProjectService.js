/*
=======================================
'	파일명 : ProjectService.js
'	작성자 : djyu
'	작성일 : 2021.09.30
'	기능   : project service
'	=====================================
*/
import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import ProjectModel from '../../database/mysql/datamanager/ProjectModel'
import DivisionModel from '../../database/mysql/datamanager/DivisionModel'
import ClassModel from '../../database/mysql/datamanager/ClassModel'
import CodegroupModel from '../../database/mysql/datamanager/CodegroupModel'
import Util from '../../utils/baseutil'
import ServiceConfig from '../service-config'
import JsonWrapper from '../../wrapper/json-wrapper'
import logger from '../../libs/logger'

const ProjectServiceClass = class {
  constructor() {

  }

  // PROJECT
  getProjectModel = (database = null) => {
    if (database) {
      return new ProjectModel(database)
    }
    return new ProjectModel(DBMySQL)
  }

  createProject = async (req_body) => {
    const project_model = this.getProjectModel(DBMySQL)
    const result = await project_model.createProject(req_body);
    return result;
  }

  updateProject = async (project_seq, req_body) => {
    // logger.debug(req_body);
    const project_model = this.getProjectModel(DBMySQL)
    const result = await project_model.updateProject(project_seq, req_body);
    return result;
  }

  getProjectInfo = async (database, start, end, status, search_type, keyword, project_seq) => {
    const project_model = this.getProjectModel(database)
    const project_info = await project_model.getProjectInfo(start, end, status, search_type, keyword, project_seq)
    //const project_paging = await project_model.getProjectInfoPaging(start, end, status, search_type, keyword, project_seq)
    
    return project_info
    // return {
    //   project_info,
    //   project_paging
    // }
  }

  ProjectMemberCount = async (database) => {
    const project_model = this.getProjectModel(database)
    const result = await project_model.getProjectMembercount();
    logger.debug(result);
    return result;
  }

  // DIVISION
  getDivisionModel = (database = null) => {
    if (database) {
      return new DivisionModel(database)
    }
    return new DivisionModel(DBMySQL)
  }

  createDivision = async (req_body) => {
    const division_model = this.getDivisionModel(DBMySQL)
    const result = await division_model.createDivision(req_body);
    return result;
  }

  updateDivision = async (division_seq, req_body) => {
    // logger.debug(req_body);
    const division_model = this.getDivisionModel(DBMySQL)
    const result = await division_model.updateDivision(division_seq, req_body);
    return result;
  }

  getDivision = async (database, dmode, project_seq, parent_division_seq, division_seq) => {
    const division_model = this.getDivisionModel(database)
    const division_info = await division_model.getDivision(dmode, project_seq, parent_division_seq, division_seq)
    
    return {
      division_info
    }
  }
  
  getDivisionInfo = async (database, start, end, is_used, search_type, keyword, project_seq, division_seq) => {
    const division_model = this.getDivisionModel(database)
    const division_info = await division_model.getDivisionInfo(start, end, is_used, search_type, keyword, project_seq, division_seq)
    // const division_paging = await division_model.getDivisionInfoPaging(start, end, is_used, search_type, keyword, project_seq, division_seq)
    
    return division_info
  }
  
  updateDivisionUsed = async (database, req_body) => {
    const arr_division_seq = req_body.params.divisions;
    const used = req_body.params.used;
    // logger.debug('updateUsersUsed 1', req_body.params.used, used);
    const params = {}
    params.is_used = used;

    const division_model = this.getDivisionModel(database)
    const result = await division_model.updateDivisionUsed(params, arr_division_seq);
    
    return result;
  }

  deleteDivision = async (database, req_body) => {
    const arr_division_seq = req_body.params.divisions;
    const used = req_body.params.used;
    // logger.debug('updateUsersUsed 1', req_body.params.used, used);
    const params = {}
    params.is_used = used;

    const division_model = this.getDivisionModel(database)
    const result = await division_model.deleteDivision(params, arr_division_seq);
    
    return result;
  }    

  // CLASS
  getClassModel = (database = null) => {
    if (database) {
      return new ClassModel(database)
    }
    return new ClassModel(DBMySQL)
  }

  createClass = async (req_body) => {
    const class_model = this.getClassModel(DBMySQL)
    const result = await class_model.createClass(req_body);
    return result;
  }

  updateClass = async (class_seq, req_body) => {
    // logger.debug(req_body);
    const class_model = this.getClassModel(DBMySQL)
    const result = await class_model.updateClass(class_seq, req_body);
    return result;
  }

  getClassInfo = async (database, start, end, is_used, search_type, keyword, project_seq, class_seq) => {
    const class_model = this.getClassModel(database)
    const class_info = await class_model.getClassInfo(start, end, is_used, search_type, keyword, project_seq, class_seq)
    // const class_paging = await class_model.getClassInfoPaging(start, end, is_used, search_type, keyword, project_seq, class_seq)
    
    return class_info
  }
  
  updateClassUsed = async (database, req_body) => {
    const arr_class_seq = req_body.params.classes;
    const used = req_body.params.used;
    // logger.debug('updateUsersUsed 1', req_body.params.used, used);
    const params = {}
    params.is_used = used;

    const class_model = this.getClassModel(database)
    const result = await class_model.updateClassUsed(params, arr_class_seq);
    
    return result;
  }

  deleteClass = async (database, req_body) => {
    const arr_class_seq = req_body.params.classes;
    const used = req_body.params.used;
    // logger.debug('updateUsersUsed 1', req_body.params.used, used);
    const params = {}
    params.is_used = used;

    const class_model = this.getClassModel(database)
    const result = await class_model.deleteClass(params, arr_class_seq);
    
    return result;
  }    

  // code group
  getCodegroupModel = (database = null) => {
    if (database) {
      return new CodegroupModel(database)
    }
    return new CodegroupModel(DBMySQL)
  }

  createCodegroup = async (req_body) => {
    const codegroup_model = this.getCodegroupModel(DBMySQL)
    const result = await codegroup_model.createCodegroup(req_body);
    return result;
  }

  updateCodegroup = async (codegroup_seq, req_body) => {
    // logger.debug(req_body);
    const codegroup_model = this.getCodegroupModel(DBMySQL)
    const result = await codegroup_model.updateCodegroup(codegroup_seq, req_body);
    return result;
  }

  getCodegroup = async (database, ref_codegroup, codegroup_seq) => {
    const codegroup_model = this.getCodegroupModel(database)
    const codegroup_info = await codegroup_model.getCodegroup(ref_codegroup, codegroup_seq)
    
    return {
      codegroup_info
    }
  }  

  getCodegroupInfo = async (database, start, end, is_used, search_type, keyword, ref_codegroup, codegroup_seq) => {
    const codegroup_model = this.getCodegroupModel(database)
    const codegroup_info = await codegroup_model.getCodegroupInfo(start, end, is_used, search_type, keyword, ref_codegroup, codegroup_seq)
    
    return codegroup_info
  }
  
  updateCodegroupUsed = async (database, req_body) => {
    const arr_codegroup_seq = req_body.params.codegroups;
    const used = req_body.params.used;
    // logger.debug('updateUsersUsed 1', req_body.params.used, used);
    const params = {}
    params.is_used = used;

    const codegroup_model = this.getCodegroupModel(database)
    const result = await codegroup_model.updateCodegroupUsed(params, arr_codegroup_seq);
    
    return result;
  }

  deleteCodegroup = async (database, req_body) => {
    const arr_codegroup_seq = req_body.params.codegroups;
    const used = req_body.params.used;
    const params = {}
    params.is_used = used;

    const codegroup_model = this.getCodegroupModel(database)
    const result = await codegroup_model.deleteCodegroup(params, arr_codegroup_seq);
    
    return result;
  }    

}
  
const project_service = new ProjectServiceClass()

export default project_service
