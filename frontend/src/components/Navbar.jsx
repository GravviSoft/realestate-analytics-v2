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
      label: 'Dashboard',
      icon: 'pi pi-home',
      command: () => navigate('/'),
      className: location.pathname === '/' ? 'active-menu-item' : '',
    },
    {
      label: 'Analytics',
      icon: 'pi pi-chart-line',
      command: () => navigate('/analytics'),
      className: location.pathname === '/analytics' ? 'active-menu-item' : '',
    },
    {
      label: 'Reports',
      icon: 'pi pi-file',
      command: () => navigate('/reports'),
      className: location.pathname === '/reports' ? 'active-menu-item' : '',
    },
  ];

  const start = (
    <div className="navbar-brand">
      <i className="pi pi-chart-bar" style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}></i>
      <span className="brand-text">Investor Dashboard</span>
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
