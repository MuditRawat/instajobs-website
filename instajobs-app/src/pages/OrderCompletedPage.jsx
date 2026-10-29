import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const OrderCompletedPage = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Order Confirmation Section matching superio-html/order-completed.html line 291 */}
      <section className="order-confirmation">
        <div className="auto-container">
          <div className="upper-box">
            <span className="icon fa fa-check"></span>
            <h4>Your order is completed!</h4>
            <div className="text">Thank you. Your order has been received.</div>
          </div>

          <ul className="order-info">
            <li>
              <span>Order Number</span>
              <strong>13119</strong>
            </li>

            <li>
              <span>Date</span>
              <strong>27/07/2021</strong>
            </li>

            <li>
              <span>Total</span>
              <strong>$40.10</strong>
            </li>

            <li>
              <span>Payment Method</span>
              <strong>Direct Bank Transfer</strong>
            </li>
          </ul>

          {/* Order Box */}
          <div className="order-box">
            <h3>Order details</h3>
            <table>
              <thead>
                <tr>
                  <th>
                    <strong>Product</strong>
                  </th>
                  <th>
                    <strong>Subtotal</strong>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="cart-item">
                  <td className="product-name">Hoodie x2</td>
                  <td className="product-total">59.00</td>
                </tr>

                <tr className="cart-item">
                  <td className="product-name">Seo Books x 1</td>
                  <td className="product-total">67.00</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="cart-subtotal">
                  <td>Subtotal</td>
                  <td>
                    <span className="amount">$178.00</span>
                  </td>
                </tr>
                <tr className="cart-subtotal">
                  <td>Shipping</td>
                  <td>
                    <span className="amount">$178.00</span>
                  </td>
                </tr>
                <tr className="order-total">
                  <td>Total</td>
                  <td>
                    <span className="amount">$9,218.00</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* End Order Box */}
        </div>
      </section>
      {/* End Order Confirmation */}

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default OrderCompletedPage;
