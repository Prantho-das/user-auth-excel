const user = require("../models/user");
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
const { mail } = require("../config/mail");
const { authResponse } = require("../utils/helper");
const excel = require('exceljs');
let authController = {
  register: async (req, res) => {
    try {
      const { email, name, password, phone } = req.body;
      let userExits = await user.exists({
        $or: [{ email: email }, { phone: phone }]
      });

      if (userExits) {
        return res.status(422).json({
          success: false,
          status: 422,
          message: "User already exists",
          data: {
            errors: {
              email: ["Email already exists"],
              phone: ["Phone already exists"]
            }
          }
        })
      }
      let hashedPassword = bcrypt.hashSync(password, parseInt(process.env.APP_SALT));
      console.log(hashedPassword)
      let newUser = await user.create({
        name: name,
        email: email,
        password: hashedPassword,
        phone: phone
      });
      console.log(newUser)
      return res.status(201).json({
        success: true,
        message: "signup successful",
        status: 201,
        data: newUser
      });
    } catch (err) {
      console.log(err)
      return res.status(500).json(err)
    }
  },
  login: async (req, res) => {
    const { email_or_phone, password } = req.body;
    let userExits = await user.exists({
      $or: [{ email: email_or_phone }, { phone: email_or_phone }]
    });
    if (!userExits) {
      return res.status(422).json({
        success: false,
        status: 422,
        message: "User not found",
        data: {
          errors: {
            user: ["User not found"]
          }
        }
      })
    }
    let userFound = await user.findOne({
      $or: [{ email: email_or_phone }, { phone: email_or_phone }]
    });
    let passwordMatch = await bcrypt.compare(password, userFound.password);
    if (!passwordMatch) {
      return res.status(422).json({
        success: false,
        status: 422,
        message: "Invalid password",
        data: {
          errors: {
            password: ["Invalid password"]
          }
        }
      })
    }
    let token = jwt.sign({ id: userFound._id }, process.env.APP_SECRET);
    return res.status(200).json({
      success: true,
      message: "login successful",
      status: 200,
      data: authResponse(token, userFound)
    });

  },
  forgotPassword: async (req, res) => {
    let { email_or_phone } = req.body;
    let userFound = await user.findOne({
      $or: [{ email: email_or_phone }, { phone: email_or_phone }]
    });
    if (!userFound) {
      return res.status(422).json({
        success: false,
        status: 422,
        message: "User not found",
        data: {
          errors: {
            user: ["User not found"]
          }
        }
      })
    }
    let token = jwt.sign({ id: userFound._id }, process.env.APP_SECRET);
    if (userFound.email) {
      const info = await mail.sendMail({
        from: process.env.MAIL_EMAIL, // sender address
        to: userFound.email, // list of receivers
        subject: "Password reset", // Subject line
        text: "Password reset", // plain text body
        html: `
      <h1>Reset your password</h1>
      <p>Click this <a href="${process.env.APP_URL}/resetPassword/${token}">link</a> to reset your password</p>

      `
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      status: 200,
      data: null
    });

  },
  resetPassword: async (req, res) => {

    let decoded = jwt.verify(req.params.token, process.env.APP_SECRET);
    console.log(decoded)
    if (!decoded) {
      return res.status(422).json({
        success: false,
        status: 422,
        message: "User not found",
        data: {
          errors: {
            user: ["User not found"]
          }
        }
      })
    }

    let userFound = await user.findById({
      _id: decoded.id
    })
    if (!userFound) {
      return res.status(422).json({
        success: false,
        status: 422,
        message: "User not found",
        data: {
          errors: {
            user: ["User not found"]
          }
        }
      })
    }

    let randomPassword = Math.random().toString(36).slice(2) +
      Math.random().toString(36)
        .toUpperCase().slice(2);
    let bcryptPassword = bcrypt.hashSync(req.body.password ?? randomPassword, parseInt(process.env.APP_SALT));
    userFound.password = bcryptPassword;
    await userFound.save();
    return res.status(200).json({
      success: true,
      message: "password updated",
      status: 200,
      data: null
    });
  },
  updatePassword: async (req, res) => {
    let userFound = await user.findById(req.user._id);
    let bcryptPassword = bcrypt.hashSync(req.body.password, parseInt(process.env.APP_SALT));
    userFound.password = bcryptPassword;
    await userFound.save();
    return res.status(200).json({
      success: true,
      message: "password updated",
      status: 200,
      data: null
    });

  },
  updateMe: async (req, res) => {
    let userData = req.body;
    if (req.file) {
      userData.image = req.file.filename;
    }
    let userFound = await user.findByIdAndUpdate(req.user._id, userData, { new: true });
    return res.status(200).json({
      success: true,
      message: "user updated",
      status: 200,
      data: authResponse(req.token, userFound)
    });


  },
  user: async (req, res) => {
    return res.status(200).json({
      success: true,
      message: "user found",
      status: 200,
      data: authResponse(req.token, req.user)
    });
  },
  downloadUserExcel: async (req, res) => {
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet('Users');
    worksheet.columns = [
      { header: "Id", key: "id", width: 5 },
      { header: "name", key: "title", width: 25 },
      { header: "email", key: "description", width: 25 },
      { header: "phone", key: "phone", width: 10 },
    ];

    let users = await user.find({})
    users.forEach((user, index) => {
      worksheet.addRow({
        id: user?._id,
        title: user?.name,
        description: user?.email,
        phone: user?.phone,
      })
    })
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "users.xlsx"
    );

    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  }

}







let registerRule = {
  name: "required|string",
  email: "required|email",
  password: "required|string|min:6",
  phone: "required|string|min:6",
}

let loginRule = {
  email_or_phone: "required|string",
  password: "required|string|min:6",
}
let forgotRule = {
  email_or_phone: "required|string",
}




module.exports = {
  authController,
  registerRule,
  loginRule,
  forgotRule
}








