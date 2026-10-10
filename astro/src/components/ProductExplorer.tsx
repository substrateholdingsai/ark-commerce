import { useState } from "react";
import styles from "./ProductExplorer.module.css";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

const sampleProducts: Product[] = [
  { id: "1", name: "Laptop Pro", price: 1299.99, category: "electronics" },
  { id: "2", name: "Wireless Mouse", price: 49.99, category: "electronics" },
  { id: "3", name: "Mechanical Keyboard", price: 129.99, category: "electronics" },
  { id: "4", name: "USB-C Hub", price: 79.99, category: "accessories" },
];

export default function ProductExplorer() {
  const [filter, setFilter] = useState("all");
  const [cart, setCart] = useState<Product[]>([]);

  const filteredProducts = filter === "all"
    ? sampleProducts
    : sampleProducts.filter(p => p.category === filter);

  const categories = ["all", ...new Set(sampleProducts.map(p => p.category))];

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
  };

  const cartTotal = cart.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className={styles.productExplorer}>
      <div className={styles.filters}>
        {categories.map(cat => (
          <button
            key={cat}
            className={filter === cat ? styles.active : ""}
            onClick={() => setFilter(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.products}>
        {filteredProducts.map(product => (
          <div key={product.id} className={styles.productCard}>
            <h4>{product.name}</h4>
            <p className={styles.price}>${product.price.toFixed(2)}</p>
            <p className={styles.category}>{product.category}</p>
            <button onClick={() => addToCart(product)}>Agregar al carrito</button>
          </div>
        ))}
      </div>

      <div className={styles.cart}>
        <h3>Carrito ({cart.length})</h3>
        {cart.length === 0 ? (
          <p>Vacío</p>
        ) : (
          <>
            {cart.map((item, i) => (
              <div key={i} className={styles.cartItem}>
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className={styles.cartTotal}>
              <strong>Total: ${cartTotal.toFixed(2)}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}