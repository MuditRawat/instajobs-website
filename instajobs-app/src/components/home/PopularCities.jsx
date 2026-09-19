import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';

const CITY_IMAGE_MAP = {
  'miami': '/images/index-22/home22-city-1.png',
  'roma': '/images/index-22/home22-city-2.png',
  'rome': '/images/index-22/home22-city-2.png',
  'london': '/images/index-22/home22-city-4.png',
  'amsterdam': '/images/index-22/home22-city-5.png',
  'berlin': '/images/index-22/home22-city-6.png',
  'paris': '/images/index-22/home22-city-7.png',
  'new york': '/images/index-22/home22-city-3.png',
  'san francisco': '/images/index-22/home22-city-8.png',
};

const DEFAULT_CITY_IMAGES = [
  '/images/index-22/home22-city-1.png',
  '/images/index-22/home22-city-2.png',
  '/images/index-22/home22-city-3.png',
  '/images/index-22/home22-city-4.png',
  '/images/index-22/home22-city-5.png',
  '/images/index-22/home22-city-6.png',
  '/images/index-22/home22-city-7.png',
  '/images/index-22/home22-city-8.png',
];

const getCityImage = (cityName, index = 0) => {
  if (!cityName) return DEFAULT_CITY_IMAGES[index % DEFAULT_CITY_IMAGES.length];
  const normalized = cityName.toLowerCase().trim();
  return CITY_IMAGE_MAP[normalized] || DEFAULT_CITY_IMAGES[index % DEFAULT_CITY_IMAGES.length];
};

const PopularCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const res = await jobService.getPopularCities(6);
        if (res.success) {
          setCities(res.cities || []);
        }
      } catch (err) {
        console.error('Error fetching popular cities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return (
    <section className="job-categories border-bottom-0">
      <div className="auto-container">
        <div className="d-flex align-items-center justify-content-between wow fadeInUp">
          <div className="sec-title">
            <h2>Popular Cities</h2>
            <div className="text">Know your worth and find the job that qualify your life</div>
          </div>
          <Link to="/jobs" className="ud-btn-border-theme at-home18 mb-4">
            View All Cities <i className="fal fa-long-arrow-right"></i>
          </Link>
        </div>

        {loading ? (
          <div className="row justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading cities...</span>
            </div>
          </div>
        ) : cities.length === 0 ? (
          <div className="row justify-content-center py-4">
            <div className="col-12 text-center">
              <p className="text-muted" style={{ fontSize: '16px' }}>
                No active jobs by city available at the moment.
              </p>
            </div>
          </div>
        ) : (
          <div className="row wow fadeInUp">
            {cities.map((city, idx) => (
              <div key={city.name} className="col-sm-6 col-md-4">
                <Link
                  to={`/jobs?location=${encodeURIComponent(city.name)}`}
                  className="border-1 p20 bdrs12 d-flex align-items-center mb30 text-decoration-none"
                  style={{ display: 'flex', color: 'inherit' }}
                >
                  <div className="thumb mr20">
                    <img
                      className="rounded-circle"
                      src={getCityImage(city.name, idx)}
                      alt={city.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="details">
                    <h5 className="mb-0 fz18 fw500">{city.name}</h5>
                    <p className="text mb-0">
                      {city.count} {city.count === 1 ? 'Job' : 'Jobs'}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularCities;
