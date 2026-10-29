import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import LogoutLink from '../components/common/LogoutLink';

const initialContacts = [
  {
    id: 1,
    name: 'Darlene Robertson',
    role: 'Head of Development',
    time: '35 mins',
    image: '/images/resource/candidate-1.png',
    count: null,
  },
  {
    id: 2,
    name: 'Jane Cooper',
    role: 'Head of Development',
    time: '35 mins',
    image: '/images/resource/candidate-2.png',
    count: '2',
    countClass: '',
  },
  {
    id: 3,
    name: 'Arlene McCoy',
    role: 'Head of Development',
    time: '35 mins',
    image: '/images/resource/candidate-3.png',
    count: '2',
    countClass: 'bg-success',
  },
  {
    id: 4,
    name: 'Albert Flores',
    role: 'Head of Development',
    time: '35 mins',
    image: '/images/resource/candidate-4.png',
    count: null,
  },
  {
    id: 5,
    name: 'Williamson',
    role: 'Head of Development',
    time: '35 mins',
    image: '/images/resource/candidate-5.png',
    count: '2',
    countClass: 'bg-warning',
  },
  {
    id: 6,
    name: 'Kristin Watson',
    role: 'Head of Development',
    time: '35 mins',
    image: '/images/resource/candidate-6.png',
    count: null,
  },
  {
    id: 7,
    name: 'Annette Black',
    role: 'Head of Development',
    time: '35 mins',
    image: '/images/resource/candidate-7.png',
    count: null,
  },
  {
    id: 8,
    name: 'Jacob Jones',
    role: 'Head of Development',
    time: '35 mins',
    image: '/images/resource/candidate-8.png',
    count: null,
  },
];

const initialMessagesMap = {
  5: [
    {
      id: 1,
      sender: 'Albert Flores',
      time: '35 mins',
      image: '/images/resource/candidate-3.png',
      text: 'How likely are you to recommend our company to your friends and family?',
      type: 'incoming',
    },
    {
      id: 2,
      sender: 'You',
      time: '35 mins',
      image: '/images/resource/candidate-6.png',
      text: 'Hey there, we’re just writing to let you know that you’ve been subscribed to a repository on GitHub.',
      type: 'outgoing',
    },
    {
      id: 3,
      sender: 'Cameron Williamson',
      time: '35 mins',
      image: '/images/resource/candidate-3.png',
      text: 'Ok, Understood!',
      type: 'incoming',
    },
  ],
};

const EmployerMessagesPage = () => {
  const [contacts] = useState(initialContacts);
  const [activeContactId, setActiveContactId] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messagesMap, setMessagesMap] = useState(initialMessagesMap);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (window.$) {
      // Sidebar toggle handlers matching superio-html script.js
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
        window.$('body').removeClass('active-chat-contacts');
      }
    };
  }, []);

  const toggleMobileContacts = () => {
    if (window.$) {
      window.$('body').toggleClass('active-chat-contacts');
    }
  };

  const handleSelectContact = (id) => {
    setActiveContactId(id);
    if (window.$) {
      window.$('body').removeClass('active-chat-contacts');
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'You',
      time: 'Just now',
      image: '/images/resource/candidate-6.png',
      text: messageText,
      type: 'outgoing',
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage],
    }));

    setMessageText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteConversation = () => {
    setMessagesMap((prev) => ({
      ...prev,
      [activeContactId]: [],
    }));
  };

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];
  const activeMessages = messagesMap[activeContactId] || [];

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Link to="/employer-dashboard">
                <i className="la la-home"></i> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/company-profile">
                <i className="la la-user-tie"></i> Company Profile
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/post-job">
                <i className="la la-paper-plane"></i> Post a New Job
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/manage-jobs">
                <i className="la la-briefcase"></i> Manage Jobs
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/applicants">
                <i className="la la-file-invoice"></i> All Applicants
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/shortlisted-resumes">
                <i className="la la-bookmark-o"></i> Shortlisted Applicants
              </Link>
            </li>
            {/* Temporarily hidden employer dashboard tabs
            <li className="active">
              <Link to="/employer-dashboard/messages">
                <i className="la la-comment-o"></i> Messages
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/resume-alerts">
                <i className="la la-bell"></i> Resume Alerts
              </Link>
            </li>
            <li>
              <Link to="/employer-dashboard/change-password">
                <i className="la la-lock"></i> Change Password
              </Link>
            </li>
            */}
            <li>
              <Link to="/employer-dashboard/company-profile">
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
                      className="contacts_column col-xl-4 col-lg-5 col-md-12 col-sm-12 chat"
                      id="chat_contacts"
                    >
                      <div className="card contacts_card">
                        <div className="card-header">
                          <div className="search-box-one">
                            <form method="post" action="#" onSubmit={(e) => e.preventDefault()}>
                              <div className="form-group">
                                <span className="icon flaticon-search-1"></span>
                                <input
                                  type="search"
                                  name="search-field"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  placeholder="Search"
                                  required=""
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
                                onClick={() => handleSelectContact(contact.id)}
                              >
                                <a href="#" onClick={(e) => e.preventDefault()}>
                                  <div className="d-flex bd-highlight">
                                    <div className="img_cont">
                                      <img
                                        src={contact.image}
                                        className="rounded-circle user_img"
                                        alt=""
                                      />
                                    </div>
                                    <div className="user_info">
                                      <span>{contact.name}</span>
                                      <p>{contact.role}</p>
                                    </div>
                                    <span className="info">
                                      {contact.time}
                                      {contact.count && (
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
                            <button
                              className="dlt-chat"
                              type="button"
                              onClick={handleDeleteConversation}
                            >
                              Delete Conversation
                            </button>
                            <button
                              className="toggle-contact"
                              type="button"
                              onClick={toggleMobileContacts}
                            >
                              <span className="fa fa-bars"></span>
                            </button>
                          </div>
                        </div>

                        <div className="card-body msg_card_body">
                          {activeMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`d-flex ${
                                msg.type === 'outgoing'
                                  ? 'justify-content-end mb-2 reply'
                                  : 'justify-content-start mb-2'
                              }`}
                            >
                              <div className="img_cont_msg">
                                <img
                                  src={msg.image}
                                  alt=""
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
                          <div className="form-group mb-0">
                            <textarea
                              className="form-control type_msg"
                              placeholder="Type a message..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              onKeyDown={handleKeyDown}
                            ></textarea>
                            <button
                              type="button"
                              className="theme-btn btn-style-one submit-btn"
                              onClick={handleSendMessage}
                            >
                              Send Message
                            </button>
                          </div>
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
        <p>© 2026 instajobs. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default EmployerMessagesPage;
