// Example usage of Member Redux Slice in React components

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchMembersThunk,
  fetchMemberByIdThunk,
  createMemberThunk,
  updateMemberThunk,
  deleteMemberThunk,
  assignRoleThunk,
  fetchMembersByRoleThunk,
  searchMembersThunk
} from './memberThunks';

import {
  clearError,
  clearCurrentMember,
  setFilters,
  resetFilters
} from './memberSlice';

// Example Component: Member List
const MemberListExample = () => {
  const dispatch = useDispatch();
  const {
    members,
    loading,
    error,
    pagination,
    stats,
    filters
  } = useSelector((state) => state.member);

  // Fetch members on component mount
  useEffect(() => {
    dispatch(fetchMembersThunk({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Handle pagination
  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
    dispatch(fetchMembersThunk({ ...filters, page }));
  };

  // Handle search
  const handleSearch = (query) => {
    dispatch(setFilters({ search: query, page: 1 }));
    dispatch(searchMembersThunk({ query, page: 1, limit: filters.limit }));
  };

  return (
    <div>
      <h2>Members ({stats.total})</h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      
      <div>
        {members.map(member => (
          <div key={member.id}>
            <p>{member.name} - {member.email} - {member.role}</p>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div>
        <button 
          disabled={!pagination.hasPrev} 
          onClick={() => handlePageChange(pagination.currentPage - 1)}
        >
          Previous
        </button>
        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
        <button 
          disabled={!pagination.hasNext} 
          onClick={() => handlePageChange(pagination.currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Example Component: Create Member Form
const CreateMemberExample = () => {
  const dispatch = useDispatch();
  const { loading, error, validationErrors } = useSelector((state) => state.member);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'USER'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createMemberThunk(formData)).unwrap();
      // Success - reset form
      setFormData({ name: '', email: '', mobile: '', password: '', role: 'USER' });
      alert('Member created successfully!');
    } catch (error) {
      // Error handling is managed by Redux state
      console.error('Failed to create member:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Member</h2>
      
      {error && <div className="error">{error}</div>}
      
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        {validationErrors.name && <span className="error">{validationErrors.name}</span>}
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {validationErrors.email && <span className="error">{validationErrors.email}</span>}
      </div>

      <div>
        <label>Mobile:</label>
        <input
          type="tel"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          required
        />
        {validationErrors.mobile && <span className="error">{validationErrors.mobile}</span>}
      </div>

      <div>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {validationErrors.password && <span className="error">{validationErrors.password}</span>}
      </div>

      <div>
        <label>Role:</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="EMPLOYEE">Employee</option>
        </select>
        {validationErrors.role && <span className="error">{validationErrors.role}</span>}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Member'}
      </button>
    </form>
  );
};

// Example Component: Member Profile/Edit
const MemberProfileExample = ({ memberId }) => {
  const dispatch = useDispatch();
  const { currentMember, loading, error, validationErrors } = useSelector((state) => state.member);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (memberId) {
      dispatch(fetchMemberByIdThunk(memberId));
    }
  }, [dispatch, memberId]);

  useEffect(() => {
    if (currentMember && isEditing) {
      setEditData({
        name: currentMember.name,
        email: currentMember.email,
        mobile: currentMember.mobile,
        role: currentMember.role
      });
    }
  }, [currentMember, isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    dispatch(clearError());
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({});
    dispatch(clearError());
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateMemberThunk({ 
        userId: currentMember.id, 
        userData: editData 
      })).unwrap();
      setIsEditing(false);
      alert('Member updated successfully!');
    } catch (error) {
      console.error('Failed to update member:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await dispatch(deleteMemberThunk(currentMember.id)).unwrap();
        alert('Member deleted successfully!');
        dispatch(clearCurrentMember());
      } catch (error) {
        console.error('Failed to delete member:', error);
      }
    }
  };

  const handleRoleChange = async (newRole) => {
    try {
      await dispatch(assignRoleThunk({
        userId: currentMember.id,
        role: newRole
      })).unwrap();
      alert('Role updated successfully!');
    } catch (error) {
      console.error('Failed to assign role:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!currentMember) return <p>Member not found</p>;

  return (
    <div>
      <h2>Member Profile</h2>
      
      {!isEditing ? (
        <div>
          <p><strong>Name:</strong> {currentMember.name}</p>
          <p><strong>Email:</strong> {currentMember.email}</p>
          <p><strong>Mobile:</strong> {currentMember.mobile}</p>
          <p><strong>Role:</strong> {currentMember.role}</p>
          <p><strong>Created:</strong> {new Date(currentMember.createdAt).toLocaleDateString()}</p>
          
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete} style={{marginLeft: '10px', backgroundColor: 'red'}}>
            Delete
          </button>
          
          <div style={{marginTop: '20px'}}>
            <strong>Assign Role:</strong>
            <select onChange={(e) => handleRoleChange(e.target.value)} value={currentMember.role}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdateSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              required
            />
            {validationErrors.name && <span className="error">{validationErrors.name}</span>}
          </div>

          <div>
            <label>Email:</label>
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({...editData, email: e.target.value})}
              required
            />
            {validationErrors.email && <span className="error">{validationErrors.email}</span>}
          </div>

          <div>
            <label>Mobile:</label>
            <input
              type="tel"
              value={editData.mobile}
              onChange={(e) => setEditData({...editData, mobile: e.target.value})}
              required
            />
            {validationErrors.mobile && <span className="error">{validationErrors.mobile}</span>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </button>
          <button type="button" onClick={handleCancelEdit} style={{marginLeft: '10px'}}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

// Example Component: Filter by Role
const MembersByRoleExample = () => {
  const dispatch = useDispatch();
  const { membersByRole, loading, pagination } = useSelector((state) => state.member);
  const [selectedRole, setSelectedRole] = useState('ADMIN');

  useEffect(() => {
    if (selectedRole) {
      dispatch(fetchMembersByRoleThunk({ 
        role: selectedRole, 
        page: 1, 
        limit: 10 
      }));
    }
  }, [dispatch, selectedRole]);

  return (
    <div>
      <h2>Members by Role</h2>
      
      <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
        <option value="ADMIN">Admin</option>
        <option value="USER">User</option>
        <option value="MANAGER">Manager</option>
        <option value="EMPLOYEE">Employee</option>
      </select>

      {loading && <p>Loading...</p>}
      
      <div>
        {membersByRole.map(member => (
          <div key={member.id}>
            <p>{member.name} - {member.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example of cleanup on component unmount
const useCleanupMemberState = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      // Clear error and current member when component unmounts
      dispatch(clearError());
      dispatch(clearCurrentMember());
    };
  }, [dispatch]);
};

export {
  MemberListExample,
  CreateMemberExample,
  MemberProfileExample,
  MembersByRoleExample,
  useCleanupMemberState
};
