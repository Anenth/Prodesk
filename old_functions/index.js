const functions = require('firebase-functions');
const TOKEN = functions.config().sendgrid.token;
const sendGrid = require('sendgrid')(TOKEN);

var EmailTemplate = require('email-templates').EmailTemplate
var path = require('path')
var templateDir = path.join(__dirname, 'emails', 'thankyou')

const FROM_EMAIL = "hello@prodesk.life";

function parseBody(body, richEmail) {
	const helper = require('sendgrid').mail;
	const fromEmail = new helper.Email(FROM_EMAIL, 'Prodesk Life');
    const toEmail = new helper.Email(body.email, body.name);
    const subject = 'Prodesk Life - Standing desk';
    const content = new helper.Content('text/html', richEmail.html);

	const mail = new helper.Mail(fromEmail, subject, toEmail, content);

	const mail_settings = new helper.MailSettings()
	const bcc = new helper.Bcc(true, FROM_EMAIL)
	mail_settings.setBcc(bcc)
	mail.addMailSettings(mail_settings)

    return mail.toJSON();
}

exports.httpEmail = functions.https.onRequest((req, res) => {
	if (!req.body.email) {
		console.error('No email address', req.body);
		const error = new Error('No email address');
		throw error;
	}
	  
	return Promise.resolve()    
		.then(() => {
			if (req.method !== 'POST') {
				const error = new Error('Only POST requests are accepted');
				error.code = 405;
				throw error;
			}
		}).then(() => {
			const thankyouEmail = new EmailTemplate(templateDir)
			return thankyouEmail.render(req.body, (err, result) => {
				return result;
			})
		}).then((richEmail) => {
			const request = sendGrid.emptyRequest({
				method: 'POST',
				path: '/v3/mail/send',
				body: parseBody(req.body, richEmail)
			});
			return sendGrid.API(request)
			
		}).then((response) => {
			if (response.body) {
				res.send(response.body);
			} else {
				res.end();
			}
			
		}).catch((err) => {
			console.error(err);
			return Promise.reject(err);
		});

})