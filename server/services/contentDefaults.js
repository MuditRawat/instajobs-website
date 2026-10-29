/**
 * Default Verified Content Foundation for InstaJobs
 * Reflects genuine features, verified platform architecture, and operational parameters.
 * Used whenever database tables are not yet provisioned, or as seed records.
 */

const DEFAULT_ABOUT_CONTENT = {
  title: 'About InstaJobs',
  tagline: 'India’s Dedicated Gig Work & Flexible Shift Marketplace',
  story: [
    'InstaJobs is built to solve the real-world hiring challenges across India’s rapidly growing gig and flexible workforce economy. We connect skilled gig workers, freelancers, and local service professionals directly with verified employers seeking reliable on-demand talent.',
    'Unlike traditional job boards with lengthy hiring cycles, InstaJobs empowers candidates with a reusable KYC verification system, instant profile shortlisting, and direct employer contact. Employers can post jobs, manage applicant pipelines, review verified candidate credentials, and schedule interview sessions with transparency.'
  ],
  mission: 'To organize and empower India’s flexible workforce through transparent hiring, verified worker credentials, and seamless direct connections between gig professionals and hiring employers.',
  core_values: [
    {
      title: 'Verified Profiles & Reusable KYC',
      description: 'Candidates verify their profile credentials once, allowing friction-free applications across all gig categories with high employer trust.'
    },
    {
      title: 'Fast & Direct Connections',
      description: 'Streamlined application tracking, employer shortlisting, and transparent contact channels eliminate endless recruiter waiting periods.'
    },
    {
      title: 'Pan-India Reach',
      description: 'Coverage across all 28 states and union territories, bridging local gig opportunities with talent in metro cities and emerging hubs alike.'
    },
    {
      title: 'Fair & Flexible Compensation',
      description: 'Support for hourly, daily, weekly, monthly, and task-based pay structures tailored to gig and flexible shifts with Indian Rupee (₹) compensation.'
    }
  ],
  // Dynamic stats calculated from real database records or live platform queries
  stats: {
    active_jobs_label: 'Active Gig Openings',
    approved_employers_label: 'Verified Hiring Employers',
    registered_candidates_label: 'Registered Gig Professionals'
  }
};

const DEFAULT_FAQS = [
  // Category: Candidates & Job Applications
  {
    category: 'Candidates & Job Applications',
    question: 'How do I apply for gig jobs on InstaJobs?',
    answer: 'Browse active job listings from the Find Jobs page, click on any job title to view its details, and select "Apply For Job". During your application, you provide your contact details, upload your job-specific CV document (PDF or DOCX), and submit required KYC verification details.'
  },
  {
    category: 'Candidates & Job Applications',
    question: 'What is Reusable KYC and why is it required?',
    answer: 'Reusable KYC verifies your candidate identity and residential details. Once submitted with your application, your verification credentials can be reused across subsequent job applications, speeding up employer review and establishing instant trust.'
  },
  {
    category: 'Candidates & Job Applications',
    question: 'Can I track the status of my submitted applications?',
    answer: 'Yes. From your Candidate Dashboard, navigate to the "Applied Jobs" tab. You can review all your submitted applications, see real-time status updates (Pending, Shortlisted, Selected, or Rejected), and review employer notifications.'
  },
  {
    category: 'Candidates & Job Applications',
    question: 'How do I manage my resumes and CVs?',
    answer: 'Access the "CV Manager" tab in your Candidate Dashboard. You can upload and manage your primary CV file, which is automatically accessible when applying for flexible shifts and gigs.'
  },
  {
    category: 'Candidates & Job Applications',
    question: 'Can I bookmark or save jobs to apply later?',
    answer: 'Yes. When logged in with a candidate account, click the bookmark icon on any job card or job details page. Saved jobs can be accessed anytime from your Candidate Dashboard under "Shortlisted Jobs".'
  },

  // Category: Employers & Hiring
  {
    category: 'Employers & Hiring',
    question: 'How do employers register and post job vacancies?',
    answer: 'Employers can register with their company details from the Register page. Once logged in, navigate to the Employer Dashboard and click "Post a New Job" to specify job titles, gig categories, shift timings, Indian Rupee compensation, location, and requirements.'
  },
  {
    category: 'Employers & Hiring',
    question: 'How does employer profile verification work?',
    answer: 'To ensure applicant safety and prevent fraudulent postings, new employer profiles undergo an administrative review. Only approved employer profiles with verified credentials appear publicly in the Employers Directory.'
  },
  {
    category: 'Employers & Hiring',
    question: 'How do employers manage incoming applicants and shortlists?',
    answer: 'Employers can view all submitted candidate applications in their "All Applicants" tab. From there, you can view candidate details, inspect uploaded job CVs, update application statuses, and shortlist top candidates into the "Shortlisted Applicants" tab.'
  },
  {
    category: 'Employers & Hiring',
    question: 'What compensation structures are supported for gig postings?',
    answer: 'InstaJobs supports flexible compensation structures tailored for gig shifts, including Per Hour, Per Day, Per Week, Per Month, and Fixed Project/Task rates in Indian Rupees (₹).'
  },

  // Category: Account & Platform Security
  {
    category: 'Account & Platform Security',
    question: 'Is my personal data and identity documentation secure?',
    answer: 'Yes. All identity documentation and CV files submitted during applications are encrypted and stored in secure cloud storage buckets with strict Row Level Security (RLS). They are accessible only to verified hiring employers whose jobs you specifically apply to and authorized administrators.'
  },
  {
    category: 'Account & Platform Security',
    question: 'How do I update my profile or change my password?',
    answer: 'Both Candidates and Employers can update their personal details, phone number, location, and profile photo from their respective Dashboard Profile tab. Passwords can be updated securely under the "Change Password" settings tab.'
  },
  {
    category: 'Account & Platform Security',
    question: 'How do I contact InstaJobs support if I encounter an issue?',
    answer: 'You can reach out to our support team at support@instajobs.in. Click the support email link located in the website footer to open your email compose window directly.'
  }
];

const DEFAULT_TERMS_CONTENT = {
  title: 'Terms and Conditions',
  last_updated: 'October 2026',
  sections: [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: [
        'By registering an account, browsing job listings, posting vacancies, or using any feature on the InstaJobs platform ("the Service"), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, you must not access or use the platform.',
        'These terms apply to all registered candidates, hiring employers, and visitors across India.'
      ]
    },
    {
      id: 'candidate-obligations',
      title: '2. Candidate Accounts and KYC Verification',
      content: [
        'Candidates must provide accurate, current, and truthful information when registering and completing their candidate profile or submitting application documents.',
        'Any KYC verification documents (such as Government ID proofs, selfies, or location data) submitted during job applications must belong to the applicant. Misrepresentation of identity, forged credentials, or uploading unauthorized documents constitutes a material violation and will result in immediate account termination.',
        'Candidates are solely responsible for reviewing gig responsibilities, compensation rates, and physical work conditions before accepting an assignment.'
      ]
    },
    {
      id: 'employer-obligations',
      title: '3. Employer Postings and Hiring Responsibilities',
      content: [
        'Employers must post genuine, active gig opportunities, shifts, or freelance roles. Job postings must clearly state the nature of work, location, and transparent compensation in Indian Rupees (₹).',
        'Employers are strictly prohibited from demanding upfront fees, security deposits, or unlawful payments from candidates as a condition of application or employment.',
        'Employer accounts and postings are subject to administrative verification and approval. InstaJobs reserves the right to suspend or reject any employer or posting that fails to meet quality and legal standards.'
      ]
    },
    {
      id: 'platform-role',
      title: '4. Platform Role & Limitations of Liability',
      content: [
        'InstaJobs provides a marketplace technology platform facilitating connections between independent gig workers and prospective employers. InstaJobs is not an employment agency or party to any direct gig contract, engagement, or shift agreement between candidates and employers.',
        'InstaJobs is not liable for payment disputes, contract breaches, workplace incidents, or job performance arising between employers and candidates. Parties are advised to execute clear engagement agreements.',
        'To the maximum extent permitted by applicable Indian law, InstaJobs shall not be liable for indirect, incidental, or consequential damages resulting from the use of the platform.'
      ]
    },
    {
      id: 'privacy-data',
      title: '5. Privacy & Data Handling',
      content: [
        'User data, uploaded resumes, and KYC documents are processed in accordance with our data protection practices and applicable Indian IT laws.',
        'Candidate documentation submitted as part of job applications is shared strictly with the corresponding hiring employer for legitimate recruitment evaluation.'
      ]
    },
    {
      id: 'termination',
      title: '6. Account Suspension & Modifications',
      content: [
        'InstaJobs reserves the right to suspend or terminate accounts that violate platform policies, engage in spam, post fraudulent jobs, or submit false identity credentials.',
        'We may revise these Terms and Conditions periodically. Updated terms will be posted on this page with an updated revision date. Continued use of the platform following updates constitutes acceptance of the revised terms.'
      ]
    },
    {
      id: 'contact-legal',
      title: '7. Inquiries & Contact',
      content: [
        'If you have any questions, feedback, or legal inquiries regarding these Terms and Conditions, please contact us at support@instajobs.in.'
      ]
    }
  ]
};

module.exports = {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_FAQS,
  DEFAULT_TERMS_CONTENT
};

