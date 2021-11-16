/*
=======================================
'	파일명 : BoardService.js
'	작성자 : djyu
'	작성일 : 2021.11.15
'	기능   : board service
'	=====================================
*/
import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import BoardModel from '../../database/mysql/board/BoardModel'
import Util from '../../utils/baseutil'
import ServiceConfig from '../service-config'
import JsonWrapper from '../../wrapper/json-wrapper'
import logger from '../../libs/logger'

const BoardServiceClass = class {
  constructor() {

  }

  // Board
  getBoardModel = (database = null) => {
    if (database) {
      return new BoardModel(database)
    }
    return new BoardModel(DBMySQL)
  }

  createBoard = async (req_body) => {
    const board_model = this.getBoardModel(DBMySQL)
    const result = await board_model.createBoard(req_body);
    return result;
  }

  updateBoard = async (division_seq, req_body) => {
    // logger.debug(req_body);
    const board_model = this.getBoardModel(DBMySQL)
    const result = await board_model.updateBoard(division_seq, req_body);
    return result;
  }

  getBoard = async (database, dmode, project_seq, parent_division_seq, division_seq) => {
    const board_model = this.getBoardModel(database)
    const board_info = await board_model.getBoard(dmode, project_seq, parent_division_seq, division_seq)
    
    return {
      board_info
    }
  }
  
  getBoardInfo = async (database, start, end, is_used, search_type, keyword, board_code, board_seq) => {
    const board_model = this.getBoardModel(database)
    const board_info = await board_model.getBoardInfo(start, end, is_used, search_type, keyword, board_code, board_seq)
    
    return board_info
  }

  deleteBoard = async (database, req_body) => {
    const arr_division_seq = req_body.params.divisions;
    const used = req_body.params.used;
    // logger.debug('updateUsersUsed 1', req_body.params.used, used);
    const params = {}
    params.is_used = used;

    const board_model = this.getBoardModel(database)
    const result = await board_model.deleteBoard(params, arr_division_seq);
    
    return result;
  }    

}
  
const board_service = new BoardServiceClass()

export default board_service
