import { Router } from 'express'
import Wrap from '../../utils/express-async'
import StdObject from '../../wrapper/std-object'
import logger from '../../libs/logger'
import DBMySQL from "../../database/knex-mysql";
<<<<<<< HEAD
import fs from 'fs';
=======
>>>>>>> 2f6467e9af1401a91d29a4baf4010cc67056f9c6

const routes = Router()

routes.get('/', Wrap(async (req, res) => {
  req.accepts('application/json')
  const output = new StdObject(0, 'data', 200)
  res.json(output)
}))

routes.get('/page/:data', Wrap(async (req, res) => {
  req.accepts('application/json')
  const param_data = req.params.data;
<<<<<<< HEAD
  const data = [];
  for (let i = 0; i<100;i++){
    data.push({meta: i});
  }
  const result = data;//`return : ${param_data}`;
=======
  const result = `return : 12${param_data}`;
>>>>>>> 2f6467e9af1401a91d29a4baf4010cc67056f9c6
  const output = new StdObject(0, result, 200)
  res.json(output)
}))

<<<<<<< HEAD

routes.get('/stream/:data', Wrap(async (req, res) => {
  req.accepts('application/json')
  let param_data = req.params.data;
  if (!param_data){
    param_data='7.mp4';
  }
  const path_mp4 = 'D:\\avi\\';
  const file_mp4 = `${path_mp4}${param_data}`;

  const stat = fs.statSync(file_mp4)
  const fileSize = stat.size
  const range = req.headers.range
  logger.debug(range)
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
    const chunksize = (end-start)+1;
    const file = fs.createReadStream(file_mp4, {start, end});
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(file_mp4).pipe(res)
  }
}))




=======
>>>>>>> 2f6467e9af1401a91d29a4baf4010cc67056f9c6
export default routes
