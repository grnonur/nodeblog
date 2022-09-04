const express = require('express');
const router = express.Router();
const path = require('path');
const Category = require('../../models/Category');
const Post = require('../../models/Post');
const User = require('../../models/User');
const Home = require('../../models/Home');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

router.get('/', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        res.render('admin/index');
    })
})

router.get('/categories', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
    
        Category.find({}).sort({$natural:-1}).lean().then(categories => {
            res.render('admin/categories', { categories: categories });
        })
    })
})

router.post('/categories', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
    
        //category name length
        if (req.body.name.length > 12) {
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Kategori ismi 12 karakterden uzun olamaz.'
            }
            res.redirect('/admin/categories');
        }
        else {
            Category.findOne({ name: req.body.name }, (error, category) => {
                if (category) {
                    req.session.sessionFlash = {
                        type: 'alert alert-danger',
                        message: 'Eklemek istediğiniz kategori zaten mevcut.'
                    }
                    res.redirect('/admin/categories')
                }
                else {
                    Category.create(req.body, () => {
                        req.session.sessionFlash = {
                            type: 'alert alert-success',
                            message: 'Kategori başarıyla eklendi.'
                        }
                        res.redirect('/admin/categories')
                    })
                }
            })
        }
    })
})

router.post('/categories/:id', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        Category.findOneAndDelete({ _id: req.params.id }).lean().then(() => {
            res.redirect('/admin/categories')
        })
    })    
})

router.get('/categories/edit/:id', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        Category.findOne({ _id: req.params.id }).lean().then((category) => {
            res.render('admin/editcategory', { category: category });
        })
    })
})

router.post('/categories/edit/:id', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        Category.findOne({ _id: req.params.id }).lean().then(category => {
            let ctgry = new Category(category);
            ctgry.name = req.body.name;

            Category.updateOne(category, ctgry).then(() => {
                res.redirect('/admin/categories');
            })
        })
    })
})

router.get('/posts', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        Post.find({}).populate({path:'author', model:User}).populate({path:'category', model:Category}).sort({$natural:-1}).lean().then(posts => {
            res.render('admin/post', {posts: posts});
        })
    })
})

router.get('/posts/edit/:id', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        Post.findOne({ _id: req.params.id }).populate({path: 'category', model:Category}).lean().then((post) => {
            Category.find({}).sort({$natural:-1}).lean().then(categories => {   
                res.render('admin/editpost', { post: post, categories:categories });  
            })
        })
    })
})

router.post('/posts/edit/:id', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }

        Post.findOneAndUpdate({_id: req.params.id}, {$set: {title: req.body.title, content:req.body.content, category:req.body.category}}, {new: true}).lean().then(post => {
            req.session.sessionFlash = {
                type: 'alert alert-success',
                message: 'Gönderiniz başarıyla güncellendi.'
            }
            res.redirect(`/admin/posts/edit/${req.params.id}`);
        })
    })
})

router.post('/posts/editphoto/:postid', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        let post_image = req.files.post_image;

        if(post_image.mimetype != 'image/png' && post_image.mimetype != 'image/jpg' && post_image.mimetype != 'image/jpeg'){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Sadece görsel yükleyebilirsiniz.'
            }
            return res.redirect(`/admin/posts/edit/${req.params.postid}`);;
        }

        cloudinary.uploader.upload(
            req.files.post_image.tempFilePath, 
            {
                use_filename: true,
                folder: 'nodeblog',
            }
        ).then(result => {
            Post.findOneAndUpdate({_id: req.params.postid}, {$set: {post_image: result.secure_url, public_id: result.public_id}}).lean().then(post => {
                cloudinary.uploader.destroy(post.public_id).then(() => {
                    fs.unlinkSync(req.files.post_image.tempFilePath);
                    req.session.sessionFlash = {
                        type: 'alert alert-success',
                        message: 'Gönderi fotoğrafı başarıyla güncellendi.'
                    }
                    res.redirect(`/admin/posts/edit/${req.params.postid}`);
                })
            })
        })
    })
})

router.post('/posts/:id', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        Post.findOne({_id: req.params.id}).lean().then(post => {
            cloudinary.uploader.destroy(post.public_id).then(() => {
                console.log("post image deleted")
            })
        })
        Post.deleteOne({_id: req.params.id}).lean().then(() => {
            res.redirect('/admin/posts');
        })
    })
})


router.get('/register', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        res.render('admin/createAccount')
    })
})

router.post('/register', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        else if(user.auth === true){
            let authen;
            if(req.body.auth === 'true'){
                authen = true
            }
            else{
                authen = false
            }
            User.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                auth: authen
            }).then(usr => {
                console.log(usr)
                req.session.sessionFlash = {
                    type: 'alert alert-success',
                    message: 'Hesap başarıyla oluşturuldu.'
                }
                return res.redirect('/admin/register')
            })
        }
    })
})

router.get('/edithome', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        Home.findOne({index: 1}).lean().then(home => {
            res.render('admin/edithome', {home: home});
        })
    })
})

router.post('/edithome', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        Home.findOneAndUpdate({index: 1}, {$set: {headerH1: req.body.headerH1, headerP: req.body.headerP, headerBtnText: req.body.headerBtnText, headerBtnLink: req.body.headerBtnLink}}, {new: true}).lean().then(up => {
            console.log(up)
            req.session.sessionFlash = {
                type: 'alert alert-success',
                message: 'Değişiklikler kaydedildi.'
            }
            res.redirect('/admin/edithome')
        })
    })
})

router.post('/editheroimage', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }

        let headerImage = req.files.headerImage;
        if(headerImage.mimetype != 'image/png' && headerImage.mimetype != 'image/jpg' && headerImage.mimetype != 'image/jpeg'){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Sadece görsel yükleyebilirsiniz.'
            }
            return res.redirect('/admin/edithome');;
        }

        cloudinary.uploader.upload(
            req.files.headerImage.tempFilePath, 
            {
                use_filename: true,
                folder: 'headerImage',
            }
        ).then(result => {
            Home.findOneAndUpdate({index: 1}, {$set: {headerImage: result.secure_url, publicId: result.public_id}}).lean().then(home => {
                cloudinary.uploader.destroy(home.publicId).then(() => {
                    fs.unlinkSync(req.files.headerImage.tempFilePath);
                    req.session.sessionFlash = {
                        type: 'alert alert-success',
                        message: 'Resim değiştirildi.'
                    }
                    res.redirect('/admin/edithome')
                })
            })
        })
    })
})

router.get('/userstatus', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        res.render('admin/userstatus')
    })
})

router.post('/userstatus/find', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        User.find({$or: [{username: req.body.usernameoremail},{email: req.body.usernameoremail}]}).lean().then(fuser => {
            if(!fuser || fuser.length === 0){
                req.session.sessionFlash = {
                    type: 'alert alert-danger',
                    message: 'Kullanıcı bulunamadı'
                }
                return res.redirect('/admin/userstatus')
            }
            res.render('admin/userstatus', {fuser: fuser})
        })
    })
})

router.post('/ban/:userid', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        if(user._id == req.params.userid){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Kendi hesabınızı yasaklayamazsınız.'
            }
            return res.redirect('/admin/userstatus')
        }
        User.findOne({_id: req.params.userid}).lean().then(ausr => {
            if(ausr.auth === true){
                req.session.sessionFlash = {
                    type: 'alert alert-danger',
                    message: 'Yönetici hesapları yasaklanamaz.'
                }
                return res.redirect('/admin/userstatus')
            }
            User.findOneAndUpdate({_id: req.params.userid}, {$set: {banned: true}}, {new: true}).lean().then(usr => {
                console.log(usr)
                req.session.sessionFlash = {
                    type: 'alert alert-warning',
                    message: `${usr.username} kullanıcısı başarıyla yasaklandı.`
                }
                
                res.redirect('/admin/userstatus')
            })
        })
    })
})

router.post('/unban/:userid', (req, res) => {
    try { 
        if(!req.session.userId){
            return res.redirect('/users/login');
        }
    } catch (error) {
        return res.redirect('/');
    }
    User.findOne({_id: req.session.userId}).lean().then(user => {
        if(user.auth !== true){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        if(user._id == req.params.userid){
            req.session.sessionFlash = {
                type: 'alert alert-danger',
                message: 'Yetkisiz işlem isteği.'
            }
            return res.redirect('/users/verify')
        }
        User.findOneAndUpdate({_id: req.params.userid}, {$set: {banned: false}}, {new: true}).lean().then(usr => {
            console.log(usr)
            req.session.sessionFlash = {
                type: 'alert alert-success',
                message: `${usr.username} kullanıcısının yasağı kaldırıldı.`
            }
            res.redirect('/admin/userstatus')
        })
    })
})


module.exports = router;