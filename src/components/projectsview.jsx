import React from 'react';

const ProjectsView = ({ projects }) => (
  <div className="fade-in" style={{marginTop: '20px'}}>
    <h2 className="resume-title">My Projects</h2>
    {projects.map((project, index) => (
      <div key={index} className="resume project-card" style={{
        borderLeft: '4px solid #007BFF',
        marginBottom: '30px'
      }}>
        <h3 style={{fontSize: '1.8rem', color: '#333', marginBottom: '15px', fontWeight: 'bold'}}>{project.title}</h3>
        <p style={{color: '#666', marginBottom: '20px', lineHeight: '1.6'}}>{project.description}</p>
        <div style={{marginBottom: '20px'}}>
          <h4 style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#555', marginBottom: '10px'}}>Technologies Used:</h4>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
            {project.technologies.map((tech, techIndex) => (
              <span key={techIndex} style={{
                backgroundColor: '#f8f9fa',
                color: '#495057',
                padding: '6px 12px',
                borderRadius: '15px',
                fontSize: '14px',
                border: '1px solid #dee2e6'
              }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#555', marginBottom: '10px'}}>Key Features:</h4>
          <ul className="list">
            {project.features.map((feature, featureIndex) => (
              <li key={featureIndex} className="list-item">
                <span style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#28a745',
                  borderRadius: '50%',
                  display: 'inline-block',
                  marginRight: '12px'
                }}></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ))}
  </div>
);

export default ProjectsView;
