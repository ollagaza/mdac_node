import { Router } from 'express'
import Wrap from '../../utils/express-async'
import Util from '../../utils/baseutil'
import StdObject from '../../wrapper/std-object'
import MemberService from "../../service/member/MemberService"
import MemberLogService from "../../service/member/MemberLogService"
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'
import DBMySQL from '../../database/knex-mysql'

const routes = Router()

routes.get('/verify/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  const result = await MemberService.verify(user_id);
  res.json(result);
});

routes.post('/createuser', Auth.isAuthenticated(Role.ADMIN), async (req, res) => {
  const request_body = req.body ? req.body : null;
  // console.log('createuser');
  // console.log(request_body);
  let result = null;

  const token_info = req.token_info
  const mod_member_seq = request_body.mod_member_seq

  if (request_body.user_id) {
    // console.log(request_body.user_id);
    result = await MemberService.createUser(request_body);
    // console.log(result);
    if (result.error === 0){
      MemberLogService.createMemberLog(req, result.seq, mod_member_seq, '1001', 'ok');
    } else {
      MemberLogService.createMemberLog(req, result.seq, mod_member_seq, '9998', result.message);
    }
    res.json(result);
  } else {
    const out = new StdObject(-1, '등록된 값이 없습니다.', 404);
    res.json(out);
  }
});

routes.post('/:member_seq(\\d+)/updateUser', async (req, res) => {
  const member_seq = Util.parseInt(req.params.member_seq)

  const mod_member_seq = req.body.mod_member_seq

  if (member_seq < 0) {
    const out = new StdObject(-1, '잘못된 사용자 입니다.', 404);
    MemberLogService.createMemberLog(req, result.seq, mod_member_seq, '9998', '잘못된 사용자 입니다.');
    res.json(out);
    return;
  }
  const request_body = req.body ? req.body : null;
  //console.log(request_body)
  let result = null;
  if (request_body.user_id) {
    result = await MemberService.updateUser(member_seq, request_body);
    MemberLogService.createMemberLog(req, member_seq, mod_member_seq, '1002', result.message);
    res.json(result);
  } else {
    const out = new StdObject(-1, '등록된 값이 없습니다.', 404);
    res.json(out);
  }
});

routes.get('/:member_seq(\\d+)/data', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  const token_info = req.token_info
  const member_seq = Util.parseInt(req.params.member_seq)
  if (!MemberService.checkMyToken(token_info, member_seq)) {
    throw new StdObject(-1, '잘못된 요청입니다.', 403)
  }

  // const user_data = await MemberService.getMemberMetadata(member_seq)
  const user_data = {data:"data"}
  const output = new StdObject()
  output.add('user_data', user_data)
  res.json(output)
}))

routes.get('/me', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
  req.accepts('application/json')
  const lang = Auth.getLanguage(req)
  const token_info = req.token_info
  const member_seq = token_info.getId()
  const member_info = await MemberService.getMemberInfoWithSub(DBMySQL, member_seq, lang)

  const output = new StdObject()
  output.add('member_info', member_info.member_info)
  output.add('member_sub_info', member_info.member_sub_info)

  res.json(output)
}))


routes.get('/userinfo', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const token_info = req.token_info
  const page = req.query.page ? req.query.page:'1'
  const ipp = req.query.ipp ? req.query.ipp:'20'
  const is_used = req.query.is_used ? req.query.is_used:''
  const search_type = req.query.search_type
  const keyword = req.query.keyword ? req.query.keyword:''
  const member_seq = req.query.member_seq ? req.query.member_seq:''

  // paging에 필요한 변수
  let totalCount = 0;
  let block = 10;
  let total_page = 0;
  let start = 0;
  let end = ipp;
  let start_page = 1;
  let end_page = block;

  start = (page - 1) * 10;
  start_page = Math.ceil(page / block);
  end_page = start_page * block;

  const member_info = await MemberService.getMemberInfoList(DBMySQL, start, end, is_used, search_type, keyword, member_seq)

  const output = new StdObject()
  output.add('member_info', member_info.member_info)
  //output.add('paging', )

  totalCount = member_info.member_paging;

  //totalCount = rows[1];
  total_page = Math.ceil(totalCount/ipp);

  if(total_page < end_page) end_page = total_page;

  let paging = {
    "totalCount":totalCount
    ,"total_page": total_page
    ,"page":page
    ,"start_page":start_page
    ,"end_page":end_page
    ,"ipp":ipp
  }
  output.add('paging', paging)

  res.json(output)
}))



routes.post('/userinfo', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  // const token_info = req.token_info
  const page = req.body.page ? req.body.page:'1'
  const ipp = req.body.ipp ? req.body.ipp:'20'
  const is_used = req.body.is_used ? req.body.is_used:''
  const search_type = req.body.search_type
  const keyword = req.body.keyword ? req.body.keyword:''
  const member_seq = req.body.member_seq ? req.body.member_seq:''

  // paging에 필요한 변수
  let totalCount = 0;
  let block = 10;
  let total_page = 0;
  let start = 0;
  let end = ipp;
  let start_page = 1;
  let end_page = block;

  start = (page - 1) * 10;
  start_page = Math.ceil(page / block);
  end_page = start_page * block;

  const member_info = await MemberService.getMemberInfoList(DBMySQL, start, end, is_used, search_type, keyword, member_seq)

  const output = new StdObject()
  output.add('member_info', member_info.member_info)
  //output.add('paging', )

  totalCount = member_info.member_paging;

  //totalCount = rows[1];
  total_page = Math.ceil(totalCount/ipp);

  if(total_page < end_page) end_page = total_page;

  let paging = {
    "totalCount":totalCount
    ,"total_page": total_page
    ,"page":page
    ,"start_page":start_page
    ,"end_page":end_page
    ,"ipp":ipp
  }
  output.add('paging', paging)

  res.json(output)
}))

routes.post('/find/id', Wrap(async (req, res) => {
  req.accepts('application/json')

  const output = await MemberService.findMemberId(DBMySQL, req.body)
  res.json(output)
}))

routes.post('/send_auth_code', Wrap(async (req, res) => {
  req.accepts('application/json')

  const output = await MemberService.sendAuthCode(DBMySQL, req.body)
  res.json(output)
}))

routes.post('/reset_password', Wrap(async (req, res) => {
  req.accepts('application/json')

  const output = await MemberService.resetPassword(DBMySQL, req.body)
  res.json(output)
}))

routes.post('/check_auth_code', Wrap(async (req, res) => {
  req.accepts('application/json')

  const output = await MemberService.checkAuthCode(DBMySQL, req.body)
  res.json(output)
}))

routes.post('/changePassword/:member_seq', Auth.isAuthenticated(Role.DEFAULT), Wrap(async (req, res) => {
  req.accepts('application/json')

  const token_info = req.token_info
  const member_seq = Util.parseInt(req.params.member_seq)

  if (!MemberService.checkMyToken(token_info, member_seq)) {
    throw new StdObject(-1, '잘못된 요청입니다.', 403)
  }
  const output = new StdObject()
  const is_change = await MemberService.changePassword(DBMySQL, member_seq, req.body, token_info.isAdmin())
  output.add('is_change', is_change)
  res.json(output)
}))

routes.post('/setusersdata',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const req_body = req.body ? req.body : {};
  // logger.debug('setusersdata', req_body);
  const output = new StdObject(0, 'data', 200);
  const result = await MemberService.updateUsersUsed(DBMySQL, req_body);
  
  const token_info = req.token_info
  const mod_member_seq = token_info.id
  let seq = ''

  for (const key of Object.keys(req.body.params.users)) {
    seq += `${req.body.params.users[key]}/`;
  }
  seq += `used=${req.body.params.used}`
  seq += `/reason=${req.body.params.reason}`

  MemberLogService.createMemberLog(req, 0, mod_member_seq, '1002', seq);
  
  if (result.error !== 0){
    output.error = result.error
    output.message = result.message
  }
  res.json(output)
}));

routes.post('/setuserdata/:member_seq',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const req_body = req.body ? req.body : {};
  // logger.debug(req_body);
  const member_seq = req.params.member_seq;
  const params = req_body.params;
  // logger.debug(params);
  const output = new StdObject()
  const result = await MemberService.updateUserUsed(DBMySQL, member_seq, params);
  if (result.error !== 0){
    output.error = result.error
    output.message = result.message
    output.httpStatusCode = 500
  }
  output.add('result', result);
  res.json(output)
}))
routes.post('/delusers',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const req_body = req.body ? req.body : {};
  const output = new StdObject(0, 'data', 200);
  const result = await MemberService.deleteUser(DBMySQL, req_body);
  if (result.error !== 0){
    output.error = result.error
    output.message = result.message
  }
  res.json(output)
}));

export default routes
