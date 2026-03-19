import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    {
      label: 'Analytics',
      icon: 'pi pi-chart-bar',
      command: () => navigate('/'),
      className: location.pathname === '/' ? 'active-menu-item' : '',
    },
    {
      label: 'Tools',
      icon: 'pi pi-calculator',
      command: () => navigate('/tools'),
      className: location.pathname === '/tools' ? 'active-menu-item' : '',
    },
    {
      label: 'Deal Analysis',
      icon: 'pi pi-chart-line',
      command: () => navigate('/deal-analysis'),
      className: location.pathname === '/deal-analysis' ? 'active-menu-item' : '',
    },
    {
      label: 'About / Hire Me',
      icon: 'pi pi-user',
      command: () => navigate('/about'),
      className: location.pathname === '/about' ? 'active-menu-item' : '',
    },
  ];

  const start = (
    <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
      <img
        src="/gravvisoft-logo-header-transparent.png"
        alt="GravviSoft logo"
        className="brand-logo"
      />
      <span className="brand-text"></span>
    </div>
  );

  const end = (
    <div className="navbar-end">
      <i className="pi pi-bell p-overlay-badge" style={{ fontSize: '1.25rem', cursor: 'pointer' }}>
        <Badge value="3" severity="danger"></Badge>
      </i>
      <Avatar
        icon="pi pi-user"
        size="normal"
        shape="circle"
        style={{ backgroundColor: '#3B82F6', color: '#ffffff', marginLeft: '1rem', cursor: 'pointer' }}
      />
    </div>
  );

  return (
    <div className="navbar-container">
      <Menubar model={items} start={start} end={end} className="custom-menubar" />
    </div>
  );
};

export default Navbar;
