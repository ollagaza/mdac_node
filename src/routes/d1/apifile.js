import { Router } from 'express'
import Wrap from '../../utils/express-async'
import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
// import AuthService from '../../service/member/AuthService'
// import MemberService from '../../service/member/MemberService'
// import MemberLogService from '../../service/member/MemberLogService'
import FileService from '../../service/file/FileService'
import logger from '../../libs/logger'
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'
import baseutil from '../../utils/baseutil'
import datautil from '../../utils/dateutil'

const routes = Router()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs');
const path = require('path');
// const root_path = require('app-root-path');

routes.get('/', Wrap(async (req, res) => {
  req.accepts('application/json');
  const output = new StdObject(0, 'data', 200);
  res.json(output);
}))

// uploadOrgFile
routes.post('/uploadorgfile', upload.array('uploadFile'), Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res, next) => {
  // Auth.isAuthenticated(Role.LOGIN_USER), 
  // req.accepts('application/json');
  try{
    if (!req.files) {
      console.log('not files');
      const output = new StdObject(-1, 'not exist files', 200);
      // output.add('data', '');
      res.json(output);
    } else {
      // save path - {root}/{분류}/{날짜}/{파일이름}
      const body = req.body;
      const files = req.files;
      if (Array.isArray(files)) {
        for (let f in files) {
          console.log(files[f]);
          // console.log(files[f].originalname);
          // console.log(files[f].filename);
          // console.log(files[f].mimetype);
          // console.log(files[f].size);
          // console.log(files[f].path);
          // console.log(files[f].destination);
          const newDir = path.resolve("./") + '/uploads/' + body.division_seq + '/' + datautil.getToday();
          const newFilePath = newDir + '/' + files[f].filename;
          baseutil.createDirectory(newDir);
          baseutil.renameFile(files[f].path, newFilePath);
          await FileService.createOrgFile(body.project_seq, body.division_seq, '', newFilePath, files[f].filename, files[f].originalname, files[f].size);
        }
      }

      const output = new StdObject(0, 'success', 200);
      output.add('data', '');
      res.json(output);
    } 
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
routes.post('/downloadorgfile', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
  req.accepts('application/json');
  try {
    const body = req.body;
    const fseq = body.file_seq;
    const file_info = await FileService.getOrgFile(fseq);
    // console.log(file_info);
    fs.readFile(file_info.file_path, (err, data) => {
      if (err) {
        return next(err);
      }
      res.setHeader('Content-disposition', 'attachment; filename="' + file_info.org_file_name + '"');
      res.setHeader('Content-Length', file_info.file_size);
      res.send(data);
    })
    // console.log(file_info.seq);
    
    // // res.setHeader('Content-type', );
    // res.setHeader('Content-Length', file_info.file_size);
    // var fielstream = fs.createReadStream(file_info.file_path);
    // fielstream.pipe(res);
    
    // fielstream.close();
    
    // const path = path.resolve("./") + '/' + file_info.file_path;
    // res.download(file_info.file_path, file_info.org_file_name, (err) => {
    //   if (err) {
    //     res.status(500).send({
    //       message: "File can not be downloaded: " + err,
    //     });
    //   }
    // });

    // const output = new StdObject(0, 'success', 200);
    // output.add('data', '');
    // res.json(output);
    
  } catch (e) {
      logger.error('/apifile/downloadorgfile', e)
      if (e.error < 0) {
          throw new StdObject(e.error, e.message, 200)
      } else {
          throw new StdObject(-1, '', 200)
      }
  }
}))

// uploadLabelingFile
routes.post('/uploadresfile', upload.array('uploadFile'), Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res, next) => {
  try {
    if (!req.files) {
      console.log('not files');
      const output = new StdObject(-1, 'not exist files', 200);
      // output.add('data', '');
      res.json(output);
    } else {
      // save path - {root}/{분류}/{날짜}/{파일이름}
      const body = req.body;
      const files = req.files;
      if (Array.isArray(files)) {
        for (let f in files) {
          console.log(files[f]);
          // get file path
          // 
          const newDir = '';
          const newFilePath = '';
          // baseutil.createDirectory(newDir);
          // baseutil.renameFile(files[f].path, newFilePath);
          // await FileService.createResultFile();
        }
      }
    }
  } catch (e) {
    logger.error('/apifile/uploadresfile', e)
    if (e.error < 0) {
      throw new StdObject(e.error, e.message, 200)
    } else {
      throw new StdObject(-1, '', 200)
    }
  }
}))

// single file
routes.post('/downloadresfile', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
  req.accepts('application/json');
  try {
    const body = req.body;
    const fseq = body.file_seq;
    const file_info = await FileService.getResFilesByFileseq(fseq);
    fs.readFile(file_info.file_path, (err, data) => {
      if (err) {
        return next(err);
      }
      res.setHeader('Content-disposition', 'attachment; filename="' + file_info.org_file_name + '"');
      res.setHeader('Content-Length', file_info.file_size);
      res.send(data);
    })
  } catch (e) {
      logger.error('/apifile/downloadorgfile', e)
      if (e.error < 0) {
          throw new StdObject(e.error, e.message, 200)
      } else {
          throw new StdObject(-1, '', 200)
      }
  }
}))

// downloadLabelingFile
routes.post('/downloadresfile', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
  req.accepts('application/json');
  try {
    const body = req.body;
    const fseq = body.file_seq;
    const files = await FileService.getResFilesByFileseq(fseq);
    console.log(files);
    for (let f in files) {
      fs.readFile(files[f].file_path, (err, data) => {
        if (err) {
          return next(err);
        }
        res.setHeader('Content-disposition', 'attachment; filename="' + files[f].org_file_name + '"');
        res.setHeader('Content-Length', files[f].file_size);
        res.send(data);
      })
    }
  } catch (e) {
      logger.error('/apifile/downloadorgfile', e)
      if (e.error < 0) {
          throw new StdObject(e.error, e.message, 200)
      } else {
          throw new StdObject(-1, '', 200)
      }
  }
}))

export default routes