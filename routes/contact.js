const express = require('express');
const router = express.Router();



router.get('/', (req, res) => {
    res.render('site/contact');
})

router.post('/email', (req, res) => {

    if ((/^\s*$/.test(req.body.name))) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'Ad Soyad alanı boş bırakılamaz.'
        }

        return res.redirect('/contact');
    }

    if ((/^\s*$/.test(req.body.email))) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'E-mail alanı boş bırakılamaz.'
        }

        return res.redirect('/contact');
    }

    if ((/^\s*$/.test(req.body.phone))) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'Telefon alanı boş bırakılamaz.'
        }

        return res.redirect('/contact');
    }

    if ((/^\s*$/.test(req.body.message))) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'Mesaj alanı boş bırakılamaz.'
        }

        return res.redirect('/contact');
    }


    //mail service
    let outputHTML = `
    <!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="x-apple-disable-message-reformatting">
      <title></title>
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        table, td, div, h1, p {font-family: Arial, sans-serif;}
      </style>
    </head>
    <body style="margin:0;padding:0;">
      <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
        <tr>
          <td align="center" style="padding:0;">
            <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
              <tr>
                <td align="center" style="padding:40px 0 30px 0;background:#70bbd9;">
                  <img src="https://assets.codepen.io/210284/h1.png" alt="" width="300" style="height:auto;display:block;" />
                </td>
              </tr>
              <tr>
                <td style="padding:36px 30px 42px 30px; text-align: center;">
                  <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                    <tr>
                      <td style="padding:0 0 36px 0;color:#153643;">
                        <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif; text-align:center;">${req.body.name}</h1>
                        <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">${req.body.message}</p>
                        <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><a href="http://www.example.com" style="color:#ee4c50;text-decoration:underline;">${req.body.email} - ${req.body.phone}</a></p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:0;">
                        <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                          <tr>
                            <td style="width:260px;padding:0;vertical-align:top;color:#153643;">
                              <p style="margin:0 0 25px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><img src="https://assets.codepen.io/210284/left.gif" alt="" width="260" style="height:auto;display:block;" /></p>
                              <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed. Morbi porttitor, eget accumsan dictum, est nisi libero ultricies ipsum, in posuere mauris neque at erat.</p>
                              <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><a href="http://www.example.com" style="color:#ee4c50;text-decoration:underline;">Blandit ipsum volutpat sed</a></p>
                            </td>
                            <td style="width:20px;padding:0;font-size:0;line-height:0;">&nbsp;</td>
                            <td style="width:260px;padding:0;vertical-align:top;color:#153643;">
                              <p style="margin:0 0 25px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><img src="https://assets.codepen.io/210284/right.gif" alt="" width="260" style="height:auto;display:block;" /></p>
                              <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;">Morbi porttitor, eget est accumsan dictum, nisi libero ultricies ipsum, in posuere mauris neque at erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed.</p>
                              <p style="margin:0;font-size:16px;line-height:24px;font-family:Arial,sans-serif;"><a href="http://www.example.com" style="color:#ee4c50;text-decoration:underline;">In tempus felis blandit</a></p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:30px;background:#ee4c50;">
                  <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
                    <tr>
                      <td style="padding:0;width:50%;" align="left">
                        <p style="margin:0;font-size:14px;line-height:16px;font-family:Arial,sans-serif;color:#ffffff;">
                          &reg; NODEW 2022<br/><a href="#" style="color:#ffffff;text-decoration:underline;">nodew.com</a>
                        </p>
                      </td>
                      <td style="padding:0;width:50%;" align="right">
                        <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
                          <tr>
                            <td style="padding:0 0 0 10px;width:38px;">
                              <a href="http://www.twitter.com/" style="color:#ffffff;"><img src="https://assets.codepen.io/210284/tw_1.png" alt="Twitter" width="38" style="height:auto;display:block;border:0;" /></a>
                            </td>
                            <td style="padding:0 0 0 10px;width:38px;">
                              <a href="http://www.facebook.com/" style="color:#ffffff;"><img src="https://assets.codepen.io/210284/fb_1.png" alt="Facebook" width="38" style="height:auto;display:block;border:0;" /></a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `

        


                            

                            "use strict";
                            const nodemailer = require("nodemailer");

                            // async..await is not allowed in global scope, must use a wrapper
                            async function main() {
                                // Generate test SMTP service account from ethereal.email
                                // Only needed if you don't have a real mail account for testing
                                let testAccount = await nodemailer.createTestAccount();

                            // create reusable transporter object using the default SMTP transport
                            let transporter = nodemailer.createTransport({
                                host: "smtp.gmail.com",
                            port: 465,
                            secure: true, // true for 465, false for other ports
                            auth: {
                                user: 'smtpmsbot@gmail.com', // generated ethereal user
                            pass: 'wmzrdzmktsdvijqz', // generated ethereal password
            },
        });

                            // send mail with defined transport object
                            let info = await transporter.sendMail({
                                from: '"Fred Foo 👻" <foo@example.com>', // sender address
                            to: "greenpikachuu@gmail.com", // list of receivers
                            subject: "Hello ✔", // Subject line
                            text: "Hello world?", // plain text body
                            html: outputHTML, // html body
        });

                            console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                            // Preview only available when sending through an Ethereal account
                            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

                            req.session.sessionFlash = {
                                type: 'alert alert-success',
                            message: 'Mesajınız başarıyla iletildi.'
        }

                            res.redirect('/contact');
    }

                            main().catch(console.error);

})


                            module.exports = router;


