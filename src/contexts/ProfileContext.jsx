import React, { createContext, useState, useContext } from 'react';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const [profile, setProfile] = useState({
        gymName: "Paramount Gym",
        owner: "Raj Sharma",
        phone: "9876543210",
        address: "Sector 9, Delhi",
        email: "contact@paramount.com",
        website: "www.paramountgym.com",
        logo: "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/back06.jpg", // Default logo
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