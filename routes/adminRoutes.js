const express = require("express");
const { viewUserList, deleteUser, addNewUser, updateUser, viewUser, addReason, banUser, unBanUser, viewDeletedUser, addCategory, viewProductsByStatus } = require("../controllers/admin");
const auth = require("../middleware/auth");
const router = express.Router()

router.get('/view-customer',auth, viewUserList )

// router.delete('/delete/:id', deleteUser)

router.post('/adduser', auth, addNewUser )

// router.put('/updateuser', auth, updateUser)

router.get('/viewuser/:id',auth, viewUser)

router.post('/addreason', auth,addReason)

router.put('/banuser/:id', banUser)

router.put('/unbanuser/:id', unBanUser)

router.get('/view-deleted-user/:id', viewDeletedUser)

router.post('/add-category',auth, addCategory)


router.get('/view-products', viewProductsByStatus)

module.exports =  router