import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 500;
`;

const Button = styled.button`
  background-color: #000;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #333;
  }
`;

const SearchFilter = styled.div`
  display: flex;
  margin-bottom: 2rem;
  
  input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    margin-right: 1rem;
  }
  
  select {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
`;

const UsersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  
  background-color: ${props => {
    switch (props.role) {
      case 'admin':
        return '#e2f0fd';
      case 'staff':
        return '#d1e7dd';
      default:
        return '#f5f5f5';
    }
  }};
  
  color: ${props => {
    switch (props.role) {
      case 'admin':
        return '#0275d8';
      case 'staff':
        return '#28a745';
      default:
        return '#212529';
    }
  }};
`;

const ActionButton = styled.button`
  background-color: ${props => props.type === 'edit' ? '#ffc107' : '#dc3545'};
  color: ${props => props.type === 'edit' ? '#212529' : 'white'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  font-size: 0.9rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

// Modal components
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0;
  }
  
  button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'customer'
  });

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In a real application, you would fetch from your API
        // const res = await axios.get('/api/users');
        // setUsers(res.data.data);
        
        // Mock data for demonstration
        setUsers([
          { id: '1', username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: '2023-01-15' },
          { id: '2', username: 'staff1', email: 'staff1@example.com', role: 'staff', createdAt: '2023-02-10' },
          { id: '3', username: 'staff2', email: 'staff2@example.com', role: 'staff', createdAt: '2023-03-05' },
          { id: '4', username: 'customer1', email: 'customer1@example.com', role: 'customer', createdAt: '2023-04-20' },
          { id: '5', username: 'customer2', email: 'customer2@example.com', role: 'customer', createdAt: '2023-04-25' },
          { id: '6', username: 'customer3', email: 'customer3@example.com', role: 'customer', createdAt: '2023-05-01' },
        ]);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Handle opening the edit modal
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role
    });
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission for updating user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      // In a real application, you would update the user via API
      // await axios.put(`/api/users/${currentUser.id}`, formData);
      
      // Update local state for demonstration
      setUsers(users.map(user => 
        user.id === currentUser.id ? { ...user, ...formData } : user
      ));
      
      setShowModal(false);
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // In a real application, you would delete the user via API
        // await axios.delete(`/api/users/${userId}`);
        
        // Update local state for demonstration
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  if (loading) {
    return <PageContainer>Loading users...</PageContainer>;
  }

  return (
    <PageContainer>
      <Header>
        <Title>User Management</Title>
        <Button onClick={() => {
          setCurrentUser(null);
          setFormData({ username: '', email: '', role: 'customer' });
          setShowModal(true);
        }}>
          Add New User
        </Button>
      </Header>
      
      <SearchFilter>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </select>
      </SearchFilter>
      
      <UsersTable>
        <thead>
          <tr>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Joined Date</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <Td>{user.username}</Td>
              <Td>{user.email}</Td>
              <Td>
                <RoleBadge role={user.role}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </RoleBadge>
              </Td>
              <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
              <Td>
                <ActionButton 
                  type="edit" 
                  onClick={() => handleEditUser(user)}
                >
                  Edit
                </ActionButton>
                <ActionButton 
                  type="delete" 
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </UsersTable>
      
      {/* User Edit/Create Modal */}
      {showModal && (
        <ModalBackdrop>
          <ModalContent>
            <ModalHeader>
              <h2>{currentUser ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => setShowModal(false)}>&times;</button>
            </ModalHeader>
            
            <Form onSubmit={handleUpdateUser}>
              <FormGroup>
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormGroup>
              
              {!currentUser && (
                <FormGroup>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    onChange={handleInputChange}
                    required={!currentUser}
                  />
                </FormGroup>
              )}
              
              <ModalButtons>
                <Button type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">{currentUser ? 'Update' : 'Create'}</Button>
              </ModalButtons>
            </Form>
          </ModalContent>
        </ModalBackdrop>
      )}
    </PageContainer>
  );
};

export default UsersPage;