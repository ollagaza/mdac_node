/*
=======================================
'	파일명 : StatisticsService.js
'	작성자 : djyu
'	작성일 : 2021.10.01
'	기능   : 통계 service
'	=====================================
*/
import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import StatisticsModel from '../../database/mysql/statistics/StatisticsModel'
import Util from '../../utils/baseutil'
import ServiceConfig from '../service-config'
import JsonWrapper from '../../wrapper/json-wrapper'
import logger from '../../libs/logger'

const StatisticsServiceClass = class {
  constructor() {

  }

  GetStatisticsModel = (database = null) => {
    if (database) {
      return new StatisticsModel(database);
    }
    return new StatisticsModel(DBMySQL);
  }

  getStatistics = async (database, search_seq, project_seq, search_type, start_date, end_date, worker) => {
    const statistics_model = this.GetStatisticsModel(database)
    const statistics_info = await statistics_model.getStatistics(search_seq, project_seq, search_type, start_date, end_date, worker)
    
    return statistics_info
  }

  getTest = async (database) => {
    const statistics_model = this.GetStatisticsModel(database)
    const statistics_info = await statistics_model.getTest()
    
    return statistics_info
  }
}

const statistics_service = new StatisticsServiceClass()

export default statistics_service
