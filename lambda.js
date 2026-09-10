'use strict'
process.env.FONTCONFIG_PATH = '/var/task/fonts';
const serverlessExpress = require('@vendia/serverless-express')
const app = require('./app')

const handler = serverlessExpress({app})

exports.handler = async (event, context) => handler(event, context)
