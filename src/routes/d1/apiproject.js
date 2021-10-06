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
routes.get('/getproject', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    req.accepts('application/json')
    const token_info = req.token_info
    try{
        const result = await ProjectService.getProjects(DBMySQL)
        // const output = new StdObject(0, 'success', 200, result)
        const output = new StdObject(0, 'success', 200);
        output.add('data', result);
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
routes.get('/getdivision', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    req.accepts('application/json')
    try{
        const project_seq = req.query.pseq;
        const result = await ProjectService.getDivisions(DBMySQL, project_seq);
        // const output = new StdObject(0, 'success', 200, result);
        const output = new StdObject(0, 'success', 200);
        output.add('data', result);
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
routes.get('/getorgfile', Wrap(async (req, res) => {
    req.accepts('application/json')
    try{
        const division_seq = req.query.dseq; // division seq
        const result = await ProjectService.getOrgFiles(DBMySQL, division_seq)
        const output = new StdObject(0, 'success', 200, result)
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

// getLabelingFile
routes.get('/getlabelingfile', Wrap(async (req, res) => {
    req.accepts('application/json')
    try{
        const division_seq = req.query.dseq; // division seq
        const result = await ProjectService.getLabelingFiles(DBMySQL, division_seq)
        const output = new StdObject(0, 'success', 200, result)
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

// getWorkItem
// setCheckResult
// getLabelingClass

export default routes