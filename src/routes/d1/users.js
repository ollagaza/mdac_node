import { Router } from 'express'
import Wrap from '../../utils/express-async'
import Util from '../../utils/baseutil'
import StdObject from '../../wrapper/std-object'
import MemberService from "../../service/member/MemberService"
import MemberLogService from "../../service/member/MemberLogService"
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'
import DBMySQL from '../../database/knex-mysql'
import ServiceConfig from '../../service/service-config'
import { json } from 'body-parser'

const routes = Router()
const { PythonShell } = require('python-shell');

routes.get('/verify/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  const result = await MemberService.verify(user_id);
  res.json(result);
});

routes.post('/memtest', Auth.isAuthenticated(Role.ADMIN), async (req, res) => {
  
  const python_path = ServiceConfig.get('PYTHON_PATH') // 'D:/tmp' 

  // // python-shell 사용 시작
  // let options = {
  //   pythonPath: `${python_path}\\python`, // 'C:\\Users\\sdev\\AppData\\Local\\Programs\\Python\\Python310\\python', // Python의 경로를 나타낸다
  //   scriptPath: `${python_path}`, // "C:\\Users\\sdev\\AppData\\Local\\Programs\\Python\\Python310", // 파일 호출시 파일 위치
  //   args: ['파이썬쉘', '1004'],
  //   encoding: 'utf8'
  // };

  // // PythonShell.runString('x=1+1; print(x)', null, (err, msg) => {
  // PythonShell.run('test.py', options, (err, msg) => {
  // // PythonShell.runString('x=15+45; print(x); print("안녕하세요");', options, (err, msg) => {

  //   let data = msg[0].replace(`b\'`, '').replace(`\'`, ''); // 한글깨짐방지
  //   let buff = Buffer.from(data, 'base64'); // 한글깨짐방지
  //   let text = buff.toString('utf-8'); // 한글깨짐방지
  //   // const txtJson = text
  //   const txtJson = JSON.parse(text)
  //   const testStr = '{"result":"python-shell", "count":1}'
  //   const testString = JSON.parse(testStr)
  //   const output = new StdObject()
  //   output.add('pythonresult', txtJson)
  //   output.add('testresult', testString);
  //   res.json(output)
  // })
  // // python-shell 사용 종료

  // spawn 사용 시작
  const spawn = require('child_process').spawn;
  // const results = spawn('python', [`${path.resolve("./")}/uploads/test.py`, '이름', '20']); 
  // const results = spawn('python', ['../../test.py', '이름', '20']); 
  const command = `${python_path}\\python`; // 'C:\\Users\\sdev\\AppData\\Local\\Programs\\Python\\Python310\\python';
  const results = spawn(command, [`${python_path}\\test.py`, '파이썬데이터', '150']); 
  const output = new StdObject()
  results.stdout.on('data', (result)=>{ 
    let data = result.toString().replace(`b\'`, '').replace(`\'`, ''); // 한글깨짐방지
    let buff = Buffer.from(data, 'base64'); // 한글깨짐방지
    // buff = buff.toString().replace(/\"/gi,""); // 한글깨짐방지
    let text = buff.toString('utf-8'); // 한글깨짐방지
    const txtJson = JSON.parse(text)
    const testStr = '{"result":"spawn", "count":2}'
    const testString = JSON.parse(testStr)
    output.add('pythonresult', txtJson)
    output.add('testresult', testString);
    res.json(output)
  });
  results.stderr.on('data', (result) => {

    // res.json(`{${__dirname}\test.py}`)
    res.json(`error`) // `{${path.resolve("./")}/uploads/test.py}`
  });
  // spawn 사용 종료
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
    MemberLogService.createMemberLog(req, member_seq, mod_member_seq, '1002', JSON.stringify(request_body));
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
  const cur_page = req.query.cur_page ? req.query.cur_page:'1'
  const list_count = req.query.list_count ? req.query.list_count:''
  const is_used = req.query.is_used ? req.query.is_used:''
  const search_type = req.query.search_type
  const keyword = req.query.keyword ? req.query.keyword:''
  const member_seq = req.query.member_seq ? req.query.member_seq:''

  // paging에 필요한 변수
  let totalCount = 0;
  let page_count = 10;
  let total_page = 0;
  let start = 0;
  let end = list_count;
  let start_page = 1;
  let end_page = block;

  start = (cur_page - 1) * 10;
  start_page = Math.ceil(cur_page / page_count);
  end_page = start_page * page_count;

  const member_info = await MemberService.getMemberInfoList(DBMySQL, start, end, is_used, search_type, keyword, member_seq)

  const output = new StdObject()
  output.add('member_info', member_info.member_info)
  //output.add('paging', )

  totalCount = member_info.member_paging;

  //totalCount = rows[1];
  total_page = Math.ceil(totalCount/list_count);

  if(total_page < end_page) end_page = total_page;

  let paging = {
    "total_count":totalCount
    ,"cur_page": cur_page
    ,"page": cur_page
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



routes.post('/userinfo', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  // const token_info = req.token_info
  const cur_page = req.body.cur_page ? req.body.cur_page:'1'
  const list_count = req.body.list_count ? req.body.list_count:''
  const is_used = req.body.is_used ? req.body.is_used:''
  const search_type = req.body.search_type
  const keyword = req.body.keyword ? req.body.keyword:''
  const member_seq = req.body.member_seq ? req.body.member_seq:''

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
  const member_info = await MemberService.getMemberInfoList(DBMySQL, start, end, is_used, search_type, keyword, member_seq)

  const output = new StdObject()
  output.add('member_info', member_info.member_info)
  //output.add('paging', )

  totalCount = member_info.member_paging;

  //totalCount = rows[1];
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

routes.post('/history/:member_seq', Wrap(async (req, res) => {
  req.accepts('application/json')
  const output = new StdObject()

  const member_info = await MemberService.hisMember(DBMySQL, req.params.member_seq)

  output.add('member_info', member_info)

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

routes.post('/membercount',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const project_seq = req.body.project_seq ? req.body.project_seq: ''
  const start_date = req.body.start_date ? req.body.start_date: ''
  const end_date = req.body.end_date ? req.body.end_date: ''

  const member_info = await MemberService.MemberCount(DBMySQL, project_seq, start_date, end_date)
  const output = new StdObject()
  output.add('member_count', member_info.member_count[0][0]) // 멤버 카운팅 - 프로시져 호출시 불필요한 값이 붙어서 제거하기 위함[0][0]...
  res.json(output)
  //res.json(project_info.statistics_info[0][0])
}));

export default routes
