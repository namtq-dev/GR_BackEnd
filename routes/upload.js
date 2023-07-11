const express = require('express');
const { uploadImages, getImages } = require('../controllers/upload');
const imageUpload = require('../middleware/imageUpload');
const { authUser } = require('../middleware/auth');

const router = express.Router();

router.post('/uploadImages', authUser, imageUpload, uploadImages);
router.post('/getImages', authUser, getImages);

module.exports = router;
