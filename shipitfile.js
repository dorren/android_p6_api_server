var chalk = require('chalk');

module.exports = function (shipit) {
  require('shipit-deploy')(shipit);

  shipit.initConfig({
    default: {
      workspace: '/tmp/eventhub',
      deployTo: '/vol2/sites/eventhub',
      repositoryUrl: 'https://github.com/dorren/android_p6_api_server.git',
      ignores: ['.git', 'node_modules'],
      rsync: ['--del'],
      keepReleases: 2,
      key: '/Users/dorrenchen/.ssh/github.pub',
      shallowClone: true
    },
    production: {
      servers: 'deployer@aws'
    }
  });

  shipit.task('pwd', function () {
    return shipit.remote('pwd');
  });

  // don't use, shared folder is causing npm install to fail.
  shipit.task('link_node_modules', function () {
    return shipit.remote(
      'cd ' + shipit.config.deployTo + '/current && ' +
      'if [ -L node_modules ]; then echo "node_modules link exists"; else ln -s ../shared/node_modules .; fi').
      then(function(res){
        shipit.log(chalk.green('linked node_modules.'));
        shipit.emit("node_modules_linked");
      });
  });

  shipit.task('npm_install', function () {
    return shipit.remote(
      'cd ' + shipit.config.deployTo + '/current && npm install').
      then(function(res){
        shipit.emit("npm_installed");
      });
  });

  shipit.task('start', function () {
    return shipit.remote(
      'cd ' + shipit.config.deployTo + '/current && NODE_ENV=production pm2 start bin/www');
  });

  shipit.task('stop', function () {
    return shipit.remote(
      'cd ' + shipit.config.deployTo + '/current && pm2 kill');
  });

  shipit.task('seed', function () {
    return shipit.remote(
      'cd ' + shipit.config.deployTo + '/current && npm run prodseed');
  });
};
