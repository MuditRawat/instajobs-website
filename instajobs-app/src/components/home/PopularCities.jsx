import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { TOP_INDIAN_HUBS } from '../../constants/indiaLocations';

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

const getCityImage = (index = 0) => {
  return DEFAULT_CITY_IMAGES[index % DEFAULT_CITY_IMAGES.length];
};

const PopularCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const res = await jobService.getPopularCities(8);
        if (res.success && res.cities && res.cities.length > 0) {
          // If database has actual cities posted, display them
          setCities(res.cities);
        } else {
          // Otherwise, display curated top Indian gig hubs with explore links
          setCities(TOP_INDIAN_HUBS.map((hub) => ({
            name: hub.name,
            state: hub.state,
            count: null // No live jobs count to avoid pretending
          })));
        }
      } catch (err) {
        console.error('Error fetching popular cities:', err);
        setCities(TOP_INDIAN_HUBS.map((hub) => ({
          name: hub.name,
          state: hub.state,
          count: null
        })));
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
            <h2>Popular Cities & Gig Hubs</h2>
            <div className="text">Explore flexible work and gig opportunities across India’s primary economic regions</div>
          </div>
          <Link to="/jobs" className="ud-btn-border-theme at-home18 mb-4">
            Browse All Locations <i className="fal fa-long-arrow-right"></i>
          </Link>
        </div>

        {loading ? (
          <div className="row justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading cities...</span>
            </div>
          </div>
        ) : (
          <div className="row wow fadeInUp">
            {cities.map((city, idx) => (
              <div key={city.name} className="col-sm-6 col-md-3">
                <Link
                  to={`/jobs?location=${encodeURIComponent(city.name)}`}
                  className="border-1 p20 bdrs12 d-flex align-items-center mb30 text-decoration-none"
                  style={{ display: 'flex', color: 'inherit' }}
                >
                  <div className="thumb mr20">
                    <img
                      className="rounded-circle"
                      src={getCityImage(idx)}
                      alt={city.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="details">
                    <h5 className="mb-0 fz18 fw500">{city.name}</h5>
                    <p className="text mb-0">
                      {city.count !== null && city.count !== undefined
                        ? `${city.count} ${city.count === 1 ? 'Job' : 'Jobs'}`
                        : 'Explore Gigs'}
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
