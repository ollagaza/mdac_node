import { Router } from 'express'
import Wrap from '../../utils/express-async'
import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import logger from '../../libs/logger'
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'
import AdminMemberService from '../../service/member/AdminMemberService'
import MemberService from '../../service/member/MemberService'
import MemberLogService from "../../service/member/MemberLogService"

const routes = Router()

routes.post('/getuserlist',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')
  const req_body = req.body ? req.body : {};
  // logger.debug(req_body);
  const output = new StdObject()
  const user_info_list =  await AdminMemberService.getMemberList(DBMySQL, req_body.searchObj, req_body.page_navigation);
  if (user_info_list.error !== -1) {
    output.add('user_data', user_info_list)
    output.add('searchObj', req_body.searchOb)
    res.json(output)
  } else {
    res.json(user_info_list)
  }
}))
routes.post('/getuserinfo',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')
  const req_body = req.body ? req.body : {};
  // logger.debug(req_body);
  // logger.debug(req_body.searchObj[0].user_id);
  const output = new StdObject()
  const user_info =  await MemberService.getMemberInfo(DBMySQL, req_body.member_seq);
  output.add('user_info', user_info)
  res.json(output)
}))

routes.get('/getindexdata',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  const result_user_co = await MemberService.MemberCount(DBMySQL);
  const result_plant_co = await MyplantService.PlantCount(DBMySQL);
  const result_member_list = await MemberService.Member_1(DBMySQL);
  // logger.debug(result_member_list);
  const result_plant_list = await MyplantService.PlantList(DBMySQL);
  // logger.debug(result_plant_list);
  const out = new StdObject();
  out.add('userco', result_user_co);
  out.add('plantco', result_plant_co);
  out.add('member_list', result_member_list);
  out.add('plant_list', result_plant_list);
  res.json(out);
}))


routes.post('/delusers',  Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const req_body = req.body ? req.body : {};
  const output = new StdObject(0, 'data', 200);
  const result = await AdminMemberService.deleteUser(DBMySQL, req_body);
  if (result.error !== 0){
    output.error = result.error
    output.message = result.message
  }
  res.json(output)
}));
  
export default routes
