import MySQLModel from "../../mysql-model";
import logger from "../../../libs/logger";
import PlantInfo from "../../../wrapper/plant/PlantInfo";

export default class CheckListModel extends MySQLModel {
  constructor(database) {
    super(database)
    this.table_name = 'j_plant'
  }

  createList = async (info) => {
    try {
      const seq = await this.create(info, 'seq')
      info.seq = seq
      // logger.debug(seq);
      info.error = 0;
      info.message = '';
    } catch (e) {
      info.error = -1;
      info.message = e.sqlMessage;
    }
    return info
  }

  updateList = async(filter, params) => {
    // logger.debug(filter, params)
    const info = {};
    try{
      await this.update(filter, params)
      info.error = 0;
    } catch (e) {
      info.error = -1;
      info.message = e.sqlMessage;
    }
    return info;
  }

  getPlantListPage = async (token_info, page_params = {}, filter_params = {}, is_admin = false, asc = false) => {
    let page = page_params.page;
    if (page_params.page === undefined || !page_params.page) {
      page = page_params.page | 1
    }
    const list_count = page_params.list_count | 20
    const page_count = page_params.page_count | 10
    const member_seq = token_info.id
    const select_text = ['j_plant.*', 'j_myplant.othername', 'j_items.itemname as jitemname' ];
    const query = this.database.select(select_text)
    query.from('j_plant')
    query.join('j_myplant', function() {
      this.on('j_plant.item_seq', '=', 'j_myplant.seq')
        .andOn('j_plant.member_seq', '=', 'j_myplant.member_seq')
    })
    query.join('j_items', 'j_myplant.groupcode', '=', 'j_items.itemcode' )
    if (is_admin !== true) {
      query.where('j_plant.member_seq', member_seq);
    }
    // query.leftJoin('j_checkresult', function() {
    //   this.on('j_plant.seq', '=', 'j_checkresult.plant_seq')
    //     .andOn('j_checkresult.select_data', '=', 1)
    // })

    if (filter_params.search && filter_params.search.length > 0) {
      let columnName = 'j_plant.title';
      if (filter_params.search_type === '0') {
        columnName = 'j_plant.title';
      }
      if (filter_params.search_type === '1') {
        columnName = 'j_myplant.othername';
      }
      if (filter_params.search_type === '2') {
        columnName = 'j_items.itemname';
      }
      if (filter_params.search_type === '3') {
        columnName = 'j_plant.result_text';
      }
      query.andWhere(columnName, 'like', `%${filter_params.search.toUpperCase()}%`)
    }
    // queryPaginated 합수에서 합계..
    const order_by = { name: 'j_plant.seq', direction: 'DESC' }
    if (asc) {
      order_by.direction = 'ASC'
    }
    query.orderBy(order_by.name, order_by.direction)
    const paging_result = await this.queryPaginated(query, list_count, page, page_count, page_params.no_paging)
    const result = []
    if (paging_result && paging_result.data) {
      for (const key in paging_result.data) {
        let query_result = paging_result.data[key]
        result.push(this.getPlantInfoByResult(query_result))
      }
    }
    paging_result.data = result
    return paging_result
  }


  getPlantInfoByResult = (query_result) => {
    return new PlantInfo(query_result)
  }

  getReportInfo = async (seq, member_seq) => {
    const select_text = ['j_plant.*', 'j_myplant.othername', 'j_items.itemname as jitemname' ];
    const query = this.database.select(select_text)
    query.from('j_plant')
    query.join('j_myplant', function() {
      this.on('j_plant.item_seq', '=', 'j_myplant.seq')
        .andOn('j_plant.member_seq', '=', 'j_myplant.member_seq')
    })
    query.join('j_items', 'j_myplant.groupcode', '=', 'j_items.itemcode' )
    query.where('j_plant.seq', seq)
    query.andWhere('j_plant.member_seq', member_seq);
    const info = {};
    try{
      const result = await query;
      info.error = 0;
      info.message = '';
      info.data = result;
    }catch (e) {
      info.error = -1;
      info.message = e;
    }
    // queryPaginated 합수에서 합계..
    // logger.debug(info);
    return info;
  }

  getReportResult = async (seq) => {
    const query = this.database.select(['*'])
    query.from('j_checkresult')
    query.where('plant_seq', seq);
    const info = {};
    try{
      const result = await query;
      info.error = 0;
      info.message = '';
      info.data = result;
    }catch (e) {
      info.error = -1;
      info.message = e;
    }
    return info;
  }

  getReportInfo2 = async (seq, member_seq) => {
    const select_text = ['j.*', 'm.othername', 'j_items.itemname as jitemname' , 'c.seq as c_seq'
      , 'c.result as c_result', 'c.result_text as c_result_text', 'c.percent as c_percent', 'c.select_data as c_select_data']
    const query = this.database.select(select_text)
    query.from('j_plant as j')
    query.join('j_myplant as m', function() {
      this.on('j.item_seq', '=', 'm.seq')
        .andOn('j.member_seq', '=', 'm.member_seq')
    })
    query.join('j_items', 'm.groupcode', '=', 'j_items.itemcode' )
    query.leftJoin('j_checkresult as c', function() {
      this.on('j.seq', '=', 'c.plant_seq')
    })
    query.where('j.seq', seq);
    query.andWhere('j.member_seq', member_seq);
    const info = {};
    let result = null;
    try{
      result = await query;
      info.error = 0;
      info.message = '';
    }catch (e) {
      info.error = -1;
      info.message = e;
    }

    const data = []
    Object.keys(result).forEach((key) => {
      const rdata= result[key];
      data.push(rdata);
    });
    info.data = data;
    // const data = new PlantInfo(result, [])
    // logger.debug(info);
    return info;
  }

  plantcount = async (date) => {
    const oKnex = this.database.count('* as co')
      .from(this.table_name)
    if (date !== 0) {
      oKnex.where('reg_day','>',date);
    }
    const result = await oKnex;
    if (result[0].co){
      return result[0].co
    }
    return 0;
  }

  plantList = async () =>{
    const select_text = ['j_plant.title', 'j_plant.reg_day', 'j_myplant.othername', 'j_items.itemname as jitemname', 'member.user_name as user_name' ];
    const query = this.database.select(select_text)
    query.from('j_plant')
    query.join('j_myplant', function() {
      this.on('j_plant.item_seq', '=', 'j_myplant.seq')
    })
    query.join('j_items', 'j_myplant.groupcode', '=', 'j_items.itemcode' )
    query.join('member', 'j_myplant.member_seq', '=', 'member.seq' )
      .limit(5)
    const result = await query;
    return result;
  }
}
