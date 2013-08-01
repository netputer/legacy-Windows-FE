/*global define*/
(function (window) {
    define([], function () {
        console.log('FilterFunction - File loaded.');
        var FilterFunction = {};

        var VARIABLE_NAME = 'data';

        var valueToExpression = function (value) {
            return JSON.stringify(value);
        };

        var selectorToExpression = function (selector) {
            var segments = selector.split('.');
            var segmentExpressions = segments.map(valueToExpression);
            return '[' + segmentExpressions.join('][') + ']';
        };

        var operators = FilterFunction.operators = {};

        operators[''] = operators.eq = function (expectation, valueExpression) {
            var testExpression;
            var callee = operators.eq;

            if (expectation.constructor === String || expectation.constructor === Number || expectation.constructor === Boolean) {
                /* primitive strict equal */
                testExpression = valueExpression + '===' + valueToExpression(expectation);
            } else if (expectation instanceof Array) {
                /* array deep equal */
                testExpression = valueExpression + '.length===' + expectation.length;

                var i, l;
                for (i = 0, l = expectation.length; i < l; i++) {
                    testExpression += '&&' + callee(expectation[i], valueExpression + '[' + i + ']');
                }
            } else {
                /* object deep equal */
                testExpression = 'Object.keys(' + valueExpression + ').length===' + Object.keys(expectation).length;

                Object.keys(expectation).forEach(function (deepSelector) {
                    testExpression += '&&' + callee(expectation[deepSelector], valueExpression + selectorToExpression(deepSelector));
                });
            }
            return testExpression;
        };

        operators.ne = function (expectation, valueExpression) {
            var eqExpression = operators.eq(expectation, valueExpression);
            return '!(' + eqExpression + ')';
        };

        operators.lt = function (expectation, valueExpression) {
            return valueExpression + '<' + valueToExpression(expectation);
        };

        operators.lte = function (expectation, valueExpression) {
            return valueExpression + '<=' + valueToExpression(expectation);
        };

        operators.gt = function (expectation, valueExpression) {
            return valueExpression + '>' + valueToExpression(expectation);
        };

        operators.gte = function (expectation, valueExpression) {
            return valueExpression + '>=' + valueToExpression(expectation);
        };

        FilterFunction.generate = function (json) {
            var functionCode = 'return true';

            Object.keys(json).forEach(function (selector) {
                var tests = json[selector];
                if (tests.constructor === String || tests.constructor === Number || tests.constructor === Boolean) {
                    if (operators.hasOwnProperty('')) {
                        /* use default operator if it exists */
                        functionCode += '&&' + operators[''](tests, VARIABLE_NAME + selectorToExpression(selector));
                    }
                } else {
                    var operatorFound = false;

                    Object.keys(tests).forEach(function (subSelector) {
                        if (subSelector.indexOf('$') === 0) {
                            /* it's an operator starts with $ sign */
                            operatorFound = true;
                            var operator = subSelector.substr(1);
                            if (operators.hasOwnProperty(operator)) {
                                /* operator exists */
                                functionCode += '&&' + operators[operator](tests[subSelector], VARIABLE_NAME + selectorToExpression(selector));
                            }
                        }
                    });

                    if (!operatorFound) {
                        /* if no operator sign found then treat it as a test for default operator */
                        functionCode += '&&' + operators[''](tests, VARIABLE_NAME + selectorToExpression(selector));
                    }
                }
            });

            functionCode += ';';
            return new Function(VARIABLE_NAME, functionCode);
        };

        return FilterFunction;
    });
}(this));
