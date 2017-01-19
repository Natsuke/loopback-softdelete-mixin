'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends6 = require('babel-runtime/helpers/extends');

var _extends7 = _interopRequireDefault(_extends6);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _debug2 = require('./debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)();

exports.default = function (Model, _ref) {
  var _ref$deletedAt = _ref.deletedAt,
      deletedAt = _ref$deletedAt === undefined ? 'deletedAt' : _ref$deletedAt,
      _ref$scrub = _ref.scrub,
      scrub = _ref$scrub === undefined ? false : _ref$scrub;

  debug('SoftDelete mixin for Model %s', Model.modelName);

  debug('options', { deletedAt: deletedAt, scrub: scrub });

  var properties = Model.definition.properties;
  var idName = Model.dataSource.idName(Model.modelName);

  var scrubbed = {};
  if (scrub !== false) {
    var propertiesToScrub = scrub;
    if (!Array.isArray(propertiesToScrub)) {
      propertiesToScrub = (0, _keys2.default)(properties).filter(function (prop) {
        return !properties[prop][idName] && prop !== deletedAt;
      });
    }
    scrubbed = propertiesToScrub.reduce(function (obj, prop) {
      return (0, _extends7.default)({}, obj, (0, _defineProperty3.default)({}, prop, null));
    }, {});
  }

  Model.defineProperty(deletedAt, { type: Date, required: false });

  Model.destroyAll = function softDestroyAll(where, cb) {
    return Model.updateAll(where, (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.remove = Model.destroyAll;
  Model.deleteAll = Model.destroyAll;

  Model.destroyById = function softDestroyById(id, cb) {
    return Model.updateAll((0, _defineProperty3.default)({}, idName, id), (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.removeById = Model.destroyById;
  Model.deleteById = Model.destroyById;

  Model.prototype.destroy = function softDestroy(options, cb) {
    var callback = cb === undefined && typeof options === 'function' ? options : cb;

    return this.updateAttributes((0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof callback === 'function' ? callback(null, result) : result;
    }).catch(function (error) {
      return typeof callback === 'function' ? callback(error) : _promise2.default.reject(error);
    });
  };

  Model.prototype.remove = Model.prototype.destroy;
  Model.prototype.delete = Model.prototype.destroy;

  // Emulate default scope but with more flexibility.
  var queryNonDeleted = (0, _defineProperty3.default)({}, deletedAt, null);

  var _findOrCreate = Model.findOrCreate;
  Model.findOrCreate = function findOrCreateDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    return _findOrCreate.call.apply(_findOrCreate, [Model, query].concat(rest));
  };

  var _find = Model.find;
  Model.find = function findDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return _find.call.apply(_find, [Model, query].concat(rest));
  };

  var _count = Model.count;
  Model.count = function countDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because count only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = void 0;
    if (!where || (0, _keys2.default)(where).length === 0) {
      whereNotDeleted = queryNonDeleted;
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] };
    }

    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      rest[_key3 - 1] = arguments[_key3];
    }

    return _count.call.apply(_count, [Model, whereNotDeleted].concat(rest));
  };

  var _update = Model.update;
  Model.update = Model.updateAll = function updateDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because update/updateAll only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = void 0;
    if (!where || (0, _keys2.default)(where).length === 0) {
      whereNotDeleted = queryNonDeleted;
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] };
    }

    for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    return _update.call.apply(_update, [Model, whereNotDeleted].concat(rest));
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvZnQtZGVsZXRlLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiTW9kZWwiLCJkZWxldGVkQXQiLCJzY3J1YiIsIm1vZGVsTmFtZSIsInByb3BlcnRpZXMiLCJkZWZpbml0aW9uIiwiaWROYW1lIiwiZGF0YVNvdXJjZSIsInNjcnViYmVkIiwicHJvcGVydGllc1RvU2NydWIiLCJBcnJheSIsImlzQXJyYXkiLCJmaWx0ZXIiLCJwcm9wIiwicmVkdWNlIiwib2JqIiwiZGVmaW5lUHJvcGVydHkiLCJ0eXBlIiwiRGF0ZSIsInJlcXVpcmVkIiwiZGVzdHJveUFsbCIsInNvZnREZXN0cm95QWxsIiwid2hlcmUiLCJjYiIsInVwZGF0ZUFsbCIsInRoZW4iLCJyZXN1bHQiLCJjYXRjaCIsImVycm9yIiwicmVqZWN0IiwicmVtb3ZlIiwiZGVsZXRlQWxsIiwiZGVzdHJveUJ5SWQiLCJzb2Z0RGVzdHJveUJ5SWQiLCJpZCIsInJlbW92ZUJ5SWQiLCJkZWxldGVCeUlkIiwicHJvdG90eXBlIiwiZGVzdHJveSIsInNvZnREZXN0cm95Iiwib3B0aW9ucyIsImNhbGxiYWNrIiwidW5kZWZpbmVkIiwidXBkYXRlQXR0cmlidXRlcyIsImRlbGV0ZSIsInF1ZXJ5Tm9uRGVsZXRlZCIsIl9maW5kT3JDcmVhdGUiLCJmaW5kT3JDcmVhdGUiLCJmaW5kT3JDcmVhdGVEZWxldGVkIiwicXVlcnkiLCJkZWxldGVkIiwibGVuZ3RoIiwiYW5kIiwicmVzdCIsImNhbGwiLCJfZmluZCIsImZpbmQiLCJmaW5kRGVsZXRlZCIsIl9jb3VudCIsImNvdW50IiwiY291bnREZWxldGVkIiwid2hlcmVOb3REZWxldGVkIiwiX3VwZGF0ZSIsInVwZGF0ZSIsInVwZGF0ZURlbGV0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O0FBQ0EsSUFBTUEsUUFBUSxzQkFBZDs7a0JBRWUsVUFBQ0MsS0FBRCxRQUF1RDtBQUFBLDRCQUE3Q0MsU0FBNkM7QUFBQSxNQUE3Q0EsU0FBNkMsa0NBQWpDLFdBQWlDO0FBQUEsd0JBQXBCQyxLQUFvQjtBQUFBLE1BQXBCQSxLQUFvQiw4QkFBWixLQUFZOztBQUNwRUgsUUFBTSwrQkFBTixFQUF1Q0MsTUFBTUcsU0FBN0M7O0FBRUFKLFFBQU0sU0FBTixFQUFpQixFQUFFRSxvQkFBRixFQUFhQyxZQUFiLEVBQWpCOztBQUVBLE1BQU1FLGFBQWFKLE1BQU1LLFVBQU4sQ0FBaUJELFVBQXBDO0FBQ0EsTUFBTUUsU0FBU04sTUFBTU8sVUFBTixDQUFpQkQsTUFBakIsQ0FBd0JOLE1BQU1HLFNBQTlCLENBQWY7O0FBRUEsTUFBSUssV0FBVyxFQUFmO0FBQ0EsTUFBSU4sVUFBVSxLQUFkLEVBQXFCO0FBQ25CLFFBQUlPLG9CQUFvQlAsS0FBeEI7QUFDQSxRQUFJLENBQUNRLE1BQU1DLE9BQU4sQ0FBY0YsaUJBQWQsQ0FBTCxFQUF1QztBQUNyQ0EsMEJBQW9CLG9CQUFZTCxVQUFaLEVBQ2pCUSxNQURpQixDQUNWO0FBQUEsZUFBUSxDQUFDUixXQUFXUyxJQUFYLEVBQWlCUCxNQUFqQixDQUFELElBQTZCTyxTQUFTWixTQUE5QztBQUFBLE9BRFUsQ0FBcEI7QUFFRDtBQUNETyxlQUFXQyxrQkFBa0JLLE1BQWxCLENBQXlCLFVBQUNDLEdBQUQsRUFBTUYsSUFBTjtBQUFBLHdDQUFxQkUsR0FBckIsb0NBQTJCRixJQUEzQixFQUFrQyxJQUFsQztBQUFBLEtBQXpCLEVBQW9FLEVBQXBFLENBQVg7QUFDRDs7QUFFRGIsUUFBTWdCLGNBQU4sQ0FBcUJmLFNBQXJCLEVBQWdDLEVBQUNnQixNQUFNQyxJQUFQLEVBQWFDLFVBQVUsS0FBdkIsRUFBaEM7O0FBRUFuQixRQUFNb0IsVUFBTixHQUFtQixTQUFTQyxjQUFULENBQXdCQyxLQUF4QixFQUErQkMsRUFBL0IsRUFBbUM7QUFDcEQsV0FBT3ZCLE1BQU13QixTQUFOLENBQWdCRixLQUFoQiw2QkFBNEJkLFFBQTVCLG9DQUF1Q1AsU0FBdkMsRUFBbUQsSUFBSWlCLElBQUosRUFBbkQsSUFDSk8sSUFESSxDQUNDO0FBQUEsYUFBVyxPQUFPRixFQUFQLEtBQWMsVUFBZixHQUE2QkEsR0FBRyxJQUFILEVBQVNHLE1BQVQsQ0FBN0IsR0FBZ0RBLE1BQTFEO0FBQUEsS0FERCxFQUVKQyxLQUZJLENBRUU7QUFBQSxhQUFVLE9BQU9KLEVBQVAsS0FBYyxVQUFmLEdBQTZCQSxHQUFHSyxLQUFILENBQTdCLEdBQXlDLGtCQUFRQyxNQUFSLENBQWVELEtBQWYsQ0FBbEQ7QUFBQSxLQUZGLENBQVA7QUFHRCxHQUpEOztBQU1BNUIsUUFBTThCLE1BQU4sR0FBZTlCLE1BQU1vQixVQUFyQjtBQUNBcEIsUUFBTStCLFNBQU4sR0FBa0IvQixNQUFNb0IsVUFBeEI7O0FBRUFwQixRQUFNZ0MsV0FBTixHQUFvQixTQUFTQyxlQUFULENBQXlCQyxFQUF6QixFQUE2QlgsRUFBN0IsRUFBaUM7QUFDbkQsV0FBT3ZCLE1BQU13QixTQUFOLG1DQUFtQmxCLE1BQW5CLEVBQTRCNEIsRUFBNUIsOEJBQXVDMUIsUUFBdkMsb0NBQWtEUCxTQUFsRCxFQUE4RCxJQUFJaUIsSUFBSixFQUE5RCxJQUNKTyxJQURJLENBQ0M7QUFBQSxhQUFXLE9BQU9GLEVBQVAsS0FBYyxVQUFmLEdBQTZCQSxHQUFHLElBQUgsRUFBU0csTUFBVCxDQUE3QixHQUFnREEsTUFBMUQ7QUFBQSxLQURELEVBRUpDLEtBRkksQ0FFRTtBQUFBLGFBQVUsT0FBT0osRUFBUCxLQUFjLFVBQWYsR0FBNkJBLEdBQUdLLEtBQUgsQ0FBN0IsR0FBeUMsa0JBQVFDLE1BQVIsQ0FBZUQsS0FBZixDQUFsRDtBQUFBLEtBRkYsQ0FBUDtBQUdELEdBSkQ7O0FBTUE1QixRQUFNbUMsVUFBTixHQUFtQm5DLE1BQU1nQyxXQUF6QjtBQUNBaEMsUUFBTW9DLFVBQU4sR0FBbUJwQyxNQUFNZ0MsV0FBekI7O0FBRUFoQyxRQUFNcUMsU0FBTixDQUFnQkMsT0FBaEIsR0FBMEIsU0FBU0MsV0FBVCxDQUFxQkMsT0FBckIsRUFBOEJqQixFQUE5QixFQUFrQztBQUMxRCxRQUFNa0IsV0FBWWxCLE9BQU9tQixTQUFQLElBQW9CLE9BQU9GLE9BQVAsS0FBbUIsVUFBeEMsR0FBc0RBLE9BQXRELEdBQWdFakIsRUFBakY7O0FBRUEsV0FBTyxLQUFLb0IsZ0JBQUwsNEJBQTJCbkMsUUFBM0Isb0NBQXNDUCxTQUF0QyxFQUFrRCxJQUFJaUIsSUFBSixFQUFsRCxJQUNKTyxJQURJLENBQ0M7QUFBQSxhQUFXLE9BQU9nQixRQUFQLEtBQW9CLFVBQXJCLEdBQW1DQSxTQUFTLElBQVQsRUFBZWYsTUFBZixDQUFuQyxHQUE0REEsTUFBdEU7QUFBQSxLQURELEVBRUpDLEtBRkksQ0FFRTtBQUFBLGFBQVUsT0FBT2MsUUFBUCxLQUFvQixVQUFyQixHQUFtQ0EsU0FBU2IsS0FBVCxDQUFuQyxHQUFxRCxrQkFBUUMsTUFBUixDQUFlRCxLQUFmLENBQTlEO0FBQUEsS0FGRixDQUFQO0FBR0QsR0FORDs7QUFRQTVCLFFBQU1xQyxTQUFOLENBQWdCUCxNQUFoQixHQUF5QjlCLE1BQU1xQyxTQUFOLENBQWdCQyxPQUF6QztBQUNBdEMsUUFBTXFDLFNBQU4sQ0FBZ0JPLE1BQWhCLEdBQXlCNUMsTUFBTXFDLFNBQU4sQ0FBZ0JDLE9BQXpDOztBQUVBO0FBQ0EsTUFBTU8sb0RBQW9CNUMsU0FBcEIsRUFBZ0MsSUFBaEMsQ0FBTjs7QUFFQSxNQUFNNkMsZ0JBQWdCOUMsTUFBTStDLFlBQTVCO0FBQ0EvQyxRQUFNK0MsWUFBTixHQUFxQixTQUFTQyxtQkFBVCxHQUFrRDtBQUFBLFFBQXJCQyxLQUFxQix1RUFBYixFQUFhOztBQUNyRSxRQUFJLENBQUNBLE1BQU1DLE9BQVgsRUFBb0I7QUFDbEIsVUFBSSxDQUFDRCxNQUFNM0IsS0FBUCxJQUFnQixvQkFBWTJCLE1BQU0zQixLQUFsQixFQUF5QjZCLE1BQXpCLEtBQW9DLENBQXhELEVBQTJEO0FBQ3pERixjQUFNM0IsS0FBTixHQUFjdUIsZUFBZDtBQUNELE9BRkQsTUFFTztBQUNMSSxjQUFNM0IsS0FBTixHQUFjLEVBQUU4QixLQUFLLENBQUVILE1BQU0zQixLQUFSLEVBQWV1QixlQUFmLENBQVAsRUFBZDtBQUNEO0FBQ0Y7O0FBUG9FLHNDQUFOUSxJQUFNO0FBQU5BLFVBQU07QUFBQTs7QUFTckUsV0FBT1AsY0FBY1EsSUFBZCx1QkFBbUJ0RCxLQUFuQixFQUEwQmlELEtBQTFCLFNBQW9DSSxJQUFwQyxFQUFQO0FBQ0QsR0FWRDs7QUFZQSxNQUFNRSxRQUFRdkQsTUFBTXdELElBQXBCO0FBQ0F4RCxRQUFNd0QsSUFBTixHQUFhLFNBQVNDLFdBQVQsR0FBMEM7QUFBQSxRQUFyQlIsS0FBcUIsdUVBQWIsRUFBYTs7QUFDckQsUUFBSSxDQUFDQSxNQUFNQyxPQUFYLEVBQW9CO0FBQ2xCLFVBQUksQ0FBQ0QsTUFBTTNCLEtBQVAsSUFBZ0Isb0JBQVkyQixNQUFNM0IsS0FBbEIsRUFBeUI2QixNQUF6QixLQUFvQyxDQUF4RCxFQUEyRDtBQUN6REYsY0FBTTNCLEtBQU4sR0FBY3VCLGVBQWQ7QUFDRCxPQUZELE1BRU87QUFDTEksY0FBTTNCLEtBQU4sR0FBYyxFQUFFOEIsS0FBSyxDQUFFSCxNQUFNM0IsS0FBUixFQUFldUIsZUFBZixDQUFQLEVBQWQ7QUFDRDtBQUNGOztBQVBvRCx1Q0FBTlEsSUFBTTtBQUFOQSxVQUFNO0FBQUE7O0FBU3JELFdBQU9FLE1BQU1ELElBQU4sZUFBV3RELEtBQVgsRUFBa0JpRCxLQUFsQixTQUE0QkksSUFBNUIsRUFBUDtBQUNELEdBVkQ7O0FBWUEsTUFBTUssU0FBUzFELE1BQU0yRCxLQUFyQjtBQUNBM0QsUUFBTTJELEtBQU4sR0FBYyxTQUFTQyxZQUFULEdBQTJDO0FBQUEsUUFBckJ0QyxLQUFxQix1RUFBYixFQUFhOztBQUN2RDtBQUNBLFFBQUl1Qyx3QkFBSjtBQUNBLFFBQUksQ0FBQ3ZDLEtBQUQsSUFBVSxvQkFBWUEsS0FBWixFQUFtQjZCLE1BQW5CLEtBQThCLENBQTVDLEVBQStDO0FBQzdDVSx3QkFBa0JoQixlQUFsQjtBQUNELEtBRkQsTUFFTztBQUNMZ0Isd0JBQWtCLEVBQUVULEtBQUssQ0FBRTlCLEtBQUYsRUFBU3VCLGVBQVQsQ0FBUCxFQUFsQjtBQUNEOztBQVBzRCx1Q0FBTlEsSUFBTTtBQUFOQSxVQUFNO0FBQUE7O0FBUXZELFdBQU9LLE9BQU9KLElBQVAsZ0JBQVl0RCxLQUFaLEVBQW1CNkQsZUFBbkIsU0FBdUNSLElBQXZDLEVBQVA7QUFDRCxHQVREOztBQVdBLE1BQU1TLFVBQVU5RCxNQUFNK0QsTUFBdEI7QUFDQS9ELFFBQU0rRCxNQUFOLEdBQWUvRCxNQUFNd0IsU0FBTixHQUFrQixTQUFTd0MsYUFBVCxHQUE0QztBQUFBLFFBQXJCMUMsS0FBcUIsdUVBQWIsRUFBYTs7QUFDM0U7QUFDQSxRQUFJdUMsd0JBQUo7QUFDQSxRQUFJLENBQUN2QyxLQUFELElBQVUsb0JBQVlBLEtBQVosRUFBbUI2QixNQUFuQixLQUE4QixDQUE1QyxFQUErQztBQUM3Q1Usd0JBQWtCaEIsZUFBbEI7QUFDRCxLQUZELE1BRU87QUFDTGdCLHdCQUFrQixFQUFFVCxLQUFLLENBQUU5QixLQUFGLEVBQVN1QixlQUFULENBQVAsRUFBbEI7QUFDRDs7QUFQMEUsdUNBQU5RLElBQU07QUFBTkEsVUFBTTtBQUFBOztBQVEzRSxXQUFPUyxRQUFRUixJQUFSLGlCQUFhdEQsS0FBYixFQUFvQjZELGVBQXBCLFNBQXdDUixJQUF4QyxFQUFQO0FBQ0QsR0FURDtBQVVELEMiLCJmaWxlIjoic29mdC1kZWxldGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgX2RlYnVnIGZyb20gJy4vZGVidWcnO1xuY29uc3QgZGVidWcgPSBfZGVidWcoKTtcblxuZXhwb3J0IGRlZmF1bHQgKE1vZGVsLCB7IGRlbGV0ZWRBdCA9ICdkZWxldGVkQXQnLCBzY3J1YiA9IGZhbHNlIH0pID0+IHtcbiAgZGVidWcoJ1NvZnREZWxldGUgbWl4aW4gZm9yIE1vZGVsICVzJywgTW9kZWwubW9kZWxOYW1lKTtcblxuICBkZWJ1Zygnb3B0aW9ucycsIHsgZGVsZXRlZEF0LCBzY3J1YiB9KTtcblxuICBjb25zdCBwcm9wZXJ0aWVzID0gTW9kZWwuZGVmaW5pdGlvbi5wcm9wZXJ0aWVzO1xuICBjb25zdCBpZE5hbWUgPSBNb2RlbC5kYXRhU291cmNlLmlkTmFtZShNb2RlbC5tb2RlbE5hbWUpO1xuXG4gIGxldCBzY3J1YmJlZCA9IHt9O1xuICBpZiAoc2NydWIgIT09IGZhbHNlKSB7XG4gICAgbGV0IHByb3BlcnRpZXNUb1NjcnViID0gc2NydWI7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByb3BlcnRpZXNUb1NjcnViKSkge1xuICAgICAgcHJvcGVydGllc1RvU2NydWIgPSBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKVxuICAgICAgICAuZmlsdGVyKHByb3AgPT4gIXByb3BlcnRpZXNbcHJvcF1baWROYW1lXSAmJiBwcm9wICE9PSBkZWxldGVkQXQpO1xuICAgIH1cbiAgICBzY3J1YmJlZCA9IHByb3BlcnRpZXNUb1NjcnViLnJlZHVjZSgob2JqLCBwcm9wKSA9PiAoeyAuLi5vYmosIFtwcm9wXTogbnVsbCB9KSwge30pO1xuICB9XG5cbiAgTW9kZWwuZGVmaW5lUHJvcGVydHkoZGVsZXRlZEF0LCB7dHlwZTogRGF0ZSwgcmVxdWlyZWQ6IGZhbHNlfSk7XG5cbiAgTW9kZWwuZGVzdHJveUFsbCA9IGZ1bmN0aW9uIHNvZnREZXN0cm95QWxsKHdoZXJlLCBjYikge1xuICAgIHJldHVybiBNb2RlbC51cGRhdGVBbGwod2hlcmUsIHsgLi4uc2NydWJiZWQsIFtkZWxldGVkQXRdOiBuZXcgRGF0ZSgpIH0pXG4gICAgICAudGhlbihyZXN1bHQgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYihudWxsLCByZXN1bHQpIDogcmVzdWx0KVxuICAgICAgLmNhdGNoKGVycm9yID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IoZXJyb3IpIDogUHJvbWlzZS5yZWplY3QoZXJyb3IpKTtcbiAgfTtcblxuICBNb2RlbC5yZW1vdmUgPSBNb2RlbC5kZXN0cm95QWxsO1xuICBNb2RlbC5kZWxldGVBbGwgPSBNb2RlbC5kZXN0cm95QWxsO1xuXG4gIE1vZGVsLmRlc3Ryb3lCeUlkID0gZnVuY3Rpb24gc29mdERlc3Ryb3lCeUlkKGlkLCBjYikge1xuICAgIHJldHVybiBNb2RlbC51cGRhdGVBbGwoeyBbaWROYW1lXTogaWQgfSwgeyAuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCl9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucmVtb3ZlQnlJZCA9IE1vZGVsLmRlc3Ryb3lCeUlkO1xuICBNb2RlbC5kZWxldGVCeUlkID0gTW9kZWwuZGVzdHJveUJ5SWQ7XG5cbiAgTW9kZWwucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiBzb2Z0RGVzdHJveShvcHRpb25zLCBjYikge1xuICAgIGNvbnN0IGNhbGxiYWNrID0gKGNiID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpID8gb3B0aW9ucyA6IGNiO1xuXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlQXR0cmlidXRlcyh7IC4uLnNjcnViYmVkLCBbZGVsZXRlZEF0XTogbmV3IERhdGUoKSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpID8gY2FsbGJhY2sobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSA/IGNhbGxiYWNrKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucHJvdG90eXBlLnJlbW92ZSA9IE1vZGVsLnByb3RvdHlwZS5kZXN0cm95O1xuICBNb2RlbC5wcm90b3R5cGUuZGVsZXRlID0gTW9kZWwucHJvdG90eXBlLmRlc3Ryb3k7XG5cbiAgLy8gRW11bGF0ZSBkZWZhdWx0IHNjb3BlIGJ1dCB3aXRoIG1vcmUgZmxleGliaWxpdHkuXG4gIGNvbnN0IHF1ZXJ5Tm9uRGVsZXRlZCA9IHtbZGVsZXRlZEF0XTogbnVsbH07XG5cbiAgY29uc3QgX2ZpbmRPckNyZWF0ZSA9IE1vZGVsLmZpbmRPckNyZWF0ZTtcbiAgTW9kZWwuZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gZmluZE9yQ3JlYXRlRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZE9yQ3JlYXRlLmNhbGwoTW9kZWwsIHF1ZXJ5LCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfZmluZCA9IE1vZGVsLmZpbmQ7XG4gIE1vZGVsLmZpbmQgPSBmdW5jdGlvbiBmaW5kRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZC5jYWxsKE1vZGVsLCBxdWVyeSwgLi4ucmVzdCk7XG4gIH07XG5cbiAgY29uc3QgX2NvdW50ID0gTW9kZWwuY291bnQ7XG4gIE1vZGVsLmNvdW50ID0gZnVuY3Rpb24gY291bnREZWxldGVkKHdoZXJlID0ge30sIC4uLnJlc3QpIHtcbiAgICAvLyBCZWNhdXNlIGNvdW50IG9ubHkgcmVjZWl2ZXMgYSAnd2hlcmUnLCB0aGVyZSdzIG5vd2hlcmUgdG8gYXNrIGZvciB0aGUgZGVsZXRlZCBlbnRpdGllcy5cbiAgICBsZXQgd2hlcmVOb3REZWxldGVkO1xuICAgIGlmICghd2hlcmUgfHwgT2JqZWN0LmtleXMod2hlcmUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgd2hlcmVOb3REZWxldGVkID0gcXVlcnlOb25EZWxldGVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGVyZU5vdERlbGV0ZWQgPSB7IGFuZDogWyB3aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICB9XG4gICAgcmV0dXJuIF9jb3VudC5jYWxsKE1vZGVsLCB3aGVyZU5vdERlbGV0ZWQsIC4uLnJlc3QpO1xuICB9O1xuXG4gIGNvbnN0IF91cGRhdGUgPSBNb2RlbC51cGRhdGU7XG4gIE1vZGVsLnVwZGF0ZSA9IE1vZGVsLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uIHVwZGF0ZURlbGV0ZWQod2hlcmUgPSB7fSwgLi4ucmVzdCkge1xuICAgIC8vIEJlY2F1c2UgdXBkYXRlL3VwZGF0ZUFsbCBvbmx5IHJlY2VpdmVzIGEgJ3doZXJlJywgdGhlcmUncyBub3doZXJlIHRvIGFzayBmb3IgdGhlIGRlbGV0ZWQgZW50aXRpZXMuXG4gICAgbGV0IHdoZXJlTm90RGVsZXRlZDtcbiAgICBpZiAoIXdoZXJlIHx8IE9iamVjdC5rZXlzKHdoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHdoZXJlTm90RGVsZXRlZCA9IHF1ZXJ5Tm9uRGVsZXRlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hlcmVOb3REZWxldGVkID0geyBhbmQ6IFsgd2hlcmUsIHF1ZXJ5Tm9uRGVsZXRlZCBdIH07XG4gICAgfVxuICAgIHJldHVybiBfdXBkYXRlLmNhbGwoTW9kZWwsIHdoZXJlTm90RGVsZXRlZCwgLi4ucmVzdCk7XG4gIH07XG59O1xuIl19
