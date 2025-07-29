const router = require('express').Router();

router.get('/', (req, res) => {
    res.json({ message: 'This is the quote route' });
});

module.exports = router;
