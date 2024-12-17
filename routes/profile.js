const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Profile page route
router.get('/', async (req, res) => {
    try {
        // 查找用户个人资料
        const profile = await req.app.locals.db.collection('profiles').findOne(
            { uid: req.session.userId }
        );
        
        // 查找用户创建的食谱
        const recipes = await req.app.locals.db.collection('recipes')
            .find({ uid: req.session.userId })
            .toArray();
            
        // 查找用户的评论
        const comments = await req.app.locals.db.collection('comments')
            .find({ uid: req.session.userId })
            .sort({ created_time: -1 })
            .toArray();
            
        // 查找用户点赞的内容
        const likes = await req.app.locals.db.collection('likes')
            .find({ uid: req.session.userId })
            .toArray();

        res.render('profile', {
            profile,
            recipes,
            comments,
            likes
        });
    } catch (error) {
        console.error('Error loading profile:', error);
        res.status(500).send('Error loading profile');
    }
});

// Update profile information
router.post('/update', async (req, res) => {
    try {
        const { first_name, last_name, introduction } = req.body;
        
        await req.app.locals.db.collection('profiles').updateOne(
            { uid: req.session.userId },
            {
                $set: {
                    first_name,
                    last_name,
                    introduction,
                    updated_at: new Date()
                }
            }
        );

        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).send('Error updating profile');
    }
});

// Update profile photo
router.post('/update-photo', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const photo = req.file.buffer.toString('base64');

        await req.app.locals.db.collection('profiles').updateOne(
            { uid: req.session.userId },
            {
                $set: {
                    photo,
                    updated_at: new Date()
                }
            }
        );

        res.redirect('/profile');
    } catch (error) {
        console.error('Error updating photo:', error);
        res.status(500).send('Error updating photo');
    }
});

// Delete recipe
router.post('/delete-recipe/:id', async (req, res) => {
    try {
        await req.app.locals.db.collection('recipes').deleteOne({
            _id: req.params.id,
            uid: req.session.userId
        });
        
        res.redirect('/profile');
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).send('Error deleting recipe');
    }
});

// Delete comment
router.post('/delete-comment/:id', async (req, res) => {
    try {
        await req.app.locals.db.collection('comments').deleteOne({
            _id: req.params.id,
            uid: req.session.userId
        });
        
        res.redirect('/profile');
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Error deleting comment');
    }
});

module.exports = router;