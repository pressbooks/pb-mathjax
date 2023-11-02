'use strict'
process.env.FONTCONFIG_PATH = '/var/task/fonts';
const serverlessExpress = require('@vendia/serverless-express')
const app = require('./app')

exports.handler = serverlessExpress({app})
