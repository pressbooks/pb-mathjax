AWS Lamba doesn't have any default fonts installed, this is our hacky workaround.

If you change stuff in here, also change `process.env.FONTCONFIG_PATH = '/var/task/fonts'` in `lambda.js`

STIX fonts are available for download at https://github.com/stipub/stixfonts and distributed under the SIL Open Font License, Version 1.1