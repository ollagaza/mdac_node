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
  req.accepts('application/json');
  const output = new StdObject(0, 'data', 200);
  res.json(output);
}))

// getProject
routes.get('/getproject', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    req.accepts('application/json');
    const token_info = req.token_info;
    try{
        const result = await ProjectService.getProjects();
        // const output = new StdObject(0, 'success', 200, result)
        const output = new StdObject(0, 'success', 200);
        output.add('data', result);
        res.json(output);
    } catch (e) {
        logger.error('/apiproject/getproject', e);
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200);
        } else {
            throw new StdObject(-1, '', 200);
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
        logger.error('/apiproject/getdivision', e);
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200);
        } else {
            throw new StdObject(-1, '', 200);
        }
    }
}))

// getOrgFile
routes.get('/getorgfile', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    // dseq(division_seq)
    req.accepts('application/json');
    try{
        const division_seq = req.query.dseq; // division seq
        const result = await ProjectService.getOrgFilesByDivisionseq(division_seq);
        // const output = new StdObject(0, 'success', 200, result);
        const output = new StdObject(0, 'success', 200);
        output.add('data', result);
        res.json(output)
    } catch (e) {
        logger.error('/apiproject/getdivision', e);
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200);
        } else {
            throw new StdObject(-1, '', 200);
        }
    }
}))

// getLabelingFile - result
routes.get('/getresfile', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    // jseq(job_seq), file_seq
    req.accepts('application/json');
    try{
        const job_seq = req.query.jseq;
        const file_seq = req.query.fseq;
        if (job_seq != null && job_seq != '') {
            // by job_seq
            const result = await ProjectService.getResFilesByJobseq(job_seq);
            const output = new StdObject(0, 'success', 200);
            output.add('data', result);
            res.json(output);
        } else if (file_seq != null && file_seq != '') {
            // by file_seq
            const result = await ProjectService.getResFilesByFileseq(file_seq);
            const output = new StdObject(0, 'success', 200);
            output.add('data', result);
            res.json(output);
        } else {
            throw new StdObject(-1, 'no params', 200);
        }
    } catch (e) {
        logger.error('/apiproject/getdivision', e);
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200);
        } else {
            throw new StdObject(-1, '', 200);
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
            // const output = new StdObject(0, 'success', 200, result);
            const output = new StdObject(0, 'success', 200);
            output.add('data', result);
            res.json(output);
        } else if (job_seq != null && job_seq != '') {
            console.log('getJobWorkersByJobseq');
            const result = await ProjectService.getJobWorkersByJobseq(job_seq);
            // const output = new StdObject(0, 'success', 200, result);
            const output = new StdObject(0, 'success', 200);
            output.add('data', result);
            res.json(output);
        } else {
            throw new StdObject(-1, 'no params', 200);
        }
    } catch (e) {
        logger.error('/apiproject/getjobworkers', e);
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200);
        } else {
            throw new StdObject(-1, '', 200);
        }
    }
}))

// create jobworker
routes.post('/addjobworker', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    req.accepts('application/json');
    try {   
        const body = req.body;
        const result = await ProjectService.createJobWorker(body.project_seq, body.job_seq, body.result_file_pair_key, body.class_seq, body.job_name, body.job_status, body.job_member_seq, body.job_date, body.reject_date, body.reg_member_seq);
        const output = new StdObject(0, 'success', 200, 'res:' + result);
        res.json(output);
    } catch (e) {
        logger.error('/apiproject/addjobworker', e);
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200);
        } else {
            throw new StdObject(-1, '', 200);
        }
    }
}))

// getWorkItem - work count, file, class - 사용자 상태
// - job table - 
routes.get('/getmemberjoblist', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    req.accepts('application/json');
    try {
        // member seq, status: 없으면 라벨링 상태
        const member_seq = req.query.member_seq;
        const file_seq = req.query.file_seq;
        // const status = req.query.status.split(',');
        let arrStatus = [];
        if (req.query.status == null || req.query.status == '') {
            arrStatus.push('A0');
            arrStatus.push('A1');
        } else {
            arrStatus = req.query.status.split(',');
        }

        if (file_seq == null || file_seq == '') {
            const result = await ProjectService.getJobListByMemberseq(member_seq, arrStatus);
            const output = new StdObject(0, 'success', 200);
            output.add('data', result);
            res.json(output);
        } else {
            const result = await ProjectService.getJobListByMemberFile(member_seq, file_seq, arrStatus);
            const output = new StdObject(0, 'success', 200);
            output.add('data', result);
            res.json(output);
        }
    } catch (e) {
        logger.error('/apiproject/getmemberjoblist', e);
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200);
        } else {
            throw new StdObject(-1, '', 200);
        }
    }
}))

// setCheckResult - 검수 결과() 업데이트
routes.post('/setjobwokerstatus', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    req.accepts('application/json');
    // input : seq(job_worker), 작업상태(완료[2]/반려[5])
    try {   
        const body = req.body;
        const result = await ProjectService.setJobWorkerStatus(body.seq, body.job_status);
        if (result != null && result.error == 0) {            
            const output = new StdObject(0, 'success', 200, result);
            res.json(output);
        } else {
            throw new StdObject(-1, 'failed update', 200);
        }
    } catch (e) {
        logger.error('/apiproject/setjobwokerstatus', e)
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200);
        } else {
            throw new StdObject(-1, '', 200);
        }
    }
}))

// getLabelingClass
// - image - project 소속 class list
// - video - job에 지정된 class_seq single, multi: 미정 (안: project 소속 class list)
routes.get('/getjobclasslist', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    // type(1:image, 2:video), project_seq, jog_seq
    req.accepts('application/json');
    try {
        const type = req.query.type;
        if (type == 1) {
            // image - by project_seq
            const result = await ProjectService.getClassByProjectseq(req.query.project_seq);
            const output = new StdObject(0, 'success', 200);
            output.add('data', result);
            res.json(output);
        } else if (type == 2) {
            // video
            // get job data
            const job = await ProjectService.getJobByJobseq(req.query.job_seq);
            if (job == null) {
                throw new StdObject(-1, 'fault job_seq', 200);
            }

            // check class_seq of job table
            if (job.class_seq == -1) {
                // get class list by project_seq
                const result = await ProjectService.getClassByProjectseq(req.query.project_seq);
                const output = new StdObject(0, 'success', 200);
                output.add('data', result);
                res.json(output);
            } else {
                // return class_seq of job table
                const output = new StdObject(0, 'success', 200, 'res:' + job.class_seq); // 수정 필요
                res.json(output);
            }
        } else {
            throw new StdObject(-1, 'no type', 200);
        }
    } catch (e) {
        logger.error('/apiproject/getjobclasslist', e);
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200);
        } else {
            throw new StdObject(-1, '', 200);
        }
    }
}))

routes.get('/getmembers', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
    req.accepts('application/json');
    try {
        const result = await ProjectService.getMembers();
        const output = new StdObject(0, 'success', 200, result);
        res.json(output);
    } catch (e) {
        logger.error('/apiproject/getmembers', e);
        if (e.error < 0) {
            throw new StdObject(e.error, e.message, 200);
        } else {
            throw new StdObject(-1, '', 200);
        }
    }
}))

export default routes