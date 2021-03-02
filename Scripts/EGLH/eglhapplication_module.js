//////////////////
/// Angular initialization - Begin
//////////////////

var eglhapplication_module = angular.module('eGLHApp', ['ngAnimate', 'ngSanitize', 'framework', 'pascalprecht.translate']);

eglhapplication_module.constant('APP_CONSTANT', {
    'HOME_CURRENCY': '元',
    'APP_STATUS_PENDING': '01',
    'APP_STATUS_CONFIRM': '02',
    'APP_STATUS_SUBMIT': '03',
    'E_SIGNATURE_UPLOAD_STATUS': {
        'NOT_UPLOADED': 0,
        'UPLOADED': 1,
        'SIGNED': 2
    }
});

var CORRESPONDING_ADDRESS = "";
var IS_FIRST_CORRESPONDING_ADDRESS = false;
var ADDRESS_MAXIMUM_LENGTH = 120;
var ADDRESS_MINIMUM_LENGTH = 10;
var NAME_MAXIMUM_LENGTH = 60;
var COMPANY_OR_SCHOOL_NAME_MAXIMUM_LENGTH = 120;
var BUSINESS_NATURE_MAXIMUM_LENGTH = 120;
var DEPARTMENT_MAXIMUM_LENGTH = 120;
var OPENING_BRANCH_NAME_MAXIMUM_LENGTH = 50;
var OPENING_BRANCH_LOCATION_MAXIMUM_LENGTH = 50;
