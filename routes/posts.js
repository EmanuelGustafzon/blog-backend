const express = require('express')
const Post = require('../models/Post')
const Account = require('../models/Account')
const { findOne } = require('../models/Post')
const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ isPublished: true });
          res.json(posts)
      } catch (err) {
        res.status(500).json({ message: err.message })
      }
})

router.get('/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    const posts = await Post.findById(postId).lean();

    if (!posts) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const contributorIds = posts.contributors;
    const contributors = await Account.find({ _id: { $in: contributorIds } }).lean();
    const usernameMap = {};
    contributors.forEach((contributor) => {
      usernameMap[contributor._id.toString()] = contributor.username;
    });
    posts.contributors = posts.contributors.map((contributorId) => usernameMap[contributorId]);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/create', async (req, res) => {
  const { title, desc, contributors, isPublished } = req.body;

  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    const authorId = req.session.userId;
    const contributorsIds = [];

    if (Array.isArray(contributors)) {
      for (let i = 0; i < contributors.length; i++) {
        const account = await Account.findOne({ username: contributors[i] });

        if (account) {
          contributorsIds.push(account._id);
        }
      }
    }

    const post = new Post({ title, desc, authorId, contributors: contributorsIds, isPublished });
    await post.save();

    res.status(201).json({ message: 'Successfully created a new post', post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the post' });
  }
});



router.put('/edit/:id', async (req, res) => {
  const { title, desc, contributors, isPublished } = req.body;
  const postId = req.params.id;
  const contributorsIds = [];

  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    
    if (req.session.userId !== post.authorId && !post.contributors.includes(req.session.userId)) {
      res.status(401).send('Unauthorized');
      return;
    }

    if (Array.isArray(contributors)) {

      for (let i = 0; i < contributors.length; i++) {
        const account = await Account.findOne({ username: contributors[i] });

        if (account) {
          contributorsIds.push(account._id);
        }
      }
    }

    post.title = title;
    post.desc = desc;
    post.contributors = contributorsIds;
    post.isPublished = isPublished;

    await post.save();

    res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.delete('/:id', async (req, res) => {
  const postId = req.params.id;
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  } 

  try {
    const postToDelete = await Post.findById(postId);
    if (!postToDelete) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (req.session.userId !== postToDelete.authorId && !postToDelete.contributors.includes(req.session.userId)) {
      res.status(401).send('Unauthorized');
      return;
    }
    
    await Post.findByIdAndDelete(postId);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router