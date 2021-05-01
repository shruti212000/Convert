const file_Filter = function(req, file, cb) {
    // Accept excel sheets only
    if (!file.originalname.match(/\.(xlsx)$/)) {
        //(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only excel files are allowed!'), false);
    }
    cb(null, true);
};
exports.file_Filter = file_Filter;