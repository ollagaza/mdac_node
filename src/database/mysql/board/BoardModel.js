/*
=======================================
'	파일명 : BoardModel.js
'	작성자 : djyu
'	작성일 : 2021.11.15
'	기능   : board model
'	=====================================
*/
import Util from '../../../utils/baseutil'
import MySQLModel from '../../mysql-model'
import JsonWrapper from '../../../wrapper/json-wrapper'
import knex from '../../knex-mysql';

export default class BoardClass extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'board'
    this.private_fields = [
      
    ]
  }

  createBoard  = async (board_info) => {
    try{
      const board_info_seq = await this.create(board_info, 'seq')
      board_info.seq = board_info_seq
      board_info.error = 0;
    } catch (e) {
      board_info.error = -1;
      board_info.message = e.sqlMessage;
    }
    return board_info
  }

  updateBoard  = async (class_seq, board_info) => {
    // logger.debug(project_info.password)
    // const member = project_info.toJSON()
    // logger.debug(project_info)
    const update_param = {};
    update_param.project_seq = board_info.project_seq;
    update_param.class_id = board_info.class_id;
    update_param.class_name = board_info.class_name;
    update_param.is_used = board_info.is_used;
    update_param.reg_member_seq = board_info.reg_member_seq;
    try{
      const board_info_seq = await this.update({ seq: class_seq }, update_param)
      board_info.error = 0;
    } catch (e) {
      board_info.error = -1;
      board_info.message = e.sqlMessage;
    }
    return board_info
  }

  getBoardInfo = async (start, end, search_type, keyword, board_code, board_seq) => {
    const result = {}
    
    const select = ['*']
    const oKnex = this.database.select(select);
    oKnex.from(this.table_name)

    oKnex.where('board_code',board_code);

    if(keyword !== '')
    {
      oKnex.andWhere(`${search_type}`,'like',`%${keyword}%`);
    }
    const oCountKnex = this.database.from(oKnex.clone().as('list'))
    oKnex.orderBy('reg_date','desc');
    oKnex.limit(end).offset(start)

    result.board_info = await oKnex;
   
    // 총 갯수
    const { total_count } = await oCountKnex.count('* as total_count').first()

    result.paging = total_count
    return result
  }
  
  deleteBoard = async (params, arr_board_seq) => {
    const result = {};
    result.error = 0;
    result.message = '';
    try {
  
      const select = ['seq']
      const oKnex = this.database.select(select);
      oKnex.from('board')
      oKnex.whereIn('seq', arr_board_seq)
  
      // 총 갯수
      const { total_count } = await oKnex.count('* as total_count').first()

      if(total_count > 0) {
        result.error = -1;
        result.message = '선택한 클래스에 할당된 작업이 있어 삭제가 불가합니다';
      } else {
        const result = await this.database
          .from(this.table_name)
          .whereIn('seq', arr_board_seq)
          .delete(params);
        // logger.debug(result);
      }
    }catch (e) {
      result.error = -1;
      result.message = '삭제 오류가 발생했습니다.  관리자에게 문의해 주세요';
    }
    return result;
  }

  getBoard = async(seq) => {
    const select = ['*'];
    const oKnex = this.database
      .select(select)
      .from(this.table_name)
      .where("seq", seq);
    return await oKnex;
  }

}
