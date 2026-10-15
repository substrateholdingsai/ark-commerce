import { Hono } from 'hono';
import productsRoute from '../src/routes/products';
import checkoutRoute from '../src/routes/checkout';

export const apiRoutes = new Hono();

apiRoutes.route('/products', productsRoute);
apiRoutes.route('/checkout', checkoutRoute);

// Mount future API modules here, for example:
// apiRoutes.route('/cart', cartRoute);
