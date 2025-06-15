import React from 'react';

const ResumeView = ({
  education,
  skills,
  experience,
  certifications,
  languages,
  hobbies
}) => (
  <div className="fade-in">
    <section className="resume card-hover">
      <h2 className="section-title">Education</h2>
      <ul className="list">
        {education.map((item, index) => (
          <li key={index} className="list-item">{item}</li>
        ))}
      </ul>
    </section>
    <section className="resume card-hover">
      <h2 className="section-title">Skills</h2>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px'}}>
        {skills.map((skill, index) => (
          <span key={index} className="skill-tag" style={{
            backgroundColor: '#e3f2fd',
            color: '#1565c0',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            textAlign: 'center',
            display: 'inline-block'
          }}>
            {skill}
          </span>
        ))}
      </div>
    </section>
    <section className="resume card-hover">
      <h2 className="section-title">Experience</h2>
      <ul className="list">
        {experience.map((item, index) => (
          <li key={index} className="list-item">{item}</li>
        ))}
      </ul>
    </section>
    <section className="resume card-hover">
      <h2 className="section-title">Certifications</h2>
      <ul className="list">
        {certifications.map((item, index) => (
          <li key={index} className="list-item">{item}</li>
        ))}
      </ul>
    </section>
    <section className="resume card-hover">
      <h2 className="section-title">Languages</h2>
      <ul className="list">
        {languages.map((item, index) => (
          <li key={index} className="list-item">{item}</li>
        ))}
      </ul>
    </section>
    <section className="resume card-hover">
      <h2 className="section-title">Hobbies</h2>
      <ul className="list">
        {hobbies.map((item, index) => (
          <li key={index} className="list-item">{item}</li>
        ))}
      </ul>
    </section>
  </div>
);

export default ResumeView;
