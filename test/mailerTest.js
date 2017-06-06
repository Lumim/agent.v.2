const sendEmail = require('../controllers/node_modules/mailer').sendEmail;

function testSendingEmail() {
  const to = ['forthright48@gmail.com'];
  const from = 'no-reply@agent-v2.com';
  const subject = 'testing';
  const text = 'testing';
  const html = '<h1>testing</h1>';

  return sendEmail({ to, from, subject, text, html }, function(err) {
    if (err) {
      return console.log(err);
    }
    return console.log('email sent');
  });
}

testSendingEmail();
