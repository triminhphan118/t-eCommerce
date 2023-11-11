"use strict"

const express = require('express');
const { apiKey, permission } = require('../auth/checkAuth')

const router = express.Router();

router.use(apiKey)
router.use(permission('0000'))
router.use("/v1/api/product", require("./product"))
router.use("/v1/api/discount", require("./discount"))
router.use("/v1/api", require("./access"))

// router.get("", (req, res) => {
//     const strData = "Hello!!!"
//     return res.status(200).json({
//         status: "success",
//         metaData: strData
//     })
// })


module.exports = router