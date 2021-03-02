var UnknownField = "UnknownField";
var ErrorSummary = "ErrorSummary";

;
(function(__global, angular) {

    if (!angular) {
        throw new Error("window.angular is not defined.");
    }

    var coreScope;
    angular.injector(['ng']).invoke(['$rootScope',
        function($rootScope) {
            coreScope = $rootScope.$new();
        }
    ]);

    var framework = angular.module('framework', []);

    //framework.UNDEFINED_FIELD = unknownField;

    /*
    framework.directive("defaultField", function($compile) {
        //var divDefaultField = '<input type="text" id="' + unknownField + '" name="' + unknownField + '" ></input>';
        var divDefaultField = "<div ng-class='{error: myForm.NoField.$error[\"NoField\"]}'>" + 
                              "<input type=\"text\" data-ng-model=\"eApp.eAppNumber\" name=\"NoField\" id=\"NoField\" validate=\"noFieldRules\" />" +
                              "<div class=\"errorToolBlock\">" +
                              "<span class=\"errorTooltip\">{{NoFieldRules.error.message()}}</span>" +
                              "</div>" + 
                              "</div>";
        
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var h = $compile(divDefaultField)(scope);
                element.html('').append(h);
            }
        };
    });
    */
    framework.directive('preventTouchOnFocus', function() {
        return {
            scope: false,
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('focus', function() {
                    disableTouchMove();
                });
                element.bind('blur', function() {
                    enableTouchMove();
                });
            }
        };
    });


    framework.directive('imageOnload', function() {
        return {
            scope: false,
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('load', function() {
                    scope.$eval(attrs.imageOnload);
                });
            }
        };
    });

    framework.directive('sortColumn', function() {
        return {
            scope: {
                sortSource: '=',
                sortOrder: '=',
                text: '@',
                onSort: '&'
            },
            restrict: 'A',
            template: '<div style="display:inline-block;position:relative;padding-right: 15px;cursor: pointer;">{{text}}<div ng-class="{\'arrow-up\': sortOrder>0, \'arrow-down\': sortOrder<0}"></div></div>',
            link: function(scope, element, attrs) {
                if (scope.sortOrder == undefined) {
                    scope.sortOrder = 0;
                }
                element.bind('click', function() {
                    scope.$apply(function() {
                        if (scope.sortOrder == 0) {
                            scope.sortOrder = 1;
                        } else {
                            scope.sortOrder *= -1;
                        }
                    });
                    scope.sortSource = scope.onSort({
                        source: scope.sortSource,
                        column: attrs.sortOrder
                    });
                });
            }
        };
    });

    framework.directive("bindHtmlUnsafe", function($compile, $timeout) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {

                var compile = function(newHTML) { // Create re-useable compile function
                    var _childScopeKey = ((attrs.id) ? attrs.id : '') + "_BindHtmlUnsafeChildScope";
                    if (scope[_childScopeKey]) {
                        //destroy the last child scope
                        scope[_childScopeKey].$destroy();
                    }
                    //create new child scope
                    scope[_childScopeKey] = scope.$new(false);
                    newHTML = $compile(newHTML)(scope[_childScopeKey]); // Compile html
                    element.html('').append(newHTML); // Clear and append it

                };

                var htmlName = attrs.bindHtmlUnsafe; // Get the name of the variable 
                // Where the HTML is stored

                scope.$watch(htmlName, function(newHTML) { // Watch for changes to 
                    // the HTML
                    if (!newHTML) return;
                    compile(newHTML); // Compile it
                });
            }
        };
    });

    framework.directive("include", function($compile) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                var compile = function(newHTML) { // Create re-useable compile function
                    newHTML = $compile(newHTML)(scope); // Compile html
                    element.html('').append(newHTML); // Clear and append it
                };

                var html = attrs.include; // html content 
                if (html) {
                    compile(html);
                }
            }
        };
    });

    framework.directive('slideable', function() {
        return {
            restrict: 'C',
            compile: function(element, attr) {
                // wrap tag
                var contents = element.html();
                element.html('<div class="slideable_content" style="overflow:hidden;max-height:99999px; margin:0 !important; padding:0 !important" >' + contents + '</div>');
                return function postLink(scope, element, attrs) {

                };
            }
        };
    });

    framework.directive('slideToggle', function($timeout) {
        this.isPrevSlideExpanded = undefined;
        var doSlideToggle = function(scope, target, content, attrs) {
            var container = $(content);
            var inner = $(content).find('div:first');

            // css transition callback
            container.on('transitionEnd webkitTransitionEnd transitionend oTransitionEnd msTransitionEnd', function(e) {
                if (scope.isSlideExpanded) {
                    container.css('max-height', 99999);
                }
            });
            if (attrs.slideToggleDirty || !scope.isSlideExpanded) {
                if (scope.isSlideExpanded) {
                    container.css({
                        'max-height': inner.outerHeight(),
                        'opacity': 1
                    });

                } else {
                    // disable transitions & set max-height to content height
                    container.removeClass('slidable-transitions ').css('max-height', inner.outerHeight());
                    setTimeout(function() {

                        // enable & start transition
                        container.addClass('slidable-transitions ').css({
                            'max-height': 0,
                            'opacity': 0
                        });

                    }, 10); // 10ms timeout is the secret ingredient for disabling/enabling transitions
                    // chrome only needs 1ms but FF needs ~10ms or it chokes on the first animation for some reason
                }
                attrs.slideToggleDirty = true;
            }

        };

        return {
            restrict: 'A',
            scope: {
                isSlideExpanded: '=ngModel'
            },
            link: function(scope, element, attrs) {
                var target, content;
                $timeout(function() {
                    if (!target) target = document.querySelector(attrs.slideToggle);
                    if (!content) content = target.querySelector('.slideable_content');
                    doSlideToggle(scope, target, content, attrs);

                    scope.$watch('isSlideExpanded', function(isExpanded) {
                        if (isExpanded != this.isPrevSlideExpanded) {
                            doSlideToggle(scope, target, content, attrs);
                            this.isPrevSlideExpanded = isExpanded;
                        }
                    });

                    element.bind('click', function() {
                        scope.$apply(function() {
                            scope.isSlideExpanded = !scope.isSlideExpanded;
                        });
                    });

                });
            }
        };
    });

    framework.directive('dateInput', function(dateFilter, dateValueFilter) {
        var templateHtml = '<input type="date"/>';

        if (!IsMobileBrowser()) {
            templateHtml = '<input type="text" custom-date-picker  />';
        }

        return {
            require: 'ngModel',
            template: templateHtml,
            replace: true,
            link: function(scope, elm, attrs, ngModelCtrl) {
                ngModelCtrl.$formatters.unshift(function(modelValue) {
                    if (!IsMobileBrowser()) {
                        return dateFilter(dateValueFilter(modelValue), 'yyyy/MM/dd'); //dateInput_by_Gary
                    } else {
                        //The HTML5 date input specification [1] refers to the RFC3339 specification [2], which specifies a full-date format equal to: yyyy-mm-dd. See section 5.6 of the RFC3339 specification for more details.
                        //[1] - http://dev.w3.org/html5/markup/input.date.html
                        //[2] - http://tools.ietf.org/html/rfc3339
                        return dateFilter(dateValueFilter(modelValue), 'yyyy-MM-dd');
                    }
                });

                ngModelCtrl.$parsers.unshift(function(viewValue) {
                    if (viewValue) {
                        //                        var arr = viewValue.split("-");
                        //                        if (arr.length == 3) {
                        //                            var _y = parseInt(arr[0]);
                        //                            var _m = parseInt(arr[1]) -1 ;
                        //                            var _d = parseInt(arr[2]);
                        //                            return dateFilter(new Date(_y, _m, _d), 'yyyy-MM-ddThh:mm:ss');
                        //                        }
                        if (!IsMobileBrowser()) {
                            var arr = viewValue.split("/");
                            if (arr.length == 3) {
                                var _y = parseInt(arr[0], 10);
                                var _m = parseInt(arr[1], 10) - 1;
                                var _d = parseInt(arr[2], 10);
                                return dateFilter(new Date(_y, _m, _d), 'yyyy-MM-ddThh:mm:ss');
                            }
                        } else {
                            //The HTML5 date input specification [1] refers to the RFC3339 specification [2], which specifies a full-date format equal to: yyyy-mm-dd. See section 5.6 of the RFC3339 specification for more details.
                            //[1] - http://dev.w3.org/html5/markup/input.date.html
                            //[2] - http://tools.ietf.org/html/rfc3339
                            var arr = viewValue.split("-");
                            if (arr.length == 3) {
                                var _y = parseInt(arr[0], 10);
                                var _m = parseInt(arr[1], 10) - 1;
                                var _d = parseInt(arr[2], 10);
                                return dateFilter(new Date(_y, _m, _d), 'yyyy-MM-ddThh:mm:ss');
                            }
                        }


                    }
                    return null;
                });

            }
        };
    });

    framework.directive('customDatePicker', function() {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, ngModelCtrl) {
                if (!IsMobileBrowser()) {
                    $(element).datepicker({
                        changeMonth: true,
                        changeYear: true,
                        yearRange: "-90:+90",
                        dateFormat: 'yy/mm/dd',    //customDatePicker_by_Gary
                        onSelect: function(date) {
                            scope.$apply(function() {
                                ngModelCtrl.$setViewValue(date);
                            });
                        }
                   },$.datepicker.regional['zh-CN']);
                }
            }
        };
    });

    
framework.directive('repeatFinish',function(){
    return {
        link: function(scope,element,attr){
            if(scope.$last == true){
                 scope.$eval( attr.repeatFinish )
            }
        }
    }
   });

framework.directive('repeatBegin',function(){
    return {
        link: function(scope,element,attr){
            if(scope.$first == true){
                 scope.$eval( attr.repeatBegin )
            }
        }
    }
  });

    framework.directive('currencyInput', ['$filter', '$locale',
        function($filter, $locale) {
            return {
                restrict: 'A',
                scope: {
                    field: '='
                },
                require: 'ngModel',
                replace: true,
                template: '<input type="text" ng-model="field" style="margin:0px 0px 0px 5px;width:75%" />',
                link: function(scope, element, attrs, controller) {
                    if (!controller) return;

                    //keypress detect actual character input e.g. comma,dot .. etc
                    $(element).bind('keypress', function(e) {
                        var inputVal = $(e.currentTarget).val();
                        var charCode = e.which || e.keyCode;
                        //up, down, left, right, home, end
                        var decimalSeparateCharCode = $locale.NUMBER_FORMATS.DECIMAL_SEP.charCodeAt(0) ;
                        if( charCode== 38 || charCode== 40 ||charCode== 37 ||charCode== 39 ||charCode== 36 ||charCode== 35 || charCode == 8 || charCode == decimalSeparateCharCode || charCode == 9){
                            return;
                        }
                        var charPressed = String.fromCharCode(charCode);
                        var pattern = "[^\\d|^\\"+ $locale.NUMBER_FORMATS.DECIMAL_SEP + "]";
                        //only allow input digit and only one DECIMAL_SEP
                        if (charPressed.match(new RegExp(pattern, "g")) || (charCode == decimalSeparateCharCode && inputVal.indexOf($locale.NUMBER_FORMATS.DECIMAL_SEP) > -1)) {
                            e.preventDefault()
                            return false;
                        }
                        return;
                    });

                    // model --> DOM
                    controller.$formatters.unshift(function(a) {
                        return ( !(controller.$modelValue==undefined || controller.$modelValue==null || controller.$modelValue === '') ? $filter('number')(controller.$modelValue) : null);
                        //return toFormat(controller.$modelValue)
                    });

                    // DOM --> model
                    controller.$parsers.unshift(function(viewValue) {
                        if (viewValue!=null && viewValue!=undefined){  
                            //var plainNumber = viewValue.replace(/[^\d|\-+|^\.]/g, '');
                            var plainNumber = parseNumberWithLocaleFormat(viewValue);
                            if(plainNumber!=null && plainNumber!=undefined){
                            	var numDecimalPlace = parseInt(attrs.currencyInputDecimalPlace,10);
                            	if(numDecimalPlace!=null && numDecimalPlace!=undefined && numDecimalPlace>-1){  
                            		plainNumber = parseFloat(plainNumber.toFixed(numDecimalPlace));
                            	}
	                            var numVal = $filter('number')(plainNumber);
	                            element.val(numVal);
	                            return plainNumber;
	                        }
                        }
                        element.val("");
                    	return null;
                    });


                }
            };
        }
    ]);

    //////////////////////////////////////////////////////
    // optional parameters:
    // 1.numeric-input-decimal-place
    //   e.g. 2
    //////////////////////////////////////////////////////
    framework.directive('numericInput', ['$filter', '$locale',
        function($filter, $locale) {
            return {
                restrict: 'A',
                require: 'ngModel',
                replace: true,
                link: function(scope, element, attrs, controller) {
                    if (!controller) return;

                    //keypress detect actual character input e.g. comma,dot .. etc
                    $(element).bind('keypress', function(e) {
                        var inputVal = $(e.currentTarget).val();
                        var charCode = e.which || e.keyCode;
                        //up, down, left, right, home, end
                        var decimalSeparateCharCode = $locale.NUMBER_FORMATS.DECIMAL_SEP.charCodeAt(0) ;
                        if( charCode== 38 || charCode== 40 ||charCode== 37 ||charCode== 39 ||charCode== 36 ||charCode== 35 || charCode == 8 || charCode == decimalSeparateCharCode || charCode == 9){
                            return;
                        }
                        var charPressed = String.fromCharCode(charCode);
                        var pattern = "[^\\d|^\\"+ $locale.NUMBER_FORMATS.DECIMAL_SEP + "]";
                        //only allow input digit and only one DECIMAL_SEP
                        if (charPressed.match(new RegExp(pattern, "g")) || (charCode == decimalSeparateCharCode && inputVal.indexOf($locale.NUMBER_FORMATS.DECIMAL_SEP) > -1)) {
                            e.preventDefault()
                            return false;
                        }
                        return;
                    });

                    // model --> DOM
                    controller.$formatters.unshift(function(a) {
                        return (  !(controller.$modelValue==undefined || controller.$modelValue==null || controller.$modelValue === '') ? $filter('number')(controller.$modelValue) : null);
                        //return toFormat(controller.$modelValue)
                    });

                    // DOM --> model
                    controller.$parsers.unshift(function(viewValue) {
                        if (viewValue!=null && viewValue!=undefined){  
                            //var plainNumber = viewValue.replace(/[^\d|\-+|^\.]/g, '');
                            var plainNumber = parseNumberWithLocaleFormat(viewValue);
                            if(plainNumber!=null && plainNumber!=undefined){
                                var numDecimalPlace = parseInt(attrs.numericInputDecimalPlace,10);
                                if(numDecimalPlace!=null && numDecimalPlace!=undefined && numDecimalPlace>-1){  
                                    plainNumber = parseFloat(plainNumber.toFixed(numDecimalPlace));
                                }
                                var numVal = $filter('number')(plainNumber);
                                element.val(numVal);
                                return plainNumber;
                            }
                        }
                        element.val(null);
                        return null;
                    });


                }
            };
        }
    ]);

    framework.directive('integerInput', ['$filter',
        function($filter) {
            return {
                restrict: 'A',
                require: 'ngModel',
                replace: true,
                link: function(scope, element, attrs, controller) {
                    if (!controller) return;

                    $(element).bind('keypress', function(e) {
                        var inputVal = $(e.currentTarget).val();
                        var charCode = e.which || e.keyCode;
                        //up, down, left, right, home, end
                        if( charCode== 38 || charCode== 40 ||charCode== 37 ||charCode== 39 ||charCode== 36 ||charCode== 35 || charCode == 8 || charCode == 9){
                            return;
                        }
                        var charPressed = String.fromCharCode(charCode);
                        if (charPressed.match(/[^\d]/g)) {
                            e.preventDefault()
                            return false;
                        }
                    });

                    // model --> DOM
                    controller.$formatters.unshift(function(a) {
                        return controller.$modelValue;
                    });

                    // DOM --> model
                    controller.$parsers.unshift(function(viewValue) {
                        if (viewValue) {
                            var plainNumber = viewValue;
                            var reg = /^\d+$/;
                            var isDigitOnly = reg.test(viewValue);
                            if (plainNumber && isDigitOnly && !isNaN(plainNumber)) {
                                if(attrs.integerInputAsString!=undefined){
                                	element.val(plainNumber);
                                    return plainNumber;    
                                }
                                var r = parseInt(plainNumber,10);
                                element.val(r.toString());
                                return r;
                            }
                        }
                        element.val(null);
                        return null;
                    });
                }
            };
        }
    ]);

    framework.directive('caseInsensitive', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                var toUpperCase = function (inputValue) {
                    if (angular.isUndefined(inputValue))
                        return;
 
                    var capitalized = inputValue? inputValue.toUpperCase(): inputValue;
                    if (capitalized !== inputValue) {
                        modelCtrl.$setViewValue(capitalized);
                        modelCtrl.$render();
                    }
                    return capitalized;
                }
                modelCtrl.$parsers.push(toUpperCase);
                toUpperCase(scope[attrs.ngModel]);  // capitalize initial value
            }
        };
    });

    framework.directive('autoComplete', function($timeout) {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, controller) {
                element.autocomplete({
                    source: scope[attrs.source],
                    selectFirst: true,
                    minLength: attrs.minlength,
                    messages: {
                        noResults: '',
                        results: function() {}
                    },
                    select: function() {
                        $timeout(
                            function() {
                                element.trigger('input');
                            }, 0
                        );
                    }
                });
                                
                scope.$watch(attrs.source, function(newSource) {
                    element.autocomplete( "option", "source", newSource );
                });
            }
        };
    });

    framework.directive('file', function() {

        getSizeDescription = function(size) {
            var _unit = ['B', 'KB', 'MB', 'GB', '?'];
            var _unitIdx = 0;
            var _result = "N/A";
            if (size && !isNaN(size)) {
                var _size = size;
                while (_size >= 1000) {
                    _unitIdx++;
                    _size = _size / 1024;
                }
                _result = _size.toFixed(2).toString() + _unit[Math.min(_unitIdx, _unit.length - 1)];
            }
            return _result;
        };

        return {
            scope: {
                file: '=',
                sizeLimit: '@',
                onSizeExceed: '&onSizeExceed'
            },
            link: function(scope, el, attrs) {
                el.bind('change', function(event) {
                    scope.$apply(function() {
                        var files = event.target.files;
                        if (files && files.length > 0) {
                            var _file = files[0];
                            var _isValid = true;
                            if (scope.sizeLimit && !isNaN(scope.sizeLimit)) {
                                var _sizeLimit = parseInt(scope.sizeLimit, 10);
                                if (_file.size > _sizeLimit) {
                                    _isValid = false;
                                    if (attrs.onSizeExceed) {
                                        scope.onSizeExceed();
                                    } else {
                                        alert('The file size exceeds the limit allowed (' + getSizeDescription(_sizeLimit) + ')');
                                    }
                                }
                            }
                            if (_isValid) {
                                scope.file = _file;
                            } else {
                                scope.file = null;
                            }
                        } else {
                            scope.file = el.val();
                        }
                    });

                });
            }
        };
    });

    framework.filter('dateValue', function() {
        return function(input) {
            if (angular.isUndefined(input) || input == null) return input;

            /*
            if (angular.isDate(input))
                return input;
            else
                return parseInt(input.substr(6));
            */
            if (angular.isDate(input))
                return input;
            else {
                return parseDateWithISOFormat(input);
            }
        };
    });

    framework.filter('countErrors', function() {
        return function(obj) {
            var c = 0;
            if (obj) {
                for (f in obj) {
                    if (obj.hasOwnProperty(f)) {
                        if (obj[f])
                            c++;
                    }
                }
            };
            return c;
        };
    });

    framework.filter('fitToRetina', function() {
        function isRetina() {
            var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\(min--moz-device-pixel-ratio: 1.5),\(-o-min-device-pixel-ratio: 3/2),\(min-resolution: 1.5dppx)";

            if (window.devicePixelRatio > 1)
                return true;

            if (window.matchMedia && window.matchMedia(mediaQuery).matches)
                return true;

            return false;
        };

        return function(input) {
            var retina = false;
            if (isRetina())
                retina = true;

            return (retina ? input.replace('.', '2x.') : input);
        };
    });

    //<<eClaim Begin
    framework.directive('whenScrolled', function($window) {
        return {
            link: function(scope, element, attr) {
                angular.element($window).bind('scroll', function() { 
                    scope.$apply(attr.whenScrolled);
                }); 
            }
        };
    });

    framework.filter('formatnumber', function () {
        return function (input) {
            if (input != undefined) {
                return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            else {
                return undefined;
            }
        };
    });
    //<<eClaim End

    String.prototype.format = function() {
        var formatted = this;
        for (var i = 0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{' + i + '\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    };

    Object.keys = Object.keys || function(o) {
        var result = [];
        for (var name in o) {
            if (o.hasOwnProperty(name))
                result.push(name);
        }
        return result;
    };

    /*
    ErrorSummaryHelper =  {
        controllers: {},
        dirtys: {},
        errors: {},
        errMessages: [],
        scope: null,
        controller: null,
        init: function(scope, controller) {
            var instance = new ErrorSummaryHelper;
            
            instance.controllers = {};
            instance.errors = {};
            instance.newErrors = {};
            angular.copy([], instance.errMessages);
            angular.copy([], instance.newErrMessages);
            instance.scope = scope;
            instance.controller = controller;
            return instance;
        },
        getKey: function(dataSource, scopeKey) {
            if (scopeKey) {
                return dataSource + "___" + scopeKey;
            }
            return dataSource;
        },
        getError: function(dataSource, scopeKey) {
            if (this.errors && this.errors[this.getKey(dataSource, scopeKey)]) {
                return this.errors[this.getKey(dataSource, scopeKey)].message();
            }
            return null;
        },
        hasError: function(dataSource, scopeKey) {
            if (dataSource == undefined) return (this.errMessages.length > 0);

            if (angular.isDefined(this.getKey(dataSource, scopeKey))) {
                return angular.isDefined(this.errors[this.getKey(dataSource, scopeKey)]);
            } else {
                return (this.errMessages.length > 0);
            }
        },
        addController: function(dataSource, scopeKey, validator) {
            if (angular.isDefined(dataSource)) {
                this.controllers[this.getKey(dataSource, scopeKey)] = validator;
            }            
        },
        removeController: function(dataSource, scopeKey) {
            var copy = {};
            var getKeyFunc = this.getKey;
            angular.forEach(this.controllers, function(v, k) {
                if (k != getKeyFunc(dataSource, scopeKey))
                    copy[k] = v;
            });
            this.controllers = copy;            
        },
        checkControllers: function() {
            angular.forEach(this.controllers, function(v, k) {
                var controller = v;
                var _v = controller.$viewValue;
                controller.$setViewValue(_v);
            });
        },
        add: function(dataSource, scopeKey, message) {
            if (angular.isDefined(dataSource)) {
                if (angular.isUndefined(this.errors[this.getKey(dataSource, scopeKey)])) {
                    this.errors[this.getKey(dataSource, scopeKey)] = new ErrorObject();
                }
                this.errors[this.getKey(dataSource, scopeKey)].set(message);
                angular.copy(this.messages(this.errors), this.errMessages);
            }
        },
        //To-Do: add key
        remove: function(dataSource, scopeKey) {
            var copy = {};
            var getKeyFunc = this.getKey;
            angular.forEach(this.errors, function(v, k) {
                if (k != getKeyFunc(dataSource, scopeKey))
                    copy[k] = v;
            });
            this.errors = copy;
            angular.copy(this.messages(this.errors), this.errMessages);            
        },
        messages: function(errs) {
            var msgs = [];
            angular.forEach(errs, function(v, k) {
                var errMsgs = v.messages;
                for (m in errMsgs) {
                    this.push(errMsgs[m]);
                }
            }, msgs);
            return msgs;
        },
        isDirty: function(dataSource, scopeKey) {
            return this.dirtys[this.getKey(dataSource, scopeKey)];  
        },
        setDirty: function(dataSource, scopeKey, value) {
            if (dataSource == undefined) return;
            var existing = this.isDirty(dataSource, scopeKey);
            this.dirtys[this.getKey(dataSource, scopeKey)] = (existing || value);
        },
        clearDirty: function(dataSource, scopeKey, value) {
            this.dirtys[this.getKey(dataSource, scopeKey)] = false;
        }
    };
    */

    ErrorSummaryHelper = function(scope, controller, fieldSets) {
        this.fieldSets = {};
        if (fieldSets)
            this.fieldSets = fieldSets;

        this.dirtys = {};
        this.errors = {};
        this.errMessages = [];
        this.scope = scope;
        this.controller = controller;
        this.getKey = function(dataSource, scopeKey) {
            if (scopeKey) {
                return dataSource + "___" + scopeKey;
            }
            return dataSource;
        };
        this.getError = function(dataSource, scopeKey) {
            if (this.errors && this.errors[this.getKey(dataSource, scopeKey)]) {
                return this.errors[this.getKey(dataSource, scopeKey)].message();
            }
            return null;
        };
        this.hasError = function(dataSource, scopeKey) {
            if (dataSource == undefined) return (this.errMessages.length > 0);

            if (angular.isDefined(this.getKey(dataSource, scopeKey))) {
                return angular.isDefined(this.errors[this.getKey(dataSource, scopeKey)]);
            } else {
                return (this.errMessages.length > 0);
            }
        };
        this.getFieldSet = function(dataSource, scopeKey) {
            return this.fieldSets[this.getKey(dataSource, scopeKey)];
        };
        this.getFieldSets = function() {
            return this.fieldSets;
        };
        this.addFieldSet = function(dataSource, scopeKey, validator) {
            if (angular.isDefined(dataSource)) {
                this.fieldSets[this.getKey(dataSource, scopeKey)] = validator;
            }
        };
        this.removeFieldSet = function(dataSource, scopeKey) {
            var copy = {};
            var getKeyFunc = this.getKey;
            angular.forEach(this.fieldSets, function(v, k) {
                if (k != getKeyFunc(dataSource, scopeKey))
                    copy[k] = v;
            });
            this.fieldSets = copy;
        };
        this.checkFieldSets = function() {
            angular.forEach(this.fieldSets, function(v, k) {
                var controller = v.controller;
                var _v = controller.$viewValue;
                controller.$setViewValue(_v);
            });
        };
        this.checkFieldSet = function(dataSource, scopeKey) {
            var v = this.fieldSets[this.getKey(dataSource, scopeKey)];
            if(v){
                var controller = v.controller;
                var _v = controller.$viewValue;
                controller.$setViewValue(_v);
            }
        };
        this.clearFieldSets = function() {
            this.fieldSets = {};
        };
        this.lookupFieldSet = function(dataSource, index) {
            var f = undefined;
            var i = 0;
            angular.forEach(this.fieldSets, function(v, k) {
                var validator = v.validator;
                var target = validator.target;
                if (target == dataSource) {
                    if (i == index) {
                        f = v;
                        return;
                    } else {
                        i++;
                    }
                }
            });
            return f;
        };
        /*this.changeScopeKey = function(dataSource, oldScopeKey, newScopeKey) {
            var oldKey = oldScopeKey;

            if(typeof oldScopeKey === 'number')
                oldKey = oldScopeKey.toString();

            var msg = this.getError(dataSource, oldKey);

            if (msg) {
                this.remove(dataSource, oldKey);
                this.add(dataSource,newScopeKey, msg);
            }
        };*/
        this.merge = function(errorSummary) {
            if (angular.isDefined(errorSummary)) {
                var _copy = this.errors;
                this.errors = extend(_copy, errorSummary.errors);
                angular.copy(this.messages(this.errors), this.errMessages);
            }
        };
        this.add = function(dataSource, scopeKey, message) {
            if (angular.isDefined(dataSource)) {
                if (angular.isUndefined(this.errors[this.getKey(dataSource, scopeKey)])) {
                    this.errors[this.getKey(dataSource, scopeKey)] = new ErrorObject();
                }
                this.errors[this.getKey(dataSource, scopeKey)].set(message);
                angular.copy(this.messages(this.errors), this.errMessages);
            }
        };
        //To-Do: add key
        this.remove = function(dataSource, scopeKey) {
            var copy = {};
            var getKeyFunc = this.getKey;
            angular.forEach(this.errors, function(v, k) {
                if (k != getKeyFunc(dataSource, scopeKey))
                    copy[k] = v;
            });
            this.errors = copy;
            angular.copy(this.messages(this.errors), this.errMessages);
        };
        this.messages = function(errs) {
            var msgs = [];
            angular.forEach(errs, function(v, k) {
                var errMsgs = v.messages;
                for (m in errMsgs) {
                    this.push(errMsgs[m]);
                }
            }, msgs);
            return msgs;
        };
        this.isDirty = function(dataSource, scopeKey) {
            return this.dirtys[this.getKey(dataSource, scopeKey)];
        };
        this.setDirty = function(dataSource, scopeKey, value) {
            if (dataSource == undefined) return;
            var existing = this.isDirty(dataSource, scopeKey);
            this.dirtys[this.getKey(dataSource, scopeKey)] = (existing || value);
        };
        this.clearDirty = function(dataSource, scopeKey, value) {
            var _field = this.getFieldSet(dataSource, scopeKey);
            if (_field){
                _field.controller.$setPristine();
            }

            this.dirtys[this.getKey(dataSource, scopeKey)] = false;
        };
    };


    ErrorObject = function() {
        // error message handling
        this.messages = [];
        this.message = function() {
            if (this.messages.length > 0)
                return this.messages[0];
            else
                return "";
        };
        this.clear = function() {
            this.messages = [];
        };
        this.set = function(message) {
            this.messages.push(message);
        };
    };

    BusinessRules = function(rules) {
        this.isBusinessRule = true;
        this.rules = rules;
        //this.error = new ErrorObject();
    };

    /*
    RuleBody = {
        isError: function() {},
        message: "",
        performCheck: function() {
            return false;
        },
        //removeMessageOnDestory: function(dataName, scope) {
        //    var _isExisting = angular.isDefined(scope.$eval(dataName));
        //    if (_isExisting) 
        //        return false;
        //    else
        //        return true;
        //}
    };
    */

    RuleBody = function(checkLogic, errMsg, forceCheckCondition, parameters) {
        this.parameters = {};
        this.isError = function() {};
        this.message = "";
        this.performCheck = function() {
            return false;
        };

        if (angular.isDefined(checkLogic))
            this.isError = checkLogic;
        if (angular.isDefined(errMsg))
            this.message = errMsg;
        if (angular.isDefined(forceCheckCondition))
            this.performCheck = forceCheckCondition;
        if (angular.isDefined(parameters)) {
            //var dummy = extend(this.parameters, parameters);
            var dummy = extend({}, this.parameters);
            this.parameters = extend(dummy, parameters);
        }
    };

    Rule = function(ruleSetting) {

        //var defaultBody = extend({}, RuleBody);
        //this.details = extend(defaultBody, ruleSetting);
        //this.details = new RuleBody();
        this.details = copyRuleDetails(ruleSetting, new RuleBody());

        /*
        if (angular.isDefined(ruleSetting.isError)) {
                this.details.isError = ruleSetting.isError;
        }
        if (angular.isDefined(ruleSetting.message)) {
                this.details.message = ruleSetting.message;
        }
        if (angular.isDefined(ruleSetting.performCheck)) {
                this.details.performCheck = ruleSetting.performCheck;
        }
        */

        //this.error = false;
        this.isDirty = function(isDirty, hasError) {
            return (isDirty || hasError || this.details.performCheck());
        };
        this.setError = function(value) {
            this.error = value;
        };
        //this.removeMessageOnDestory = function(dataName, scope) {
        //    if (angular.isDefined(this.details.removeMessageOnDestory)) 
        //        return this.details.removeMessageOnDestory(dataName, scope);
        //    else
        //        return false;
        //};
    };

    
    doValidator = function (controller) {
        var _v = controller.$viewValue;
        controller.$setViewValue(_v);
    };

    GroupValidator = function(scope, controller, rulePairs, indicator) {
        this.scope = scope;
        this.controller = controller;
        this.indicatorField = indicator;

        this.rulePairs = [];
        if (rulePairs)
            this.rulePairs = rulePairs;
        this.validator = new Validator(null, [], null);

        this.isValid = function() {
            this.validator.errors = [];
            for (f in this.rulePairs) {
                var rulePair = this.rulePairs[f];
                var ruleField = scope[rulePair.rule];

                if (ruleField && ruleField.isBusinessRule) {
                    this.validator.target = rulePair.field;
                    this.validator.validationRules = ruleField.rules;

                    var v = $(scope);
                    var p = null;
                    var fs = rulePair.field.split('.');

                    for (a in fs) {
                        var f = fs[a];
                        p = v.prop(f);

                        if (a < (fs.length - 1)) {
                            v = $(p);
                        }
                    };
                    
                    var _fullCheck = scope.fullCheck;
                    try {
                        scope.fullCheck = true;
                        this.validator.execute(p, scope, controller);
                    } catch (e) {
                        var ee = e;
                    }
                    scope.fullCheck = _fullCheck;
                }
                if (this.validator.errors.length > 0) break;
            }
            var valid = (this.validator.errors.length == 0);
            //            if (scope[this.indicatorField])
            //                scope[this.indicatorField] = valid;

            scope.$eval(this.indicatorField + "=" + valid);
            return valid;
        };
    };

    FieldSet = function(controller, validator, dataSource) {
        this.controller = controller;
        this.validator = validator;
        this.dataSource = dataSource;
    };

    _setDirtyOnModelUpdate = function(scope, element, attrs, controller, setDirtyOnModelUpdate) {
        var listener = undefined;
        var listener2 = undefined;
        var watchCount1 = 0;
        var watchCount2 = 0;

        element.on("$destroy", function() {
            if(listener){
                listener();
            }
            if(listener2){
                listener2();
            }
        });

        //set dirty when self ng-model is updated
        if(!setDirtyOnModelUpdate){
            listener = scope.$watch(attrs.ngModel, function (newValue, oldValue) {
                if(watchCount1 > 0){
                    controller.$setViewValue(newValue);
                    if(listener){
                        listener();
                    }
                }
                watchCount1++;
            },true);
        }
        //set dirty when depended ng-model is updated
        if(setDirtyOnModelUpdate){
            listener2 = scope.$watch(setDirtyOnModelUpdate, function (newValue, oldValue) {
                if(watchCount2 > 0){
                    controller.$setViewValue(controller.$viewValue);
                    if(listener2){
                        listener2();
                    }
                }
                watchCount2++;
            },true);
        }
    };

    framework.directive("setDirtyOnModelUpdate", function() {
        return {
            restrict: "A",
            require: 'ngModel',
            link: function(scope, element, attrs, controller) {
                _setDirtyOnModelUpdate(scope, element, attrs, controller,attrs.setDirtyOnModelUpdate);
            }
        };
    });

    framework.directive("validateNgRepeatOnIndexChange", function() {
        return {
            restrict: "A",
            link: function(scope, element, attrs, controller) {
                var listener = undefined;
                var validateElements = null;
                element.on("$destroy", function() {
                    if(listener){
                        listener();
                        validateElements = null;
                    }
                });

                validateElements = element.find('[validate]');
                listener = scope.$watch("$index", function(newVal, oldVal){
                    if(newVal===oldVal) return;
                    $.each(validateElements, function( index, value ) {
                        if($(value).attr('validate')){
                            var validate_field = $(value).attr('ng-model') || $(value).attr('validate-model-attribute');
                            var validate_scope_key = $(value).attr('validate-scope-key');
                            if(scope.ErrorSummary.hasError(validate_field,validate_scope_key)){
                                scope.ErrorSummary.checkFieldSet(validate_field,validate_scope_key);    
                            }
                        }
                    });
                });
                
            }
        };
    });

    framework.directive('ieSelectFix', function(){
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attributes, ngModelCtrl) {
                if (navigator.appName.indexOf("Internet Explorer")==-1 && navigator.appVersion.indexOf("MSIE 8")==-1) return;

                scope.$watch(attributes.ieSelectFix, function() {
                    var control = element[0];
                    var option = document.createElement("option");
                    control.add(option,null);
                    control.remove(control.options.length-1);
                });
            }
        }
    });

    framework.directive('updateWatchData', function(){
        return {
           scope:{
               onDataChange:'&'
            },
            restrict: 'A',
            link: function(scope, element, attrs) {
                if(attrs.updateWatchOn){
                    scope.$parent.$watch(attrs.updateWatchOn, function (newValue, oldValue,myscope) {
                     var isnotl=true;
                     angular.forEach(newValue,function(obj,index){
                            if(obj==null)
                            {
                              isnotl=false;
                              return;
                            }
                       });
                    if(isnotl&&oldValue!=null&&newValue!=null && (!angular.equals(oldValue,newValue)))
                    {
                       if(attrs.updateWatchOn.indexOf('[')==-1 && attrs.updateWatchOn.indexOf(']')==-1)
                        {
                            myscope.$parent.mychangdata=attrs.updateWatchOn;
                        }else
                        {
                            angular.forEach(newValue,function(obj,index){
                            if(obj!=oldValue[index])
                            {
                             var attArr= attrs.updateWatchOn.replace("[","").replace("]","").split(',');
                              myscope.$parent.mychangdata=attArr[index];
                            }
                          });
                        }
                      scope.onDataChange();
                    }
                    },true);
                }
             }

        };
    });


    framework.directive('validate', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attr, controller) {
                var ruleName = attr['validate'];
                //var ruleDefinition = scope[ruleName];
                var ruleDefinition = scope.$eval(ruleName);
                var field = null;
                if (attr.validateModelAttribute) {
                    field = attr[attr.validateModelAttribute];
                } else {
                    field = attr.ngModel;
                }

                //var validateScopeKey = scope.$eval(attr.validateScopeKey);
                var validateScopeKey = attr.validateScopeKey;
                var rules = [];
                var baseForm = $('form')[0].name;
                var innerForm = attr.innerform;
                var fieldName = undefined;
                var validateUseWatchListener = undefined;
                var watchOnListener = undefined;
                var mode=attr.validatetimes;
                if (attr.name) {
                    //fieldName = baseForm + (angular.isDefined(innerForm) ? '.' + innerForm: '') + "." + attr.name;
                    fieldName = (angular.isDefined(innerForm) ? innerForm + "." : '') + attr.name;
                }

                if (ruleDefinition !== undefined) {
                    //field = ruleDefinition.field;
                    for (var key in ruleDefinition.rules) {
                        rules.push(ruleDefinition.rules[key]);
                    }
                }
                //rules.push(new CompulsoryRule({ message: "Representative cannot be empty." }));
                //rules.push(new MinLengthRule({ length: 5 }));
                var validator = new Validator(field, rules, fieldName, validateScopeKey,mode);

                /*if (validateScopeKey && scope.$index != undefined) {
                    scope[ErrorSummary].changeScopeKey(validator.target, scope.$index, validateScopeKey);
                };*/

                scope[ErrorSummary].addFieldSet(validator.target, validateScopeKey,
                    new FieldSet(controller, validator,
                        new function(s, f) {
                            this.scope = s;
                            this.fieldName = f;
                            this.value = function() {
                                return this.scope.$eval(this.fieldName);
                            };
                        }(scope, field)));

                elem.on("$destroy", function() {
                    var _field = scope[ErrorSummary].getFieldSet(validator.target, validateScopeKey);
                    if (angular.isDefined(_field)) {
                        try {
                            //safe apply
                            if (scope.$$phase || scope.$root.$$phase) {
                                scope[ErrorSummary].remove(validator.target, validateScopeKey);
                                //scope[ErrorSummary].clearDirty(validator.target, validateScopeKey);
                                scope[ErrorSummary].removeFieldSet(validator.target, validateScopeKey);
                            } else {
                                scope.$apply(function() {
                                    scope[ErrorSummary].remove(validator.target, validateScopeKey);
                                    //scope[ErrorSummary].clearDirty(validator.target, validateScopeKey);
                                    scope[ErrorSummary].removeFieldSet(validator.target, validateScopeKey);
                                });
                            }
                        } catch (err) {}
                    }
                    //validator.resetErrorStatus();
                    if(validateUseWatchListener){
                        validateUseWatchListener();
                    }
                    if(watchOnListener){
                        watchOnListener();
                    }
                    validator = undefined;//20190540
                });

                function check(value) {
                    if (angular.isUndefined(scope[ErrorSummary])) {
                        //scope.ErrorSummary = ErrorSummaryHelper.init(scope, controller);
                        scope.ErrorSummary = new ErrorSummaryHelper(scope, controller);
                    }
                    //scope.clearError();
                    if (angular.isDefined(ruleDefinition)) {
                        if (ruleDefinition.isBusinessRule) {
                            //ruleDefinition.error.clear();

                            if (angular.isDefined(validator.target)) {
                                //var dirty = scope.$eval(validator.fieldName + ".$dirty");
                                var _field = scope[ErrorSummary].getFieldSet(validator.target, validateScopeKey);
                                var dirty = false;
                                if (_field)
                                    dirty = _field.controller.$dirty;
                                scope[ErrorSummary].setDirty(validator.target, validateScopeKey, dirty);
                            }
                            //validator.execute(value, scope, controller, scope[ErrorSummary], validateScopeKey);
                            validator.execute(value, scope, controller);

                            // the form field validity should be set since we need prompt message to notify the user if they insist to 
                            // move the current page to another even errors happen in the current page.                            
                            if (angular.isDefined(validator.target)) {
                                controller.$setValidity(validator.target, !validator.hasError);
                                scope[ErrorSummary].remove(validator.target, validateScopeKey);
                            }
                            if (validator.hasError) {
                                for (var i = 0; i < validator.errors.length; i++) {
                                    if (angular.isDefined(validator.target)) {
                                        scope[ErrorSummary].add(validator.target, validateScopeKey, validator.errors[i]);
                                    }
                                }
                            }
                        }
                    }
                    return value;
                };

                /*function isValidateField() {
                    var _isValidateField = false;
                    if(elem.is(":visible") || attr.validateHiddenField){ //only check visible type or having attribute validate-hidden-field
                        _isValidateField = true;
                    }
                    return _isValidateField;
                }*/

                // DOM --> model
                controller.$parsers.unshift(function(value) {
                    //if (isValidateField()){
                        return check(value);
                    //}
                });

                // model --> DOM
                controller.$formatters.unshift(function(value) {
                    //if (isValidateField()){
                        return check(value);
                    //}
                    //return check(value);
                });

                if(attr.validateUseWatch){
                    validateUseWatchListener = scope.$watch(attr.ngModel, function (newValue, oldValue) {
                        check(newValue);
                    },true);
                }
                if(attr.validateWatchOn){
                    watchOnListener = scope.$watch(attr.validateWatchOn, function (newValue, oldValue) {
                        check(controller.$modelValue);
                    },true);
                    _setDirtyOnModelUpdate(scope, elem, attr, controller,attr.validateWatchOn);
                }

            }
        };

    });

    framework.directive('ngRepeatAddOrgIndex', [
        function() {
            return {
                restrict: 'A',
                link: function(scope, element, iAttrs) {
                    var expression = iAttrs.ngRepeat;
                    try {
                	    var lhs,rhs;
					    var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+|\s+([\s\S]+?))?\s*$/);

					    if (match && match.length>2) {
						    lhs = match[1];
        				    rhs = match[2];
        				    var parentScope = element.parent().scope();
	                        parentScope.$watchCollection(rhs, function() {
	                            var sourceArr = parentScope.$eval(rhs);
	                            scope.$orgIndex = $.inArray(scope.$eval(lhs), sourceArr);
	                        });
					    }
                    } catch (err) {
                        scope.$orgIndex = -1;
                    }
                }
            };
        }
    ]);

    Validator = function(field, rules, fieldName, validateScopeKey, mode) {

        this.hasError = false;
        this.target = field;
        this.scopeKey = validateScopeKey;
        this.validationRules = rules;
        this.errors = [];

        this.fieldName = fieldName;
        this.checkMode = (mode == undefined ? "once" : mode);
        //this.execute = function(value, scope, controller, errorSummary, validateScopeKey) {
        this.execute = function(value, scope, controller) {
            this.errors = [];
            this.hasError = false;

            var errorSummary = scope[ErrorSummary];
            var scopeKey = this.scopeKey;
            //if (angular.isDefined(validateScopeKey))
            //    scopeKey = validateScopeKey;

            var isDirty = false;
            var hasError = false;
            if (angular.isDefined(errorSummary)) {
                isDirty = errorSummary.isDirty(this.target, scopeKey);
                hasError = errorSummary.hasError(this.target, scopeKey);
            }
            for (var rule in this.validationRules) {
                var errorFound = this.validationRules[rule].details.isError(value, this.target, this.scopeKey, scope, controller, this.validationRules[rule], isDirty, hasError);
                if (errorFound) {
                    this.validationRules[rule].setError(errorFound);
                    var msg = null;
                    if (isFunction(this.validationRules[rule].details.message)) {
                        msg = this.validationRules[rule].details.message(value, this.target, this.scopeKey, scope, controller, this.validationRules[rule]);
                    } else {
                        msg = this.validationRules[rule].details.message;
                    }
                    this.errors.push(msg);
                    this.hasError = this.hasError || (errorFound);
                    if (this.checkMode == "once" && this.hasError) break;
                }
            };
        };

        function isFunction(fn) {
            return fn && {}.toString.call(fn) === '[object Function]';
        };

        //this.resetErrorStatus = function() {
        //    for (var idx in this.validationRules) {
        //        this.validationRules[idx].setError(false);
        //    }
        //};

        //this.removeMessageOnDestory = function(scope) {
        //    var _removeMessage = false;
        //    for (var idx in this.validationRules) {
        //        if (angular.isDefined(this.validationRules)) {
        //            _removeMessage = _removeMessage || this.validationRules[idx].removeMessageOnDestory(this.target, scope);
        //        }
        //    }
        //    return _removeMessage;
        //};
    };

    // available business rules

    // only required if it is compulsory field
    Required = function(details) {

        /*
        var defaultRule = {
            message: function(value, target, scopeKey, scope, controller, me) {
                return "The value cannot be empty.";
            },
            isError: function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError))
                    if (value == "" || value == undefined)
                        return true;
                    else
                        return false;
            },
            isBindingTargetDefined: function(scope) {
                return false;
            }
        };
        var localRule = extend(defaultRule, details);
        */
        var defaultRule = new RuleBody(function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError))
                    if (value == "" || value == null || value == undefined)
                        return true;
                    else
                        return false;
            },
            "The value cannot be empty.",
            function(scope) {
                return false;
            });
        var localRule = copyRuleDetails(details, defaultRule);
        return new Rule(localRule);
    };

    // check minimum length of string
    MinLength = function(details) {

        /*
        var defaultRule = {
            length: 0,
            message: function(value, target, scopeKey, scope, controller, me) {
                return "It must be longer than " + me.details.length + " characters.";
            },
            isError: function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError))
                    if (value.length < me.details.length)
                        return true;
                    else
                        return false;
            }
        };
        var localRule = extend(defaultRule, details);
        */
        var defaultRule = new RuleBody(
            function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError))
                    if (value.length < me.details.parameters.length)
                        return true;
                    else
                        return false;
            },
            function(value, target, scopeKey, scope, controller, me) {
                return "It must be longer than " + me.details.parameters.length + " characters.";
            },
            undefined, {
                length: 0
            });
        var localRule = copyRuleDetails(details, defaultRule);
        return new Rule(localRule);
    };

    // check maximum length of string
    MaxLength = function(details) {

        /*
        var defaultRule = {
            length: 100,
            message: function(value, target, scopeKey, scope, controller, me) {
                return "It must be less than " + me.details.length + " characters.";
            },
            isError: function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError))
                    if (value.length > me.details.length)
                        return true;
                    else
                        return false;
            }
        };
        var localRule = extend(defaultRule, details);
        */
        var defaultRule = new RuleBody(
            function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError))
                    if (value.length > me.details.parameters.length)
                        return true;
                    else
                        return false;
            },
            function(value, target, scopeKey, scope, controller, me) {
                return "It must be less than " + me.details.parameters.length + " characters.";
            },
            undefined, {
                length: 100
            });
        var localRule = copyRuleDetails(details, defaultRule);
        return new Rule(localRule);
    };

    // check length and ensure it is in between the values
    InBetweenLength = function(details) {

        /*
        var defaultRule = {
            min: 0,
            max: 100,
            message: function(value, target, scopeKey, scope, controller, me) {
                return "It must be between " + me.details.min + " and " + me.details.max + " characters long inclusively.";
            },
            isError: function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError))
                    if (value.length < me.details.min || value.length > me.details.max)
                        return true;
                    else
                        return false;
            }
        };
        var localRule = extend(defaultRule, details);
        */
        var defaultRule = new RuleBody(
            function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError))
                    if (value.length < me.details.parameters.min || value.length > me.details.parameters.max)
                        return true;
                    else
                        return false;
            },
            function(value, target, scopeKey, scope, controller, me) {
                return "It must be between " + me.details.parameters.min + " and " + me.details.parameters.max + " characters long inclusively.";
            },
            undefined, {
                min: 0,
                max: 100
            });
        var localRule = copyRuleDetails(details, defaultRule);
        return new Rule(localRule);
    };

    // check value and ensure it is in range
    InBetweenNumber = function(details) {

        /*
        var defaultRule = {
            min: 0,
            max: 100000000,
            message: function(value, target, scopeKey, scope, controller, me) {
                return "It must be between " + me.details.min + " and " + me.details.max + " inclusively.";
            },
            isError: function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError)) {
                    if (angular.isNumber(value) || angualr.isString(value)) {
                        var v = value;
                        if (angular.isString(value))
                            v = Number(value);
                        if (v < me.details.min || v > me.details.max)
                            return true;
                        else
                            return false;
                    } else
                        return false;
                }
            }
        };
        var localRule = extend(defaultRule, details);
        */
        var defaultRule = new RuleBody(
            function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError)) {
                    if (angular.isNumber(value) || angualr.isString(value)) {
                        var v = value;
                        if (angular.isString(value))
                            v = Number(value);
                        if (v < me.details.parameters.min || v > me.details.parameters.max)
                            return true;
                        else
                            return false;
                    } else
                        return false;
                }
            },
            function(value, target, scopeKey, scope, controller, me) {
                return "It must be between " + me.details.parameters.min + " and " + me.details.parameters.max + " inclusively.";
            },
            undefined, {
                min: 0,
                max: 100000000
            });
        var localRule = copyRuleDetails(details, defaultRule);
        return new Rule(localRule);
    };

    // check value and ensure it is in range (alphabetic)
    InBetween = function(details) {

        /*
        var defaultRule = {
            min: "",
            max: "z",
            message: function(value, target, scopeKey, scope, controller, me) {
                return "It must be between " + me.details.min + " and " + me.details.max + ".";
            },
            isError: function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError)) {
                    if (value < me.details.min || v > me.details.max)
                        return true;
                    else
                        return false;
                }
            }
        };
        var localRule = extend(defaultRule, details);
        */
        var defaultRule = new RuleBody(
            function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError)) {
                    if (value < me.details.parameters.min || v > me.details.parameters.max)
                        return true;
                    else
                        return false;
                }
            },
            function(value, target, scopeKey, scope, controller, me) {
                return "It must be between " + me.details.parameters.min + " and " + me.details.parameters.max + ".";
            },
            undefined, {
                min: "",
                max: "z"
            });
        var localRule = copyRuleDetails(details, defaultRule);
        return new Rule(localRule);
    };

    // check minimum value
    MinNumber = function(details) {

        /*
        var defaultRule = {
            value: 0,
            message: function(value, target, scopeKey, scope, controller, me) {
                return "It must be " + me.details.value + " and above.";
            },
            isError: function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError)) {
                    if (angular.isNumber(value) || angualr.isString(value)) {
                        var v = value;
                        if (angular.isString(value))
                            v = Number(value);
                        if (v < me.details.value)
                            return true;
                        else
                            return false;
                    } else
                        return false;
                }
            }
        };
        var localRule = extend(defaultRule, details);
        */
        var defaultRule = new RuleBody(
            function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError)) {
                    if (angular.isNumber(value) || angualr.isString(value)) {
                        var v = value;
                        if (angular.isString(value))
                            v = Number(value);
                        if (v < me.details.parameters.value)
                            return true;
                        else
                            return false;
                    } else
                        return false;
                }
            },
            function(value, target, scopeKey, scope, controller, me) {
                return "It must be " + me.details.parameters.value + " and above.";
            },
            undefined, {
                value: 0
            });
        var localRule = copyRuleDetails(details, defaultRule);
        return new Rule(localRule);
    };

    // check maximum value
    MaxNumber = function(details) {

        /*
        var defaultRule = {
            value: 100000000,
            message: function(value, target, scopeKey, scope, controller, me) {
                return "It must be " + me.details.value + " and below.";
            },
            isError: function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError)) {
                    if (angular.isNumber(value) || angualr.isString(value)) {
                        var v = value;
                        if (angular.isString(value))
                            v = Number(value);
                        if (v > me.details.value)
                            return true;
                        else
                            return false;
                    } else
                        return false;
                }
            }
        };
        var localRule = extend(defaultRule, details);
        */
        var defaultRule = new RuleBody(
            function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError)) {
                    if (angular.isNumber(value) || angualr.isString(value)) {
                        var v = value;
                        if (angular.isString(value))
                            v = Number(value);
                        if (v > me.details.parameters.value)
                            return true;
                        else
                            return false;
                    } else
                        return false;
                }
            },
            function(value, target, scopeKey, scope, controller, me) {
                return "It must be " + me.details.parameters.value + " and below.";
            },
            undefined, {
                value: 100000000
            });
        var localRule = copyRuleDetails(details, defaultRule);
        return new Rule(localRule);
    };

    // check minimum value (alphabetic)
    Min = function(details) {

        /*
        var defaultRule = {
            value: "",
            message: function(value, target, scopeKey, scope, controller, me) {
                return "It must be " + me.details.value + " and above.";
            },
            isError: function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError)) {
                    if (value < me.details.value)
                        return true;
                    else
                        return false;
                }
            }
        };
        var localRule = extend(defaultRule, details);
        */
        var defaultRule = new RuleBody(
            function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError)) {
                    if (value < me.details.parameters.value)
                        return true;
                    else
                        return false;
                }
            },
            function(value, target, scopeKey, scope, controller, me) {
                return "It must be " + me.details.parameters.value + " and above.";
            },
            undefined, {
                value: ""
            });
        var localRule = copyRuleDetails(details, defaultRule);
        return new Rule(localRule);
    };

    // sample of custom validation rule
    /*
    new Rule({ message: "custom error",
               isError: function (value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                            if (me.isDirty(isDirty)) {
                                if (value.length < 10) {
                                    return true;
                                } else
                                    return false;
                            }

                        }
             })
    */

    // check maximum value (alphabetic)
    Max = function(details) {
        var defaultRule = new RuleBody(
            function(value, target, scopeKey, scope, controller, me, isDirty, hasError) {
                if (me.isDirty(isDirty, hasError)) {
                    if (value > me.details.parameters.value)
                        return true;
                    else
                        return false;
                }
            },
            function(value, target, scopeKey, scope, controller, me) {
                return "It must be " + me.details.parameters.value + " and below.";
            },
            undefined, {
                value: "zzzzzz"
            });
        var localRule = copyRuleDetails(details, defaultRule);

        return new Rule(localRule);
    };

    // check mobile browser
    IsMobileBrowser = function() {
        var isiPad = navigator.userAgent.match(/iPad/i) != null;
        if (isiPad) {
            return true;
        }
        var check = false;
        (function(a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };

    // open file
    OpenFile = function(file) {
        window.open(file, "signWindow");
    };

    ParseQueryString = function() {
        var str = window.location.search;
        var objURL = {};

        str.replace(
            new RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function($0, $1, $2, $3) {
                objURL[$1] = $3;
            }
        );
        return objURL;
    };

    //QRCode_begin
    ShowQRDialog = function(url, loadStartCallback, loadCompleteCallback, loadFailCallback, closeCallBack) {
        if (loadStartCallback) {
            loadStartCallback();
        }
        var _imgContainer = $("<div class='touchScrollable' style='text-align:center;min-width:300px;max-height:420px;overflow-x:hidden;overflow-y:auto'></div>");
        //var _img = $("<img onclick='window.open(this.src)' style='cursor:pointer;max-width:900px;' src='" + url + "' />");

        if(url.indexOf("?") >-1){
            url = url + "&timestamp=" + (new Date()).getTime().toString();
        }
        else{
            url = url + "?timestamp=" + (new Date()).getTime().toString();
        }
        var _img = $("<img style='max-width:350' src='" + url + "' />");
        _imgContainer.append(_img);
        $('#content-dialog-content').empty();
        $('#content-dialog-content').append(_imgContainer);

        var _dialog_id = "content-dialog";
        var _dialog = $('#' + _dialog_id);
        
        $('body').css('overflow-y', 'hidden');
        _img.bind('load', function() {
            setTimeout(function() {
                if (_img.width() >= 300) {
                    _dialog.data("dialog").option("width", '350');
                   // _dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
                    _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
                }
            }, 0);

            var setting = {};
            setting.open = function(event, ui) {
                disableTouchMove();
                $(this).siblings('.ui-dialog-titlebar').remove();
                $('div.ui-widget-overlay').click(function(e) {
                    _dialog.dialog('close');
                    if (closeCallBack) {
                        closeCallBack();
                    }
                });
                $('#content-dialog-close').click(function(e) {
                    _dialog.dialog('close');
                    if (closeCallBack) {
                        closeCallBack();
                    }
                });
               // _dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
                _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
            };
            setting.close = function(event, ui) {
                $('#content-dialog-content').html('');
                if (closeCallBack) {
                    closeCallBack();
                }
                enableTouchMove();
                $('body').css('overflow-y', 'auto');
                $('div.ui-widget-overlay').off('click');
                $('#content-dialog-close').off('click');
            };
            setting.width = 'auto';
            setting.closeOnEscape = true;
            setting.position = ['center', 'center'];
            setting.modal = true;
            setting.draggable = false;
            setting.resizable = false;
            setting.closable = false;
            setting.dialogClass = 'ui-dialog-custom';
            setting.minHeight = 300;
            setting.minWidth = 350;

            _dialog.dialog(setting);
            if (loadCompleteCallback) {
                loadCompleteCallback();
            }
        });
        _img.bind('error', function() {
            if (loadFailCallback) {
                loadFailCallback();
            } else {
                alert('Image cannot be loaded.');
            }
        });
    };
    //QRCode_end

    //<<EAPP_OPTIMIZE_ESIGN_Gray
    ShowImageConfirmDialog = function(url, yesMsg, noMsg, yesCallBack, noCallback, overlayClickExit) {
        var _dialog_id = "system-confirm-image-dialog";
        var _dialog = $('#' + _dialog_id);
        var _img = $("<img style='max-width:700px;max-height:300px' src='" + url + "' />");
        var _overlayClickExit = overlayClickExit == undefined ? true : overlayClickExit;
        $('body').css('overflow-y', 'hidden');

        var setting = {}
        setting.open = function(event, ui) {
            disableTouchMove();

            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#confirmImage').empty();
            $(this).find('#confirmImage').append(_img);

            if (_overlayClickExit) {
                $('div.ui-widget-overlay').click(function(e) {
                    _dialog.dialog('close');

                    if (noCallback) {
                        noCallback();
                    }
                });
            }

            _dialog.dialog("option", "position", _dialog.dialog("option", "position"));
        };

        setting.create = function() {
            $(this).css("maxHeight", 500);
            $(this).css("text-align", "center");
        };

        setting.close = function(event, ui) {
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
            $('div.ui-widget-overlay').off('click');
        };

        var buttons = {}
        var button1 = {}

        button1["text"] = yesMsg;
        button1["class"] = 'buttonGreen buttonSmall';
        button1["click"] = function() {
            _dialog.dialog('close');

            if (yesCallBack) {
                yesCallBack();
            }
        };

        button1['style'] = 'float:left;margin-left:20px';
        buttons["Yes"] = button1;

        var button2 = {}

        button2["text"] = noMsg;
        button2["class"] = 'buttonOrange buttonSmall';
        button2["click"] = function() {
            _dialog.dialog('close');

            if (noCallback) {
                noCallback();
            }
        };

        button2['style'] = 'float:right;margin-right:20px';
        buttons["No"] = button2;

        setting.buttons = buttons;
        setting.width = 700;
        setting.height = 380;
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 100;

        _dialog.dialog(setting);
    };
    //>>EAPP_OPTIMIZE_ESIGN_Gray

    ShowImageDialog = function(url, loadStartCallback, loadCompleteCallback, loadFailCallback, closeCallBack) {
        if (loadStartCallback) {
            loadStartCallback();
        }
        var _imgContainer = $("<div class='touchScrollable' style='text-align:center;min-width:300px;max-height:520px;overflow-x:hidden;overflow-y:auto'></div>");
        //var _img = $("<img onclick='window.open(this.src)' style='cursor:pointer;max-width:900px;' src='" + url + "' />");

        if(url.indexOf("?") >-1){
            url = url + "&timestamp=" + (new Date()).getTime().toString();
        }
        else{
            url = url + "?timestamp=" + (new Date()).getTime().toString();
        }
        var _img = $("<img style='max-width:900px' src='" + url + "' />");
        _imgContainer.append(_img);
        $('#content-dialog-content').empty();
        $('#content-dialog-content').append(_imgContainer);

        var _dialog_id = "content-dialog";
        var _dialog = $('#' + _dialog_id);
        
        $('body').css('overflow-y', 'hidden');
        _img.bind('load', function() {
            setTimeout(function() {
                if (_img.width() >= 900) {
                    _dialog.data("dialog").option("width", '900');
                    //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
                    _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
                }
            }, 0);

            var setting = {};
            setting.open = function(event, ui) {
                disableTouchMove();
                $(this).siblings('.ui-dialog-titlebar').remove();
                $('div.ui-widget-overlay').click(function(e) {
                    _dialog.dialog('close');
                    if (closeCallBack) {
                        closeCallBack();
                    }
                });
                $('#content-dialog-close').click(function(e) {
                    _dialog.dialog('close');
                    if (closeCallBack) {
                        closeCallBack();
                    }
                });
               // _dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
                _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
            };
            setting.close = function(event, ui) {
                $('#content-dialog-content').html('');
                if (closeCallBack) {
                    closeCallBack();
                }
                enableTouchMove();
                $('body').css('overflow-y', 'auto');
                $('div.ui-widget-overlay').off('click');
                $('#content-dialog-close').off('click');
            };
            setting.width = 'auto';
            setting.closeOnEscape = true;
            setting.position = ['center', 'center'];
            setting.modal = true;
            setting.draggable = false;
            setting.resizable = false;
            setting.closable = false;
            setting.dialogClass = 'ui-dialog-custom';
            setting.minHeight = 300;
            setting.minWidth = 300;

            _dialog.dialog(setting);
            if (loadCompleteCallback) {
                loadCompleteCallback();
            }
        });
        _img.bind('error', function() {
            if (loadFailCallback) {
                loadFailCallback();
            } else {
                alert('Image cannot be loaded.');
            }
        });
    };

    ShowImagesDialog = function(urls, loadStartCallback, loadCompleteCallback, loadFailCallback, closeCallBack, viewAllCallback) {
        if(!urls || urls.length ==0){
            return;
        }
        if (loadStartCallback) {
            loadStartCallback();
        }
        var _imgContainer = $("<div class='touchScrollable' style='text-align:center;min-width:300px;max-height:520px;overflow-x:hidden;overflow-y:auto'></div>");
        //var _img = $("<img onclick='window.open(this.src)' style='cursor:pointer;max-width:900px;' src='" + url + "' />");
        var url = urls[0];
        if(url.indexOf("?") >-1){
            url = url + "&timestamp=" + (new Date()).getTime().toString();
        }
        else{
            url = url + "?timestamp=" + (new Date()).getTime().toString();
        }
        var _img = $("<img style='max-width:900px' src='" + url +"'/>");
        _imgContainer.append(_img);
        $('#images-dialog-content').empty();
        $('#images-dialog-content').append(_imgContainer);

        var _dialog_id = "images-dialog";
        var _dialog = $('#' + _dialog_id);
        _dialog.data("pageNumber" , 0);

        var refreshButtons = function(){
            $('#images-dialog-prev').hide();
            $('#images-dialog-next').hide();
            $('#images-dialog-close').hide();
            var _pageNumber = _dialog.data("pageNumber");
            if(_pageNumber>0){
                $('#images-dialog-prev').show();
            }
            if(_pageNumber<urls.length-1){
                $('#images-dialog-next').show();
            }
            else{
                $('#images-dialog-close').show();
            }
            $('#images-dialog-page-counter').text('Page ' + (_pageNumber+1) + ' of ' + urls.length);
        }
        refreshButtons();

        var showLoading = function(isShow){
            if(isShow){
                _dialog.addClass("loading");
            }
            else{
                _dialog.removeClass("loading");
            }
        };

        var resizeContainer = function(){
            _dialog.data("dialog").option("height", $(window).height() -100);
            _imgContainer.css('max-height',$(window).height() -100 - 70);
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };

        $('body').css('overflow-y', 'hidden');
        _img.bind('load', function() {
            setTimeout(function() {
                if (_img.width() >= 900) {
                    _dialog.data("dialog").option("width", '900');
                    //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
                    _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
                }
            }, 0);

            var setting = {};
            setting.open = function(event, ui) {
                _img.off('load');
                _img.bind('load', function() {
                    _imgContainer.scrollTop(0);
                    showLoading(false);
                    _img.show();
                });

                disableTouchMove();
                $(this).siblings('.ui-dialog-titlebar').remove();
                $('div.ui-widget-overlay').click(function(e) {
                    _dialog.dialog('close');
                    if (closeCallBack) {
                        closeCallBack();
                    }
                });
                $('#images-dialog-prev').click(function(e) {
                    var _pageNumber = _dialog.data("pageNumber");
                    if(_pageNumber>0){
                        _pageNumber--;
                        _dialog.data("pageNumber",_pageNumber);
                        var url = urls[_pageNumber];
                        if(url.indexOf("?") >-1){
                            url = url + "&timestamp=" + (new Date()).getTime().toString();
                        }
                        else{
                            url = url + "?timestamp=" + (new Date()).getTime().toString();
                        }
                        _img.hide();
                        showLoading(true);
                        _img.attr('src' , url);
                    }
                    refreshButtons();
                });

                $('#images-dialog-next').click(function(e) {
                    var _pageNumber = _dialog.data("pageNumber");
                    if(_pageNumber<urls.length-1){
                        _pageNumber++;
                        _dialog.data("pageNumber",_pageNumber);
                        var url = urls[_pageNumber];
                        if(url.indexOf("?") >-1){
                            url = url + "&timestamp=" + (new Date()).getTime().toString();
                        }
                        else{
                            url = url + "?timestamp=" + (new Date()).getTime().toString();
                        }
                        _img.hide();
                        showLoading(true);
                        _img.attr('src' , url);
                    }
                    if(_pageNumber == urls.length-1){
                        if(viewAllCallback){
                            viewAllCallback();
                        }
                    }
                    refreshButtons();
                });

                $('#images-dialog-close').click(function(e) {
                    _dialog.dialog('close');
                    if (closeCallBack) {
                        closeCallBack();
                    }
                    if(viewAllCallback){
                        viewAllCallback();
                    }
                });
                _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
                resizeContainer();
                $(window).on('resize', resizeContainer);
            };
            setting.close = function(event, ui) {
                $('#content-dialog-content').html('');
                if (closeCallBack) {
                    closeCallBack();
                }
                enableTouchMove();
                $(window).off('resize', resizeContainer);
                $('body').css('overflow-y', 'auto');
                $('div.ui-widget-overlay').off('click');
                $('#images-dialog-close').off('click');
                $('#images-dialog-prev').off('click');
                $('#images-dialog-next').off('click');
            };

            setting.width = 'auto';
            setting.closeOnEscape = true;
            setting.position = ['center', 'center'];
            setting.modal = true;
            setting.draggable = false;
            setting.resizable = false;
            setting.closable = false;
            setting.dialogClass = 'ui-dialog-images';
            setting.minHeight = 300;
            setting.minWidth = 300;

            _dialog.dialog(setting);
            if (loadCompleteCallback) {
                loadCompleteCallback();
            }
        });
        _img.bind('error', function() {
            if (loadFailCallback) {
                loadFailCallback();
            } else {
                alert('Image cannot be loaded.');
            }
        });
    };

    Function.prototype.bind = function(parent) {
        var f = this;
        var args = [];

        for (var a = 1; a < arguments.length; a++) {
            args[args.length] = arguments[a];
        }

        var temp = function() {
            return f.apply(parent, args);
        }

        return(temp);
    }

    ShowIFrameDialogPost = function(url, callBackUrl, closeCallBack, parameters) {
        if (IsMobileBrowser()) {
            if (parameters) {
                url = url + "?";
                angular.forEach(parameters, function(v, k) {
                   url = url + k + '=' + v + '&';
                });
                url = url.substring(0, url.length - 1);
            }
            $.ajax({
                url: "ClearSignDocumentResult",
                method: 'get',
                async: false
            }).success(function (data) {
                window.open(url, '_blank');
                setTimeout(function(){
                    alert("Click to continue");
                    $.ajax({
                        url: "ReceiveSignDocumentResult",
                        data: {docid:parameters["docid"]},
                        method: 'get',
                        async: false
                    }).success(function (data) {
                        if (closeCallBack) {
                            closeCallBack(data);
                        }
                    }).error(function (jqXHR, textStatus, errorThrown) {
                        if (closeCallBack) {
                            closeCallBack(null);
                        }
                    });

                }.bind(this),1000);
            }).error(function (jqXHR, textStatus, errorThrown) {
                alert('Clear Sign Document Result Failed');
            });
            
            return;
        }
        var _dialog_id = "iframe-dialog-post";
        var _dialog = $("#iframe-dialog-post");
        var _param = "#toolbar=0&navpanes=1&statusbar=0&messages=0&page=1";

        var _dynamicForm = $('<html>');

        var params = {
            "id": 'triggerSignDocForm',
            "action": url,
            "target": 'id-iframe-body'
        };
        var myForm = $('<form>', params);
        if (parameters) {
            angular.forEach(parameters, function(v, k) {
                myForm.append($('<input>', {
                        'name': k,
                        'value': v,
                        'type': 'hidden'
                    }));
            });
        }
        
        var _iFrameHtml = '<iframe id="id-iframe-body" src="" name="id-iframe-body" width="100%" height="50%" style="display:block;"" frameborder="0" scrolling="yes"></iframe>';
        $('#iframe-dialog-post-content').html(_iFrameHtml);
        $('#iframe-dialog-post-content').append(myForm);
        //myForm.appendTo(document.body);

        $('body').css('overflow-y', 'hidden');
        var setting = {};
        setting.open = function(event, ui) {
            _dialog.siblings('.ui-dialog-titlebar').remove();
            $('div.ui-widget-overlay').click(function(e) {
                _dialog.dialog('close');
                if (closeCallBack) {
                    closeCallBack();
                }
            });
            $('#iframe-dialog-post-close').click(function(e) {
                _dialog.dialog('close');
                if (closeCallBack) {
                    closeCallBack();
                }
            });
            //_dialog.parent().css('top', ($(document).scrollTop() + 15).toString() + 'px');

            setTimeout(function() {
                //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
                _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
                _dialog.find('iframe').attr('height', _dialog.innerHeight() - 80);

                var _iframe = document.getElementById("id-iframe-body");
                if (_iframe) {
                    _dialog.find('iframe').unbind('load');  
                    _dialog.find('iframe').bind('load', function() {
                        try {
                            var _url = _iframe.contentWindow.window.location.href;
                            if (_url.indexOf(callBackUrl) == 0) {
                                var _result = _dialog.find('iframe').contents().find('body').html();
                                var _jsonResult = JSON.parse(_result);
                                _dialog.dialog('close');
                                if (closeCallBack) {
                                    closeCallBack(_jsonResult);
                                }
                            }
                        } catch (e) {
                            var a = e;
                            // ignore
                        }
                    });        
                }

                //_dialog.find('iframe').attr('src', url + _param); 
                //myForm.submit();    
                $('#triggerSignDocForm').submit();

            }, 10);
        };
        setting.close = function(event, ui) {
            _dialog.find('iframe').attr('src', '');
            if (closeCallBack) {
                closeCallBack();
            }
            $('body').css('overflow-y', 'auto');
        };
        setting.width = 980;
        setting.height = $(window).innerHeight() - 30;
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 500;

        _dialog.dialog(setting);
    };

    ShowIFrameDialog = function(url, closeCallBack) {
        if (IsMobileBrowser()) {
            window.open(url, '_blank');
            return;
        }
        var _dialog_id = "iframe-dialog";
        var _dialog = $('#' + _dialog_id);
        var _param = "#toolbar=0&navpanes=1&statusbar=0&messages=0&page=1";

        $('body').css('overflow-y', 'hidden');
        var setting = {};
        setting.open = function(event, ui) {
            _dialog.siblings('.ui-dialog-titlebar').remove();
            $('div.ui-widget-overlay').click(function(e) {
                _dialog.dialog('close');
                if (closeCallBack) {
                    closeCallBack();
                }
            });
            $('#iframe-dialog-close').click(function(e) {
                _dialog.dialog('close');
                if (closeCallBack) {
                    closeCallBack();
                }
            });
            //_dialog.parent().css('top', ($(document).scrollTop() + 15).toString() + 'px');

            setTimeout(function() {
                //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
                _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
                _dialog.find('iframe').attr('height', _dialog.innerHeight() - 80);
                _dialog.find('iframe').attr('src', url + _param);
            }, 10);
        };
        setting.close = function(event, ui) {
            _dialog.find('iframe').attr('src', '');
            if (closeCallBack) {
                closeCallBack();
            }
            $('body').css('overflow-y', 'auto');
            $('div.ui-widget-overlay').off('click');
            $('#iframe-dialog-close').off('click');
        };
        setting.width = 980;
        setting.height = $(window).innerHeight() - 30;
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 500;

        _dialog.dialog(setting);
    };

    ShowSecureCodeFormDialog = function(continueCallBack, cancelCallback) {
        var _dialog_id = "secure-code-form";
        var _dialog = $('#' + _dialog_id);
        $('#secureCode').val("");
        $('body').css('overflow-y', 'hidden');

        var setting = {};
        setting.open = function(event, ui) {
            $(this).siblings('.ui-dialog-titlebar').remove();
            //$(this).find('#errorMessages').html(errMessage);
            $('div.ui-widget-overlay').click(function(e) {
                _dialog.dialog('close');
                if (stayCallback) {
                    stayCallback();
                }
            });
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function() {
            $(this).css("maxHeight", 500);
        };
        setting.close = function(event, ui) {
            $('body').css('overflow-y', 'auto');
            $('div.ui-widget-overlay').off('click');
        };
        var buttons = {}
        var button1 = {}
        button1["text"] = 'Cancel';
        button1["class"] = 'buttonOrange buttonSmall';
        button1["click"] = function() {
            _dialog.dialog('close');
            if (cancelCallback) {
                cancelCallback();
            }
        };
        button1['style'] = 'float:left;margin-left:20px';
        buttons["Cancel"] = button1;

        var button2 = {}
        button2["text"] = 'Continue';
        button2["class"] = 'buttonGreen buttonSmall';
        button2["click"] = function() {
            _dialog.dialog('close');
            if (continueCallBack) {
                var code = $('#secureCode').val();
                continueCallBack(code);
            }
        };
        button2['style'] = 'float:right;margin-right:20px';
        buttons["Continue"] = button2;

        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };

    ShowErrorDialog = function(errMessage, closeCallBack) {
        var _dialog_id = "system-error-message-dialog";
        var _dialog = $('#' + _dialog_id).clone();
        $('body').css('overflow-y', 'hidden');
        var setting = {}
        setting.open = function(event, ui) {
            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#errorMessages').html(errMessage);
            // $(this).find('iframe').attr('height', $(this).innerHeight() - 50);
            $('div.ui-widget-overlay').click(function(e) {
                _dialog.dialog('close');
            });
            $('#system-error-message-dialog-close').click(function(e) {
                _dialog.dialog('close');
            });
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function() {
            $(this).css("maxHeight", 500);
        };
        setting.close = function(event, ui) {
            if (closeCallBack) {
                closeCallBack();
            }
            $('body').css('overflow-y', 'auto');
            $('div.ui-widget-overlay').off('click');
            $('#system-error-message-dialog-close').off('click');
        };

        var buttons = {}
        var button1 = {}
        button1["text"] = '确定';
        button1["class"] = 'buttonGreen buttonSmall';
        button1["click"] = function() {
            _dialog.dialog('close');
        };
        buttons["Ok"] = button1;

        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };
    
    ShowMessageDialog = function(message, btnText, closeCallBack) {
        var _dialog_id = "system-error-message-dialog";
        var _dialog = $('#' + _dialog_id).clone();
        $('body').css('overflow-y', 'hidden');
        var setting = {}
        setting.open = function(event, ui) {
            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#errorMessages').html(message);
            $('div.ui-widget-overlay').click(function(e) {
                _dialog.dialog('close');
            });
            $('#system-error-message-dialog-close').click(function(e) {
                _dialog.dialog('close');
            });
           // _dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function() {
            $(this).css("maxHeight", 500);
        };
        setting.close = function(event, ui) {
            if (closeCallBack) {
                closeCallBack();
            }
            $('body').css('overflow-y', 'auto');
            $('div.ui-widget-overlay').off('click');
            $('#system-error-message-dialog-close').off('click');
        };

        var buttons = {}
        var button1 = {}
        button1["text"] = (btnText)?btnText:'确定';
        button1["class"] = 'buttonGreen buttonSmall';
        button1["click"] = function() {
            _dialog.dialog('close');
        };
        buttons["Ok"] = button1;

        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };

    ShowConfirmErrorDialog = function(errMessage, continueCallBack, stayCallback) {
        var _dialog_id = "system-confirm-error-dialog";
        var _dialog = $('#' + _dialog_id);
        $('body').css('overflow-y', 'hidden');

        var setting = {}
        setting.open = function(event, ui) {
            disableTouchMove();

            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#errorMessages').html(errMessage);
            $('div.ui-widget-overlay').click(function(e) {
                _dialog.dialog('close');
                if (stayCallback) {
                    stayCallback();
                }
            });
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function() {
            $(this).css("maxHeight", 500);
        };
        setting.close = function(event, ui) {
            // $(this).find('iframe').attr('src', '');
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
            $('div.ui-widget-overlay').off('click');
        };

        var buttons = {}
        var button1 = {}
        button1["text"] = '返回';
        button1["class"] = 'buttonOrange buttonSmall';
        button1["click"] = function() {
            _dialog.dialog('close');
            if (stayCallback) {
                stayCallback();
            }
        };
        button1['style'] = 'float:center;margin-left:20px';
        buttons["Stay"] = button1;

//        var button2 = {}
//        button2["text"] = 'Continue';
//        button2["class"] = 'buttonGreen buttonSmall';
//        button2["click"] = function() {
//            _dialog.dialog('close');
//            if (continueCallBack) {
//                continueCallBack();
//            }
//        };
        //message_by_gary button2['style'] = 'float:right;margin-right:20px ; display:none';//message_by_gary
//        button2['style'] = 'float:right;margin-right:20px ;';
//        buttons["Continue"] = button2;

        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };

    ShowConfirmationDialog = function(confirmationMsg, yesMsg, noMsg, yesCallBack, noCallback, overlayClickExit) { 
        var _dialog_id = "system-confirm-dialog";
        var _dialog = $('#' + _dialog_id);
        var _overlayClickExit = overlayClickExit == undefined ? true : overlayClickExit; 
        $('body').css('overflow-y', 'hidden');

        var setting = {}
        setting.open = function(event, ui) {
            disableTouchMove();

            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#confirmMessage').html(confirmationMsg);
            if (_overlayClickExit) { 
                $('div.ui-widget-overlay').click(function(e) {
                    _dialog.dialog('close');
                    if (noCallback) {
                        noCallback();
                    }
                });
            }
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function() {
            $(this).css("maxHeight", 500);
        };
        setting.close = function(event, ui) {
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
//            if (!yesClicked){
//                if (noCallback) {
//                    noCallback();
//                }
//            }
            $('div.ui-widget-overlay').off('click');
        };

        var buttons = {}
        var button1 = {}
        //var yesClicked = false;
        button1["text"] = yesMsg;
        button1["class"] = 'buttonGreen buttonSmall';
        button1["click"] = function() {
            //yesClicked = true;
            _dialog.dialog('close');
            if (yesCallBack) {
                yesCallBack();
            }
        };
        button1['style'] = 'float:left;margin-left:20px';
        buttons["Yes"] = button1;

        var button2 = {}
        button2["text"] = noMsg;
        button2["class"] = 'buttonOrange buttonSmall';
        button2["click"] = function() {
            _dialog.dialog('close');
            if (noCallback) {
                noCallback();
            }
        };
        button2['style'] = 'float:right;margin-right:20px';
        buttons["No"] = button2;

        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };

    ShowConfirmationDialogWithTitle2 = function(title, confirmationMsg, yesMsg, noMsg, yesCallBack, noCallback, overlayClickExit) {
        var _dialog_id = "system-confirm-dialog";
        var _dialog = $('#' + _dialog_id);
        var _overlayClickExit = overlayClickExit == undefined ? true : overlayClickExit;
        $('body').css('overflow-y', 'hidden');

        var setting = {}
        setting.open = function(event, ui) {
            disableTouchMove();

            //$(this).siblings('.ui-dialog-titlebar').remove();
            $(".ui-dialog-titlebar-close").hide();
            $(this).find('#confirmMessage').html(confirmationMsg);
            if (_overlayClickExit) {
                $('div.ui-widget-overlay').click(function(e) {
                    _dialog.dialog('close');
                    if (noCallback) {
                        noCallback();
                    }
                });
            }
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function() {
            $(this).css("maxHeight", 500);
        };
        setting.close = function(event, ui) {
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
            $('div.ui-widget-overlay').off('click');
        };

        var buttons = {}
        if (yesMsg) { //20186842
            var button1 = {}
            button1["text"] = yesMsg;
            button1["class"] = 'buttonGreen buttonSmall';
            button1["click"] = function() {
                _dialog.dialog('close');
                if (yesCallBack) {
                    yesCallBack();
                }
            };
            button1['style'] = 'float:left;margin-left:20px';
            buttons["Yes"] = button1;
        } //20186842
        
        if (noMsg) { //20186842
            var button2 = {}
            button2["text"] = noMsg;
            button2["class"] = 'buttonOrange buttonSmall';
            button2["click"] = function() {
                _dialog.dialog('close');
                if (noCallback) {
                    noCallback();
                }
            };
            button2['style'] = 'float:right;margin-right:20px';
            buttons["No"] = button2;
        } //20186842

        setting.title = title;
        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom ui-confirm-title';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };

    ShowEnclosedConfirmationDialog = function(confirmationMsg, yesMsg, noMsg, yesCallBack, noCallback) {
        var _dialog_id = "system-confirm-dialog";
        var _dialog = $('#' + _dialog_id);
        $('body').css('overflow-y', 'hidden');

        var setting = {}
        setting.open = function(event, ui) {
            disableTouchMove();

            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#confirmMessage').html(confirmationMsg);
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function() {
            $(this).css("maxHeight", 500);
        };
        setting.close = function(event, ui) {
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
//            if (!yesClicked){
//                if (noCallback) {
//                    noCallback();
//                }
//            }
            $('div.ui-widget-overlay').off('click');
        };

        var buttons = {}
        var button1 = {}
        //var yesClicked = false;
        button1["text"] = yesMsg;
        button1["class"] = 'buttonGreen buttonSmall';
        button1["click"] = function() {
            //yesClicked = true;
            _dialog.dialog('close');
            if (yesCallBack) {
                yesCallBack();
            }
        };
        button1['style'] = 'float:left;margin-left:20px';
        buttons["Yes"] = button1;

        var button2 = {}
        button2["text"] = noMsg;
        button2["class"] = 'buttonOrange buttonSmall';
        button2["click"] = function() {
            _dialog.dialog('close');
            if (noCallback) {
                noCallback();
            }
        };
        button2['style'] = 'float:right;margin-right:20px';
        buttons["No"] = button2;

        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom ui-dialog-table';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };

     //AWS NGLH GMMW begin
    ShowGMMWDocRequireDialog = function(confirmationMsg, yesMsg, noMsg, yesCallBack, noCallback) {
        var _dialog_id = "system-confirm-dialog";
        var _dialog = $('#' + _dialog_id);
        $('body').css('overflow-y', 'hidden');

        var setting = {}
        setting.open = function(event, ui) {
            disableTouchMove();

            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).find('#confirmMessage').html(confirmationMsg);
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function() {
            $(this).css("maxHeight", 500);
        };
        setting.close = function(event, ui) {
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
//            if (!yesClicked){
//                if (noCallback) {
//                    noCallback();
//                }
//            }
            $('div.ui-widget-overlay').off('click');
        };

        var buttons = {}
        var button1 = {}
        //var yesClicked = false;
        button1["text"] = yesMsg;
        button1["class"] = 'buttonGreen buttonSmall';
        button1["click"] = function() {
            //yesClicked = true;
            _dialog.dialog('close');
            if (yesCallBack) {
                yesCallBack();
            }
        };
        button1['style'] = 'float:left;margin-left:80px';
        buttons["Yes"] = button1;

        var button2 = {}
        button2["text"] = noMsg;
        button2["class"] = 'buttonOrange buttonSmall';
        button2["click"] = function() {
            _dialog.dialog('close');
            if (noCallback) {
                noCallback();
            }
        };
        button2['style'] = 'float:right;margin-right:80px';
        buttons["No"] = button2;

        setting.buttons = buttons;
        setting.width = 400;
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = false;
        setting.resizable = false;
        setting.closable = false;
        setting.dialogClass = 'ui-dialog-custom ui-dialog-table';
        setting.minHeight = 150;

        _dialog.dialog(setting);
    };
    //AWS NGLH GMMW  end


    ShowConfirmationDialogWithTitle = function(title,confirmationMsg,width,Height, yesMsg, noMsg, yesCallBack, noCallback) {
        var _dialog_id = "system-confirm-dialog";
        var _dialog = $('#' + _dialog_id);
        $('body').css('overflow-y', 'hidden');

        var setting = {}
        setting.open = function(event, ui) {
            //disableTouchMove();

//            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).siblings('.ui-dialog-titlebar').class="ui-dialog-title";
            $(this).find('#confirmMessage').html(confirmationMsg);
            $('div.ui-widget-overlay').click(function(e) {
                _dialog.dialog('close');
                if (noCallback) {
                    noCallback();
                }
            });
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        setting.create = function() {
            $(this).css("maxHeight", Height);
        };
        setting.close = function(event, ui) {
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
//            if (!yesClicked){
//                if (noCallback) {
//                    noCallback();
//                }
//            }
            $('div.ui-widget-overlay').off('click');
        };

        var buttons = {}
        var button1 = {}
        //var yesClicked = false;
        button1["text"] = yesMsg;
        button1["class"] = 'buttonGreen buttonSmall';
        button1["click"] = function() {
            //yesClicked = true;
            _dialog.dialog('close');
            if (yesCallBack) {
                yesCallBack();
            }
        };
        button1['style'] = 'float:left;margin-left:20px';
        buttons["Yes"] = button1;

        var button2 = {}
        button2["text"] = noMsg;
        button2["class"] = 'buttonOrange buttonSmall';
        button2["click"] = function() {
            _dialog.dialog('close');
            if (noCallback) {
                noCallback();
            }
        };
        button2['style'] = 'float:right;margin-right:20px';
        buttons["No"] = button2;

        setting.buttons = buttons;
        setting.width = width; //400
        setting.height = 'auto';
        setting.closeOnEscape = true;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = true;
        setting.resizable = false;
        setting.closable = false;
//        setting.dialogClass = 'ui-dialog-custom';
        setting.dialogClass = 'ui-dialog-custom';
        setting.title=title;
        setting.minHeight = 150

        _dialog.dialog(setting);
    };

    //2016-MDT-004-phase2-felix begin
    ShowQuestionaire = function(questionDiv, scope, compile, yesButton, noButton) {
        var _dialog_id = "system-questionaire-dialog";
        var _dialog = $('#' + _dialog_id);
        $('body').css('overflow-y', 'hidden');

        var setting = {}
        setting.open = function(event, ui) {
            //disableTouchMove();

            $(this).siblings('.ui-dialog-titlebar').remove();
            $(this).siblings('.ui-dialog-titlebar').class="ui-dialog-title";
            _dialog.empty();
            _dialog.append(questionDiv);
            //$(this).find('#confirmMessage').html(confirmationMsg);
            //$('div.ui-widget-overlay').click(function(e) {
            //    _dialog.dialog('close');
            //    if (noCallback) {
            //        noCallback();
            //    }
            //});
            //_dialog.data("dialog").option("position", _dialog.data("dialog").options.position);
            compile(_dialog.parent())(scope);
            _dialog.dialog("option", "position", _dialog.dialog("option", "position")); //Jquery upgrade
        };
        //setting.create = function() {
        //    $(this).css("maxHeight", Height);
        //};
        setting.close = function(event, ui) {
            $('body').css('overflow-y', 'auto');
            enableTouchMove();
            //if (!yesClicked){
            //    if (noCallback) {
            //        noCallback();
            //    }
            //}
            $('div.ui-widget-overlay').off('click');
        };

        var buttons = {}
        //var button1 = {}
        //var yesClicked = false;
        //button1["text"] = yesMsg;
        //button1["class"] = 'buttonGreen buttonSmall';
        //button1["click"] = function() {
        //    //yesClicked = true;
        //    if (yesCallBack) {
        //        if (yesCallBack()) {
        //            _dialog.dialog('close');
        //        }
        //    }
        //    else {
        //        _dialog.dialog('close');
        //    }
        //};
        //button1['style'] = 'float:right;margin-right:50px';
        //button1['ng-Class'] = '{buttonGreen:QuestionFC00400.Answer,buttonGreenDisabled:!QuestionFC00400.Answer}';
        //button1['ng-disabled'] = '!QuestionFC00400.Answer';
        if (yesButton) {
            buttons["Yes"] = yesButton(_dialog);
        }

        //var button2 = {}
        //button2["text"] = noMsg;
        //button2["class"] = 'buttonOrange buttonSmall';
        //button2["click"] = function() {
        //    _dialog.dialog('close');
        //    if (noCallBack) {
        //        noCallBack();
        //    }
        //};
        //button2['style'] = 'float:right;margin-right:20px';
        if (noButton) {
            buttons["No"] = noButton(_dialog);
        }

        setting.buttons = buttons;
        setting.width = 'auto';
        setting.height = 'auto';
        setting.closeOnEscape = false;
        setting.position = 'center';
        setting.modal = true;
        setting.draggable = true;
        setting.resizable = false;
        setting.closable = false;
        //setting.dialogClass = 'ui-dialog-custom';
        setting.dialogClass = 'ui-dialog-custom';
        //setting.title=title;
        setting.minHeight = 150

        _dialog.dialog(setting);
    };
    //2016-MDT-004-phase2-felix end

    framework.provider('uploadFileService', function() {
        this.uploadUrl = null;
        this.$get = function($q) {
            var xhr = null;
            var uploadUrl = this.uploadUrl;
            return {
                cancelUpload: function() {
                    if (xhr != null) {
                        xhr.abort();
                    }
                },
                upload: function(file, formData) {
                    var deferred = $q.defer();
                    var lastLoaded = 0;
                    var lastTime = null;
                    var loadstartListener = function(evt) {
                        lastTime = (new Date()).getTime();
                    };
                    var progressListener = function(evt) {
                        if (evt.lengthComputable) {
                            var loadDiff = (evt.loaded - lastLoaded); //in B
                            var timeDiff = ((new Date()).getTime() - lastTime) / 1000; //in second
                            if (timeDiff > 0) {
                                var transferSpeed = loadDiff / timeDiff;
                                var percentComplete = (evt.loaded / evt.total) * 100;
                                deferred.notify({
                                    "percentComplete": percentComplete,
                                    "transferSpeed": transferSpeed,
                                    "timeRemaining": Math.max(0, (file.size - evt.loaded) / transferSpeed)
                                });
                            }
                        }
                    };
                    if (!formData) {
                        formData = new FormData();
                    }
                    formData.append("file", file);
                    var _startTime = new Date();
                    xhr = $.ajax({
                        type: 'POST',
                        url: uploadUrl,
                        data: formData,
                        async: true,
                        cache: false,
                        // Force this to be read from FormData
                        contentType: false,
                        processData: false,
                        success: function(response, textStatus, jqXHR) {
                            var _timeElapsed = ((new Date()).getTime() - _startTime.getTime()) / 1000;
                            try {
                                var _jsonResult = JSON.parse(response);
                                if (_jsonResult["JSON_RESULT_ERROR"].length > 0) {
                                    deferred.reject({
                                        "timeElapsed": _timeElapsed,
                                        "statusText": _jsonResult["JSON_RESULT_ERROR"]
                                    });
                                } else {
                                    deferred.resolve({
                                        "timeElapsed": _timeElapsed,
                                        "statusText": "Done",
                                        "result": _jsonResult["JSON_RESULT_DATA"]
                                    });
                                }
                            } catch (err) {
                                deferred.reject({
                                    "timeElapsed": _timeElapsed,
                                    "statusText": err
                                });
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            var _timeElapsed = ((new Date()).getTime() - _startTime.getTime()) / 1000;
                            deferred.reject({
                                "timeElapsed": _timeElapsed,
                                "statusText": errorThrown
                            });
                        },
                        xhr: function() {
                            var _xhr = $.ajaxSettings.xhr();
                            if (_xhr.upload) {
                                _xhr.upload.addEventListener(
                                    'progress', progressListener, false);
                                _xhr.upload.addEventListener(
                                    'loadstart', loadstartListener, false);

                            } else {}
                            return _xhr;
                        }
                    });
                    return deferred.promise;
                }
            };
        };


        this.setUploadUrl = function(url) {
            this.uploadUrl = url;
        };
    });

    framework.provider('logService', function() {
        this.$get = function($q) {
            return {
                log: function(s) {
                    try {
                        console.log(s);
                    } catch (e) {}
                }
            };
        };
    });

}(window, window.angular));

function extend(destination, source) {
    var property;
    for (property in source) {
        destination[property] = source[property];
    }
    return destination;
};

function copyRuleDetails(otherRule, rule) {
    if (angular.isDefined(otherRule.isError))
        rule.isError = otherRule.isError;
    if (angular.isDefined(otherRule.message))
        rule.message = otherRule.message;
    if (angular.isDefined(otherRule.performCheck))
        rule.performCheck = otherRule.performCheck;
    if (angular.isDefined(otherRule.parameters)) {
        var r = extend({}, rule.parameters);
        rule.parameters = extend(r, otherRule.parameters);
    }
    return rule;
};

/*
{
"JSON_RESULT_ERROR": [
                         {"errorCode": "E1000", "errorField": "", "errorMessage": "representative error sample"},
                         {"errorCode": "E1010", "errorField": "eApp.Representative.BranchName;branchNameRules", "errorMessage": "eApp.Representative.BranchName error sample"}
                     ],
"JSON_RESULT_DATA": {}
}
*/
var JSON_RESULT = "JSON_RESULT_DATA";
var JSON_ERROR = "JSON_RESULT_ERROR";

function presentErrors(errors, scope, controller) {
    var form = scope[$('form')[0].name];
    if (form) {
        if (angular.isUndefined(scope[ErrorSummary])) {
            //scope[ErrorSummary] = ErrorSummaryHelper.init(scope, controller);
            scope[ErrorSummary] = new ErrorSummaryHelper(scope, controller);
        }

        scope[ErrorSummary].remove(UnknownField, undefined);

        for (e in errors) {
            var err = errors[e];

            var dataModel = UnknownField;
            var formFld = UnknownField;
            var fieldIdx = undefined;
            var dataSource = undefined;
            var clientId = undefined;
            var validateScopeKey = undefined;

            if (!(err.errorField == "" || err.errorField == undefined || err.errorField == null)) {
                var errFields = err.errorField.split(";");
                dataModel = errFields[0];
                if (errFields.length > 1) {
                    formFld = errFields[1];
                }
                if (errFields.length > 2) {
                    fieldIdx = errFields[2];
                }
                if (errFields.length > 3) {
                    dataSource = errFields[3];
                }
                if (errFields.length > 4) {
                    clientId = errFields[4];
                }
            }

            //var validateScopeKey = scope.$eval($(elem).attr('validate-scope-key'));
            if (dataModel != UnknownField && angular.isDefined(fieldIdx)) {
                var _f = scope[ErrorSummary].lookupFieldSet(dataModel, fieldIdx);

                if (_f) {
                    validateScopeKey = _f.validator.scopeKey;
                } else {                    
                    
                    var v = $(scope);
                    var p = null;
                    var fs = dataSource.split('.');

                    try {
                        for (a in fs) {
                            var f = fs[a];
                            p = v.prop(f);
                            v = $(p);
                        };
                    } catch (e) {
                        v = null;
                    }

                    if (clientId != undefined) {
                        if (v && v[fieldIdx][clientId]) {
                            if (v[fieldIdx][clientId].$$hashKey) {
                                validateScopeKey = v[fieldIdx][clientId].$$hashKey;
                            } else {
                                validateScopeKey = clientId;
                            }
                        }
                    } else if (v && v[fieldIdx]) {
                        if (v[fieldIdx].$$hashKey) {
                            validateScopeKey = v[fieldIdx].$$hashKey;
                        } else {
                            validateScopeKey = fieldIdx;
                        }                        
                    }
                }
                                
                if (!validateScopeKey) {
                    dataModel = UnknownField;
                }
            }

            if (dataModel != UnknownField) {
                scope[ErrorSummary].remove(dataModel, validateScopeKey);
            }

            scope[ErrorSummary].add(dataModel, validateScopeKey, err.errorMessage);

            // the form field validity should be set since we need prompt message to notify the user if they insist to 
            // move the current page to another even errors happen in the current page.
            if (form[formFld]) {
                form[formFld].$setValidity(dataModel, false);
                //if (scope[formFld + "Rules"] !== undefined) {
                //    scope[formFld + "Rules"].error.clear();            
                //    scope[formFld + "Rules"].error.set(err.errorMessage);
                //}
            }

        };
    }
};

preventBehavior = function(e) {
    e.preventDefault();
};

allowTouchMove = function(e){
    var ele = $(this);
    if (ele.get(0).scrollHeight > ele.height()) {
        var te = e.originalEvent.changedTouches[0].clientY;
        if (ts > te) {
            //down
            if( (ele.scrollTop() + ele.height() )< ele.get(0).scrollHeight){
                e.stopPropagation();
            }
        } else {
            //up
            if(ele.scrollTop() > 0){
                e.stopPropagation();
            }
        }
        
    }
};

var ts;
recordPositionOnTouchStart = function(e){
    ts = e.originalEvent.touches[0].clientY;
}

var touchMoveCounter = 0;
disableTouchMove = function() {
    if (IsMobileBrowser()) {
        touchMoveCounter++;
        document.removeEventListener("touchmove", preventBehavior, false);
        document.addEventListener("touchmove", preventBehavior, false);
        $('.touchScrollable').off('touchmove', allowTouchMove);
        $('.touchScrollable').on('touchmove', allowTouchMove);
        $(document).off('touchstart', recordPositionOnTouchStart);
        $(document).on('touchstart', recordPositionOnTouchStart);
    }
};

enableTouchMove = function() {
    if (IsMobileBrowser()) {
        touchMoveCounter--;
        if(touchMoveCounter<0) touchMoveCounter = 0;
        if(touchMoveCounter==0){
           document.removeEventListener("touchmove", preventBehavior, false);
           $('.touchScrollable').off('touchmove', allowTouchMove);
           $(document).off('touchstart', recordPositionOnTouchStart);
        }
    }
};

/*resetTouchMove = function() {
    touchMoveCounter = 0;
    enableTouchMove();
};*/

hyphenDelimitedToCamelCase = function(input) {
    return ("-" + input).replace(/-([a-z])/g, function(m, w) {
        return w.toUpperCase();
    });
};

CamelCaseTohyphenDelimited = function(input) {
    input = input.charAt(0).toLowerCase() + input.slice(1);
    return (input).replace(/([A-Z])/g, function(m, w) {
        return "-" + w.toLowerCase();
    });
};

parseNumberWithLocaleFormat = function(s){
    if(s!=null && s !=undefined){
        var injector = angular.injector(['ng']);
        var locale = injector.get('$locale');
        var groupSep =locale.NUMBER_FORMATS.GROUP_SEP;
        var decimalSep =locale.NUMBER_FORMATS.DECIMAL_SEP;
        //split into integer and deciaml part
        var arr = s.split(decimalSep);
        if(arr.length == 1){
            var val = arr[0].replace(new RegExp(groupSep, 'g'), '');
            if(val!="" && val!=null && val!=undefined && !isNaN(val)){
                return parseFloat(val);
            }
        }
        else if(arr.length == 2){
            var integerPart = arr[0].replace(new RegExp(groupSep, 'g'), '');
            var decimalPart = arr[1];
            var jsNumberStr = integerPart;
            if(decimalPart!=null && decimalPart !=undefined){
                jsNumberStr = jsNumberStr + "." + decimalPart;
            }
            if(jsNumberStr!="" && jsNumberStr!=null && jsNumberStr!=undefined && !isNaN(jsNumberStr)){
                return parseFloat(jsNumberStr);
            }
        }
    }
    return null;
};

parseDateWithISOFormat = function (s, trimTime) {
    //ISO_8601:yyyy-MM-ddThh:mm:ss
    if (angular.isUndefined(s) || s == null) return null;
    var arr = s.split("T");
    var dateStr = arr[0];
    var timeStr = null;
    if (arr.length > 1) {
        timeStr = arr[1];
    }
    var _y = null,
        _m = null,
        _d = null,
        _hh = null,
        _mm = null,
        _ss = null;
    var dateArr = dateStr.split("-");
    if (dateArr.length == 3) {
        _y = parseInt(dateArr[0], 10);
        _m = parseInt(dateArr[1], 10) - 1;
        _d = parseInt(dateArr[2], 10);
        if (!timeStr) {
            return new Date(_y, _m, _d);
        }
    }

    if (timeStr && !trimTime) {
        var timeArr = timeStr.split(":");
        if (timeArr.length >= 3) {
            _hh = parseInt(timeArr[0], 10);
            _mm = parseInt(timeArr[1], 10);
            _ss = parseInt(timeArr[2], 10);
            return new Date(_y, _m, _d, _hh, _mm, _ss);
        }
    }
    else {
        return new Date(_y, _m, _d, 0, 0, 0);
    }

    return null;
};

isoFormatDateToDisplayFormat = function (isoFormatDateStr) {
    var thisDate = parseDateWithISOFormat(isoFormatDateStr);
    return $.datepicker.formatDate('yy/mm/dd', thisDate);
};

//<<20190057
isoFormatDateToDisplayFormat_GACP = function (isoFormatDateStr) {
    var dateVal = isoFormatDateStr.replace("年", "-").replace("月", "-").replace("日", "")
    var thisDate = parseDateWithISOFormat(isoFormatDateStr);
    return $.datepicker.formatDate('yy/mm/dd', thisDate);
};
//>>20190057

getCaret = function(el) { 
  if (el.selectionStart) { 
    return el.selectionStart; 
  } else if (document.selection) { 
    el.focus(); 

    var r = document.selection.createRange(); 
    if (r == null) { 
      return 0; 
    } 

    var re = el.createTextRange(), 
        rc = re.duplicate(); 
    re.moveToBookmark(r.getBookmark()); 
    rc.setEndPoint('EndToStart', re); 

    return rc.text.length; 
  }  
  return 0;
}

setCaret = function(el, caretPos) {
    el.value = el.value;
    // ^ this is used to not only get "focus", but
    // to make sure we don't have it everything -selected-
    // (it causes an issue in chrome, and having it doesn't hurt any other browser)

    if (el !== null) {

        if (el.createTextRange) {
            var range = el.createTextRange();
            range.move('character', caretPos);
            range.select();
            return true;
        }

        else {
            // (el.selectionStart === 0 added for Firefox bug)
            if (el.selectionStart || el.selectionStart === 0) {
                el.focus();
                el.setSelectionRange(caretPos, caretPos);
                return true;
            }

            else { // fail city, fortunately this never happens (as far as I've tested) :)
                el.focus();
                return false;
            }
        }
    }
}

getSelectionText = function(el)
{
  var textComponent = el;
  var selectedText = "";
  // IE version
  if (document.selection != undefined)
  {
    textComponent.focus();
    var sel = document.selection.createRange();
    selectedText = sel.text;
  }
  // Mozilla version
  else if (textComponent.selectionStart != undefined)
  {
    var startPos = textComponent.selectionStart;
    var endPos = textComponent.selectionEnd;
    selectedText = textComponent.value.substring(startPos, endPos)
  }
  return selectedText;
}

clearSelection = function(){
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {  // IE?
        document.selection.empty();
    }
}

/*
Object.prototype.hashCode = (function(id) {
    return function() {
        if (!this.hashCode) {
            this.hashCode = '<hash|#' + (id++) + '>';
        }
        return this.hashCode;
    };
}(0));*/