import bunyan, { LoggerOptions } from "bunyan";
import config from "./config";

// import createCWStream from 'bunyan-cloudwatch'
// const createCWStream = require('bunyan-cloudwatch')

const loggerOptions: LoggerOptions = <LoggerOptions>{
  name: config.app.name,
  level: process.env.LOG_LEVEL || "info",
  streams: [
    {
      stream: process.stdout,
    },
    // {
    //   stream: createCWStream({
    //     logGroupName:
    //       process.env.AWS_CLOUDWATCH_LOGS_GROUP || 'maxandfood',
    //     logStreamName:
    //       process.env.AWS_CLOUDWATCH_LOGS_STREAM || 'anonymous',
    //     cloudWatchLogsOptions: {
    //       region: process.env.AWS_CLOUDWATCH_LOGS_REGION || 'us-east-1',
    //     },
    //   }),
    //   type: 'raw',
    // },
  ],
};

export default bunyan.createLogger(loggerOptions);
