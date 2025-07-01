import React from 'react';
import { Select, SelectItem } from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import i18n, { languages } from "../../i18n";
import { setLanguage } from "@/store/reducers/languageSlice";

const LanguageSwitcher = ({ className = "", size = "sm" }) => {
  const dispatch = useDispatch();
  const reduxLanguage = useSelector((state) => state.language.value);

  const handleSelectionChange = async (event) => {
    const selectedLanguage = event.target.value;
    await i18n.changeLanguage(selectedLanguage);
    dispatch(setLanguage(selectedLanguage));
    document.documentElement.setAttribute("dir", i18n.dir(selectedLanguage));
  };

  return (
    <Select
      disallowEmptySelection
      defaultSelectedKeys={[reduxLanguage]}
      onChange={handleSelectionChange}
      className={`w-28 ${className}`}
      size={size}
      aria-label="Select language"
    >
      {Object.entries(languages).map(([code, name]) => (
        <SelectItem key={code} value={code}>
          {name}
        </SelectItem>
      ))}
    </Select>
  );
};

export default LanguageSwitcher;