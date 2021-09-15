import { Router } from 'express'
import Wrap from '../../utils/express-async'
import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
// import AuthService from '../../service/member/AuthService'
// import MemberService from '../../service/member/MemberService'
// import MemberLogService from '../../service/member/MemberLogService'
import ProjectService from '../../service/project/ProjectService'
import logger from '../../libs/logger'
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'


const routes = Router()

routes.get('/', Wrap(async (req, res) => {
  req.accepts('application/json')
  const output = new StdObject(0, 'data', 200)
  res.json(output)
}))

// getProject
routes.get('/getproject', Wrap(async (req, res) => {
    req.accepts('application/json')
    try{
        const result = await ProjectService.GetProject(DBMySQL)
        const output = new StdObject(0, result, 200)
        res.json(output)
    } catch (e) {
        logger.error('/apiproject/getproject', e)
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200)
        } else {
            throw new StdObject(-1, '', 200)
        }
    }
}))

// getDivision
routes.get('/getdivision', Wrap(async (req, res) => {
    req.accepts('application/json')
    try{
        const project_seq = 1;
        const result = await ProjectService.GetDivision(DBMySQL, project_seq)
        const output = new StdObject(0, result, 200)
        res.json(output)
    } catch (e) {
        logger.error('/apiproject/getdivision', e)
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200)
        } else {
            throw new StdObject(-1, '', 200)
        }
    }
}))

// getOrgFile
// getLabelingFile
// getWorkItem
// setCheckResult
// getLabelingClass

export default routes