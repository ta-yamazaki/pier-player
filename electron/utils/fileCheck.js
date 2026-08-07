import fs from 'fs';

// path未設定の行（手入力など）は存在扱いにする
export const withExists = (file) => ({
    ...file,
    exists: file.path === "" ? true : fs.existsSync(file.path)
});

export const withExistsAll = (files) => files.map(withExists);
