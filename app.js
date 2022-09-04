const express = require('express');
const app = express();
const path = require('path')
const { engine } = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const generateDate = require('./helpers/generateDate').generateDate;
const limit = require('./helpers/limit').limit;
const truncate = require('./helpers/truncate').truncate;
const strip = require('./helpers/strip').strip;
const commentDate = require('./helpers/commentDate').commentDate;
const countComment = require('./helpers/countComment').countComment;
const paginate = require('./helpers/paginate').paginate;
const commentAuth = require('./helpers/commentAuth').commentAuth;
const truefalse = require('./helpers/truefalse').truefalse;
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const User = require('./models/User');
const conn = require('./utils/db');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const hostname = '127.0.0.1';
const port = process.env.PORT;

//database connection
conn();

app.use(expressSession({
    secret:'testo',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    }
}))

app.use(fileUpload({useTempFiles: true}));

//session-link
app.use((req, res, next) => {
    if(req.session.userId && req.session.verify){
        res.locals = {
            displayLink: true,
            verify: true
        }
    }
    else if(req.session.userId){
        res.locals = {
            displayLink: true,
            verify: false
        }
    }
    else{
        res.locals = {
            displayLink: false,
            verify: false
        }
    }
    next();
})

app.use((req, res, next) => {
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
})

app.use((req, res, next) => {
    res.locals.passKey = req.session.passKey;
    res.locals.auth = req.session.auth;
    res.locals.userID = req.session.userId;
    next();
})

app.use((req,res,next)=>{
    // If you don't pass your user state into req.user
    if(!req.session.userId){
        //console.log('return')
        return next();
    }
    if(req.session.userId){
        User.findOne({ _id:req.session.userId }).lean().then(user => {
            if(!user){
                //console.log('user not found')
                next();
            }
            else{
                // The User Would have been authenticated 
                // Therefore User exist 
                if(user.banned){
                    // User Is Banned so handle it as you like 
                    req.session.destroy(() => {
                        //console.log('banlı');
                        return next();
                    }) 
                }
                else{
                    // Users Aren't Banned so continue  
                    //console.log('ok')
                    next();
                }
            }
        })
    }
})

app.use(express.static('public'));

app.engine('handlebars', engine({helpers:{generateDate:generateDate, limit: limit, truncate:truncate, strip:strip, commentDate:commentDate, countComment:countComment, paginate:paginate, commentAuth:commentAuth, truefalse:truefalse}}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const main = require('./routes/main');
app.use('/', main);
const posts = require('./routes/posts');
app.use('/posts', posts);
const users = require('./routes/users');
app.use('/users', users);
const contact = require('./routes/contact');
app.use('/contact', contact);
const admin = require('./routes/admin/index');
app.use('/admin', admin);

app.listen(port, hostname, (req, res) => {
    console.log(`Sunucu Aktif! http://${hostname}:${port}/`);
})