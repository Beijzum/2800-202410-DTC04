require("dotenv").config();
const courier_module = require("@trycourier/courier");
const courier = new courier_module.CourierClient({ authorizationToken: process.env.COURIER_TOKEN });

/**
 * Sends an email with a link to the specified user.
 * 
 * Templates used for this function must have two fields: recipient, and link.
 * 
 * @param {String} email email to send to
 * @param {String} name Name to address user as
 * @param {String} link Link for user to verify email
 * @param {String} template courier template to use
 * @returns true if the email is successfully sent, else false
 */
async function sendEmailWithLink(email, name, link, template) {
	try {
		await courier.send({
			message: {
				to: {
					email: email,
				},
				template: template,
				data: {
					recipient: name,
					link: link,
				},
			},
		});
	} catch (error) {
		console.error(error);
		return false;
	}
	
	return true;
}

module.exports = {
    sendEmailWithLink
};