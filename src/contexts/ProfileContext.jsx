import React, { createContext, useState, useContext } from "react";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("userProfile");
    // 2. If it exists, parse and use it; otherwise, use defaults
    return savedProfile
      ? JSON.parse(savedProfile)
      : {
        ownerId: null,
        gymId: null,
        gymName: "Paramount Gym",
        owner: "Raj Sharma",
        phone: "9876543210",
        address: "Sector 9, Delhi",
        email: "contact@paramount.com",
        website: "www.paramountgym.com",
        gymLogo: "https://googleapis.com",
        ownerLogo: "https://codeskulptor-demos.commondatastorage.googleapis.com/AddressableObject/ironman.jpg",
        googleMapUrl: "https://maps.google.com/?q=paramount+gym",
      };
  });

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
