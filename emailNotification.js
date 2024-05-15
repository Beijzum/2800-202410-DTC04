require("dotenv").config();
const courier_module = require("@trycourier/courier");

/**
 * Sends a reset password email to the specified user.
 * 
 * @param {String} email the email to send to
 * @param {String} name the name to address the user as
 * @param {String} link the link for the user to reset their password
 * @returns true if email is successfully sent, else false
 */
async function sendResetLink(email, name, link) {
    const courier = new courier_module.CourierClient({ authorizationToken: process.env.COURIER_TOKEN });

    try {
        await courier.send({
          message: {
            to: {
              email: email,
            },
            template: "RDPCSGVYMQMG5SNGNKEDJ9PP9BEV",
            data: {
              recipient: name,
              resetlink: link,
            },
          },
        });
    } catch(error) {
        console.error(error);
        return false;
    }

    return true;
}

module.exports = {
    sendResetLink: sendResetLink,
}