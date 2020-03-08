'use strict';
const Category = require('../models/category');
const User = require('../models/user');
const POI = require('../models/poi');

const Categories = {
    home: {
        handler: async function(request, h) {
            try {
                const categories = await Category.find().lean();
                return h.view('categories', {
                    title: 'View/Create Categories',
                    categories: categories
                });
            }catch(err){
                return h.view('home', { errors: [{ message: err.message }] });
            }
        }
    },
    create: {
        handler: async function(request, h){
            try {
                const name = request.payload.name;
                const newCat = new Category({
                    name: name
                });
                await newCat.save();
                return h.redirect('/home');
            }catch(err){
                return h.view('main', { errors: [{ message: err.message }] });
            }
        }
    },


}

module.exports = Categories;