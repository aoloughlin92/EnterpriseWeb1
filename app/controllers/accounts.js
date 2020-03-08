'use strict';
const User = require('../models/user');
const Admin = require('../models/admin');
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

const Accounts = {
    index: {
        auth: false,
        handler: function(request, h) {
            return h.view('main', { title: 'Welcome to Points of Interest' });
        }
    },
    showSignup: {
        auth: false,
        handler: function(request, h) {
            return h.view('signup', { title: 'Sign up for Points of Interest' });
        }
    },
    signup: {
        auth: false,
        validate: {
            payload: {
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string()
                    .email()
                    .required(),
                password: Joi.string().required()
            },
            options: {
                abortEarly: false
            },
            failAction: function(request, h, error) {
                return h
                    .view('signup', {
                        title: 'Sign up error',
                        errors: error.details
                    })
                    .takeover()
                    .code(400);
            }
        },
        handler: async function(request, h) {
            try {
                const payload = request.payload;
                let user = await User.findByEmail(payload.email);
                let admin = await Admin.findByEmail(payload.email);
                if (user || admin) {
                    const message = 'Email address is already registered';
                    throw Boom.badData(message);
                }
                const newUser = new User({
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                    password: payload.password
                });
                user = await newUser.save();
                request.cookieAuth.set({ id: user.id });
                return h.redirect('/home');
            } catch (err) {
                return h.view('signup', { errors: [{ message: err.message }] });
            }
        }
    },
    showLogin: {
        auth: false,
        handler: function(request, h) {
            return h.view('login', { title: 'Login to Points of Interest' });
        }
    },
    login: {
        auth: false,
        validate: {
            payload: {
                email: Joi.string()
                    .email()
                    .required(),
                password: Joi.string().required()
            },
            options: {
                abortEarly: false
            },
            failAction: function(request, h, error) {
                return h
                    .view('login', {
                        title: 'Sign in error',
                        errors: error.details
                    })
                    .takeover()
                    .code(400);
            }
        },
        handler: async function(request, h) {
            const { email, password } = request.payload;
            try {
                let user = await User.findByEmail(email);
                let admin = await Admin.findByEmail(email);
                if(user){
                    user.comparePassword(password);
                    request.cookieAuth.set({ id: user.id });
                    return h.redirect('/home');
                }
                else if(admin){
                    admin.comparePassword(password);
                    request.cookieAuth.set({ id: admin.id });
                    return h.redirect('/admin');
                }
                else if (!user && !admin) {
                    const message = 'Email address is not registered';
                    throw Boom.unauthorized(message);
                }
            } catch (err) {
                return h.view('login', { errors: [{ message: err.message }] });
            }
        }
    },
    logout: {
        auth: false,
        handler: function(request, h) {
            request.cookieAuth.clear();
            return h.redirect('/');
        }
    },
    showSettings: {
        handler: async function(request, h) {
            try {
                const id = request.auth.credentials.id;
                const user = await User.findById(id).lean();
                return h.view('settings', { title: 'Point of Interest Settings', user: user });
            } catch (err) {
                return h.view('login', { errors: [{ message: err.message }] });
            }
        }
    },
    adminShowSettings: {
        handler: async function(request, h) {
            try {
                const id = request.auth.credentials.id;
                const admin = await Admin.findById(id).lean();
                return h.view('adminsettings', { title: 'Point of Interest Settings', admin: admin });
            } catch (err) {
                return h.view('login', { errors: [{ message: err.message }] });
            }
        }
    },
    updateSettings: {
        validate: {
            payload: {
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string()
                    .email()
                    .required(),
                password: Joi.string().required()
            },
            options: {
                abortEarly: false
            },
            failAction: function(request, h, error) {
                return h
                    .view('settings', {
                        title: 'Sign up error',
                        errors: error.details
                    })
                    .takeover()
                    .code(400);
            }
        },
        handler: async function(request, h) {
            try {
                const userEdit = request.payload;
                const id = request.auth.credentials.id;
                const user = await User.findById(id);
                user.firstName = userEdit.firstName;
                user.lastName = userEdit.lastName;
                user.email = userEdit.email;
                user.password = userEdit.password;
                await user.save();
                return h.redirect('/settings');
            } catch (err) {
                return h.view('main', { errors: [{ message: err.message }] });
            }
        }
    },
    adminUpdateSettings: {
        validate: {
            payload: {
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string()
                    .email()
                    .required(),
                password: Joi.string().required()
            },
            options: {
                abortEarly: false
            },
            failAction: function(request, h, error) {
                return h
                    .view('adminsettings', {
                        title: 'Sign up error',
                        errors: error.details
                    })
                    .takeover()
                    .code(400);
            }
        },
        handler: async function(request, h) {
            try {
                const adminEdit = request.payload;
                const id = request.auth.credentials.id;
                const admin = await Admin.findById(id);
                admin.firstName = adminEdit.firstName;
                admin.lastName = adminEdit.lastName;
                admin.email = adminEdit.email;
                admin.password = adminEdit.password;
                await admin.save();
                return h.redirect('/adminsettings');
            } catch (err) {
                return h.view('main', { errors: [{ message: err.message }] });
            }
        }
    },
    updateUser: {
        validate: {
            payload: {
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                email: Joi.string()
                    .email()
                    .required(),
                password: Joi.string().required()
            },
            options: {
                abortEarly: false
            },
            failAction: function(request, h, error) {
                return h
                    .view('admin', {
                        title: 'Sign up error',
                        errors: error.details
                    })
                    .takeover()
                    .code(400);
            }
        },
        handler: async function(request, h) {
            try {
                const user = await User.findById(request.params.id);
                const userEdit = request.payload;
                user.firstName = userEdit.firstName;
                user.lastName = userEdit.lastName;
                user.email = userEdit.email;
                user.password = userEdit.password;
                await user.save();

                const user2 = await User.findById(request.params.id).lean();
                return h.view('editUser', {
                    title: user2.firstName +" "+ user2.lastName,
                    user: user2,
                });
            }catch(err){
                return h.redirect('/admin', { errors: [{ message: err.message }] });
            }
        }
    },
    deleteUser: {
        handler: async function(request, h) {
            try {
                //const user = await User.findById(request.params.id);
                const response = await User.findOneAndDelete({_id: request.params.id});
                return h.redirect('/admin');
            }catch(err){
                return h.redirect('/admin', { errors: [{ message: err.message }] });
            }
        }
    },

};

module.exports = Accounts;