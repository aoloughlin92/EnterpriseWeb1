'use strict';
const POI = require('../models/poi');
const User = require('../models/user');
const ImageStore = require('../utils/image-store');
const Category = require('../models/category')

const POIs = {
    home: {
        handler: async function(request, h) {
            const categories = await Category.find().lean()
            return h.view('home', {
                title: 'Create a Point of Interest',
                categories: categories
            });
        }
    },
    view: {
        handler: async function(request, h) {
            const user = await User.findById(request.auth.credentials.id);
            const pois = await POI.findByCreator(user).populate('category').populate('creator').lean();
            return h.view('view', {
                title:'View Points of Interest',
                pois: pois
            });
        }
    },
    create: {
        handler: async function(request, h){
            try {
                const id = request.auth.credentials.id;
                const user = await User.findById(id);
                const data = request.payload;
                const rawCategory = request.payload.category;
                const category = await Category.findOne({name: rawCategory});
                var imageId;
                try {
                    const file = request.payload.imagefile;

                    if (Object.keys(file).length > 0) {
                        imageId = await ImageStore.uploadImage(request.payload.imagefile);
                    }
                }
                catch(err){
                    return h.view('main', { errors: [{ message: err.message }] });
                }
                const newPOI = new POI({
                    name: data.name,
                    category: category._id,
                    description: data.description,
                    creator: user._id,
                    images: [imageId]
                });
                await newPOI.save();
                return h.redirect('/view');
            } catch(err) {
                return h.view('main', {errors: [{message: err.message}]});
            }
        },
        payload: {
            multipart: true,
            output: 'data',
            maxBytes: 209715200,
            parse: true
        }
    },
    editScreen: {
        handler: async function (request, h) {
            try{
                const poi = await POI.findById(request.params.id).populate('category').lean();
                const images = await ImageStore.getImagesByArray(poi.images);
                const categories = await Category.find().lean();
                return h.view('editpoi', {
                    title: poi.name,
                    poi: poi,
                    images: images,
                    categories: categories
            });
            } catch(err){
                return h.view('main', {errors: [{message: err.message}]});
            }
        }
    },
    userEdit: {
        handler: async function(request, h){
            try {
                const id = request.auth.credentials.id;
                const user = await User.findById(id);
                const poi = await POI.findById(request.params.id);
                const poiEdit = request.payload;
                const rawCategory = request.payload.category;
                const category = await Category.findOne({name: rawCategory});
                poi.name = poiEdit.name;
                poi.description = poiEdit.description;
                poi.category = category._id;
                await poi.save();
                const images = await ImageStore.getImagesByArray(poi.images);
                const poi2 = await POI.findById(request.params.id).populate('category').lean();
                const categories = await Category.find().lean();
                return h.view('editpoi', {
                    title: poi2.name,
                    poi: poi2,
                    images: images,
                    categories: categories
                });
            } catch(err) {
                return h.view('main', {errors: [{message: err.message}]});
            }
        },


    },
    userDelete: {
        handler: async function(request, h) {
            try {
                const response = await POI.findOneAndDelete({_id: request.params.id});
                return h.redirect('/view');
            }catch(err){
                return h.redirect('/view', { errors: [{ message: err.message }] });
            }
        }

    },
    viewByCategory: {
        handler: async function (request, h) {
            try {
                const user = await User.findById(request.auth.credentials.id);
                const category = await Category.findById(request.params.id);
                const pois = await POI.findByCategory(user, category).populate('creator').populate('category').lean()
                return h.view('view', {
                    title: category.name,
                    pois: pois
                });
            } catch (err) {
                return h.view('main', {errors: [{message: err.message}]});
            }
        }
    },
    uploadImage: {
        handler: async function (request, h) {
            try {
                const poi = await POI.findById(request.params.id);

                var imageId;
                const file = request.payload.imagefile;

                if (Object.keys(file).length > 0) {
                    imageId = await ImageStore.uploadImage(request.payload.imagefile);
                }

                poi.images.push(imageId);
                await poi.save();
                return h.redirect('/editPOI/'+ poi._id);
            } catch (err) {
                return h.view('main', {errors: [{message: err.message}]});
            }
        },
        payload: {
            multipart: true,
            output: 'data',
            maxBytes: 209715200,
            parse: true
        }
    },
    deleteImage:{
        handler: async function (request, h) {
            try{
                const imageId = request.params.imageid;
                const poiId = request.params.poiid;
                const poi = await POI.findById(poiId);
                const index =  poi.images.indexOf(imageId);
                if(index > -1){
                    poi.images.splice(index,1);
                }
                await poi.save();
                return h.redirect('/editPOI/'+ poi._id);
            }catch(err){
                return h.view('main', {errors: [{message: err.message}]});
            }
        }


    },
};

module.exports = POIs;