module.exports = {
    requestTime: (req, res, next) => {
        req.requestTime = Date.now();
        next();
    },
    // More Middleware Functions Here
}