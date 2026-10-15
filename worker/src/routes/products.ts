import { Hono } from 'hono';
import type { Env } from '../types/env';

const products = new Hono<{ Bindings: Env }>();

products.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, name, weight, price, "desc", image, badge, stock
       FROM products
       WHERE active = 1
       ORDER BY display_order, name`
    ).all();

    return c.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json(
      { success: false, error: 'Failed to fetch products' },
      500
    );
  }
});

products.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const product = await c.env.DB.prepare(
      `SELECT id, name, weight, price, "desc", image, badge, stock
       FROM products
       WHERE id = ? AND active = 1`
    )
      .bind(id)
      .first();

    if (!product) {
      return c.json(
        { success: false, error: 'Product not found' },
        404
      );
    }

    return c.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return c.json(
      { success: false, error: 'Failed to fetch product' },
      500
    );
  }
});

export default products;
