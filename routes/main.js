const express = require('express');
const router = express.Router();
const Post = require('../models/Post')
const Category = require('../models/Category');
const User = require('../models/User');
const Home = require('../models/Home');

router.get('/', (req, res) => {
    Home.findOne({index: 1}).lean().then(home => {
        res.render('site/index', {home: home});
    })
})

router.get('/blog', (req, res) => {
    const postPerPage = 4;
    const page = req.query.page || 1;
    Post.find({}).populate({path: 'author', model: User}).populate({path: 'category', model: Category}).sort({$natural:-1})
    .skip((page-1)*postPerPage)
    .limit(postPerPage)
    .lean().then(posts => {
        Post.countDocuments().then(postCount => {
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
                        num_of_posts: {$size: '$posts'}
                    }
                },
                {
                    $sort: {
                        name: 1
                    }
                }
            ]).then(categories => {
                res.render('site/blog', {posts:posts, categories:categories, current:parseInt(page), pages:Math.ceil(postCount / postPerPage)});
            })
        })
    })
})





module.exports = router;