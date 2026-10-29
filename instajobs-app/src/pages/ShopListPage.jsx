import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const productsData = [
  { id: 1, name: 'Album', price: '$21.99', image: '/images/resource/products/1.png' },
  { id: 2, name: 'Album', price: '$21.99', image: '/images/resource/products/2.png' },
  { id: 3, name: 'Album', price: '$21.99', image: '/images/resource/products/3.png' },
  { id: 4, name: 'Album', price: '$21.99', image: '/images/resource/products/4.png' },
  { id: 5, name: 'Album', price: '$21.99', image: '/images/resource/products/5.png' },
  { id: 6, name: 'Album', price: '$21.99', image: '/images/resource/products/6.png' },
  { id: 7, name: 'Album', price: '$21.99', image: '/images/resource/products/7.png' },
  { id: 8, name: 'Album', price: '$21.99', image: '/images/resource/products/8.png' },
  { id: 9, name: 'Album', price: '$21.99', image: '/images/resource/products/9.png' },
  { id: 10, name: 'Album', price: '$21.99', image: '/images/resource/products/10.png' },
  { id: 11, name: 'Album', price: '$21.99', image: '/images/resource/products/11.png' },
  { id: 12, name: 'Album', price: '$21.99', image: '/images/resource/products/12.png' },
];

const ShopListPage = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title matching superio-html/shop.html line 292 */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Shop</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>{' '}
              <li>Shop</li>
            </ul>
          </div>
        </div>
      </section>
      {/* End Page Title */}

      {/* Products Section matching superio-html/shop.html line 306 */}
      <div className="products-section">
        <div className="auto-container">
          <div className="row">
            {productsData.map((product) => (
              <div key={product.id} className="product-block col-lg-3 col-md-6 col-sm-12">
                <div className="inner-box">
                  <div className="image-box">
                    <figure className="image">
                      <Link to={`/shop/${product.id}`}>
                        <img src={product.image} alt="" />
                      </Link>
                    </figure>
                  </div>
                  <div className="info">
                    <h3>
                      <Link to={`/shop/${product.id}`}>{product.name}</Link>
                    </h3>
                    <span className="price">{product.price}</span>
                    <a href="#" className="theme-btn btn-style-one">
                      <i className="flaticon-shopping-bag"></i>Add to Cart
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <nav className="ls-pagination">
            <ul>
              <li className="prev">
                <a href="#">
                  <i className="fa fa-arrow-left"></i>
                </a>
              </li>
              <li>
                <a href="#">1</a>
              </li>
              <li>
                <a href="#" className="current-page">
                  2
                </a>
              </li>
              <li>
                <a href="#">3</a>
              </li>
              <li className="next">
                <a href="#">
                  <i className="fa fa-arrow-right"></i>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      {/* End Products Section */}

      {/* Main Footer */}
      <Footer />
    </div>
  );
};

export default ShopListPage;
