const express = require("express")
const morgan = require("morgan")
const helmet = require("helmet")
const compression = require("compression")
const { checkOverLoad } = require("./helpers/check.connect")
const router = require("./routes")
require("dotenv").config()

const app = express()

// init middlewares
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))


// init db
require("./dbs/init.mongodb");
checkOverLoad()

// init routes
app.use("/", router)

// handling error
app.use((req, res, next) => {
    const error = new Error()
    error.status = 400
    next(error)
})

app.use((error, req, res, next) => {
    console.log(error)
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        code: statusCode,
        message: error.message || "Internal Error Server"
    })
})

module.exports = app;