const { rm, mv } = require('shelljs')

mv('deploy/*.yml', './')
rm('-rf', 'deploy/*')
mv('./*.yml', 'deploy/')
