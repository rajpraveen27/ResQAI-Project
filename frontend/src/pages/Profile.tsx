import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile: React.FC = () => {
  const { user } = useAuth(); // Profile component doesn't need login, as auth is handled by provider
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo_token'}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update local context
        // Note: For now we'll just show success. In a real app, 
        // the context would have an updateProfile function.
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error.' });
    }
  };

  if (!user) return <div className="page-container">Please login to view profile.</div>;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">👤 My Profile</h1>
      </div>

      <div className="profile-container glass-card">
        <div className="profile-top">
          <div className="profile-avatar-large">
            {user.avatar || user.name[0]}
          </div>
          <div className="profile-info-main">
            <h2>{user.name}</h2>
            <span className={`role-badge role-${user.role}`}>{user.role.toUpperCase()}</span>
            <p className="profile-email">{user.email}</p>
          </div>
          {!isEditing && (
            <button className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
          )}
        </div>

        {message && (
          <div className={`status-message ${message.type}`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        <div className="profile-details-grid">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  className="form-input" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  className="form-input" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="form-group">
                <label>Base Location</label>
                <input 
                  className="form-input" 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="City, State"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          ) : (
            <div className="details-list">
              <div className="detail-item">
                <label>Phone</label>
                <p>{user.phone || 'Not provided'}</p>
              </div>
              <div className="detail-item">
                <label>Location</label>
                <p>{user.location || 'Not provided'}</p>
              </div>
              <div className="detail-item">
                <label>Account Status</label>
                <p><span className="status-dot online"></span> Active & Verified</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
