// make by june
import { Router } from 'express'
import Util from '../../utils/baseutil'
import StdObject from '../../wrapper/std-object'
import ProjectService from "../../service/datamanager/ProjectService"
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'
import DBMySQL from '../../database/knex-mysql'
import Wrap from '../../utils/express-async';
import DatastatusService from "../../service/datamanager/DatastatusService";
import logger from "../../libs/logger";
import fs from "fs";


const routes = Router()

routes.get('/projectlist', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const result = await DatastatusService.getProject_List(DBMySQL);
  const output = new StdObject(0, '', 200)
  if (result.error === 0){
    output.add('list', result.data);
  } else {
    output.error = result.error;
    output.message = result.message;
  }

  res.json(output)
}))

routes.get('/statuslist', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const result = await DatastatusService.getProject_List(DBMySQL);
  const output = new StdObject(0, '', 200)
  if (result.error === 0){
    output.add('list', result.data);
  } else {
    output.error = result.error;
    output.message = result.message;
  }

  res.json(output)
}))


routes.get('/getfirstdiv/:pro_seq', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const pro_seq = req.params.pro_seq;
  const result = await DatastatusService.getFirstDivision(DBMySQL, pro_seq);
  const output = new StdObject(0, '', 200)
  if (result.error === 0){
    output.add('list', result.data);
  } else {
    output.error = result.error;
    output.message = result.message;
  }

  res.json(output)
}))

routes.post('/getdivsion/:pro_seq', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const pro_seq = req.params.pro_seq;
  const req_body = req.body ? req.body : {};
  // logger.debug(req_body);
  let div_seq = '0';
  if (req_body.div_seq) {
    div_seq = req_body.div_seq;
  }
  // logger.debug(div_seq);
  let is_used = 'A';
  if (req_body.is_used) {
    is_used = req_body.is_used;
  }
  const result = await DatastatusService.getDivision(DBMySQL, pro_seq, div_seq, is_used);
  const output = new StdObject(0, '', 200)
  if (result.error === 0){
    output.add('list', result.data);
  } else {
    output.error = result.error;
    output.message = result.message;
  }

  res.json(output)
}))

routes.post('/getdivsum/', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const output = new StdObject(0, '', 200)
  const req_body = req.body ? req.body : null;
  if (!req_body) {
    output.error = -1;
    output.message = '잘못된 파라메타 입니다.';
    return res.json(output)
  }
  const result = await DatastatusService.getDivSum(DBMySQL, req_body);
  if (result.data.error === 0){
    output.add('list', result.data.data);
    output.add('max', result.max.data);
  } else {
    output.error = result.error;
    output.message = result.message;
  }
  // logger.debug(result);
  res.json(output)
}))


routes.get('/statusclass/:seq', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const seq = req.params.seq;
  const result = await DatastatusService.getProject_Class(DBMySQL, seq);
  const output = new StdObject(0, '', 200)
  if (result.error === 0){
    output.add('list', result.data);
  } else {
    output.error = result.error;
    output.message = result.message;
  }

  res.json(output)
}))

routes.post('/getworker', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const result = await DatastatusService.getWokerList(DBMySQL);
  const output = new StdObject(0, '', 200)
  if (result.error === 0){
    output.add('list', result.data);
  } else {
    output.error = result.error;
    output.message = result.message;
  }

  res.json(output)
}))

routes.post('/getfilelist/:pro_seq/:div_seq', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const pro_seq = req.params.pro_seq;
  const div_seq = req.params.div_seq;
  const req_body = req.body;
  // logger.debug('l list', pro_seq, div_seq, req_body)
  const result = await DatastatusService.getFileList(DBMySQL, pro_seq, div_seq, req_body);
  const output = new StdObject(0, '', 200)
  if (result.error === 0){
    output.add('list', result.data);
    output.add('page_navigation', result.page_navigation);
    // logger.debug('page_navigation', result.page_navigation);
  } else {
    output.error = result.error;
    output.message = result.message;
  }
  // logger.debug('l list', result);
  res.json(output)
}))

routes.post('/getviewlist/:pro_seq/:div_seq', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const token_info = req.token_info
  if (!token_info){
    return new StdObject(-1, 'not login', 400);
  }
  const member_seq = token_info.getId()
  const pro_seq = req.params.pro_seq;
  const div_seq = req.params.div_seq;
  const req_body = req.body;
  const result = await DatastatusService.getFileView(DBMySQL, pro_seq, div_seq, req_body, member_seq);
  res.json(result)
}))

routes.post('/getclasslist/:pro_seq', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
  req.accepts('application/json')
  const pro_seq = req.params.pro_seq;
  const result = await DatastatusService.getClassList(DBMySQL, pro_seq);
  const output = new StdObject(0, '', 200)
  if (result.error === 0){
    output.add('list', result.data);
  } else {
    output.error = result.error;
    output.message = result.message;
  }

  res.json(output)
}))

routes.post('/setworkin/:pro_seq/:div_seq', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const token_info = req.token_info
  if (!token_info){
    return new StdObject(-1, 'not login', 400);
  }
  // logger.debug('setin');
  const member_seq = token_info.getId()
  const pro_seq = req.params.pro_seq;
  const div_seq = req.params.div_seq;
  const req_body = req.body ? req.body : null;
  if (!req_body) {
    return new StdObject(-1, '입력된 파라메타가 없습니다.', 200);
  }
  const result = await DatastatusService.setWorkIn(DBMySQL, pro_seq, div_seq, req_body, member_seq);
  const output = new StdObject(0, '', 200)
  if (result.error === 0){
    output.add('list', result.data);
  } else {
    output.error = result.error;
    output.message = result.message;
  }

  res.json(output)
}))

routes.post('/delwork/:pro_seq/:div_seq', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const token_info = req.token_info
  if (!token_info){
    return new StdObject(-1, 'not login', 400);
  }
  const member_seq = token_info.getId()
  const pro_seq = req.params.pro_seq;
  const div_seq = req.params.div_seq;
  const req_body = req.body ? req.body : null;
  if (!req_body) {
    return new StdObject(-1, '입력된 파라메타가 없습니다.', 200);
  }
  const result = await DatastatusService.delWork(DBMySQL, pro_seq, div_seq, req_body, member_seq);
  res.json(result);
}))

routes.get('/getimg/:seq/:isresult', async (req, res) => {
  const seq = req.params.seq;
  const isresult = req.params.isresult;
  const output = await DatastatusService.getImgBySeq(DBMySQL, seq, isresult);
  if (output.error === 0) {
    fs.readFile(output.img_path ,
      function (error, data) {
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end(data);
      }
    )
  } else {
    res.json(new StdObject(-1, '잘못된 데이타입니다.',404));
  }
});

routes.get('/getvideo/:seq/:isresult', async (req, res) => {
  const seq = req.params.seq;
  const isresult = req.params.isresult;
  const output = await DatastatusService.getImgBySeq(DBMySQL, seq, isresult);
  const file_mp4 = output.img_path; // 'E:\\temp\\datamanger\\1\\Clouds.mp4';//
  // output.error = 0;
  // logger.debug(file_mp4);
  if (output.error === 0) {
    const stat = fs.statSync(file_mp4)
    const fileSize = stat.size
    const range = req.headers.range
    // logger.debug(range)
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
      const chunksize = (end-start)+1;
      const file = fs.createReadStream(file_mp4, {start, end});
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(206, head)
      file.pipe(res)
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(200, head)
      fs.createReadStream(file_mp4).pipe(res)
    }
  } else {
    res.json(new StdObject(-1, '잘못된 데이타입니다.',404));
  }
});

routes.post('/getHis/:job_seq', Auth.isAuthenticated(Role.LOGIN_USER),  Wrap(async (req, res) => {
  req.accepts('application/json')
  const token_info = req.token_info
  if (!token_info){
    return new StdObject(-1, 'not login', 400);
  }
  const member_seq = token_info.getId()
  const job_seq = req.params.job_seq;
  const req_body = req.body ? req.body : null;
  if (!req_body) {
    return new StdObject(-1, '입력된 파라메타가 없습니다.', 200);
  }
  const result = await DatastatusService.getHis(DBMySQL, job_seq, req_body, member_seq);
  res.json(result);
}))

routes.get('/resultdown/:job_seq', Wrap(async (req, res) => {
  req.accepts('application/json')
  const job_seq = req.params.job_seq;
  // logger.debug(req.query);
  const req_body = req.query ? req.query : {file_type: 'i'};
  if (!req_body) {
    return new StdObject(-1, '입력된 파라메타가 없습니다.', 200);
  }
  const result = await DatastatusService.resultDown(DBMySQL, job_seq, req_body, res);
  if (result.error !== 0) {
    const output = new StdObject( result.error, result.message, 500);
    res.json(output);
  }
}))



export default routes
