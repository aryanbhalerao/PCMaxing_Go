const { Router } = require('express');
const { supabase } = require('../lib/supabase');

const router = Router();

// GET /api/components
// Query params: category, search, sort (price_asc | price_desc)
router.get('/', async (req, res, next) => {
  try {
    const { category, search, sort } = req.query;

    let query = supabase.from('components').select('*');

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);

    if (sort === 'price_desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else {
      query = query.order('category').order('price');
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/components/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid component id' });

    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Component not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
