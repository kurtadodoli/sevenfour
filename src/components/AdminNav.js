import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const AdminNav = () => {
  const { currentUser } = useAuth();
  
  // Only render if user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }
  
  return (
    <AdminNavContainer>
      <NavTitle>Admin Panel</NavTitle>
      <NavList>
        <NavItem>
          <NavLink to="/admin">Dashboard</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/admin/products">Product Maintenance</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/admin/users">User Management</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/admin/reports">Reports</NavLink>
        </NavItem>
        <NavItem>
          <NavLink to="/admin/settings">Settings</NavLink>
        </NavItem>
      </NavList>
    </AdminNavContainer>
  );
};

const AdminNavContainer = styled.div`
  background-color: #1a1a1a;
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const NavTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.2);
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.5rem;
`;

const NavLink = styled(Link)`
  display: block;
  padding: 0.5rem 0;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: white;
  }
  
  &.active {
    color: white;
    font-weight: bold;
  }
`;

export default AdminNav;
