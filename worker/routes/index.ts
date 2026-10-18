import { Hono } from 'hono';
import productsRoute from '../src/routes/products';
import checkoutRoute from '../src/routes/checkout';
import storeRoute from '../src/routes/store';
import adminRoute from '../src/routes/admin';
import authRoute from '../src/routes/auth';
import cartRoute from '../src/routes/cart';

export const apiRoutes = new Hono();

apiRoutes.route('/products', productsRoute);
apiRoutes.route('/checkout', checkoutRoute);
apiRoutes.route('/store', storeRoute);
apiRoutes.route('/admin', adminRoute);
apiRoutes.route('/auth', authRoute);
apiRoutes.route('/cart', cartRoute);
