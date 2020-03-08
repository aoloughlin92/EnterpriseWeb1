'use strict';

const Accounts = require('./app/controllers/accounts');
const POIs = require('./app/controllers/pois');
const Admins = require('./app/controllers/admins');
const Categories = require('./app/controllers/categories');

module.exports = [
    { method: 'GET', path: '/', config: Accounts.index },
    { method: 'GET', path: '/signup', config: Accounts.showSignup },
    { method: 'GET', path: '/login', config: Accounts.showLogin },
    { method: 'GET', path: '/logout', config: Accounts.logout },
    { method: 'POST', path: '/signup', config: Accounts.signup },
    { method: 'POST', path: '/login', config: Accounts.login },

    { method: 'GET', path: '/home', config: POIs.home },
    { method: 'GET', path: '/admin', config: Admins.home },
    { method: 'GET', path: '/view', config: POIs.view },
    { method: 'POST', path: '/create', config: POIs.create },

    { method: 'GET', path: '/settings', config: Accounts.showSettings },
    { method: 'POST', path: '/settings', config: Accounts.updateSettings },
    { method: 'GET', path: '/adminsettings', config: Accounts.adminShowSettings },
    { method: 'POST', path: '/adminsettings', config: Accounts.adminUpdateSettings },

    { method: 'GET', path: '/viewUser/{id}', config: Admins.viewUser },
    { method: 'GET', path: '/editUser/{id}', config: Admins.editUser },
    { method: 'POST', path: '/editUser/{id}', config: Accounts.updateUser },
    { method: 'GET', path: '/deleteUser/{id}', config: Accounts.deleteUser },

    { method: 'GET', path: '/editPOI/{id}', config: POIs.editScreen },
    { method: 'POST', path: '/editPOI/{id}', config: POIs.userEdit },
    { method: 'GET', path: '/deletePOI/{id}', config: POIs.userDelete },
    { method: 'POST', path: '/uploadImage/{id}', config: POIs.uploadImage },

    { method: 'GET', path: '/categories', config: Categories.home },
    { method: 'POST', path: '/createCategory', config: Categories.create },
    { method: 'GET', path: '/viewCategory/{id}', config: POIs.viewByCategory },
    { method: 'GET', path: '/deleteimage/{poiid}/{imageid}', config: POIs.deleteImage },

    {
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: './public'
            }
        },
        options: { auth: false }
    }
];