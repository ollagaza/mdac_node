import { Router } from 'express'
import Wrap from '../../utils/express-async'
import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import AuthService from '../../service/member/AuthService'
import MemberService from '../../service/member/MemberService'
import MemberLogService from '../../service/member/MemberLogService'
import logger from '../../libs/logger'
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'


const routes = Router()

routes.get('/', Wrap(async (req, res) => {
  req.accepts('application/json')
  const output = new StdObject(0, 'data', 200)
  res.json(output)
}))

// login
routes.post('/', Wrap(async (req, res) => {
    console.log('apiauth-test')
    req.accepts('application/json')
    try{
      const member_info = await AuthService.login(DBMySQL, req)
      const output = await Auth.getTokenResult(res, member_info, member_info.used_admin !== 'A' ? Role.MEMBER : Role.ADMIN)
  
      await MemberLogService.createMemberLog(req,  member_info.seq, '0000', 'apiauto_login')
      return res.json(output)
    } catch (e) {
      logger.error('/aipauth/', e)
      if (e.error < 0) {
        throw new StdObject(e.error, e.message, 200)
      } else {
        throw new StdObject(-1, '아이디 혹은 비밀번호가 일치하지 않습니다.<br/>입력한 내용을 다시 확인해 주세요.', 200)
      }
    }
}))

export default routes