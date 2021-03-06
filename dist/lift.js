"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var isFunction = function isFunction(func) {
  return !!(func && func.constructor && func.call && func.apply);
};

var idFunction = function idFunction(value) {
  return value;
};

var isNone = function isNone(value) {
  return value === null || value === undefined;
};

var Curry = exports.Curry = function Curry(func) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return args.length >= func.length ? func.apply(undefined, args) : Curry.bind.apply(Curry, [undefined, func].concat(args));
};

var Monad = exports.Monad = function Monad(modifier) {
  var prototype = Object.create({ is_monad: true });
  var unit = function unit(value) {
    var monad = Object.create(prototype);

    var run = function run(value, func, args) {
      return isFunction(func) ? func.apply(undefined, [value].concat(_toConsumableArray(args || []))) : monad;
    };
    prototype.bind = function (func, args) {
      return run(value, func, args);
    };

    monad.of = function (value) {
      var m = run(value, idFunction);
      return m && m.is_monad ? m : unit(m);
    };
    monad.fold = function () {
      return value;
    };
    monad.chain = monad.bind;
    monad.map = function (func) {
      return unit(func(value));
    };
    monad.join = function () {
      return monad.bind(idFunction);
    };
    monad.toMaybe = function () {
      return Maybe(value);
    };
    monad.run = function (func) {
      return run(value, func), monad;
    };

    if (isFunction(modifier)) {
      modifier(monad, value);
    }
    return monad;
  };

  var apply = function apply(prototype, name, func, unit) {
    prototype[name] = func;
    return unit;
  };

  unit.lift = unit.l = function (name, func) {
    return apply(prototype, name, function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var m = prototype.bind(func, args);
      return m && m.is_monad ? m : unit(m);
    }, unit);
  };

  unit.liftValue = unit.lv = function (name, func) {
    return apply(prototype, name, function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return prototype.bind(func, args);
    }, unit);
  };

  unit.method = unit.m = function (name, func) {
    return apply(prototype, name, func, unit);
  };

  return unit;
};

var Just = exports.Just = Monad();

var Maybe = exports.Maybe = Monad(function (monad, value) {
  var valueIsNone = isNone(value);
  monad.isNothing = monad.n = function () {
    return valueIsNone;
  };
  monad.is = function () {
    return !valueIsNone;
  };
  monad.or = function (orValue) {
    return valueIsNone ? orValue : value;
  };
  monad.else = function (orMonad) {
    return valueIsNone ? orMonad : monad;
  };
  monad.bind = valueIsNone ? function () {
    return monad;
  } : monad.bind;
  monad.map = valueIsNone ? function () {
    return monad;
  } : monad.map;
  var run = monad.run;
  monad.run = function (func) {
    return (valueIsNone ? function () {} : run)(value, func), monad;
  };
});

var validFunctions = function validFunctions(monad, value) {
  monad.success = monad.s = successFactory;
  monad.fail = monad.f = failFactory;
  monad.isSuccess = function () {
    return monad.isSuccessValue;
  };
  monad.isFail = function () {
    return !monad.isSuccessValue;
  };
  monad.ap = function (validationWithFn) {
    return monad.isSuccess() ? // eslint-disable-line
    validationWithFn.map(function (fn) {
      return fn(value);
    }) : validationWithFn.isFail() ? monad.fail([].concat(value, validationWithFn.fail())) : monad;
  };
};

var Success = Monad(function (monad, value) {
  monad.isSuccessValue = true;
  validFunctions(monad, value);
});

var Fail = Monad(function (monad, value) {
  monad.isSuccessValue = false;
  validFunctions(monad, value);
});

var successFactory = function successFactory(value) {
  return Success(value);
};
var failFactory = function failFactory(value) {
  return Fail(value);
};

var Valid = exports.Valid = Monad(function (monad, value) {
  validFunctions(monad, value);
});

Valid.success = Valid.s = successFactory;
Valid.fail = Valid.f = failFactory;

var IO = exports.IO = function IO(func) {
  return function () {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return Monad(function (monad, value) {
      monad.run = function () {
        return value.apply(undefined, args);
      };
    })(func);
  };
};
//# sourceMappingURL=lift.js.map