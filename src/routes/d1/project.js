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

routes.post('/createproject', Auth.isAuthenticated(Role.ADMIN), async (req, res) => {
  const request_body = req.body ? req.body : null;
  let result = null;

  const token_info = req.token_info
  const reg_member_seq = request_body.reg_member_seq

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

routes.post('/:project_seq(\\d+)/updateproject', async (req, res) => {
  const project_seq = Util.parseInt(req.params.project_seq)
  if (project_seq < 0) {
    const out = new StdObject(-1, '잘못된 사용자 입니다.', 404);
    //MemberLogService.createMemberLog(req, result.seq, result.seq, '9998', '잘못된 사용자 입니다.');
    res.json(out);
    return;
  }
  const request_body = req.body ? req.body : null;
  const reg_member_seq = request_body.reg_member_seq
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

routes.post('/projectinfo', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const token_info = req.token_info
  const page = req.body.page ? req.body.page:'1'
  const ipp = req.body.ipp ? req.body.ipp:'20'
  const status = req.body.status ? req.body.status:''
  const search_type = req.body.search_type
  const keyword = req.body.keyword ? req.body.keyword:''
  const project_seq = req.body.project_seq ? req.body.project_seq:''

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
  const project_info = await ProjectService.getProjectInfo(DBMySQL, start, end, status, search_type, keyword, project_seq)

  const output = new StdObject()
  output.add('project_info', project_info.project_info)
  //output.add('paging', )

  totalCount = project_info.project_paging;

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

export default routes
