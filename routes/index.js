var express = require('express');
var router = express.Router();

const blogSchema = require("../Models/Schema_blog");

const isAuthenticated = require("../middleware/authentication.js");

/* GET home page. */
router.get('/', async function (req, res, next) {
    const result = await blogSchema.findAll();
    res.render('home', {
        title: 'HOME PAGE',
        isAuthenticated: req.session.isAuthenticated,
    });
});



/* GET ALL BLOGS */
router.get('/blogs', async function (req, res, next) {
    await blogSchema.findAll()
        .then(data => {
            res.render('blogs', {
                title: 'BLOGS PAGE',
                blogData: data,
                isAuthenticated: req.session.isAuthenticated,
            });
        })
        .catch(err => console.log(err));

});



/* GET ADD BLOG */
router.get('/add-blog', isAuthenticated, async function (req, res, next) {
    res.render("add-blog.pug", {
        title: "ADD BLOG PAGE",
        isAuthenticated: req.session.isAuthenticated,
    });
});



/* POST ADD BLOG */
router.post('/add-blog', isAuthenticated, async function (req, res, next) {
    const values = {
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        body: req.body.body,
        author: req.body.author,
        categories: req.body.categories,
    }
    await blogSchema.addItem(values);
    res.redirect("/blogs");
});



/* GET ONE BLOG BY ID */
router.get('/blog/:id', async function (req, res, next) {

    await blogSchema.findById(req.params.id)
        .then(data => {
            res.render('blog-details', {
                title: 'BLOG PAGE',
                blog: data,
                isAuthenticated: req.session.isAuthenticated,
            });
        })
        .catch(err => console.log(err));

});



/* GET ONE BLOG CONTENT BY ID */
router.get('/blog/edit/:id', isAuthenticated, async function (req, res, next) {
    await blogSchema.findById(req.params.id)
        .then(data => {
            res.render('edit-blog', {
                title: 'BLOG PAGE',
                blog: data,
                isAuthenticated: req.session.isAuthenticated,
            });
        })
        .catch(err => console.log(err));
});



/* POST ONE BLOG CONTENT BY ID */
router.post('/blog/edit/:id', isAuthenticated, async function (req, res, next) {
    const values = await {
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        body: req.body.body,
        author: req.body.author,
        categories: req.body.categories,
    }
    await blogSchema.findByIdAndUpdate(req.params.id, values);
    res.redirect(`/blog/${req.params.id}`)
});



/* DELETE ONE BLOG BY ID */
router.get('/blog/delete/:id', isAuthenticated, async function (req, res, next) {
    await blogSchema.findByIdAndDelete(req.params.id);
    res.redirect(`/blogs`);
});

module.exports = router;
