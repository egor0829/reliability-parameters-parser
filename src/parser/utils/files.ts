import fs from 'fs';

const getFiles = (dir: fs.PathLike): string[] => {
    return fs.readdirSync(dir).filter((file) => fs.statSync(dir + '/' + file).isFile());
};

const getDirs = (dir: fs.PathLike): string[] => {
    return fs.readdirSync(dir).filter((file) => fs.statSync(dir + '/' + file).isDirectory());
};

const getLastFile = (dir: fs.PathLike, filter?: (fileName: string) => boolean): string => {
    let files = getFiles(dir);

    if (filter) {
        files = files.filter((file) => filter(file));
    }

    return files.sort((fileA, fileB) => {
        const fileAPath = dir + '/' + fileA;
        const fileBPath = dir + '/' + fileB;
        return fileAPath < fileBPath ? -1 : 1;
    })[files.length - 1];
};

export {getFiles, getDirs, getLastFile};
