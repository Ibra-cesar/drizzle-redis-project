import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "testingacount1426@gmail.com",
    pass: "gxhy tcsw gxdp pobj",
  },
});

