let joi = require("joi");

/* Checks that the password has atealse one of each of the following:
 * a lowercase letter
 * an uppercase letter
 * one of the following characters: @#$%^&+!.=
 * a number
*/
const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+!.=])(?=.*\d).*/;

const passwordSchema = joi.string().required().min(5).pattern(regex);
const emailSchema = joi.string().required().email({ tlds: { allow: false }});

const signUpSchema = joi.object({
    username: joi.string().required().alphanum().min(5).max(20),
    email: emailSchema,
    password: passwordSchema
});

const loginSchema = joi.object({
    email: emailSchema,
    password: joi.string().required()
});

module.exports = {
    signUpSchema: signUpSchema,
    loginSchema: loginSchema,
    emailSchema: emailSchema,
    passwordSchema: passwordSchema
};