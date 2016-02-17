'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * 继承所有wechats controller
 */
module.exports = _.extend(	
  require('./wechats/wechats.activities.server.controller'),
  require('./wechats/wechats.common.server.controller'),
  require('./wechats/wechats.admin.server.controller'),
  require('./wechats/wechats.climb_game.server.controller')
);