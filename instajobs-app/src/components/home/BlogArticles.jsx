import React from 'react';
import { Link } from 'react-router-dom';

const articles = [
  {
    id: 1,
    tag: 'Designer',
    image: '/images/index-21/blog-1.png',
    date: 'April 06 2023',
    author: 'By Ali Tufan',
    titleLine1: '21 Job Interview Tips: How To Make a Great',
    titleLine2: 'Impression',
  },
  {
    id: 2,
    tag: 'Developer',
    image: '/images/index-21/blog-2.png',
    date: 'April 06 2023',
    author: 'By Ali Tufan',
    titleLine1: '10 Ways to Avoid a Referee Disaster',
    titleLine2: 'Zone',
  },
  {
    id: 3,
    tag: 'Marketing',
    image: '/images/index-21/blog-1.png',
    date: 'April 06 2023',
    author: 'By Ali Tufan',
    titleLine1: 'Tips to Keep Your Resume Relevant to the',
    titleLine2: 'Position',
  },
];

const BlogArticles = () => {
  return (
    <section className="layout-pt-120 layout-pb-120 border-bottom-1">
      <div className="auto-container">
        <div className="d-sm-flex align-items-center justify-content-sm-between wow fadeInUp mb-4 mb-sm-0">
          <div className="sec-title">
            <h2>Travel Articles</h2>
            <div className="text">Fresh job related news content posted each day.</div>
          </div>
          <Link to="/blogs" className="ud-btn-border-theme at-home18 mb-4">
            View All <i className="fal fa-long-arrow-right"></i>
          </Link>
        </div>
        <div className="row wow fadeInUp">
          {articles.map((article) => (
            <div key={article.id} className="col-lg-4 col-sm-6">
              <div className="blog -type-1 at-home21 mb-4 mb-xl-0">
                <div className="blog-image position-relative mb30">
                  <span className="tag">
                    {article.tag}
                  </span>
                  <img className="bdrs12" src={article.image} alt="image" />
                </div>
                <div className="blog-content">
                  <div className="d-flex align-items-center">
                    <span className="date fz15 dark-color">
                      {article.date}
                    </span>
                    <span className="text-border-color mx-2">|</span>
                    <span className="author fz15 dark-color">
                      {article.author}
                    </span>
                  </div>
                  <h4>
                    <Link to={`/blogs/${article.id}`}>
                      {article.titleLine1} <br className="d-none d-xl-block" /> {article.titleLine2}
                    </Link>
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

export default BlogArticles;
