import path from 'path'
import os from 'os'
import config from '../config/config'

const LOCAL = 'local';

let TOKEN_SECRET = 'aiqkdkcntkdjq'//'dpxldlwlTjwlqnr'
if (config.isRelease()) {
  TOKEN_SECRET = 'aiqkdncjtkdjq'//'dpaxldlwl.surgstory.com'
}
let DIRECTORY_SEPARATOR = '/';
const osType = os.type().toLowerCase();
if (osType.indexOf('window') > -1) {
  DIRECTORY_SEPARATOR = '\\';
}

const FileUPing = 0; // 업로드중
const FileUPdone = 1;// 업로드완료
const FileTransStart = 2;// 변환 시작
const FileTrans = 3;// 변환 중
const FileDone = 11;// 변환완료
const FileErr = 90;// 에러

const FFMPEG_EXE = 'D:\\ffmpeg\\ffmpeg-4.3.1-2020-11-19-full_build-shared\\bin\\ffmpeg';

export default {
  'LOCAL': LOCAL,
  'TOKEN_SECRET': TOKEN_SECRET,
  'SP': DIRECTORY_SEPARATOR,
  FileUPing,
  FileUPdone,
  FileTransStart,
  FileTrans,
  FileDone,
  FileErr,
  FFMPEG_EXE
}

