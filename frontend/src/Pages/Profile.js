import React from 'react';

const Profile = () => {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  })();

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <h1>Profile</h1>
      {user ? (
        <div style={{ marginTop: 16 }}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {user.role && <p><strong>Role:</strong> {user.role}</p>}
        </div>
      ) : (
        <p>No user info available.</p>
      )}
    </div>
  );
};

export default Profile;
