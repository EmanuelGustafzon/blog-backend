const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Account = require('../models/Account');
const Post = require('../models/Post');

router.post('/register', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  try {
    const existingAccount = await Account.findOne({ username });
    if (existingAccount) {
      return res.status(409).send('Username already exists');
    }

    if(password !== confirmPassword) {
      return res.status(400).send('The passwords does not match');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newAccount = new Account({
      username,
      password: hashedPassword,
    });
    await newAccount.save();

    res.send('Registration successful!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const account = await Account.findOne({ username });

    if (account && bcrypt.compareSync(password, account.password)) {
      req.session.userId = account._id;

      res.cookie('connect.sid', req.sessionID, {
        httpOnly: true,
        secure: true, 
        sameSite: 'none',
        maxAge: 3600000,
      });

      res.json({ message: 'Login successful!' });
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/logout', (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred while logging out' });
    } else {
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logout successful' });
    }
  });
});

router.put('/profile/update', async (req, res) => {
  const { oldUsername, oldPassword, newUsername, newPassword, repeatNewPassword } = req.body;

  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    const account = await Account.findOne({ username: oldUsername });

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    if (!bcrypt.compareSync(oldPassword, account.password)) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    if (newUsername) {
      account.username = newUsername;
    }

    if (newPassword && newPassword === repeatNewPassword) {
      account.password = bcrypt.hashSync(newPassword, 10);
    }

    await account.save();

    res.json({ message: 'Update successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



router.delete('/profile/delete', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    const account = await Account.findByIdAndDelete(userId);

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    await Post.deleteMany({ authorId: userId });

    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while logging out' });
      } else {
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Account, associated posts, and session deleted successfully' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



router.get('/profile', async (req, res) => {
  if (!req.session.userId) {
    res.status(401).send('Unauthorized');
    return;
  }

  try {
    const accountId = req.session.userId;
    const account = await Account.findById(accountId);
    const myPosts = await Post.find();

    const filteredPosts = myPosts.filter((post) => {
      return post.authorId === accountId || post.contributors.includes(accountId);
    });

    res.json({
      username: account.username,
      posts: filteredPosts,
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while retrieving the profile information' });
  }
});





router.get('/testProtocol', (req, res) => {
  if (req.session.userId) {
    res.send('Welcome to the protected route!');
  } else {
    res.status(401).send('Unauthorized');
  }

});

module.exports = router;