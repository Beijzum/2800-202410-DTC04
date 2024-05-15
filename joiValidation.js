let joi = require("joi");

// this thing refuses to work despite resources saying otherwise, someone else figure this out
// const regex = new RegExp("/(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+!.=])(?=.*\d).*/g");
// console.log(regex.test("Aa43.5"));
const passwordSchema = joi.string().required().min(5).alphanum();

const signUpSchema = joi.object({
    username: joi.string().required().alphanum().min(5).max(20),
    email: joi.string().required().email({ tlds: { allow: false }}),
    password: passwordSchema
});

const loginSchema = joi.object({
    email: joi.string().required().email({ tlds: { allow: false }}),
    password: passwordSchema
})

module.exports = {
    signUpSchema: signUpSchema,
    loginSchema: loginSchema,
    emailSchema: joi.string().required().email({ tlds: { allow: false }}),
    passwordSchema: passwordSchema
}