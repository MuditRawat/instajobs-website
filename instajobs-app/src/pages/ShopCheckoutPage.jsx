import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';

const countryOptions = [
  { code: '', label: 'Select a country…' },
  { code: 'AX', label: 'Åland Islands' },
  { code: 'AF', label: 'Afghanistan' },
  { code: 'AL', label: 'Albania' },
  { code: 'DZ', label: 'Algeria' },
  { code: 'AS', label: 'American Samoa' },
  { code: 'AD', label: 'Andorra' },
  { code: 'AO', label: 'Angola' },
  { code: 'AI', label: 'Anguilla' },
  { code: 'AQ', label: 'Antarctica' },
  { code: 'AG', label: 'Antigua and Barbuda' },
  { code: 'AR', label: 'Argentina' },
  { code: 'AM', label: 'Armenia' },
  { code: 'AW', label: 'Aruba' },
  { code: 'AU', label: 'Australia' },
  { code: 'AT', label: 'Austria' },
  { code: 'AZ', label: 'Azerbaijan' },
  { code: 'BS', label: 'Bahamas' },
  { code: 'BH', label: 'Bahrain' },
  { code: 'BD', label: 'Bangladesh' },
  { code: 'BB', label: 'Barbados' },
  { code: 'BY', label: 'Belarus' },
  { code: 'PW', label: 'Belau' },
  { code: 'BE', label: 'Belgium' },
  { code: 'BZ', label: 'Belize' },
  { code: 'BJ', label: 'Benin' },
  { code: 'BM', label: 'Bermuda' },
  { code: 'BT', label: 'Bhutan' },
  { code: 'BO', label: 'Bolivia' },
  { code: 'BQ', label: 'Bonaire, Saint Eustatius and Saba' },
  { code: 'BA', label: 'Bosnia and Herzegovina' },
  { code: 'BW', label: 'Botswana' },
  { code: 'BV', label: 'Bouvet Island' },
  { code: 'BR', label: 'Brazil' },
  { code: 'IO', label: 'British Indian Ocean Territory' },
  { code: 'VG', label: 'British Virgin Islands' },
  { code: 'BN', label: 'Brunei' },
  { code: 'BG', label: 'Bulgaria' },
  { code: 'BF', label: 'Burkina Faso' },
  { code: 'BI', label: 'Burundi' },
  { code: 'KH', label: 'Cambodia' },
  { code: 'CM', label: 'Cameroon' },
  { code: 'CA', label: 'Canada' },
  { code: 'CV', label: 'Cape Verde' },
  { code: 'KY', label: 'Cayman Islands' },
  { code: 'CF', label: 'Central African Republic' },
  { code: 'TD', label: 'Chad' },
  { code: 'CL', label: 'Chile' },
  { code: 'CN', label: 'China' },
  { code: 'CX', label: 'Christmas Island' },
  { code: 'CC', label: 'Cocos (Keeling) Islands' },
  { code: 'CO', label: 'Colombia' },
  { code: 'KM', label: 'Comoros' },
  { code: 'CG', label: 'Congo (Brazzaville)' },
  { code: 'CD', label: 'Congo (Kinshasa)' },
  { code: 'CK', label: 'Cook Islands' },
  { code: 'CR', label: 'Costa Rica' },
  { code: 'HR', label: 'Croatia' },
  { code: 'CU', label: 'Cuba' },
  { code: 'CW', label: 'Curaçao' },
  { code: 'CY', label: 'Cyprus' },
  { code: 'CZ', label: 'Czech Republic' },
  { code: 'DK', label: 'Denmark' },
  { code: 'DJ', label: 'Djibouti' },
  { code: 'DM', label: 'Dominica' },
  { code: 'DO', label: 'Dominican Republic' },
  { code: 'EC', label: 'Ecuador' },
  { code: 'EG', label: 'Egypt' },
  { code: 'SV', label: 'El Salvador' },
  { code: 'GQ', label: 'Equatorial Guinea' },
  { code: 'ER', label: 'Eritrea' },
  { code: 'EE', label: 'Estonia' },
  { code: 'ET', label: 'Ethiopia' },
  { code: 'FK', label: 'Falkland Islands' },
  { code: 'FO', label: 'Faroe Islands' },
  { code: 'FJ', label: 'Fiji' },
  { code: 'FI', label: 'Finland' },
  { code: 'FR', label: 'France' },
  { code: 'GF', label: 'French Guiana' },
  { code: 'PF', label: 'French Polynesia' },
  { code: 'TF', label: 'French Southern Territories' },
  { code: 'GA', label: 'Gabon' },
  { code: 'GM', label: 'Gambia' },
  { code: 'GE', label: 'Georgia' },
  { code: 'DE', label: 'Germany' },
  { code: 'GH', label: 'Ghana' },
  { code: 'GI', label: 'Gibraltar' },
  { code: 'GR', label: 'Greece' },
  { code: 'GL', label: 'Greenland' },
  { code: 'GD', label: 'Grenada' },
  { code: 'GP', label: 'Guadeloupe' },
  { code: 'GU', label: 'Guam' },
  { code: 'GT', label: 'Guatemala' },
  { code: 'GG', label: 'Guernsey' },
  { code: 'GN', label: 'Guinea' },
  { code: 'GW', label: 'Guinea-Bissau' },
  { code: 'GY', label: 'Guyana' },
  { code: 'HT', label: 'Haiti' },
  { code: 'HM', label: 'Heard Island and McDonald Islands' },
  { code: 'HN', label: 'Honduras' },
  { code: 'HK', label: 'Hong Kong' },
  { code: 'HU', label: 'Hungary' },
  { code: 'IS', label: 'Iceland' },
  { code: 'IN', label: 'India' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'IR', label: 'Iran' },
  { code: 'IQ', label: 'Iraq' },
  { code: 'IE', label: 'Ireland' },
  { code: 'IM', label: 'Isle of Man' },
  { code: 'IL', label: 'Israel' },
  { code: 'IT', label: 'Italy' },
  { code: 'CI', label: 'Ivory Coast' },
  { code: 'JM', label: 'Jamaica' },
  { code: 'JP', label: 'Japan' },
  { code: 'JE', label: 'Jersey' },
  { code: 'JO', label: 'Jordan' },
  { code: 'KZ', label: 'Kazakhstan' },
  { code: 'KE', label: 'Kenya' },
  { code: 'KI', label: 'Kiribati' },
  { code: 'KW', label: 'Kuwait' },
  { code: 'KG', label: 'Kyrgyzstan' },
  { code: 'LA', label: 'Laos' },
  { code: 'LV', label: 'Latvia' },
  { code: 'LB', label: 'Lebanon' },
  { code: 'LS', label: 'Lesotho' },
  { code: 'LR', label: 'Liberia' },
  { code: 'LY', label: 'Libya' },
  { code: 'LI', label: 'Liechtenstein' },
  { code: 'LT', label: 'Lithuania' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'MO', label: 'Macao' },
  { code: 'MK', label: 'North Macedonia' },
  { code: 'MG', label: 'Madagascar' },
  { code: 'MW', label: 'Malawi' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'MV', label: 'Maldives' },
  { code: 'ML', label: 'Mali' },
  { code: 'MT', label: 'Malta' },
  { code: 'MH', label: 'Marshall Islands' },
  { code: 'MQ', label: 'Martinique' },
  { code: 'MR', label: 'Mauritania' },
  { code: 'MU', label: 'Mauritius' },
  { code: 'YT', label: 'Mayotte' },
  { code: 'MX', label: 'Mexico' },
  { code: 'FM', label: 'Micronesia' },
  { code: 'MD', label: 'Moldova' },
  { code: 'MC', label: 'Monaco' },
  { code: 'MN', label: 'Mongolia' },
  { code: 'ME', label: 'Montenegro' },
  { code: 'MS', label: 'Montserrat' },
  { code: 'MA', label: 'Morocco' },
  { code: 'MZ', label: 'Mozambique' },
  { code: 'MM', label: 'Myanmar' },
  { code: 'NA', label: 'Namibia' },
  { code: 'NR', label: 'Nauru' },
  { code: 'NP', label: 'Nepal' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'NC', label: 'New Caledonia' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'NI', label: 'Nicaragua' },
  { code: 'NE', label: 'Niger' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'NU', label: 'Niue' },
  { code: 'NF', label: 'Norfolk Island' },
  { code: 'KP', label: 'North Korea' },
  { code: 'MP', label: 'Northern Mariana Islands' },
  { code: 'NO', label: 'Norway' },
  { code: 'OM', label: 'Oman' },
  { code: 'PK', label: 'Pakistan' },
  { code: 'PS', label: 'Palestinian Territory' },
  { code: 'PA', label: 'Panama' },
  { code: 'PG', label: 'Papua New Guinea' },
  { code: 'PY', label: 'Paraguay' },
  { code: 'PE', label: 'Peru' },
  { code: 'PH', label: 'Philippines' },
  { code: 'PN', label: 'Pitcairn' },
  { code: 'PL', label: 'Poland' },
  { code: 'PT', label: 'Portugal' },
  { code: 'PR', label: 'Puerto Rico' },
  { code: 'QA', label: 'Qatar' },
  { code: 'RE', label: 'Reunion' },
  { code: 'RO', label: 'Romania' },
  { code: 'RU', label: 'Russia' },
  { code: 'RW', label: 'Rwanda' },
  { code: 'ST', label: 'São Tomé and Príncipe' },
  { code: 'BL', label: 'Saint Barthélemy' },
  { code: 'SH', label: 'Saint Helena' },
  { code: 'KN', label: 'Saint Kitts and Nevis' },
  { code: 'LC', label: 'Saint Lucia' },
  { code: 'SX', label: 'Saint Martin (Dutch part)' },
  { code: 'MF', label: 'Saint Martin (French part)' },
  { code: 'PM', label: 'Saint Pierre and Miquelon' },
  { code: 'VC', label: 'Saint Vincent and the Grenadines' },
  { code: 'WS', label: 'Samoa' },
  { code: 'SM', label: 'San Marino' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'SN', label: 'Senegal' },
  { code: 'RS', label: 'Serbia' },
  { code: 'SC', label: 'Seychelles' },
  { code: 'SL', label: 'Sierra Leone' },
  { code: 'SG', label: 'Singapore' },
  { code: 'SK', label: 'Slovakia' },
  { code: 'SI', label: 'Slovenia' },
  { code: 'SB', label: 'Solomon Islands' },
  { code: 'SO', label: 'Somalia' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'GS', label: 'South Georgia/Sandwich Islands' },
  { code: 'KR', label: 'South Korea' },
  { code: 'SS', label: 'South Sudan' },
  { code: 'ES', label: 'Spain' },
  { code: 'LK', label: 'Sri Lanka' },
  { code: 'SD', label: 'Sudan' },
  { code: 'SR', label: 'Suriname' },
  { code: 'SJ', label: 'Svalbard and Jan Mayen' },
  { code: 'SZ', label: 'Swaziland' },
  { code: 'SE', label: 'Sweden' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'SY', label: 'Syria' },
  { code: 'TW', label: 'Taiwan' },
  { code: 'TJ', label: 'Tajikistan' },
  { code: 'TZ', label: 'Tanzania' },
  { code: 'TH', label: 'Thailand' },
  { code: 'TL', label: 'Timor-Leste' },
  { code: 'TG', label: 'Togo' },
  { code: 'TK', label: 'Tokelau' },
  { code: 'TO', label: 'Tonga' },
  { code: 'TT', label: 'Trinidad and Tobago' },
  { code: 'TN', label: 'Tunisia' },
  { code: 'TR', label: 'Turkey' },
  { code: 'TM', label: 'Turkmenistan' },
  { code: 'TC', label: 'Turks and Caicos Islands' },
  { code: 'TV', label: 'Tuvalu' },
  { code: 'UG', label: 'Uganda' },
  { code: 'UA', label: 'Ukraine' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'GB', label: 'United Kingdom (UK)' },
  { code: 'US', label: 'United States (US)' },
  { code: 'UM', label: 'United States (US) Minor Outlying Islands' },
  { code: 'VI', label: 'United States (US) Virgin Islands' },
  { code: 'UY', label: 'Uruguay' },
  { code: 'UZ', label: 'Uzbekistan' },
  { code: 'VU', label: 'Vanuatu' },
  { code: 'VA', label: 'Vatican' },
  { code: 'VE', label: 'Venezuela' },
  { code: 'VN', label: 'Vietnam' },
  { code: 'WF', label: 'Wallis and Futuna' },
  { code: 'EH', label: 'Western Sahara' },
  { code: 'YE', label: 'Yemen' },
  { code: 'ZM', label: 'Zambia' },
  { code: 'ZW', label: 'Zimbabwe' }
];

const ShopCheckoutPage = () => {
  const location = useLocation();
  const [selectedPayment, setSelectedPayment] = useState('payment-2');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    country: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    orderNotes: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page-wrapper">
      <span className="header-span"></span>
      <Header />

      {/* Page Title matching superio-html/shop-checkout.html line 292 */}
      <section className="page-title">
        <div className="auto-container">
          <div className="title-outer">
            <h1>Checkout</h1>
            <ul className="page-breadcrumb">
              <li>
                <Link to="/">Home</Link>
              </li>{' '}
              <li>Checkout</li>
            </ul>
          </div>
        </div>
      </section>
      {/* End Page Title */}

      {/* Checkout Section matching superio-html/shop-checkout.html line 306 */}
      <section className="checkout-page">
        <div className="auto-container">
          <div className="row">
            <div className="column col-lg-8 col-md-12 col-sm-12">
              {/* Checkout Details */}
              <div className="checkout-form">
                <h3 className="title">Billing Details</h3>
                <form onSubmit={(e) => e.preventDefault()} className="default-form">
                  <div className="row">
                    {/* First Name */}
                    <div className="form-group col-lg-6 col-md-12 col-sm-12">
                      <div className="field-label">
                        First name <sup>*</sup>
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder=""
                      />
                    </div>

                    {/* Last Name */}
                    <div className="form-group col-lg-6 col-md-12 col-sm-12">
                      <div className="field-label">
                        Last name <sup>*</sup>
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder=""
                      />
                    </div>

                    {/* Company Name */}
                    <div className="form-group col-lg-12 col-md-12 col-sm-12">
                      <div className="field-label">Company name (optional)</div>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder=""
                      />
                    </div>

                    {/* Country */}
                    <div className="form-group col-lg-12 col-md-12 col-sm-12">
                      <div className="field-label">
                        Country <sup>*</sup>
                      </div>
                      <select
                        name="country"
                        className="select2 sortby-select"
                        autoComplete="country"
                        value={formData.country}
                        onChange={handleChange}
                      >
                        {countryOptions.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Street Address */}
                    <div className="form-group col-lg-12 col-md-12 col-sm-12">
                      <div className="field-label">
                        Street address <sup>*</sup>
                      </div>
                      <input
                        type="text"
                        name="address1"
                        value={formData.address1}
                        onChange={handleChange}
                        placeholder="House number and street name"
                        style={{ marginBottom: '10px' }}
                      />
                      <input
                        type="text"
                        name="address2"
                        value={formData.address2}
                        onChange={handleChange}
                        placeholder="Apartment,suite,unit etc. (optional)"
                      />
                    </div>

                    {/* Town / City */}
                    <div className="form-group col-lg-6 col-md-12 col-sm-12">
                      <div className="field-label">
                        Town / City <sup>*</sup>
                      </div>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder=""
                        required
                      />
                    </div>

                    {/* State / County */}
                    <div className="form-group col-lg-6 col-md-12 col-sm-12">
                      <div className="field-label">
                        State / County <sup>*</sup>
                      </div>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder=""
                        required
                      />
                    </div>

                    {/* Postcode / ZIP */}
                    <div className="form-group col-lg-6 col-md-12 col-sm-12">
                      <div className="field-label">
                        Postcode/ ZIP <sup>*</sup>
                      </div>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        placeholder=""
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div className="form-group col-lg-6 col-md-12 col-sm-12">
                      <div className="field-label">Phone</div>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder=""
                      />
                    </div>

                    {/* Email */}
                    <div className="form-group col-lg-12 col-md-12 col-sm-12">
                      <div className="field-label">Email Address</div>
                      <input
                        type="text"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder=""
                      />
                    </div>

                    {/* Additional Notes */}
                    <div className="form-group col-lg-12 col-md-12 col-sm-12">
                      <h3 className="title">Additional information</h3>
                      <div className="field-label">Order notes (optional)</div>
                      <textarea
                        name="orderNotes"
                        value={formData.orderNotes}
                        onChange={handleChange}
                        placeholder="Notes about your order, e.g. special notes for delivery."
                      ></textarea>
                    </div>
                  </div>
                </form>
              </div>
              {/* End Checkout Details */}
            </div>

            <div className="column col-lg-4 col-md-12 col-sm-12">
              {/* Order Box */}
              <div className="order-box">
                <h3>Your Order</h3>
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

              {/* Payment Box */}
              <div className="payment-box">
                <div className="payment-options">
                  <ul>
                    <li>
                      <div className="radio-option radio-box">
                        <input
                          type="radio"
                          name="payment-group"
                          id="payment-2"
                          checked={selectedPayment === 'payment-2'}
                          onChange={() => setSelectedPayment('payment-2')}
                        />
                        <label htmlFor="payment-2">
                          Direct Bank Transfer
                          <span className="small-text">
                            Make your payment directly into our bank account. Please use your Order
                            ID as the payment reference. Your order won’t be shipped until the funds
                            have cleared in our account.
                          </span>
                        </label>
                      </div>
                    </li>

                    <li>
                      <div className="radio-option radio-box">
                        <input
                          type="radio"
                          name="payment-group"
                          id="payment-1"
                          checked={selectedPayment === 'payment-1'}
                          onChange={() => setSelectedPayment('payment-1')}
                        />
                        <label htmlFor="payment-1">
                          Check Payments
                          <span className="small-text">
                            Make your payment directly into our bank account. Please use your Order
                            ID as the payment reference. Your order won’t be shipped until the funds
                            have cleared in our account.
                          </span>
                        </label>
                      </div>
                    </li>

                    <li>
                      <div className="radio-option radio-box">
                        <input
                          type="radio"
                          name="payment-group"
                          id="payment-3"
                          checked={selectedPayment === 'payment-3'}
                          onChange={() => setSelectedPayment('payment-3')}
                        />
                        <label htmlFor="payment-3">
                          Cash on Delivery
                          <span className="small-text">
                            Make your payment directly into our bank account. Please use your Order
                            ID as the payment reference. Your order won’t be shipped until the funds
                            have cleared in our account.
                          </span>
                        </label>
                      </div>
                    </li>

                    <li>
                      <div className="radio-option radio-box">
                        <input
                          type="radio"
                          name="payment-group"
                          id="payment-4"
                          checked={selectedPayment === 'payment-4'}
                          onChange={() => setSelectedPayment('payment-4')}
                        />
                        <label htmlFor="payment-4">
                          <strong>PayPal</strong> <img src="/images/icons/paypal.png" alt="" />
                        </label>
                      </div>
                    </li>
                  </ul>

                  <div className="btn-box">
                    <Link to="/order-completed" className="theme-btn btn-style-one">
                      Place Order
                    </Link>
                  </div>
                </div>
              </div>
              {/* End Payment Box */}
            </div>
          </div>
        </div>
      </section>
      {/* End CheckOut Page */}

      {/* Main Footer alternate5 */}
      <footer className="main-footer alternate5">
        <div className="auto-container">
          <div className="widgets-section">
            <div className="row">
              <div className="big-column col-xl-4 col-lg-3 col-md-12">
                <div className="footer-column about-widget">
                  <div className="logo">
                    <Link to="/">
                      <img src="/images/logo.svg" alt="" />
                    </Link>
                  </div>
                  <p className="phone-num">
                    <span>Call us </span>
                    <a href="tel:1234567890">123 456 7890</a>
                  </p>
                  <p className="address">
                    329 Queensberry Street, North Melbourne VIC
                    <br /> 3051, Australia. <br />
                    <a href="mailto:support@superio.com" className="email">
                      support@superio.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="big-column col-xl-8 col-lg-9 col-md-12">
                <div className="row">
                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">For Candidates</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="/jobs">Browse Jobs</Link>
                          </li>
                          <li>
                            <Link to="/jobs">Browse Categories</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard">Candidate Dashboard</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard/job-alerts">Job Alerts</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard/shortlisted-jobs">My Bookmarks</Link>
                          </li>
                          <li>
                            <Link to="/pricing">Job Packages</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">For Employers</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="#">Browse Candidates</Link>
                          </li>
                          <li>
                            <Link to="/employer-dashboard">Employer Dashboard</Link>
                          </li>
                          <li>
                            <Link to="/employer-dashboard/post-job">Add Job</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">About Us</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="/about">About Us</Link>
                          </li>
                          <li>
                            <Link to="/terms">Terms Page</Link>
                          </li>
                          <li>
                            <Link to="/candidate-dashboard/my-resume">Resume Page</Link>
                          </li>
                          <li>
                            <Link to="/blogs">Blog</Link>
                          </li>
                          <li>
                            <Link to="/contact">Contact</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="footer-column col-lg-3 col-md-6 col-sm-12">
                    <div className="footer-widget links-widget">
                      <h4 className="widget-title">Helpful Resources</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <Link to="#">Site Map</Link>
                          </li>
                          <li>
                            <Link to="/terms">Terms of Use</Link>
                          </li>
                          <li>
                            <Link to={location.pathname} onClick={(e) => e.preventDefault()}>Privacy Center</Link>
                          </li>
                          <li>
                            <Link to="#">Security Center</Link>
                          </li>
                          <li>
                            <Link to="#">Accessibility Center</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="auto-container">
            <div className="outer-box">
              <div className="copyright-text">
                © 2021 <Link to="/">Superio</Link>. All Right Reserved.
              </div>
              <div className="social-links">
                <a href="#">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShopCheckoutPage;
