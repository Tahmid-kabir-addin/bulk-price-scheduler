const logger = (req, res, next) => {
    console.log(req.originalUrl);
}

module.exports = logger;