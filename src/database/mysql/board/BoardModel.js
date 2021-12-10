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
import logger from '../../../libs/logger';

const fs = require('fs');

export default class BoardClass extends MySQLModel {
  constructor (database) {
    super(database)

    this.table_name = 'mdc_board'
    this.private_fields = [
      
    ]
  }

  // 게시물 등록
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

  // 게시물 업데이트
  updateBoard  = async (board_seq, board_info) => {
    // logger.debug(project_info.password)
    // const member = project_info.toJSON()
    // logger.debug(project_info)
    const result = {}
    const update_param = {};
    update_param.project_seq = board_info.project_seq;
    update_param.subject = board_info.subject;
    update_param.content = board_info.content;
    update_param.reg_member_seq = board_info.reg_member_seq;
    if(board_info.files) {
      update_param.files = board_info.files;
    }
    try{
      // 기존파일 삭제 시작
      const find_board_result = await this.findOne({ seq: board_seq })
  
      if (find_board_result && find_board_result.files && board_info.files) {
        for (var i = 0 ; i <= find_board_result.files.split('///').length-1; i++) {
          fs.unlink('./uploads/' + board_info.board_code + '/' + find_board_result.files.split('///')[i],function(err){
            if(err) return console.log(err);
            // console.log('file deleted successfully');
          });    
        }
        // update_param.files = "";
      }
      // 기존파일 삭제 종료
 
      const board_info_seq = await this.update({ seq: board_seq }, update_param)
      board_info.error = 0;
    } catch (e) {
      board_info.error = -1;
      board_info.message = e.sqlMessage;
    }
    return board_info
  }

  // 게시물 정보조회
  getBoardInfo = async (start, end, search_type, keyword, board_code, project_seq, board_seq) => {
    const result = {}
    
    const select = ['board.*','member.user_name','project.project_name']
    const oKnex = this.database.select(select);
    oKnex.from(`${this.table_name} as board`)
      .join('mdc_member as member', function () {
              this.on('board.reg_member_seq','=','member.seq')
      })
    
    oKnex.leftJoin('mdc_project as project', function () {
            this.on('board.project_seq','=','project.seq')
    })

    oKnex.where('board_code',board_code);

    if(board_seq) {
      oKnex.andWhere('board.seq', board_seq)
    } else {
      if(project_seq) {
        oKnex.andWhere('board.project_seq', project_seq);
      }
      if(keyword !== '')
      {
        oKnex.andWhere(`${search_type}`,'like',`%${keyword}%`);
      }
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
  
  // 게시물 삭제
  deleteBoard = async (params, arr_board_seq) => {
    const result = {};
    result.error = 0;
    result.message = '';
    try {

      // 삭제전에 첨부파일 삭제 시작
      const select = ['board_code', 'files']
      const oKnex = this.database.select(select);
      oKnex.from(this.table_name)
      oKnex.whereIn('seq', arr_board_seq)
      oKnex.andWhere('files', '!=', '')
        
      const resultFiles = await oKnex;
      
      for (var i = 0 ; i <= resultFiles.length-1; i++) {
        for (var j = 0 ; j <= resultFiles[i].files.split('///').length-1; j++) {
          fs.unlink('./uploads/' + resultFiles[i].board_code + '/' + resultFiles[i].files.split('///')[j],function(err){
            if(err) return console.log(err);
            // console.log('file deleted successfully');
          });    
        }
      }
      // 삭제전에 첨부파일 삭제 종료
  
      // 실 데이터 삭제
      const result = await this.database
        .from(this.table_name)
        .whereIn('seq', arr_board_seq)
        .delete(params);
      // logger.debug(result);
    }catch (e) {
      result.error = -1;
      result.message = '삭제 오류가 발생했습니다.  관리자에게 문의해 주세요';
    }
    return result;
  }
}
