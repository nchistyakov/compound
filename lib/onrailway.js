// monkey patch ejs
// var ejs = require('ejs'), old_parse = ejs.parse;
// ejs.parse = function () {
//     var str = old_parse.apply(this, Array.prototype.slice.call(arguments));
//     return str.replace('var buf = [];', 'var buf = []; arguments.callee.buf = buf;');
// };

var singularize = require("../vendor/inflection").singularize;
var utils = require('./railway_utils'), safe_merge = utils.safe_merge;
var ActionObserver = require('./action_observer');
var Mapper = require('./route_mapper');

var app_dir = '';
var add_routes = function (root, app) {
    var routes = require(root + '/config/routes').routes;
    if (!routes) {
        throw new Error('Routes is not defined in config/routes.js');
    }
    var mapper = new Mapper(app);
    routes(mapper);
    return mapper;
};

exports.init = function (root_dir, app) {
    app_dir = root_dir;
    require.paths.unshift(root_dir + "/app/helpers");
    require.paths.unshift(root_dir + "/app/controllers");
    require('./models.js').init(root_dir);
    var exists = require('path').exists;
    exists(root_dir + '/app/helpers/application_helper.js', function (ex) {
        ActionObserver.application_helper = ex ? require('application_helper') : {};
    });
    return {
        routes: add_routes(root_dir, app)
    };
};

/*function create_routes(app, base_path, controller_name, controller_file, routes, before_filter) {
    var observer = ActionObserver.get(base_path, controller_name, controller_file);
    if (!before_filter) {
        before_filter = [];
    } else {
        if (typeof before_filter == 'string') {
            before_filter = [before_filter];
        }
        if (before_filter.constructor == Array) {
            for (var i in before_filter) {
                if (typeof before_filter[i] == 'string') {
                    before_filter[i] = observer.calling(before_filter[i]) || global.before_filter[before_filter[i]];
                }
            }
        }
    }
    var method = 'get', action, action_name, path;
    for (var i in routes) {
        (function (i) {
        var route = i.split(/\s+/);
        if (route.length == 1) {
            method = 'get';
            action_name = i;
        } else {
            method = route[0].toLowerCase();
            action_name = route[1];
        }
        path = base_path + controller_name + action_name;
        action = observer.calling(routes[i]);
        var args = [path]
            .concat(before_filter)
            .concat(action || function (req, res) {
                res.send('Unknown action ' + routes[i] + ' for controller ' + controller_name);
            });
        observer.dump.push({
            helper: ActionObserver.calc_helper_name(path),
            method: method,
            path: path,
            file: controller_file,
            name: controller_name,
            action: routes[i]
        });
        app[method].apply(app, args);
        if (action_name == '/') {
            args[0] = args[0].replace(/\/$/, '');
            app[method].apply(app, args);
        }
        })(i);
    }
}*/

// exports.create_routes = create_routes;