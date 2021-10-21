import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import StdObject from "../../../wrapper/std-object";
import logger from '../../../libs/logger'
import JsonWrapper from '../../../wrapper/json-wrapper'
import Constants from "../../../constants/constants";

export default class ItemsModel extends MySQLModel {
  constructor(database) {
    super(database)

    this.table_name = 'j_items'
  }

  createItems  = async (file_info) => {
    try{
      const seq = await this.create(file_info, 'seq')
      file_info.seq = seq
      file_info.error = 0;
    } catch (e) {
      file_info.error = -1;
      file_info.message = e.sqlMessage;
    }
    return file_info
  }

  getGroup = async () => {
    const file_info = {};
    try{
      const oKnex = this.database.select('*');
      oKnex.from(this.table_name);
      oKnex.where('group_type','0');
      const result = await oKnex;
      const redata = [];
      Object.keys(result).forEach((key) => {
        const rdata = {};
        rdata.seq = result[key].seq;
        rdata.itemcode = result[key].itemcode;
        rdata.itemname = result[key].itemname;
        redata.push(rdata);
      })
      file_info.error = 0;
      file_info.data = redata;
      // logger.debug(file_info);
    } catch (e) {
      file_info.error = -1;
      file_info.message = e.sqlMessage;
    }
    return file_info
  }

  getItemWidthPcode = async (req_body) => {
    const file_info = {};
    try{
      const pcode = req_body.pcode;
      const pcodesub = req_body.pcodesub;
      const search = req_body.search;
      const select = ['a1.seq as seq','a1.itemcode as itemcode', 'a1.itemname as itemname', 'a1.used as used', 'a2.itemcode as pitemcode',
        'a2.itemname as pitemname', 'ca.itemcode as citemcode', 'ca.conid_case as conid_case', 'ca.conid_act as conid_act', 'ca.conid_recom as conid_recom'];
      const oKnex = this.database.select(select);
      oKnex.from(`${this.table_name} as a1`);
      oKnex.innerJoin(`${this.table_name} as a2`, 'a1.pcode', 'a2.itemcode' );
      oKnex.leftJoin(`j_caseaction as ca`, 'a1.itemcode', 'ca.itemcode' );
      oKnex.where('a1.pcode', pcode);
      if (search && search.length > 0){
        oKnex.andWhere('a1.itemname', 'like',`%${search}%`);
      }
      if((pcodesub && pcodesub !== '0') && (search && search.length > 0)) {
        oKnex.andWhere('a1.pcodesub', pcodesub);
      }

      oKnex.andWhere('a1.group_type','2');
      oKnex.andWhere('a2.group_type','0');
      const result = await oKnex;
      const redata = [];
      Object.keys(result).forEach((key) => {
        const rdata = {};
        rdata.seq = result[key].seq;
        rdata.itemcode = result[key].itemcode;
        rdata.itemname = result[key].itemname;
        rdata.used = result[key].used;
        rdata.pitemname = result[key].pitemname;
        rdata.pitemcode = result[key].pitemcode;
        rdata.citemcode = result[key].citemcode;
        rdata.is_case = 0;
        rdata.is_act = 0;
        rdata.is_recom = 0;
        if(result[key].conid_case && result[key].conid_case.length > 0) {
          rdata.is_case = 1;
        }
        if(result[key].conid_act && result[key].conid_act.length > 0) {
          rdata.is_act = 1;
        }
        if(result[key].conid_recom && result[key].conid_recom.length > 0) {
          rdata.is_recom = 1;
        }
        redata.push(rdata);
      })
      file_info.error = 0;
      file_info.data = redata;
    } catch (e) {
      file_info.error = -1;
      file_info.message = e.sqlMessage;
    }
    // logger.debug(file_info);
    return file_info
  }

  getItem = async (pcode) => {
    const file_info = {};
    try{
      const oKnex = this.database.select('*');
      oKnex.from(this.table_name);
      oKnex.where('itemcode', 'like', `%${pcode}%`);
      oKnex.andWhere('group_type','2');
      const result = await oKnex;
      const redata = [];
      Object.keys(result).forEach((key) => {
        const rdata = {};
        rdata.seq = result[key].seq;
        rdata.itemcode = result[key].itemcode;
        rdata.itemname = result[key].itemname;
        redata.push(rdata);
      })
      file_info.error = 0;
      file_info.data = redata;
    } catch (e) {
      file_info.error = -1;
      file_info.message = e.sqlMessage;
    }
    // logger.debug(file_info);
    return file_info
  }

  getCodeItem = async (req_body) => {
    const file_info = {};
    try{
      const pcode = req_body.pcode;
      const pcodesub = req_body.pcodesub;
      const oKnex = this.database.select('*');
      oKnex.from(this.table_name);
      oKnex.where('pcode', pcode);
      if (pcodesub !== '0') {
        oKnex.andWhere('pcodesub', pcodesub);
      }
      oKnex.andWhere('group_type','2');
      oKnex.orderBy('itemcode');
      const result = await oKnex;
      const redata = [];
      Object.keys(result).forEach((key) => {
        const rdata = {};
        rdata.seq = result[key].seq;
        rdata.itemcode = result[key].itemcode;
        rdata.itemname = result[key].itemname;
        rdata.used = result[key].used;
        redata.push(rdata);
      })
      file_info.error = 0;
      file_info.data = redata;
    } catch (e) {
      file_info.error = -1;
      file_info.message = e.sqlMessage;
    }
    // logger.debug(file_info);
    return file_info
  }

  setCodeItemname = async (code, name, used) => {
    const result = {error: 0, message:''};
    try {
      const updateparam = {itemname: name, used: used}
      await this.database
        .from(this.table_name)
        .where('itemcode', code)
        .update(updateparam);
    }catch (e) {
      result.error = -1;
      result.message = e;
    }
    return result;
  }

}
