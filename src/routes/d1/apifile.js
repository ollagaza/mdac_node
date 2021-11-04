import { Router } from 'express'
import Wrap from '../../utils/express-async'
import StdObject from '../../wrapper/std-object'
// import DBMySQL from '../../database/knex-mysql'
// import AuthService from '../../service/member/AuthService'
// import MemberService from '../../service/member/MemberService'
// import MemberLogService from '../../service/member/MemberLogService'
import FileService from '../../service/file/FileService'
import ProjectService from '../../service/project/ProjectService'
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

routes.get('/', Wrap(async (req, res) => {
  req.accepts('application/json');
  const output = new StdObject(0, 'data', 200);
  res.json(output);
}))

// uploadOrgFile
routes.post('/uploadorgfile', upload.array('uploadFile'), Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res, next) => {
  // req.accepts('application/json');
  // pseq(project_seq), dseq(divisino_seq)
  try{
    if (!req.files) {
      console.log('not files');
      const output = new StdObject(-1, 'not exist files', 200);
      // output.add('data', '');
      res.json(output);
    } else {
      // save path - {root}/uploads/{분류}/{날짜}/{파일이름}
      const body = req.body;
      const files = req.files;
      console.log('pseq:' + body.pseq);
      console.log('dseq:' + body.dseq);
      if (Array.isArray(files)) {
        const newDir = path.resolve("./") + '/uploads/' + body.dseq + '/' + datautil.getToday();
        for (let f in files) {
          console.log(files[f]);
          // console.log(files[f].originalname);
          // console.log(files[f].filename);
          // console.log(files[f].mimetype);
          // console.log(files[f].size);
          // console.log(files[f].path);
          // console.log(files[f].destination);
          const filetype = files[f].mimetype.split('/');
          let filetypecode = '';
          console.log(filetype[0]);
          if (filetype[0] == 'image') {
            filetypecode = 'i';
          } else if (filetype[0] == 'video') {
            filetypecode = 'v';
          }

          const newFilePath = newDir + '/' + files[f].filename;
          await baseutil.createDirectory(newDir);
          baseutil.renameFile(files[f].path, newFilePath);
          await FileService.createOrgFile(body.pseq, body.dseq, filetypecode, newDir + '/', files[f].filename, files[f].originalname, files[f].size);
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
  console.log('===downloadorgfile===');
  req.accepts('application/json');
  try {
    const body = req.body;
    console.log('fseq:' + body.fseq);
    const file_info = await FileService.getOrgFile(body.fseq);
    console.log(file_info);
    fs.readFile(file_info.file_path + '/' + file_info.file_name, (err, data) => {
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
routes.post('/uploadresfiles', upload.array('uploadFile'), Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res, next) => {
  // pseq(project_seq), dseq(division_seq), jseq(job_seq), fseq(file_seq), cseq(class_seq)
  try {
    if (!req.files) {
      console.log('not files');
      const output = new StdObject(-1, 'not exist files', 200);
      res.json(output);
    } else {
      // save path - {root}/uploads/result/{분류}/{날짜}/{파일이름}
      const body = req.body;
      const files = req.files;
      // get result_file_pair_key
      let pairKey = 1;
      let maxPairKey = await FileService.getMaxResFileParkKey();
      if (maxPairKey && maxPairKey.val) {
        pairKey = maxPairKey.val + 1;
      }

      if (Array.isArray(files)) {
        const newDir = path.resolve("./") + '/uploads/result/' + body.dseq + '/' + datautil.getToday();
        console.log('newDir:' + newDir);
        console.log('files length: ' + files.length);
        for (let f in files) {
          let filetype = '';
          const fileext = files[f].originalname.split('.');
          if (fileext[1] == "jpg" || fileext[1] == "jpeg" || fileext[1] == "png") {
            filetype = 'i';
          } else if (fileext[1] == "xml") {
            filetype = 'x';
          }

          const newFilePath = newDir + '/' + files[f].filename;
          await baseutil.createDirectory(newDir);
          baseutil.renameFile(files[f].path, newFilePath);          
          console.log(files[f].filename);
          console.log(files[f].originalname);
          // insert to result_file table
          let rseq = await FileService.createResultFile(body.fseq, body.jseq, filetype, files[f].filename, pairKey, files[f].originalname, newDir + '/', files[f].size);
        }
        // insert to job_workder table - A2(라벨링 완료)
        await ProjectService.createJobWorker(body.pseq, body.jseq, pairKey, body.cseq, 'A', 'A2', body.mseq, null, null, null);
        // update job status
        await ProjectService.setJobStatusByWorkerCnt(body.jseq, 'A2');
      }

      const output = new StdObject(0, 'success', 200);
      output.add('data', '');
      res.json(output);
    }
  } catch (e) {
    logger.error('/apifile/uploadresfiles', e)
    if (e.error < 0) {
      throw new StdObject(e.error, e.message, 200)
    } else {
      throw new StdObject(-1, '', 200)
    }
  }

}))

// single original file download
routes.post('/downloadresfile', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
  req.accepts('application/json');
  try {
    const body = req.body;
    const fseq = body.file_seq;
    const file_info = await FileService.getResFileBySeq(fseq);
    fs.readFile(file_info.file_path + file_info.file_name, (err, data) => {
      if (err) {
        return next(err);
      }
      res.setHeader('Content-disposition', 'attachment; filename="' + file_info.org_file_name + '"');
      res.setHeader('Content-Length', file_info.file_size);
      res.send(data);
    })
  } catch (e) {
      logger.error('/apifile/downloadresfile', e)
      if (e.error < 0) {
          throw new StdObject(e.error, e.message, 200)
      } else {
          throw new StdObject(-1, '', 200)
      }
  }
}))

// downloadLabelingFile - multifile??
routes.post('/downloadresfiles', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
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
      logger.error('/apifile/downloadresfiles', e)
      if (e.error < 0) {
          throw new StdObject(e.error, e.message, 200)
      } else {
          throw new StdObject(-1, '', 200)
      }
  }
}))

routes.post('/setresfiledata', Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res) => {
  req.accepts('application/json');
  try {
    const body = req.body;
    const pseq = body.project_seq;
    const fseq = body.file_seq;
    const jseq = body.job_seq;
    const mseq = body.member_seq;
    const data = body.res_data;
    const status = 'A2';
    let pairkey = 1;
    let maxPairKey = await FileService.getMaxResFileParkKey();
    if (maxPairKey && maxPairKey.val) {
      pairkey = maxPairKey.val + 1;
    }
    
    console.log('pairkey: ' + pairkey);
    let result = await FileService.createResultFileData(fseq, jseq, mseq, pairkey, data, status);
    result = await ProjectService.createJobWorker(pseq, jseq, pairkey, -1, 'A', status, mseq, null, null, null);
    // update job status
    // result = await ProjectService.setJobStatusByWorkerCnt(jseq, status);
    result = await ProjectService.setJobStatus(jseq, status);
    if (result != null && result > 0) {            
      const output = new StdObject(0, 'success', 200, result);
      res.json(output);
    } else {
        throw new StdObject(-1, 'failed set', 200);
    }
  } catch(e) {
    logger.error('/apifile/setresfiledata', e)
    if (e.error < 0) {
        throw new StdObject(e.error, e.message, 200)
    } else {
        throw new StdObject(-1, '', 200)
    }
  }
}))

routes.get('/test', Wrap(async (req, res) => {
  req.accepts('application/json');
  try {
    let max = await FileService.getMaxResFileParkKey();
    console.log('max:' + max.val);
    let pairKey = max.val + 1;
    console.log('parikey:' + pairKey);

    const output = new StdObject(0, 'success', 200, max);
    res.json(output);
  } catch (e) {
    if (e.error < 0) {
      throw new StdObject(e.error, e.message, 200)
  } else {
      throw new StdObject(-1, '', 200)
  }
  }
}))

export default routes