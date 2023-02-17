const fs = require("fs");
module.exports = function (m, fn) {
	fn.fs = {};
	fn.fs.file_exists = function (folder, file) {
		return new Promise((resolve, reject) => {
			const path = fn.public_file(folder, file);
			if (fs.existsSync(path)) {
				resolve(path);

			} else {
				reject(new Error('File does not exist'));

			};
		});
	};
	fn.fs.mkdir = function (folder) {
		return new Promise((resolve, reject) => {
			const path = fn.public_folder(folder);
			fn.fs.folder_exists(folder)
			.then(result => resolve(path))
			.catch(err => {
				fs.mkdir(path, {recursive: true}, result => {
					resolve(path);
				});
			});
		});
	};
	fn.fs.folder_exists = function (folder) {
		return new Promise((resolve, reject) => {
			const path = fn.public_folder(folder);
			if (fs.existsSync(path)) {
				resolve(path);

			} else {
				reject(new Error('File does not exist'));

			};
		});
	};
	fn.fs.copy_file = function (src, dest) {
		return new Promise((resolve, reject) => {
			fn.fs.file_exists(src.folder, src.folder)
			.then(src => {
				fs.copyFile(
					src,
					dest,
					function (err) {
						if (err) {
							if (err.code === 'EEXIST') {
								reject(new Error('Error copying file: This file already exists'));

							} else {
								reject(err);

							};
						} else {
							resolve(true);

						};
					}
				);
			})
			.catch(err => reject(err));
		});
	};
	fn.fs.upload_file = function (options = {}) {
		return new Promise((resolve, reject) => {
			fn.suppliers.get({supplier_id: options.supplier_id})
			.then(supplier => {
				fn.fs.copy_file(
					options.file,
					fn.public_file('files', options.filename)
				)
				.then(result => {
					m.files.findOrCreate({
						where: {filename: options.filename},
						defaults: {
							user_id: options.user_id,
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
					.catch(err => reject(err));
				})
				.catch(err => reject(err));
			})
			.catch(err => reject(err));
		});
	};
	fn.fs.rmdir = function (folder) {
		return new Promise((resolve, reject) => {
			fn.fs.file_exists(folder, '')
			.then(exists => {
				fs.rm(
					folder,
					{recursive: true},
					err => {
						if (err) {
							console.log(err);
							reject(err);

						} else {
							resolve(true);

						};
					}
				);
			})
			.catch(err => reject(err));
		});
	};
	fn.fs.rm = function (file) {
		return new Promise((resolve, reject) => {
			fs.access(file, fs.constants.R_OK, function (err) {
				if (err) reject(err)
				else {
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
	fn.fs.delete_file = function (options = {}) {
		return new Promise((resolve, reject) => {
			m[options.table].findByPk(options.id)
			.then(result => {
				if (result.filename) {
					fn.fs.file_exists(options.table, result.filename)
					.then(filepath => {
						fn.rm(filepath)
						.then(rmresult => {
							result.update({filename: null})
							.then(result => {
								fn.actions.create(
									`${options.table_s} | FILE DELETED`,
									options.user_id,
									[{_table: options.table, id: options.id}]
								)
								.then(result => resolve(true));
							})
							.catch(err => reject(err));
						})
						.catch(err => reject(err));
					})
					.catch(err => reject(err));
				} else {
					reject(new Error('No file for this record'));
				};
			})
			.catch(err => reject(err));
		});
	};
	fn.fs.download = function (folder, file, res) {
		return new Promise((resolve, reject) => {
			fn.fs.file_exists(folder, file)
			.then(path => {
				res.download(path, file, err => {
					if (err) {
						reject(err);

					} else {
						resolve(true);

					};
				});
			})
			.catch(err => reject(err));
		});
	};
};