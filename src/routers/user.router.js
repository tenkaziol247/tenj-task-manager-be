const express = require('express');
const User = require('../models/user.model');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

const router = new express.Router();

//create user
router.post('/', async (req, res) => {
    const newUser = new User(req.body);

    try {
        await newUser.save();
        const token = await newUser.generateToken();
        res.status(201).send({ user: newUser, token });
    } catch (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            res.status(400).send({ message: 'Account already exists' });
        } else {
            res.status(400).send(err);
        }
    }
});

//login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password,
        );

        const token = await user.generateToken();
        res.status(200).send({ user, token });
    } catch (err) {
        res.status(400).send(err.message);
    }
});

//read profile
router.get('/me', auth, (req, res) => {
    res.send(req.user);
});

//logout
router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(
            (token) => token.token !== req.token,
        );
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

//logout all token
router.post('/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

//update user
router.patch('/me', auth, async (req, res) => {
    //check property update valid
    const updateProperties = Object.keys(req.body);
    const allowedProperties = ['password', 'name', 'age'];
    const isValid = updateProperties.every((property) => {
        return allowedProperties.includes(property);
    });

    if (!isValid) {
        return res.status(400).send({ message: 'Invalid updates' });
    }

    try {
        updateProperties.forEach(
            (property) => (req.user[property] = req.body[property]),
        );
        await req.user.save();

        res.send(req.user);
    } catch (err) {
        res.status(500).send();
    }
});

//delete user
router.delete('/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (err) {
        res.status(500).send();
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpe?g|png)$/)) {
            return cb(new Error('Please upload an image!'));
        }
        cb(null, true);
    },
});

router.post(
    '/me/avatar',
    auth,
    upload.single('avatar'),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 200, height: 200 })
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    },
    (err, req, res, next) => {
        res.status(400).send({ message: err.message });
    },
);

router.get('/me/avatar', auth, async (req, res) => {
    try {
        if (!req.user.avatar) {
            return res.status(404).send({ message: 'Dont have avatar' });
        }

        res.set('Content-Type', 'image/png');
        res.send(req.user.avatar);
    } catch (err) {
        res.status(500).send();
    }
});

router.delete('/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = null;
        await req.user.save();
        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

module.exports = router;
