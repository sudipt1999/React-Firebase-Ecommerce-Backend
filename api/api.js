const router = require('express').Router();
const passport = require('passport')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')


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

// Update Product
// Delete Product

// find products from particular section

module.exports =  router;