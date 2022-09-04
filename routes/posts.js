const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const path = require('path');
const Category = require('../models/Category');
const User = require('../models/User');
const Comment = require('../models/Comment');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


router.get('/new', (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({ _id: req.session.userId }).lean().then(user => {
        if (user.auth !== true) {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        Category.find({}).sort({ name: 1 }).lean().then(categories => {
            res.render('site/addpost', { categories: categories });
        })
    })
})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.get('/search', (req, res) => {
    if (req.query.look) {
        const regex = RegExp(escapeRegex(req.query.look), 'gi');
        Post.find({ $or: [{ title: regex }, { content: regex }] }).populate({ path: 'author', model: User }).sort({ $natural: -1 }).lean().then(posts => {
            Category.aggregate([
                {
                    $lookup: {
                        from: 'posts',
                        localField: '_id',
                        foreignField: 'category',
                        as: 'posts'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        num_of_posts: { $size: '$posts' }
                    }
                }

            ]).then(categories => {
                res.render('site/blog', { posts: posts, categories: categories })
            })
        })
    }
})


router.get('/:id', (req, res) => {
    Post.findById(req.params.id).populate({ path: 'author', model: User }).lean().then(post => {
        Category.aggregate([
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'posts'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    num_of_posts: { $size: '$posts' }
                }
            },
            {
                $sort: {
                    name: 1
                }
            }
        ]).then(categories => {
            Post.find({}).sort({ $natural: -1 }).lean().then(posts => {
                Comment.find({ post: req.params.id, active: true }).populate({ path: 'author', model: User }).sort({ $natural: -1 }).lean().then(comments => {
                    res.render('site/blog-single', { post: post, categories: categories, posts: posts, comments: comments });
                })
            })
        })
    })
})

router.post('/comment/:id', (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    //verify can comment
    if (!req.session.verify) {
        req.session.sessionFlash = {
            type: 'alert alert-danger',
            message: 'Sadece doğrulanmış hesaplar yorum yapabilir.'
        }
        return res.redirect(`/posts/${req.params.id}`)
    }
    if (!(/^\s*$/.test(req.body.cContent))) { //empty string control
        Comment.create({
            cContent: req.body.cContent,
            post: req.params.id,
            author: req.session.userId
        });
    }
    res.redirect(`/posts/${req.params.id}`);
})

router.get('/category/:id', (req, res) => {
    Post.find({ category: req.params.id }).populate({ path: 'author', model: User }).sort({ $natural: -1 }).lean().then(posts => {
        Category.aggregate([
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'posts'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    num_of_posts: { $size: '$posts' }
                }
            },
            {
                $sort: {
                    name: 1
                }
            }
        ]).then(categories => {
            res.render('site/blog', { posts: posts, categories: categories })
        })
    })

})

router.post('/test', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({ _id: req.session.userId }).lean().then(user => {
        if (user.auth !== true) {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        let post_image = req.files.post_image;
        if (post_image.mimetype != 'image/png' && post_image.mimetype != 'image/jpg' && post_image.mimetype != 'image/jpeg') {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Sadece görsel yükleyebilirsiniz.'
            }
            return res.redirect('/posts/new');;
        }
        cloudinary.uploader.upload(
            req.files.post_image.tempFilePath, 
            {
                use_filename: true,
                folder: 'nodeblog',
            }
        )
        .then(result => {
            Post.create({
                ...req.body,
                post_image: result.secure_url,
                public_id: result.public_id,
                author: req.session.userId
            })
            fs.unlinkSync(req.files.post_image.tempFilePath);
            req.session.sessionFlash = {
                type: 'alert alert-success',
                message: 'Gönderi başarıyla oluşturuldu.'
            }
            res.redirect('/blog');
        });
    })
})

router.post('/deletecomment/:authorid/:commentid/:postid', (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({ _id: req.session.userId }).lean().then(user => {
        if (!user) {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Beklenmeyen veri tabanı hatası.'
            }
            return res.redirect('/users/verify')
        }
        if (user._id != req.params.authorid) {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        else if (user._id == req.params.authorid) {
            Comment.findOneAndUpdate({ author: user._id, _id: req.params.commentid }, { $set: { active: false } }, { new: true }).lean().then(comment => {
                console.log(comment)
                res.redirect(`/posts/${req.params.postid}`)
            })
        }
        else {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Beklenmeyen hata.'
            }
            return res.redirect('/users/verify')
        }
    })
})

router.post('/editcomment/:commentid', (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    Comment.findOne({ _id: req.params.commentid }).lean().then(comment => {
        Comment.create({
            author: comment.author,
            cContent: comment.cContent,
            post: comment.post,
            active: false
        }).then(() => {
            Comment.findOneAndUpdate({ _id: req.params.commentid }, { $set: { cContent: req.body.textAreaContent, edit: true } }, { new: true }).lean().then(c => {
                console.log(c)
                res.redirect(`/posts/${comment.post}/#c`)
            })
        })
    })
})

module.exports = router;