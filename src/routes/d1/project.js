/*
=======================================
'	파일명 : project.js
'	작성자 : djyu
'	작성일 : 2021.09.30
'	기능   : project route
'	=====================================
*/
import { Router } from 'express'
import Wrap from '../../utils/express-async'
import Util from '../../utils/baseutil'
import StdObject from '../../wrapper/std-object'
import ProjectService from "../../service/datamanager/ProjectService"
// import MemberLogService from "../../service/member/MemberLogService"
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'
import DBMySQL from '../../database/knex-mysql'

const routes = Router()

// PROJECT
// 프로젝트 생성
routes.post('/createproject', Auth.isAuthenticated(Role.ADMIN), async (req, res) => {
  const request_body = req.body ? req.body : null;
  let result = null;

  const token_info = req.token_info
  const reg_member_seq = request_body.reg_member_seq // 수정자 회원번호

  if (request_body.project_name) {
    result = await ProjectService.createProject(request_body);
    // if (result.error === 0){
    //   MemberLogService.createMemberLog(req, result.seq, reg_member_seq, '1001', 'ok');
    // } else {
    //   MemberLogService.createMemberLog(req, result.seq, reg_member_seq, '9998', result.message);
    // }
    res.json(result);
  } else {
    const out = new StdObject(-1, '등록된 값이 없습니다.', 404);
    res.json(out);
  }
});

// 프로젝트 업데이트
routes.post('/:project_seq(\\d+)/updateproject', async (req, res) => {
  const project_seq = Util.parseInt(req.params.project_seq)
  if (project_seq < 0) {
    const out = new StdObject(-1, '잘못된 프로젝트 입니다.', 404);
    //MemberLogService.createMemberLog(req, result.seq, result.seq, '9998', '잘못된 사용자 입니다.');
    res.json(out);
    return;
  }
  const request_body = req.body ? req.body : null;
  const reg_member_seq = request_body.reg_member_seq // 수정자 회원번호
  let result = null;
  if (request_body.project_name) {
    result = await ProjectService.updateProject(project_seq, request_body);
    //MemberLogService.createMemberLog(req, project_seq, reg_member_seq, '1002', result.message);
    res.json(result);
  } else {
    const out = new StdObject(-1, '등록된 값이 없습니다.', 404);
    res.json(out);
  }
});

// 프로젝트정보
routes.get('/:project_seq(\\d+)/data', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  const token_info = req.token_info
  const member_seq = Util.parseInt(req.params.member_seq)
  if (!ProjectService.checkMyToken(token_info, member_seq)) {
    throw new StdObject(-1, '잘못된 요청입니다.', 403)
  }

  // const user_data = await DataManagerService.getMemberMetadata(member_seq)
  const user_data = {data:"data"}
  const output = new StdObject()
  output.add('user_data', user_data)
  res.json(output)
}))

// 프로젝트정보-List,one
routes.post('/projectinfo', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const token_info = req.token_info
  const cur_page = req.body.cur_page ? req.body.cur_page:'1'
  const list_count = req.body.list_count ? req.body.list_count:''
  const status = req.body.status ? req.body.status:''
  const search_type = req.body.search_type
  const keyword = req.body.keyword ? req.body.keyword:''
  const project_seq = req.body.project_seq ? req.body.project_seq:''

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
  const project_info = await ProjectService.getProjectInfo(DBMySQL, start, end, status, search_type, keyword, project_seq)

  const output = new StdObject()
  output.add('project_info', project_info.project_info)
  // output.add('paging', )

  totalCount = project_info.paging;

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

// DIVISION
// 분류생성
routes.post('/createdivision', Auth.isAuthenticated(Role.ADMIN), async (req, res) => {
  const request_body = req.body ? req.body : null;
  let result = null;

  const token_info = req.token_info
  const reg_member_seq = request_body.reg_member_seq // 수정자 회원번호

  if (request_body.division_name) {
    result = await ProjectService.createDivision(request_body);
    // if (result.error === 0){
    //   MemberLogService.createMemberLog(req, result.seq, reg_member_seq, '1001', 'ok');
    // } else {
    //   MemberLogService.createMemberLog(req, result.seq, reg_member_seq, '9998', result.message);
    // }
    res.json(result);
  } else {
    const out = new StdObject(-1, '등록된 값이 없습니다.', 404);
    res.json(out);
  }
});

// 분류업데이트
routes.post('/:division_seq(\\d+)/updatedivision', async (req, res) => {
  const division_seq = Util.parseInt(req.params.division_seq)
  if (division_seq < 0) {
    const out = new StdObject(-1, '잘못된 분류 입니다.', 404);
    // MemberLogService.createMemberLog(req, result.seq, result.seq, '9998', '잘못된 사용자 입니다.');
    res.json(out);
    return;
  }
  const request_body = req.body ? req.body : null;
  const reg_member_seq = request_body.reg_member_seq // 수정자 회원번호
  let result = null;
  if (request_body.division_name) {
    result = await ProjectService.updateDivision(division_seq, request_body);
    // MemberLogService.createMemberLog(req, project_seq, reg_member_seq, '1002', result.message);
    res.json(result);
  } else {
    const out = new StdObject(-1, '등록된 값이 없습니다.', 404);
    res.json(out);
  }
});

// 분류정보 
routes.post('/division', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const token_info = req.token_info
  const dmode = req.body.dmode ? req.body.dmode: ''
  const project_seq = req.body.project_seq ? req.body.project_seq: ''
  const parent_division_seq = req.body.parent_division_seq ? req.body.parent_division_seq: ''
  const division_seq = req.body.division_seq ? req.body.division_seq: ''

  console.log(`[project.js-project_seq]===${project_seq}`)
  const division_info = await ProjectService.getDivision(DBMySQL, dmode, project_seq, parent_division_seq, division_seq)
  const output = new StdObject()
  output.add('division_info', division_info.division_info)
  //output.add('paging', )

  res.json(output)
}))

// 분류정보-List,one
routes.post('/divisioninfo', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const token_info = req.token_info
  const cur_page = req.body.cur_page ? req.body.cur_page:'1'
  const list_count = req.body.list_count ? req.body.list_count:'20'
  const is_used = req.body.is_used
  const search_type = req.body.search_type
  const keyword = req.body.keyword ? req.body.keyword:''
  const project_seq = req.body.project_seq ? req.body.project_seq:''
  const division_seq = req.body.division_seq ? req.body.division_seq:''

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
  const division_info = await ProjectService.getDivisionInfo(DBMySQL, start, end, is_used, search_type, keyword, project_seq, division_seq)
  const output = new StdObject()
  output.add('division_info', division_info.division_info) // 분류리스트
  // output.add('paging', )

  totalCount = division_info.paging; // 페이징정보

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

// 분류 사용여부 업데이트
routes.post('/setdivisiondata',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const req_body = req.body ? req.body : {};
  // logger.debug('setusersdata', req_body);
  const output = new StdObject(0, 'data', 200);
  const result = await ProjectService.updateDivisionUsed(DBMySQL, req_body);
  
  const token_info = req.token_info
  const mod_member_seq = token_info.id
  let seq = ''

  for (const key of Object.keys(req.body.params.divisions)) {
    seq += `${req.body.params.divisions[key]}/`;
  }
  seq += `used=${req.body.params.used}`

  //MemberLogService.createMemberLog(req, 0, mod_member_seq, '1002', seq);
  
  if (result.error !== 0){
    output.error = result.error
    output.message = result.message
  }
  res.json(output)
}));
// 분류삭제
routes.post('/deldivision',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const req_body = req.body ? req.body : {};
  const output = new StdObject(0, 'data', 200);
  const result = await ProjectService.deleteDivision(DBMySQL, req_body);
  if (result.error !== 0){
    output.error = result.error
    output.message = result.message
  }
  res.json(output)
}));


// CLASS
// 클래스생성
routes.post('/createclass', Auth.isAuthenticated(Role.ADMIN), async (req, res) => {
  const request_body = req.body ? req.body : null;
  let result = null;

  const token_info = req.token_info
  const reg_member_seq = request_body.reg_member_seq // 수정자 회원번호

  if (request_body.class_name) {
    result = await ProjectService.createClass(request_body);
    // if (result.error === 0){
    //   MemberLogService.createMemberLog(req, result.seq, reg_member_seq, '1001', 'ok');
    // } else {
    //   MemberLogService.createMemberLog(req, result.seq, reg_member_seq, '9998', result.message);
    // }
    res.json(result);
  } else {
    const out = new StdObject(-1, '등록된 값이 없습니다.', 404);
    res.json(out);
  }
});
// 클래스업데이트
routes.post('/:class_seq(\\d+)/updateclass', async (req, res) => {
  const class_seq = Util.parseInt(req.params.class_seq)
  if (class_seq < 0) {
    const out = new StdObject(-1, '잘못된 클래스 입니다.', 404);
    // MemberLogService.createMemberLog(req, result.seq, result.seq, '9998', '잘못된 사용자 입니다.');
    res.json(out);
    return;
  }
  const request_body = req.body ? req.body : null;
  const reg_member_seq = request_body.reg_member_seq // 수정자 회원번호
  let result = null;
  if (request_body.class_name) {
    result = await ProjectService.updateClass(class_seq, request_body);
    // MemberLogService.createMemberLog(req, project_seq, reg_member_seq, '1002', result.message);
    res.json(result);
  } else {
    const out = new StdObject(-1, '등록된 값이 없습니다.', 404);
    res.json(out);
  }
});

// 클래스정보-List,one
routes.post('/classinfo', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const token_info = req.token_info
  const cur_page = req.body.cur_page ? req.body.cur_page:'1'
  const list_count = req.body.list_count ? req.body.list_count:'20'
  const is_used = req.body.is_used
  const search_type = req.body.search_type
  const keyword = req.body.keyword ? req.body.keyword:''
  const project_seq = req.body.project_seq ? req.body.project_seq:''
  const class_seq = req.body.class_seq ? req.body.class_seq:''

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
  const class_info = await ProjectService.getClassInfo(DBMySQL, start, end, is_used, search_type, keyword, project_seq, class_seq)
  // console.log(`class_seq===${class_seq}`)
  const output = new StdObject()
  output.add('class_info', class_info.class_info) // 클래스리스트 정보
  // output.add('paging', )

  totalCount = class_info.paging; // 페이징정보

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
// 클래스 사용여부 업데이트
routes.post('/setclassdata',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const req_body = req.body ? req.body : {};
  // logger.debug('setusersdata', req_body);
  const output = new StdObject(0, 'data', 200);
  const result = await ProjectService.updateClassUsed(DBMySQL, req_body);
  
  const token_info = req.token_info
  const mod_member_seq = token_info.id
  let seq = ''

  for (const key of Object.keys(req.body.params.classes)) {
    seq += `${req.body.params.classes[key]}/`;
  }
  seq += `used=${req.body.params.used}`

  // MemberLogService.createMemberLog(req, 0, mod_member_seq, '1002', seq);
  
  if (result.error !== 0){
    output.error = result.error
    output.message = result.message
  }
  res.json(output)
}));
// 클래스삭제
routes.post('/delclass',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const req_body = req.body ? req.body : {};
  const output = new StdObject(0, 'data', 200);
  const result = await ProjectService.deleteClass(DBMySQL, req_body);
  if (result.error !== 0){
    output.error = result.error
    output.message = result.message
  }
  res.json(output)
}));

export default routes
