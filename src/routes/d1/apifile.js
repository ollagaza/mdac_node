import { Router } from 'express'
import Wrap from '../../utils/express-async'
import StdObject from '../../wrapper/std-object'
import DBMySQL from '../../database/knex-mysql'
import AuthService from '../../service/member/AuthService'
import MemberService from '../../service/member/MemberService'
import MemberLogService from '../../service/member/MemberLogService'
import logger from '../../libs/logger'
import Auth from '../../middlewares/auth.middleware'
import Role from '../../constants/roles'

const routes = Router()
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

routes.get('/', Wrap(async (req, res) => {
  req.accepts('application/json')
  const output = new StdObject(0, 'data', 200)
  res.json(output)
}))

// uploadOrgFile
routes.post('/uploadorgfile', upload.array('uploadFile'), Auth.isAuthenticated(Role.LOGIN_USER), Wrap(async (req, res, next) => {
  // Auth.isAuthenticated(Role.LOGIN_USER), 
  // req.accepts('application/json')
  try{
    if (!req.files) {
      console.log('not files');

      const output = new StdObject(-1, 'not exist files', 200);
      // output.add('data', '');
      res.json(output);
    } else {
      console.log('files');
      const files = req.files;
      if (Array.isArray(files)) {
        console.log('file size:' + files.length);
        for (let f in files) {
          // console.log(files[f]);
          console.log(files[f].originalname);
          console.log(files[f].filename);
          console.log(files[f].mimetype);
          console.log(files[f].size);
          // console.log(files[f].path);
          // console.log(files[f].destination);
        }
      }
    
      // let f1 = req.uploadFile;
      // f1.mv('./uploads/' + f1.name);
      // res.send({

      // });
      const output = new StdObject(0, 'success', 200);
      output.add('data', '');
      res.json(output);
    }

      // const project_seq = req.query.pseq;
      // console.log(project_seq);

      // const result = await ProjectService.GetDivisions(DBMySQL, project_seq);
      
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
// uploadLabelingFile
// downloadLabelingFile

export default routes