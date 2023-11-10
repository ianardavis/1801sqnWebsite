const fs = require("fs");
module.exports = function (m, fn) {
	fn.fs = {};
	function pathExists(path, createIfFalse = false) {
		return new Promise((resolve, reject) => {
			if (fs.existsSync(path)) {
				resolve(path);

			} else {
				if (createIfFalse) {
					fn.fs.mkdir(path)
					.then(path => resolve(true))
					.catch(reject);

				} else {
					reject(new Error('Path does not exist'));

				};

			};
		});
	};
	fn.fs.fileExists 	= function (folder, file) {
		return pathExists(fn.publicFile(folder, file));
	};
	fn.fs.folderExists = function (folder, createIfFalse = false) {
		return pathExists(fn.publicFolder(folder), createIfFalse);
	};
	fn.fs.mkdir 		= function (folder) {
		return new Promise(resolve => {
			const path = fn.publicFolder(folder);
			fn.fs.folderExists(folder)
			.then(result => resolve(path))
			.catch(err => {
				fs.mkdir(path, {recursive: true}, result => {
					resolve(path);
				});
			});
		});
	};
	fn.fs.copyFile 	= function (src, dest) {
		return new Promise((resolve, reject) => {
			fn.fs.fileExists(src.folder, src.folder)
			.then(src => {
				fs.copyFile(
					src,
					dest,
					function (err) {
						if (err) {
							if (err.code === 'EEXIST') {
								reject(new Error('Error copying file: Destination file already exists'));

							} else {
								reject(err);

							};
						} else {
							resolve(true);

						};
					}
				);
			})
			.catch(reject);
		});
	};
	fn.fs.uploadFile 	= function (options = {}) {
		return new Promise((resolve, reject) => {
			fn.suppliers.find({supplier_id: options.supplier_id})
			.then(supplier => {
				fn.fs.copyFile(
					options.file,
					fn.publicFile('files', options.filename)
				)
				.then(result => {
					m.files.findOrCreate({
						where: {filename: options.filename},
						defaults: {
							user_id: 	 options.user_id,
							supplier_id: options.supplier_id,
							description: options.description
						}
					})
					.then(([file, created]) => {
						if (!created) {
							reject(new Error('A file with this name already exists'));

						} else {
							resolve(true);

						};
					})
					.catch(reject);
				})
				.catch(reject);
			})
			.catch(reject);
		});
	};
	fn.fs.rmdir 		= function (folder) {
		return new Promise((resolve, reject) => {
			fn.fs.fileExists(folder, '')
			.then(exists => {
				fs.rm(
					folder,
					{recursive: true},
					err => {
						if (err) {
							console.error(err);
							reject(err);

						} else {
							resolve(true);

						};
					}
				);
			})
			.catch(reject);
		});
	};
	fn.fs.rm 			= function (file) {
		return new Promise((resolve, reject) => {
			fs.access(file, fs.constants.R_OK, function (err) {
				if (err) {
					reject(err);

				} else {
					fs.unlink(file, function (err) {
						if (err) {
							reject(err);

						} else {
							resolve(true);

						};
					});
				};
			});
		});
	};
	fn.fs.deleteFile 	= function (options = {}) {
		return new Promise((resolve, reject) => {
			m[options.table].findByPk(options.id)
			.then(result => {
				if (result.filename) {
					fn.fs.fileExists(options.table, result.filename)
					.then(filepath => {
						fn.rm(filepath)
						.then(rmresult => {
							fn.update(result, {filename: null})
							.then(result => {
								fn.actions.create([
									`${options.table_s} | FILE DELETED`,
									options.user_id,
									[{_table: options.table, id: options.id}]
								])
								.then(result => resolve(true));
							})
							.catch(reject);
						})
						.catch(reject);
					})
					.catch(reject);
					
				} else {
					reject(new Error('No file for this record'));

				};
			})
			.catch(reject);
		});
	};
	fn.fs.download 		= function (folder, file, res) {
		return new Promise((resolve, reject) => {
			fn.fs.fileExists(folder, file)
			.then(path => {
				res.download(path, file, err => {
					if (err) {
						reject(err);

					} else {
						resolve(true);

					};
				});
			})
			.catch(reject);
		});
	};
};