import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const initialCartItems = [
  {
    id: 1,
    name: 'Album',
    price: 298,
    qty: 1,
    subtotalFormatted: '$1.298',
    image: '/images/resource/products/cart-img.png'
  },
  {
    id: 2,
    name: 'Album',
    price: 298,
    qty: 1,
    subtotalFormatted: '$1.298',
    image: '/images/resource/products/cart-img.png'
  },
  {
    id: 3,
    name: 'Album',
    price: 298,
    qty: 1,
    subtotalFormatted: '$1.298',
    image: '/images/resource/products/cart-img.png'
  }
];

const ShoppingCartPage = () => {
  const location = useLocation();
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleQtyChange = (id, newQty) => {
    const qtyVal = Math.max(1, parseInt(newQty) || 1);
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, qty: qtyVal } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title matching superio-html/shopping-cart.html line 292 */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Shopping Cart</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>{' '}
              <li>Shopping Cart</li>
            </ul>
          </div>
        </div>
      </section>
      {/* End Page Title */}

      {/* Cart Section matching superio-html/shopping-cart.html line 306 */}
      <section className="cart-section">
        <div className="auto-container">
          <div className="row">
            <div className="column col-lg-8 col-md-12 col-sm-12">
              {/* Cart Outer */}
              <div className="cart-outer">
                <div className="table-outer">
                  <table className="default-table">
                    <thead className="cart-header">
                      <tr>
                        <th className="product-name">Product</th>
                        <th className="product-thumbnail">&nbsp;</th>
                        <th className="product-price">Price</th>
                        <th className="product-quantity">Quantity</th>
                        <th className="product-subtotal">Subtotal</th>
                        <th className="product-remove">&nbsp;</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id} className="cart-item">
                          <td className="product-thumbnail">
                            <Link to={`/shop/${item.id}`}>
                              <img src={item.image} alt="" />
                            </Link>
                          </td>
                          <td className="product-name">
                            <Link to={`/shop/${item.id}`}>{item.name}</Link>
                          </td>
                          <td className="product-price">${item.price}</td>
                          <td className="product-quantity">
                            <div className="item-quantity">
                              <input
                                type="number"
                                className="qty"
                                name="qty"
                                value={item.qty}
                                onChange={(e) => handleQtyChange(item.id, e.target.value)}
                              />
                            </div>
                          </td>
                          <td className="product-subtotal">
                            <span className="amount">{item.subtotalFormatted}</span>
                          </td>
                          <td className="product-remove">
                            <a
                              href="#"
                              className="remove"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveItem(item.id);
                              }}
                            >
                              <span className="flaticon-dustbin"></span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="cart-options clearfix">
                  <div className="apply-coupon">
                    <div className="form-group">
                      <input
                        type="text"
                        name="coupon-code"
                        className="input"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <button type="button" className="theme-btn btn-style-one">
                        Apply Coupon
                      </button>
                    </div>
                    <div className="form-group pull-right">
                      <button type="button" className="theme-btn btn-style-three">
                        update cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="column col-lg-4 col-md-12 col-sm-12">
              <div className="totals-table-outer">
                <ul className="totals-table">
                  <li>
                    <h3>Cart Totals</h3>
                  </li>
                  <li>
                    <span className="col">Subtotal</span>
                    <span className="col price">$186.00</span>
                  </li>
                  <li>
                    <span className="col">Total</span>
                    <span className="col price">$186.00</span>
                  </li>
                </ul>
                <Link to="/shop-checkout" className="theme-btn btn-style-one proceed-btn">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* End Cart Section */}

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default ShoppingCartPage;
