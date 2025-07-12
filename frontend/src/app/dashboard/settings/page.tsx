"use client";
import React, { useState } from 'react';
import SettingsPage from '../components/SettingsPage';

export default function Page() {
  const [firstName] = useState('');
  const [lastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleUpdateEmail = () => {
    // Implement real update logic here
    alert('Email updated! (implement real logic)');
  };

  const handleUpdatePhoneNumber = () => {
    // Implement real update logic here
    alert('Phone number updated! (implement real logic)');
  };

  return (
    <SettingsPage
      firstName={firstName}
      lastName={lastName}
      email={email}
      setEmail={setEmail}
      handleUpdateEmail={handleUpdateEmail}
      phoneNumber={phoneNumber}
      setPhoneNumber={setPhoneNumber}
      handleUpdatePhoneNumber={handleUpdatePhoneNumber}
    />
  );
} 