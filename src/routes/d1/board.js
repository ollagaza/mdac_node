/*
=======================================
'	파일명 : board.js
'	작성자 : djyu
'	작성일 : 2021.11.15
'	기능   : board route
'	=====================================
*/
import { Router } from 'express'
import Wrap from '../../utils/express-async'
import Util from '../../utils/baseutil'
import StdObject from '../../wrapper/std-object'
import BoardService from "../../service/board/BoardService"
// import MemberLogService from "../../service/member/MemberLogService"
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'
import DBMySQL from '../../database/knex-mysql'

const routes = Router()

const multer = require('multer');
const path = require('path');


// 파일 업로드
const upload = multer({
  storage: multer.diskStorage({
      destination(req, file, done){
          const dir = Util.createDirectory(path.resolve("./") + '/uploads/' + req.body.board_code + '/');
          done(null, path.resolve("./") + '/uploads/' + req.body.board_code);
      },
      filename(req, file, done) {
          const ext = path.extname(file.originalname);
          done(null, path.basename(file.originalname, ext) + Date.now() + ext);
          //done(null, file.originalname);
      },
  }),
});

// 게시글 작성
routes.post('/createboard', upload.array('image',10), Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res, next) => {
  const request_body = req.body ? req.body : null;
  let result = null;

  const token_info = req.token_info
  const reg_member_seq = request_body.reg_member_seq // 수정자 회원번호
  if (request_body.subject) {
    let filename = "";
    for (let i = 0; i < req.files.length; i++) {
      // filename += `///public/uploadFiles/${req.files[i].filename}`;
      if(filename =="") {
        filename = `${req.files[i].filename}`;
      }else{
          filename += `///${req.files[i].filename}`;
      }
    }
    request_body.files = filename

    result = await BoardService.createBoard(request_body);
    if (result.error === 0){
      // MemberLogService.createMemberLog(req, result.seq, reg_member_seq, '1001', 'ok');
    } else {
      // MemberLogService.createMemberLog(req, result.seq, reg_member_seq, '9998', result.message);
    }
    res.json(result);
  } else {
    const out = new StdObject(-1, '등록된 값이 없습니다.', 404);
    res.json(out);
  }
}));

// 게시글업데이트
routes.post('/:board_seq(\\d+)/updateboard', upload.array('image',10), Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  const board_seq = Util.parseInt(req.params.board_seq)
  if (board_seq < 0) {
    const out = new StdObject(-1, '잘못된 게시물 입니다.', 404);
    // MemberLogService.createMemberLog(req, result.seq, result.seq, '9998', '잘못된 사용자 입니다.');
    res.json(out);
    return;
  }
  const request_body = req.body ? req.body : null;
  let result = null;
  if (request_body.subject) {
    let filename = "";
    for (let i = 0; i < req.files.length; i++) {
      // filename += `///public/uploadFiles/${req.files[i].filename}`;
      if(filename =="") {
        filename = `${req.files[i].filename}`;
      }else{
          filename += `///${req.files[i].filename}`;
      }
    }
    if(filename) {
      request_body.files = filename
    }

    result = await BoardService.updateBoard(board_seq, request_body);
    // MemberLogService.createMemberLog(req, project_seq, reg_member_seq, '1002', result.message);
    res.json(result);
  } else {
    const out = new StdObject(-1, '등록된 값이 없습니다.', 404);
    res.json(out);
  }
}))

// 게시물-List,one
routes.post('/:board_code/boardinfo', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const token_info = req.token_info
  const board_code = req.params.board_code ? req.params.board_code:'1'
  const cur_page = req.body.cur_page ? req.body.cur_page:'1'
  const list_count = req.body.list_count ? req.body.list_count:'20'
  const search_type = req.body.search_type
  const keyword = req.body.keyword ? req.body.keyword:''
  const project_seq = req.body.project_seq ? req.body.project_seq:''
  const board_seq = req.body.board_seq ? req.body.board_seq:''

  // paging에 필요한 변수
  let totalCount = 0;
  let page_count = 10;
  let total_page = 0;
  let start = 0;
  let end = list_count;
  let start_page = 1;
  let end_page = page_count;

  start = (cur_page - 1) * list_count;
  start_page = Math.ceil(cur_page / page_count);
  end_page = start_page * page_count;
  const board_info = await BoardService.getBoardInfo(DBMySQL, start, end, search_type, keyword, board_code, project_seq, board_seq)
  const output = new StdObject()
  output.add('board_info', board_info.board_info) // 분류리스트
  // output.add('paging', )

  totalCount = board_info.paging; // 페이징정보

  // totalCount = rows[1];
  total_page = Math.ceil(totalCount/list_count);

  if(total_page < end_page) end_page = total_page;

  let paging = {
    "total_count":totalCount
    ,"cur_page": cur_page
    ,"first_page": start_page
    ,"last_page": end_page
    ,"list_count": list_count
    ,"page_count": page_count
    ,"start": start
    ,"end": end
  }
  output.add('paging', paging)

  res.json(output)
}))

// 게시글삭제
routes.post('/delboard',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const req_body = req.body ? req.body : {};
  const output = new StdObject(0, 'data', 200);
  const result = await BoardService.deleteBoard(DBMySQL, req_body);
  if (result.error !== 0){
    output.error = result.error
    output.message = result.message
  }
  res.json(output)
}));

routes.post('/:board_code/upload', upload.array('image',10), Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res, next) => {

  const board_code = req.params.board_code ? req.params.board_code:'1'

  // console.log(req.file, req.body);
  // res.send('OK');
  // const request_body = req.body ? req.body : null;
  // let result = null;

  // const token_info = req.token_info
  // const reg_member_seq = request_body.reg_member_seq // 수정자 회원번호

  // if (request_body.subject) {
  //   result = await BoardService.createBoard(request_body);
  //   res.json(result);
  // } else {
  //   const out = new StdObject(-1, '등록된 값이 없습니다.', 404);
  //   res.json(out);
  // }

}));

export default routes
