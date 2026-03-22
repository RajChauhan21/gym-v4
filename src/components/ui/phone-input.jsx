"use client";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export function PhoneNumberInput({ value, onChange, disabled }) {
  return (
    // <div className="flex items-center border rounded-md px-2 h-10 bg-background dark:text-white">
      <PhoneInput
        international
        defaultCountry="IN"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full dark:text-black dark:bg-white rounded-full p-1 px-2 mt-1"
      />
    // </div>
  );
}
