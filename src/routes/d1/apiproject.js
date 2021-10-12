import { Router } from 'express'
import Wrap from '../../utils/express-async'
import StdObject from '../../wrapper/std-object'
// import DBMySQL from '../../database/knex-mysql'
// import AuthService from '../../service/member/AuthService'
// import MemberService from '../../service/member/MemberService'
// import MemberLogService from '../../service/member/MemberLogService'
import ProjectService from '../../service/project/ProjectService'
import logger from '../../libs/logger'
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'
import { wrap } from 'lodash'


const routes = Router()

routes.get('/', Wrap(async (req, res) => {
  req.accepts('application/json')
  const output = new StdObject(0, 'data', 200)
  res.json(output)
}))

// getProject
routes.get('/getproject', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    req.accepts('application/json');
    const token_info = req.token_info
    try{
        const result = await ProjectService.getProjects()
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
    // pseq(project_seq)
    req.accepts('application/json');
    try{
        const project_seq = req.query.pseq;
        const result = await ProjectService.getDivisions(project_seq);
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
routes.get('/getorgfile', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    // dseq(division_seq)
    req.accepts('application/json');
    try{
        const division_seq = req.query.dseq; // division seq
        const result = await ProjectService.getOrgFilesByDivisionseq(division_seq)
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

// getLabelingFile - result
routes.get('/getresfile', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    // jseq(job_seq)
    req.accepts('application/json');
    try{
        const job_seq = req.query.jseq;
        const result = await ProjectService.getResFilesByJobseq(job_seq)
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

// get jobworker list
routes.get('/getjobworkers', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    // pseq(project_seq), jseq(job_seq)
    req.accepts('application/json');
    try {
        const project_seq = req.query.pseq;
        const job_seq = req.query.jseq;
        if (project_seq != null && project_seq != '') {
            console.log('getJobWorkersByProjectseq');
            const result = await ProjectService.getJobWorkersByProjectseq(project_seq);
            const output = new StdObject(0, 'success', 200, result);
            res.json(output);
        } else if (job_seq != null && job_seq != '') {
            console.log('getJobWorkersByJobseq');
            const result = await ProjectService.getJobWorkersByJobseq(job_seq);
            const output = new StdObject(0, 'success', 200, result);
            res.json(output);
        } else {
            throw new StdObject(-1, 'no params', 200)
        }
    } catch (e) {
        logger.error('/apiproject/getjobworkers', e)
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200)
        } else {
            throw new StdObject(-1, '', 200)
        }
    }
}))

// create jobworker
routes.post('/addjobworker', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    req.accepts('application/json');
    try {   
        const body = req.body;
        await ProjectService.createJobWorker(body.project_seq, body.job_seq, body.result_file_pair_key, body.class_seq, body.job_name, body.job_status, body.job_member_seq, body.job_date, body.reject_date, body.reg_member_seq);

    } catch (e) {

    }

}))



// getWorkItem - work count, file, class
// setCheckResult
// getLabelingClass

export default routes