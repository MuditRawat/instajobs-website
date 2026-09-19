import React from 'react';

const steps = [
  {
    id: 1,
    icon: 'fal fa-book-user',
    titleLine1: 'Register an account',
    titleLine2: 'to start',
  },
  {
    id: 2,
    icon: 'far fa-file-magnifying-glass',
    titleLine1: 'Explore over thousands',
    titleLine2: 'of resumes',
  },
  {
    id: 3,
    icon: 'far fa-clipboard-list-check',
    titleLine1: 'Find the most suitable',
    titleLine2: 'candidate.',
  },
];

const HowItWorksCta = () => {
  return (
    <section className="cta-home-18 mx-auto">
      <div className="auto-container">
        <div className="row wow fadeInUp">
          {steps.map((step) => (
            <div key={step.id} className="col-md-4 col-sm-6">
              <div className="how-it-work at-home18 mb-md-0 text-center">
                <div className="top-part position-relative">
                  <div className="icon position-relative">
                    <span className={step.icon}></span>
                  </div>
                </div>
                <div className="details">
                  <h4 className="title">
                    {step.titleLine1} <br className="d-none d-lg-block" /> {step.titleLine2}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksCta;
