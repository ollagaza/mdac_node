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

    getOrgFiles = async(division_seq) => {
        const file_model = this.getFileModel(DBMySQL);
        return file_model.getOrgFiles(division_seq);
    }

    getResFiles = async() => {
        const file_model = this.getResultFileModel(DBMySQL);
        return file_model.getResFiles()
    }

    createOrgFile = async (project_seq, division_seq, file_type, file_path, file_name, org_file_name, file_size) => {
        const file_model = this.getFileModel(DBMySQL);
        return file_model.createOrgFile(project_seq, division_seq, file_type, file_path, file_name, org_file_name, file_size);
    }

    createResultFile = async(file_seq, job_seq, file_type, file_name) => {
        const file_model = this.getResultFileModel(DBMySQL);
        return file_model.createResFile(file_seq, job_seq, file_type, file_name);
    }
}

const file_service = new FileServiceClass()

export default file_service