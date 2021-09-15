import MySQLModel from "../../mysql-model";
import logger from "../../../libs/logger";

export default class CheckListModel extends MySQLModel {
  constructor(database) {
    super(database)
    this.table_name = 'j_myplant'
  }

  createMyplant = async (info) => {
    try {
      const seq = await this.create(info, 'seq')
      info.message = seq
      // logger.debug(seq);
      info.error = 0;
    } catch (e) {
      info.error = -1;
      info.message = e.sqlMessage;
    }
    return info
  }

  updateMyplant = async (info, seqdata, member_seq) => {
    try {
      // logger.debug('updateMyplant');

      const filter = {'seq': seqdata};//{'seq': seqdata, 'member_seq': member_seq};
      // logger.debug(filter);
      const seq = await this.update(filter, info)
      // logger.debug(seq);
      info.error = 0;
    } catch (e) {
      info.error = -1;
      info.message = e.sqlMessage;
      logger.error(e);
    }
    return info
  }

  getList = async (member_seq) => {
    const info = {};
    try {
      const sel = ['j_myplant.*', 'j_items.itemname', 'j1.item_name as j1itemname', 'j2.item_name as j2itemname'];
      const oKnex = this.database.select(sel);
      oKnex.from(this.table_name);
      oKnex.innerJoin('j_items', 'j_items.itemcode', 'j_myplant.groupcode')
      oKnex.innerJoin('juso_item as j1', 'j_myplant.sido', 'j1.item_seq')
      oKnex.leftJoin('juso_item as j2', 'j_myplant.gugun', 'j2.item_seq')
      oKnex.where('member_seq',member_seq);
      const result = await oKnex;
      // logger.debug(result);
      const redata = [];

      // logger.debug('result ',result);
      Object.keys(result).forEach((key) => {
        const rdata = {};
        rdata.seq= result[key].seq;
        // logger.debug('rdata.seq ',rdata.seq);
        rdata.member_seq= result[key].member_seq;
        rdata.othername= result[key].othername;
        rdata.groupcode= result[key].groupcode;
        rdata.groupname= result[key].itemname;
        rdata.wherename= result[key].wherename;
        rdata.m_day= result[key].m_day;
        rdata.sido= result[key].sido;
        rdata.gugun= result[key].gugun;
        rdata.plantstatus= result[key].plantstatus;
        rdata.reg_date= result[key].reg_date;
        rdata.j1itemname= result[key].j1itemname;
        rdata.j2itemname= result[key].j2itemname;
        redata.push(rdata);
      });
      // logger.debug('redata', redata)
      info.data = redata;
      info.error = 0;
    } catch (e) {
      info.error = -1;
      info.message = e.sqlMessage;
    }
    return info
  }

  getInfo = async (seq, member_seq) => {
    const info = {};
    try {
      const sel = ['j_myplant.*', 'j_items.itemname'];
      const oKnex = this.database.select(sel);
      oKnex.from(this.table_name);
      oKnex.innerJoin('j_items', 'j_items.itemcode', 'j_myplant.groupcode')
      oKnex.where('member_seq',member_seq);
      oKnex.andWhere('j_myplant.seq',seq);
      const result = await oKnex;
      // logger.debug(result);
      const redata = [];
      const rdata = {};
      Object.keys(result).forEach((key) => {
        rdata.seq= result[key].seq;
        rdata.member_seq= result[key].member_seq;
        rdata.othername= result[key].othername;
        rdata.groupcode= result[key].groupcode;
        rdata.groupname= result[key].itemname;
        rdata.wherename= result[key].wherename;
        rdata.m_day= result[key].m_day;
        rdata.sido= result[key].sido;
        rdata.gugun= result[key].gugun;
        rdata.plantstatus= result[key].plantstatus;
        rdata.reg_date= result[key].reg_date;
        redata.push(rdata);
      });
      info.data = redata;
      info.error = 0;
    } catch (e) {
      info.error = -1;
      info.message = e.sqlMessage;
    }
    return info
  }
}
