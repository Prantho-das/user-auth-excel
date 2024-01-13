const user = require("../models/user");
let jwt = require("jsonwebtoken");
const authMiddleware = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      status: 401,
      data: {
        errors: {
          token: ["Unauthorized"]
        }
      }
    });
  }
  let main_token = token.split(" ")[1];
  try {
    let decoded = jwt.verify(main_token, process.env.APP_SECRET);
    let userFound = await user.findById(decoded.id);
    if (!userFound) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        status: 401,
        data: {
          errors: {
            token: ["Unauthorized"]
          }
        }
      });
    }
    req.token = main_token
    req.user = userFound;
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({

      success: false,
      message: "Unauthorized",
      status: 401,
      data: {
        errors: {
          token: ["Unauthorized"]
        }
      }
    });
  }

}




module.exports = authMiddleware;