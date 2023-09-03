const dev = {
    app: {
        port: process.env.PORT || 3000
    },
    db: {
        host: process.env.DEV_APP_HOST || "localhost",
        port: process.env.DEV_APP_PORT || 27017,
        name: process.env.DEV_APP_NAME || "eCommerce",
    }
}

const pro = {
    app: {
        port: process.env.PORT || 3000
    },
    db: {
        host: process.env.PRO_APP_HOST || "localhost",
        port: process.env.PRO_APP_PORT || 27017,
        name: process.env.PRO_APP_NAME || "eCommercePro",
    }
}

const config = { dev, pro }
const env = process.env.NODE_ENV || "dev"

module.exports = config[env]