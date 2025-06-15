import React from 'react';

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px'}}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const Header = ({ activeView, setActiveView, resumepdf }) => (
  <header style={{
    backgroundColor: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '20px 0'
  }}>
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px'}}>
      <h1 className="resume-title">Nikhil Nedungadi</h1>
      <div className="contact-info">
        <p> Email: nikhil.nedungadi01@gmail.com</p>
        <a 
          href="https://www.linkedin.com/in/nikhil-nedungadi" 
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#007BFF',
            textDecoration: 'none',
            marginTop: '10px'
          }}
        >
          <LinkedInIcon />
          <span style={{marginLeft: '8px'}}>LinkedIn Profile</span>
        </a>
        <div className="mt-4">
          <span style={{color: '#555', marginRight: '10px'}}>My resume:</span>
          <a 
            href={resumepdf} 
            download="Nikhil_Nedungadi_Resume.pdf"
            className="resume-button"
            style={{textDecoration: 'none'}}
          >
            Download
          </a>
        </div>
      </div>
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setActiveView('resume')}
          className={`resume-button ${activeView === 'resume' ? 'nav-button-active' : ''}`}
          style={{
            backgroundColor: activeView === 'resume' ? '#007BFF' : '#6c757d',
            padding: '12px 24px',
            fontSize: '16px'
          }}
        >
          Resume
        </button>
        <button
          type="button"
          onClick={() => setActiveView('projects')}
          className={`resume-button ${activeView === 'projects' ? 'nav-button-active' : ''}`}
          style={{
            backgroundColor: activeView === 'projects' ? '#007BFF' : '#6c757d',
            padding: '12px 24px',
            fontSize: '16px'
          }}
        >
          Projects
        </button>
        <button
          type="button"
          onClick={() => setActiveView('tools')}
          className={`resume-button ${activeView === 'tools' ? 'nav-button-active' : ''}`}
          style={{
            backgroundColor: activeView === 'tools' ? '#007BFF' : '#6c757d',
            padding: '12px 24px',
            fontSize: '16px'
          }}
        >
          Text Tools
        </button>
      </div>
    </div>
  </header>
);

export default Header;
