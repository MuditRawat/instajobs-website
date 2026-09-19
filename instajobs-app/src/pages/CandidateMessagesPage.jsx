import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';
import CandidateSkillsPercentage from '../components/common/CandidateSkillsPercentage';

const initialContacts = [
  { id: 1, name: 'Darlene Robertson', role: 'Head of Development', time: '35 mins', avatar: '/images/resource/candidate-1.png', count: null },
  { id: 2, name: 'Jane Cooper', role: 'Head of Development', time: '35 mins', avatar: '/images/resource/candidate-2.png', count: 2, countClass: '' },
  { id: 3, name: 'Arlene McCoy', role: 'Head of Development', time: '35 mins', avatar: '/images/resource/candidate-3.png', count: 2, countClass: 'bg-success' },
  { id: 4, name: 'Albert Flores', role: 'Head of Development', time: '35 mins', avatar: '/images/resource/candidate-4.png', count: null },
  { id: 5, name: 'Williamson', role: 'Head of Development', time: '35 mins', avatar: '/images/resource/candidate-5.png', count: 2, countClass: 'bg-warning' },
  { id: 6, name: 'Kristin Watson', role: 'Head of Development', time: '35 mins', avatar: '/images/resource/candidate-6.png', count: null },
  { id: 7, name: 'Annette Black', role: 'Head of Development', time: '35 mins', avatar: '/images/resource/candidate-7.png', count: null },
  { id: 8, name: 'Jacob Jones', role: 'Head of Development', time: '35 mins', avatar: '/images/resource/candidate-8.png', count: null },
];

const initialMessages = [
  {
    id: 1,
    sender: 'Albert Flores',
    avatar: '/images/resource/candidate-3.png',
    time: '35 mins',
    text: 'How likely are you to recommend our company to your friends and family?',
    isReply: false,
  },
  {
    id: 2,
    sender: 'You',
    avatar: '/images/resource/candidate-6.png',
    time: '35 mins',
    text: 'Hey there, we’re just writing to let you know that you’ve been subscribed to a repository on GitHub.',
    isReply: true,
  },
  {
    id: 3,
    sender: 'Cameron Williamson',
    avatar: '/images/resource/candidate-3.png',
    time: '35 mins',
    text: 'Ok, Understood!',
    isReply: false,
  },
];

const CandidateMessagesPage = () => {
  const [activeContactId, setActiveContactId] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileContacts, setShowMobileContacts] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.$) {
      // Sidebar toggle handlers
      window.$('#toggle-user-sidebar').off('click').on('click', function () {
        window.$('body').toggleClass('sidebar-active');
      });
      window.$('.sidebar-backdrop').off('click').on('click', function () {
        window.$('body').removeClass('sidebar-active');
      });
    }

    return () => {
      if (window.$) {
        window.$('body').removeClass('sidebar-active');
      }
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgObj = {
      id: Date.now(),
      sender: 'You',
      avatar: '/images/resource/candidate-6.png',
      time: 'Just now',
      text: newMessage,
      isReply: true,
    };

    setMessages((prev) => [...prev, msgObj]);
    setNewMessage('');
  };

  const handleDeleteChat = () => {
    setMessages([]);
  };

  const filteredContacts = initialContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeContact = initialContacts.find((c) => c.id === activeContactId) || initialContacts[2];

  return (
    <div className="page-wrapper dashboard">
      <span className="header-span"></span>
      <Header />

      {/* Sidebar Backdrop */}
      <div className="sidebar-backdrop"></div>

      {/* User Sidebar */}
      <div className="user-sidebar">
        <div className="sidebar-inner">
          <ul className="navigation">
            <li>
              <Link to="/candidate-dashboard">
                <i className="la la-home"></i> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/my-profile">
                <i className="la la-user-tie"></i> My Profile
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/my-resume">
                <i className="la la-file-invoice"></i> My Resume
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/applied-jobs">
                <i className="la la-briefcase"></i> Applied Jobs
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/job-alerts">
                <i className="la la-bell"></i> Job Alerts
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/shortlisted-jobs">
                <i className="la la-bookmark-o"></i> Shortlisted Jobs
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/cv-manager">
                <i className="la la-file-invoice"></i> CV manager
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/packages">
                <i className="la la-box"></i> Packages
              </Link>
            </li>
            <li className="active">
              <Link to="/candidate-dashboard/messages">
                <i className="la la-comment-o"></i> Messages
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/change-password">
                <i className="la la-lock"></i> Change Password
              </Link>
            </li>
            <li>
              <Link to="/candidate-dashboard/my-profile">
                <i className="la la-user-alt"></i> View Profile
              </Link>
            </li>
            <li>
              <LogoutLink />
            </li>
            <li>
              <Link to="/">
                <i className="la la-trash"></i> Delete Profile
              </Link>
            </li>
          </ul>

          <CandidateSkillsPercentage />
        </div>
      </div>
      {/* End User Sidebar */}

      {/* Dashboard Section */}
      <section className="user-dashboard">
        <div className="dashboard-outer">
          <div className="upper-title-box">
            <h3>Messages</h3>
            <div className="text">Ready to jump back in?</div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              {/* Chat Widget */}
              <div className="chat-widget">
                <div className="widget-content">
                  <div className="row">
                    <div
                      className={`contacts_column col-xl-4 col-lg-5 col-md-12 col-sm-12 chat ${
                        showMobileContacts ? 'active' : ''
                      }`}
                      id="chat_contacts"
                    >
                      <div className="card contacts_card">
                        <div className="card-header">
                          <div className="search-box-one">
                            <form onSubmit={(e) => e.preventDefault()}>
                              <div className="form-group">
                                <span className="icon flaticon-search-1"></span>
                                <input
                                  type="search"
                                  name="search-field"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  placeholder="Search"
                                  required
                                />
                              </div>
                            </form>
                          </div>
                        </div>
                        <div className="card-body contacts_body">
                          <ul className="contacts">
                            {filteredContacts.map((contact) => (
                              <li
                                key={contact.id}
                                className={contact.id === activeContactId ? 'active' : ''}
                                onClick={() => {
                                  setActiveContactId(contact.id);
                                  setShowMobileContacts(false);
                                }}
                              >
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                  <div className="d-flex bd-highlight">
                                    <div className="img_cont">
                                      <img
                                        src={contact.avatar}
                                        className="rounded-circle user_img"
                                        alt={contact.name}
                                      />
                                    </div>
                                    <div className="user_info">
                                      <span>{contact.name}</span>
                                      <p>{contact.role}</p>
                                    </div>
                                    <span className="info">
                                      {contact.time}
                                      {contact.count !== null && (
                                        <span className={`count ${contact.countClass || ''}`}>
                                          {contact.count}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="col-xl-8 col-lg-7 col-md-12 col-sm-12 chat">
                      <div className="card message-card">
                        <div className="card-header msg_head">
                          <div className="d-flex bd-highlight">
                            <div className="img_cont">
                              <img
                                src="/images/resource/candidate-8.png"
                                alt=""
                                className="rounded-circle user_img"
                              />
                            </div>
                            <div className="user_info">
                              <span>Arlene McCoy</span>
                              <p>Active</p>
                            </div>
                          </div>

                          <div className="btn-box">
                            <button type="button" className="dlt-chat" onClick={handleDeleteChat}>
                              Delete Conversation
                            </button>
                            <button
                              type="button"
                              className="toggle-contact"
                              onClick={() => setShowMobileContacts(!showMobileContacts)}
                            >
                              <span className="fa fa-bars"></span>
                            </button>
                          </div>
                        </div>

                        <div className="card-body msg_card_body">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`d-flex ${
                                msg.isReply ? 'justify-content-end mb-2 reply' : 'justify-content-start mb-2'
                              }`}
                            >
                              <div className="img_cont_msg">
                                <img
                                  src={msg.avatar}
                                  alt={msg.sender}
                                  className="rounded-circle user_img_msg"
                                />
                                <div className="name">
                                  {msg.sender} <span className="msg_time">{msg.time}</span>
                                </div>
                              </div>
                              <div className="msg_cotainer">{msg.text}</div>
                            </div>
                          ))}
                        </div>

                        <div className="card-footer">
                          <form onSubmit={handleSendMessage}>
                            <div className="form-group mb-0">
                              <textarea
                                className="form-control type_msg"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                  }
                                }}
                              ></textarea>
                              <button type="submit" className="theme-btn btn-style-one submit-btn">
                                Send Message
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright Footer */}
      <div className="copyright-text">
        <p>© 2021 Superio. All Right Reserved.</p>
      </div>
    </div>
  );
};

export default CandidateMessagesPage;
