import DBMySQL from '../../database/knex-mysql'
import log from '../../libs/logger'
import FileModel from '../../database/mysql/file/FileModel'
import ResultFileModel from '../../database/mysql/file/ResultFileModel'

const FileServiceClass = class {
    constructor() {
        this.log_prefix = '[FileServiceClass]'
    }

    getFileModel = (database = null) => {
        if (database) {
            return new FileModel(database);
        }
        return new FileModel(DBMySQL);
    }

    getResultFileModel = (database = null) => {
        if (database) {
            return new ResultFileModel(database);
        }
        return new ResultFileModel(DBMySQL);
    }

    getOrgFile = async(seq) => {
        const file_model = this.getFileModel(DBMySQL);
        const result = await file_model.getOrgFile(seq);
        return result;
    }

    getOrgFiles = async(division_seq) => {
        const file_model = this.getFileModel(DBMySQL);
        return file_model.getOrgFiles(division_seq);
    }

    getResFileBySeq = async(seq) => {
        const file_model = this.getResultFileModel(DBMySQL);
        return file_model.getResFileBySeq(seq);
    }

    getResFilesByFileseq = async(file_seq) => {
        const file_model = this.getResultFileModel(DBMySQL);
        return file_model.getResFilesByFileseq(file_seq);
    }

    getResFilesByJobseq = async(job_seq) => {
        const file_model = this.getResultFileModel(DBMySQL);
        return file_model.getResFilesByJobseq(job_seq)
    }

    createOrgFile = async (project_seq, division_seq, file_type, file_path, file_name, org_file_name, file_size) => {
        const file_model = this.getFileModel(DBMySQL);
        return file_model.createOrgFile(project_seq, division_seq, file_type, file_path, file_name, org_file_name, file_size);
    }

    createResultFile = async(file_seq, job_seq, file_type, file_name, pair_key, org_file_name, file_path, file_size) => {
        const file_model = this.getResultFileModel(DBMySQL);
        return file_model.createResFile(file_seq, job_seq, file_type, file_name, pair_key, org_file_name, file_path, file_size);
    }

    createResultFileData = async(fseq, jseq, memberseq, pairkey, resdata, status) => {
        const file_model = this.getResultFileModel(DBMySQL);
        return file_model.createResFileData(fseq, jseq, memberseq, pairkey, resdata, status);
    }

    getMaxResFileParkKey = async() => {
        const file_model = this.getResultFileModel(DBMySQL);
        return file_model.getMaxResFileParkKey();
    }
}

const file_service = new FileServiceClass()

export default file_service