const { Router } = require('express');
const { supabase } = require('../lib/supabase');

const router = Router();

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('components')
      .select('category')
      .order('category');

    if (error) throw error;
    const categories = [...new Set(data.map((c) => c.category))];
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:category/components
router.get('/:category/components', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('category', req.params.category)
      .order('price');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
