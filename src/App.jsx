import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import config from './config';
import resumepdf from './assets/Nikhil_Nedungadi_Resume.pdf';

import Header from './components/header';
import ResumeView from './components/resumeview';
import ProjectsView from './components/projectsview';
import TextChunkerView from './components/textchunkerview';
import Footer from './components/footer';

const App = () => {
  const [activeView, setActiveView] = useState('resume');
  const [backendStatus, setBackendStatus] = useState('checking');

  // All static data
  const education = [
    "B.Tech. Computer Science, VIT VELLORE - Class of 2026",
    "SINDHI High School - High School Diploma"
  ];
  const skills = [
    "C", "C++", "Python", "React", "HTML", "CSS", "JavaScript", 
    "Generative AI", "Artificial Intelligence", "Java", "SQL", 
    "MySQL", "Data Structures and Algorithms", 
    "Object-Oriented Programming", "Tailwind CSS (Basic)"
  ];
  const experience = [
    "Intern at HITACHI"
  ];
  const projects = [
    {
      title: "Video Transcript Chunker",
      description: "Developed a full-stack application with Python Flask backend and React frontend to break large video transcripts into manageable chunks.",
      technologies: ["Python", "Flask", "React", "JavaScript", "REST API"],
      features: ["Smart text chunking", "Transcript cleaning", "Multiple output formats", "Real-time processing"]
    },
    {
      title: "Job Website using React",
      description: "Developed a fully functional job search website using React.js, allowing users to search and view various job listings.",
      technologies: ["React.js", "JavaScript", "CSS", "HTML"],
      features: ["Job search functionality", "Responsive design", "User-friendly interface"]
    },
    {
      title: "React Chat App",
      description: "Built a real-time chat application using React and Socket.IO, featuring private messaging, group chats and a bot the user can chat with.",
      technologies: ["React", "Socket.IO", "Node.js", "JavaScript"],
      features: ["Real-time messaging", "Private messaging", "Group chats"]
    },
    
    {
      title: "Resume Website",
      description: "Created a personal resume website using React, showcasing my skills, projects, and experience.",
      technologies: ["React", "CSS", "HTML", "JavaScript"],
      features: ["Responsive design", "Interactive navigation", "Modern UI"]
    }
    
    
  ];
  const certifications = [
    "Artificial Intelligence Fundamentals (2023)",
    "Generative AI for Executives and Business Leaders (2022)",
    "Winner: Hack the Hackathon - Ideathon (2022)"
  ];
  const languages = ["English", "Hindi", "Kannada (Basic)"];
  const hobbies = ["Cycling", "Chess", "Gaming", "Drawing"];

  // Text Chunker State
  const [chunkerState, setChunkerState] = useState({
    inputText: '',
    maxChars: 2900,
    cleanTranscript: true,
    method: 'smart',
    loading: false,
    result: null,
    error: null
  });

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/health`, { 
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('disconnected');
    }
  };

  return (
    <div style={{minHeight: '100vh'}}>
      <Header 
        activeView={activeView}
        setActiveView={setActiveView}
        resumepdf={resumepdf}
      />
      <main style={{maxWidth: '1200px', margin: '0 auto', padding: '40px 20px'}}>
        {activeView === 'resume' && (
          <ResumeView
            education={education}
            skills={skills}
            experience={experience}
            certifications={certifications}
            languages={languages}
            hobbies={hobbies}
          />
        )}
        {activeView === 'projects' && (
          <ProjectsView projects={projects} />
        )}
        {activeView === 'tools' && (
          <TextChunkerView
            backendStatus={backendStatus}
            checkBackendStatus={checkBackendStatus}
            chunkerState={chunkerState}
            setChunkerState={setChunkerState}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
