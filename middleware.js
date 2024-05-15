module.exports = {
    requestTime: (req, res, next) => {
        req.requestTime = Date.now();
        next();
    },

    originUrl: (req, res, next) => {
        req.origin = `${req.protocol}://${req.get('host')}`;
        next();
    },
    // More Middleware Functions Here
};
