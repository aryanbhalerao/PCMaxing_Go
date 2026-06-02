const { Router } = require('express');
const componentsRouter = require('./components');
const categoriesRouter = require('./categories');
const compatibilityRouter = require('./compatibility');

const router = Router();

router.use('/components', componentsRouter);
router.use('/categories', categoriesRouter);
router.use('/compatibility', compatibilityRouter);

module.exports = router;
