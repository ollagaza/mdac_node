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


const routes = Router()

routes.get('/projectlist', Wrap(async (req, res) => {
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

routes.get('/statuslist', Wrap(async (req, res) => {
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


routes.get('/getfirstdiv/:pro_seq', Wrap(async (req, res) => {
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

routes.post('/getdivsion/:pro_seq', Wrap(async (req, res) => {
  req.accepts('application/json')
  const pro_seq = req.params.pro_seq;
  const req_body = req.body ? req.body : {};
  logger.debug(req_body);
  let div_seq = '0';
  if (req_body.div_seq) {
    div_seq = req_body.div_seq;
  }
  logger.debug(div_seq);
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

routes.get('/statusclass/:seq', Wrap(async (req, res) => {
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

routes.post('/getworker', Wrap(async (req, res) => {
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

routes.post('/getjob/:pro_seq/:div_seq', Wrap(async (req, res) => {
  req.accepts('application/json')
  const pro_seq = req.params.pro_seq;
  const div_seq = req.params.div_seq;
  const req_body = req.body;
  logger.debug('l list', pro_seq, div_seq)
  const result = await DatastatusService.getJobList(DBMySQL, pro_seq, div_seq, req_body);
  const output = new StdObject(0, '', 200)
  if (result.error === 0){
    output.add('list', result.data);
  } else {
    output.error = result.error;
    output.message = result.message;
  }

  res.json(output)

}))






export default routes
