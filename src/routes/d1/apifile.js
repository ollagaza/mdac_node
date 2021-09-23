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

// uploadOrgFile
routes.post('/uploadorgfile', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
  req.accepts('application/json')
  try{
      // const project_seq = req.query.pseq;
      // console.log(project_seq);

      // const result = await ProjectService.GetDivisions(DBMySQL, project_seq);
      const output = new StdObject(0, 'success', 200);
      output.add('data', '');
      res.json(output);
  } catch (e) {
      logger.error('/apifile/uploadorgfile', e)
      if (e.error < 0) {
          throw new StdObject(e.error, e.message, 200)
      } else {
          throw new StdObject(-1, '', 200)
      }
  }
}))

// downloadOrgFile
// uploadLabelingFile
// downloadLabelingFile

export default routes