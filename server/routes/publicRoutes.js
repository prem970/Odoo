const express = require('express');
const router = express.Router();
const { getCategories, getCourses, getBlogPosts, getCommunityUsers, getChannels, createChannel, getChannelMessages, postMessage, getStats } = require('../controllers/publicController');

router.get('/categories', getCategories);
router.get('/courses', getCourses);
router.get('/blog', getBlogPosts);
router.get('/community-users', getCommunityUsers);
router.get('/stats', getStats);
router.get('/community-channels', getChannels);
router.post('/community-channels', createChannel);
router.get('/community-messages/:channelId', getChannelMessages);
router.post('/community-messages/:channelId', postMessage);

module.exports = router;
