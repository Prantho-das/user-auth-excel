let express = require('express');
const { validationMiddleware } = require('../middeware/validationMiddleware');
const { authController, registerRule, loginRule, forgotRule } = require('../controllers/authController');
const authMiddleware = require('../middeware/authMiddleware');
const { upload } = require('../config/fileupload');
let apiRouter = express.Router();

apiRouter.get('/user', authMiddleware, authController.user);
apiRouter.put('/update-user-profile',authMiddleware, validationMiddleware(registerRule),  upload.single('image'),authController.updateMe);
apiRouter.post('/register', validationMiddleware(registerRule), authController.register);
apiRouter.post('/login', validationMiddleware(loginRule), authController.login);
apiRouter.post('/forgotPassword', validationMiddleware(forgotRule), authController.forgotPassword);
apiRouter.post('/resetPassword/:token', authController.resetPassword);
apiRouter.get('/download-user-excel', authController.downloadUserExcel);


module.exports = apiRouter;