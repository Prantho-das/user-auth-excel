const { validator } = require("../utils/helper");


exports.validationMiddleware = (validationRule) => {
  if (!validationRule) {
    throw new Error('Validation rules not found');
  }
  return async (req, res, next) => {
    await validator(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        return res.status(412)
          .send({
            success: false,
            message: 'Validation failed',
            data: err
          });
      } else {
        next();
      }
    })
  }
}
