import React, { useEffect } from 'react';

const TestimonialSection = () => {
  useEffect(() => {
    // Native Owl Carousel initialization matching superio-html/js/script.js line 221
    if (window.$ && window.$.fn && window.$.fn.owlCarousel) {
      const $carousel = window.$('.testimonial-carousel-two');
      if ($carousel.length) {
        if ($carousel.data('owl.carousel')) {
          $carousel.trigger('destroy.owl.carousel');
        }
        $carousel.owlCarousel({
          animateOut: 'fadeOut',
          animateIn: 'fadeIn',
          loop: true,
          margin: 15,
          items: 1,
          nav: true,
          dots: false,
          smartSpeed: 500,
          autoplay: true,
          autoplayTimeout: 10000,
          navText: ['<span class="flaticon-back"></span>', '<span class="flaticon-next"></span>'],
        });
      }
    }

    return () => {
      if (window.$ && window.$.fn && window.$.fn.owlCarousel) {
        const $carousel = window.$('.testimonial-carousel-two');
        if ($carousel.length && $carousel.data('owl.carousel')) {
          $carousel.trigger('destroy.owl.carousel');
        }
      }
    };
  }, []);

  return (
    <section className="testimonial-section-three layout-pb-60">
      <div className="auto-container">
        <div className="carousel-outer wow fadeInUp">
          {/* Exact Testimonial Carousel HTML structure from superio-html/index-18.html lines 813-878 */}
          <div className="testimonial-carousel-two owl-carousel owl-theme">
            {/* Slide Item 1 */}
            <div className="slide-item">
              <div className="image-column">
                <figure className="image">
                  <img src="/images/index-18/testimonials-1.png" alt="" />
                </figure>
              </div>
              <div className="content-column">
                <div className="testimonial-block-three">
                  <div className="inner-box">
                    <h4 className="title">Great quality!</h4>
                    <div className="text">
                      Without JobHunt i’d be homeless, they found me a job and got me sorted out quickly with everything! Can’t quite… The Mitech team works really hard to ensure high level of quality
                    </div>
                    <div className="info-box">
                      <h4 className="name">Gabriel Nolan</h4>
                      <span className="designation">Consultant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Item 2 */}
            <div className="slide-item">
              <div className="image-column">
                <figure className="image">
                  <img src="/images/index-18/testimonials-1.png" alt="" />
                </figure>
              </div>
              <div className="content-column">
                <div className="testimonial-block-three">
                  <div className="inner-box">
                    <h4 className="title">Great quality!</h4>
                    <div className="text">
                      Without JobHunt i’d be homeless, they found me a job and got me sorted out quickly with everything! Can’t quite… The Mitech team works really hard to ensure high level of quality
                    </div>
                    <div className="info-box">
                      <h4 className="name">Gabriel Nolan</h4>
                      <span class="designation">Consultant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Item 3 */}
            <div className="slide-item">
              <div className="image-column">
                <figure className="image">
                  <img src="/images/index-18/testimonials-1.png" alt="" />
                </figure>
              </div>
              <div className="content-column">
                <div className="testimonial-block-three">
                  <div className="inner-box">
                    <h4 className="title">Great quality!</h4>
                    <div className="text">
                      Without JobHunt i’d be homeless, they found me a job and got me sorted out quickly with everything! Can’t quite… The Mitech team works really hard to ensure high level of quality
                    </div>
                    <div className="info-box">
                      <h4 className="name">Gabriel Nolan</h4>
                      <span className="designation">Consultant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
