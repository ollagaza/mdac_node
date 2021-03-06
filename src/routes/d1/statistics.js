/*
=======================================
'	파일명 : statistics.js
'	작성자 : djyu
'	작성일 : 2021.10.01
'	기능   : 통계 route
'	=====================================
*/
import { Router } from 'express'
import Wrap from '../../utils/express-async'
import Util from '../../utils/baseutil'
import StdObject from '../../wrapper/std-object'
import StatisticsService from "../../service/statistics/StatisticsService"
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'
import DBMySQL from '../../database/knex-mysql'

const routes = Router()

// 통계 조회
routes.post('/', Auth.isAuthenticated(Role.ADMIN), Wrap(async (req, res) => {
  req.accepts('application/json')

  const token_info = req.token_info
  const search_seq = req.body.search_seq ? req.body.search_seq: '' // 1: 작업자 통계(라벨링) / 2: 작업자 통계(검수) / 3,4: 프로젝트 통계
  const project_seq = req.body.project_seq ? req.body.project_seq: ''
  const search_type = req.body.search_type ? req.body.search_type: ''
  const start_date = req.body.start_date ? req.body.start_date: ''
  const end_date = req.body.end_date ? req.body.end_date: ''
  const worker = req.body.worker ? req.body.worker: ''
  const status = req.body.status ? req.body.status: ''

  const project_info = await StatisticsService.getStatistics(DBMySQL, search_seq, project_seq, search_type, start_date, end_date, worker, status)
  const output = new StdObject()
  output.add('statistics_info', project_info.statistics_info[0][0]) // 통계 정보 - 프로시져 호출시 불필요한 값이 붙어서 제거하기 위함[0][0]...
  res.json(output)
  //res.json(project_info.statistics_info[0][0])
}))

export default routes
