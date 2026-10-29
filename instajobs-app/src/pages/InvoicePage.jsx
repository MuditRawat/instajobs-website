import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const InvoicePage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    // Initialize WOW.js for scroll reveal animations matching script.js line 1066
    if (window.WOW) {
      const wow = new window.WOW({
        boxClass: 'wow',
        animateClass: 'animated',
        offset: 0,
        mobile: false,
        live: true
      });
      wow.init();
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-wrapper">
      {/* Invoice Section matching superio-html/invoice.html line 31 */}
      <section className="invoice-section">
        <div className="auto-container">
          <div className="upper-box">
            <button className="theme-btn btn-style-three" onClick={handlePrint}>
              Print
            </button>
          </div>
        </div>
        <div className="auto-container">
          <div className="invoice-wrap">
            <div className="invoice-content">
              <div className="logo-box">
                <div className="logo">
                  <Link to="/">
                    <img src="/images/logo.svg" alt="" />
                  </Link>
                </div>
                <div className="invoice-id">
                  Invoice # <span>0043128641</span>
                </div>
              </div>

              <div className="info-box">
                <div className="left-column">
                  <div className="info">
                    <h6>Invoice date:</h6>
                    <span>03/10/2021</span>
                  </div>

                  <div className="info">
                    <h4>Supplier</h4>
                    <h5>instajobs LLC</h5>
                    <p>2301 Ravenswood Rd Madison, WI 53711</p>
                  </div>
                </div>

                <div className="right-column">
                  <div className="info">
                    <h6>Due date:</h6>
                    <span>03/10/2021</span>
                  </div>

                  <div className="info">
                    <h4>Customer</h4>
                    <h5>John Doe</h5>
                    <p>329 Queensberry Street, North Melbourne VIC 3051, Australia.</p>
                  </div>
                </div>
              </div>

              <div className="table-outer">
                <table className="default-table invoice-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Price</th>
                      <th>VAT (20%)</th>
                      <th>Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>Standard Plan</td>
                      <td>$443.00 </td>
                      <td>$921.80</td>
                      <td>$9243</td>
                    </tr>
                    <tr>
                      <td>Extra Plan</td>
                      <td>$413.00 </td>
                      <td>$912.80 </td>
                      <td>$5943</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Total Due</strong>
                      </td>
                      <td></td>
                      <td></td>
                      <td>
                        <strong>$9,750</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="invoice-footer">
              <ul className="bottom-links">
                <li>
                  <a href="https://www.instajobs.com" target="_blank" rel="noreferrer" className="link">
                    www.instajobs.com
                  </a>
                </li>
                <li>
                  <a href="mailto:invoice@instajobs.com">invoice@instajobs.com</a>
                </li>
                <li>
                  <a href="tel:123123456">(123) 123-456</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* End Invoice Section */}
    </div>
  );
};

export default InvoicePage;
