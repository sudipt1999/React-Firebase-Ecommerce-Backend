const router = require('express').Router();
const passport = require('passport')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const async = require('async')

// Models

const Admin = require('../models/Admin/Admin')
const Product = require('../models/Products/Product')
const Section = require('../models/Section/Section')




router.get('/', (req, res) => {
    res.json(req.user)
})

// add User
router.post('/addAdmin', (req, res) => {
    console.log(req.body)
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password) {
       return res.status(400).json({
            err: "Insufficient Information"
        })
    }

    Admin.findOne({username: username})
          .then(user => {
                if(user) {
                    // already exisiting user
                    return res.status(400).json({msg: "User Already Exists !"})
                }

                const newAdmin = new Admin({username, password})
                bcrypt.genSalt(10, (err, salt)=>{
                    if(err){
                       return res.status(500).json({
                            err: 'Something went wrong on our side.'
                        })
                    }
                    bcrypt.hash(newAdmin.password, salt, (err, hash)=>{
                        if(err){
                            return  res.status(400).json(err)
                        }
                        newAdmin.password = hash;
                        newAdmin.save()
                        .then(user => {
                            return res.json(user)
                        })
                        .catch(err => {
                            return res.status(500).json({msg: "Internal Server Error"})
                        }) 
                    })
                })
               
          })
          .catch(err => {
            return res.status(500).json({msg: "Internal Server Error"})
          })
   
})

// Login 

router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/fail' }),
  function(req, res) {
    console.log(req.user)
    res.json(req.user);
});




// Fail Redirect
router.get('/fail', (req, res) => {
    res.status(400).json({err : "Invalid Credentials "})
})

// unauthorized access
router.get('/401', (req, res) => {
    res.status(401).json({err: "Unauthorized access "})
})


// logout
router.get('/logout', (req, res) => {
    req.logout()
    res.send(req.user)
})


// get top 5 sections
router.get('/section', (req, res) => {
    Section.find()
           .then(data => {
               return res.json(data)
           })
           .catch(err => {
               return res.json(err)
           })
})


// Add Section
router.post('/section/add', (req, res) => {
    // check for logged in user
    if(!req.user) {
       return res.redirect('/401')
    }
    
    console.log(req.body)
    const title = String(req.body.title).toLocaleLowerCase()
    const imageUrl = req.body.imageUrl

    if(!title || !imageUrl) {
        return res.status(400).json({err: "Insufficient Information"})
    }
    const linkUrl = `shop/${title}`
    Section.findOne({title})
            .then(sec => {
                if(sec) {
                    return res.status(400).json({err: "Already Existing Section"})
                }

                const newSection = new Section({title, imageUrl, linkUrl})
                newSection.save()
                          .then(savedRecord => {
                              return res.json(savedRecord)
                          })
                          .catch(err => {
                              return res.status(400).json(err)
                          })
            })
            .catch(err => {
                return res.status(500).json({err: "Internal Server Error"})
            })

    

})
// Update Section
router.post('/section/update/:id', (req, res) => {
     // check for logged in user
     if(!req.user) {
        return res.redirect('/401')
     }

     const id  = mongoose.Types.ObjectId(req.params.id)

     Section.findById(id)
            .then(section => {
                if(!section) {
                    return res.status(400).json({err: "No Such Section Exists"})
                }

                const title = String(req.body.title).toLocaleLowerCase()
                const imageUrl = req.body.imageUrl

                if(!title || !imageUrl) {
                    return res.status(400).json({err: "Insufficient Information"})
                }

                Section.findByIdAndUpdate(id, {$set:{title, imageUrl}}, {new: true})
                        .then(updatedRecord => {
                            return res.json(updatedRecord)
                        })
                        .catch(err => {
                            return res.status(400).json(err)
                        })

            })
            .catch(err => {
                return res.status(500).json({err: "Internal Server Error"})
            })


})
// Delete Section
router.post('/section/delete/:id', (req, res) => {
    // check for logged in user
    if(!req.user) {
       return res.redirect('/401')
    }

    const id  = mongoose.Types.ObjectId(req.params.id)

    Section.findById(id)
           .then(section => {
               if(!section) {
                   return res.status(400).json({err: "No Such Section Exists"})
               }

               Section.findByIdAndRemove(id)
                       .then(data => {
                           return res.json({msg: "Successfully Deleted"})
                       })
                       .catch(err => {
                           return res.status(400).json(err)
                       })

           })
           .catch(err => {
               return res.status(500).json({err: "Internal Server Error"})
           })


})



// Add Product
router.post('/product/add/:sectionid', (req, res) => {
    // check for logged in user
    if(!req.user) {
        return res.redirect('/401')
    }


    console.log(req.body)
    const sectionId = mongoose.Types.ObjectId(req.params.sectionid)
    Section.findById(sectionId)
            .then(sec => {
                if(!sec) {
                    return res.status(401).json({err: "Invalid Section Id"})
                }

                const name = req.body.name
                const price = req.body.price
                const section = req.params.sectionid
                const imageUrl = req.body.image

                if(!name || !price || !imageUrl) {
                    return res.status(401).json({err: "Insufficient Information"})
                }


                const newProduct = new Product({name, price, section, imageUrl})
                newProduct.save()
                          .then(savedProduct => {
                            return res.json(savedProduct)
                          })
                          .catch(err => {
                              return res.status(500).json({err: "Internal Server Error"})
                          })


            })
            .catch(err => {
                return res.status(401).json({err: "Internal Server Error"})
            })
     
})


// Update Product
router.post('/product/update/:productid', (req, res) => {
    // check for logged in user
    if(!req.user) {
        return res.redirect('/401')
    }


    console.log(req.body)
    const productId = mongoose.Types.ObjectId(req.params.productid)
    Product.findOne({id: productId})
            .then(product => {
                if(!product) {
                    return res.status(401).json({err: "Invalid Product Id"})
                }

                const name = req.body.name || product.name
                const price = req.body.price || product.price
                const section = req.body.sectionId || product.section
                const imageUrl = req.body.image || product.imageUrl


                Product.findByIdAndUpdate(productId, {$set:{name, price, section, imageUrl}}, {new: true})
                .then(updatedRecord => {
                    return res.json(updatedRecord)
                })
                .catch(err => {
                    return res.status(400).json(err)
                })


            })
            .catch(err => {
                return res.status(401).json({err: "Internal Server Error"})
            })
     
})

// Delete Product
router.post('/product/delete/:id', (req, res) => {
    // check for logged in user
    if(!req.user) {
       return res.redirect('/401')
    }

    const id  = mongoose.Types.ObjectId(req.params.id)

    Product.findById(id)
           .then(product => {
               if(!product) {
                   return res.status(400).json({err: "No Such Product Exists"})
               }

               Product.findByIdAndRemove(id)
                       .then(data => {
                           return res.json({msg: "Successfully Deleted"})
                       })
                       .catch(err => {
                           return res.status(400).json(err)
                       })

           })
           .catch(err => {
               return res.status(500).json({err: "Internal Server Error"})
           })


})


// find products from particular section
router.get('/product/:section', (req, res) => {
    const sectionId = mongoose.Types.ObjectId(req.params.section)
    Product.find({section: sectionId}) 
           .then(products => {
                return res.json(products) 
           })
           .catch(err => {
               return res.status(400).json({
                   msg: "Invalid or Insufficient Information",
                   err
               })
           })
})


const ShopData = require('./shopData')
const items = Object.keys(ShopData)

router.get('/automate', (req,res) => {
    items.map(key => {
        ShopData[key].items.map(({name, price, section, imageUrl})=>{
            const newProduct = new Product({name, price, section, imageUrl})
            newProduct.save().then(p => console.log(p)).catch(err => console.log(err))
        })
    })

    res.json({msg: "adding Items"})
})


router.get('/collection', (req, res) => {
    console.log("COLLECTION ROUTE CALLED")
    const Data = {}

    Section.find({})
    .then(sections => {
        const sectionProductPromises = sections.map(section => {
            let id = section._id;
            return Product.find({
                    section: id
                })
                .then(products => {                     
                    Data[section.title] = {
                        title: section.title,
                        routeName: section.title,
                        id,
                        items: products
                    }
                });

        });
        return Promise.all(sectionProductPromises);    
    })
    .then(() => {
        res.json(Data)
    })
    .catch(err => {
        res.status(500).json(err)
    });
});


module.exports =  router;