import React from "react";
import { useTranslation } from "react-i18next";

const SectionHeading = ({ title, shortDescription, onShowMoreClick }) => {
  const { t } = useTranslation();

  return (
    <div className="text-center my-4">
      {/* Title */}
      <h1 className="text-md sm:text-2xl font-bold">{title}</h1>

      {/* Short Description */}
      {shortDescription && (
        <p className="text-sm text-gray-600 my-2">{shortDescription}</p>
      )}

      {/* Show More Button */}
      {onShowMoreClick && (
        <div className="flex justify-center mt-2">
          <button
            onClick={onShowMoreClick}
            className="text-sm sm:text-md font-semibold text-primary-500 hover:underline"
          >
            {t("show_more")}
          </button>
        </div>
      )}
    </div>
  );
};

export default SectionHeading;
