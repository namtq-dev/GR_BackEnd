const express = require('express');
const { uploadImages, getImages } = require('../controllers/upload');
const imageUpload = require('../middleware/imageUpload');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/uploadImages', authUser, imageUpload, uploadImages);
router.get('/getImages', getImages);

module.exports = router;
