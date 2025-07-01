// Filter.jsx
import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Input,
  Chip,
  Button,
  Accordion,
  AccordionItem,
  Slider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

import {
  RiCheckLine,
  RiVerifiedBadgeFill,
  RiMoneyDollarCircleLine,
  RiPriceTag3Line,
  RiLinksLine,
  RiPriceTag2Line,
  RiFilterLine,
} from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { getCurrencySymbol } from "@/helpers/functionHelper";

const FilterContent = ({
  t,
  selectedKeys,
  setSelectedKeys,
  renderFilterOptions,
  applyFilters,
  handleReset,
  priceRanges,
  handlePriceRangeClick,
  sliderValue,
  handleSliderChange,
  minPrice,
  handleMinPriceChange,
  maxPrice,
  handleMaxPriceChange,
  currency,
  onClose,
  isMobile,
}) => (
  <div className="w-full px-0">
    <Accordion
      variant="light"
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
      selectionMode="multiple"
    >
      <AccordionItem
        key="1"
        aria-label="Type"
        title="Type"
        indicator={<RiVerifiedBadgeFill />}
      >
        <div className="flex flex-wrap">{renderFilterOptions("Type")}</div>
      </AccordionItem>

      <AccordionItem
        key="2"
        aria-label="Sort by Price"
        title="Sort by Price"
        indicator={<RiMoneyDollarCircleLine />}
      >
        <div className="flex flex-wrap">{renderFilterOptions("Price")}</div>
      </AccordionItem>

      <AccordionItem
        key="3"
        aria-label="Price Range"
        title="Price Range"
        indicator={<RiPriceTag2Line />}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-default-700">{t("quick_selection")}</p>
            <div className="flex flex-wrap gap-2">
              {priceRanges.map((range, index) => (
                <Chip
                  key={index}
                  variant={
                    minPrice === range.min.toString() &&
                    maxPrice === range.max.toString()
                      ? "solid"
                      : "bordered"
                  }
                  className="cursor-pointer"
                  onClick={() => handlePriceRangeClick(range.min, range.max)}
                >
                  {range.label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-default-700">
              {t("drag_to_select_range")}
            </p>
            <Slider
              size="sm"
              label="Price Range"
              step={50}
              minValue={0}
              maxValue={1000}
              value={sliderValue}
              onChange={handleSliderChange}
              className="max-w-md"
              formatOptions={{ style: "currency", currency: "INR" }}
            />
          </div>
         

          <div className="space-y-2">
            <p className="text-sm text-default-700">{t("custom_range")}</p>
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                label="Min"
                placeholder="0"
                value={minPrice}
                onChange={handleMinPriceChange}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">
                      {currency}
                    </span>
                  </div>
                }
                className="w-full"
              />
              <span className="text-default-400">-</span>
              <Input
                type="text"
                label="Max"
                placeholder="1000"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">
                      {currency}
                    </span>
                  </div>
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem
        key="4"
        aria-label="Category"
        title="Category"
        indicator={<RiPriceTag3Line />}
      >
        <div className="flex flex-wrap">{renderFilterOptions("Category")}</div>
      </AccordionItem>
    </Accordion>

    <div className="space-x-4 mt-4">
      <Button
        onPress={() => {
          handleReset();
          if (isMobile) onClose?.();
        }}
        className="font-bold rounded"
        variant="bordered"
      >
        {t("reset_filters")}
      </Button>
      <Button
        onPress={() => {
          applyFilters();
          if (isMobile) onClose?.();
        }}
        className="bg-primary-500 text-white font-bold rounded"
      >
        {t("apply_filters")}
      </Button>
    </div>
  </div>
);

const Filter = ({
  onCategorySelection,
  onTypeSelection,
  onPriceSelection,
  onPriceRangeSelection,
  indicatorType,
  selectedCategory,
  selectedPrice,
  isMobile = false,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();

  const homeStoreData = useSelector((state) => state.homepage);
  const categories = homeStoreData?.categories;
  const currency = useSelector((state) => state.settings.value.currency);

  const [type, setType] = useState(indicatorType);
  const [priceOrder, setPriceOrder] = useState(selectedPrice);
  const [selectedCategoryState, setSelectedCategoryState] =
    useState(selectedCategory);
  const [searchValue, setSearchValue] = useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(
    new Set(["1", "2", "3", "4"])
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sliderValue, setSliderValue] = useState([0, 1000]);

  const filterOptions = useMemo(() => {
    const categoryOptions = categories.map((category) => ({
      name: category.name,
      category: "Category",
      id: category.id,
    }));

    return [
      {
        name: "Veg",
        category: "Type",
        icon: <RiVerifiedBadgeFill className="text-green-500" />,
      },
      {
        name: "Non - Veg",
        category: "Type",
        icon: <RiVerifiedBadgeFill className="text-red-500" />,
      },
      {
        name: "Low to High",
        category: "Price",
      },
      {
        name: "High to Low",
        category: "Price",
      },
      ...categoryOptions,
    ];
  }, [categories]);

  const filteredOptions = useMemo(
    () =>
      filterOptions.filter((option) => {
        if (typeof option.name === "string") {
          return option.name.toLowerCase().includes(searchValue.toLowerCase());
        }
        console.warn(`Option name is not a string:`, option);
        return false;
      }),
    [filterOptions, searchValue]
  );

  const handleOptionSelection = (option) => {
    if (option.category === "Type") {
      setType((prevType) => (prevType === option.name ? "" : option.name));
    } else if (option.category === "Price") {
      setPriceOrder((prevPrice) =>
        prevPrice === option.name ? "" : option.name
      );
    } else if (option.category === "Category") {
      setSelectedCategoryState((prevId) =>
        prevId === option.id ? "" : option.id
      );
    }
    setSearchValue("");
  };

  const priceRanges = [
    { label: `Under ${currency}500`, min: 0, max: 500 },
    { label: `${currency}500 - ${currency}750`, min: 500, max: 750 },
    { label: `${currency}750 - ${currency}1,000`, min: 750, max: 1000 },
  ];

  const handleSliderChange = (value) => {
    setSliderValue(value);
    setMinPrice(value[0].toString());
    setMaxPrice(value[1].toString());
  };

  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setMinPrice(value);
    }
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setMaxPrice(value);
    }
  };

  const handleReset = () => {
    setType("");
    setPriceOrder("");
    setSelectedCategoryState("");
    setSearchValue("");
    setMinPrice("");
    setMaxPrice("");
    setSliderValue([0, 1000]);

    // Call all reset handlers
    onTypeSelection("");
    onPriceSelection("");
    onCategorySelection("");
    onPriceRangeSelection({ min_price: "", max_price: "" });
  };

  const applyFilters = () => {
    const updates = {
      type: type !== indicatorType ? type : undefined,
      priceOrder: priceOrder !== selectedPrice ? priceOrder : undefined,
      category:
        selectedCategoryState !== selectedCategory
          ? selectedCategoryState
          : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    };

    // Only trigger updates for changed values
    if (updates.type !== undefined) onTypeSelection(updates.type);
    if (updates.priceOrder !== undefined) onPriceSelection(updates.priceOrder);
    if (updates.category !== undefined) onCategorySelection(updates.category);
    if (updates.minPrice !== undefined || updates.maxPrice !== undefined) {
      onPriceRangeSelection({
        min_price: updates.minPrice || "",
        max_price: updates.maxPrice || "",
      });
    }
  };

  const handlePriceRangeClick = (min, max) => {
    setMinPrice(min.toString());
    setMaxPrice(max.toString());
    setSliderValue([min, max]);
  };

  const renderFilterOptions = (category) => {
    return filteredOptions
      .filter((option) => option.category === category)
      .map((option, index) => (
        <Chip
          key={`${option.category}-${option.name}-${index}`}
          variant={
            (option.category === "Category" &&
              selectedCategoryState === option.id) ||
            (option.category !== "Category" &&
              (type === option.name || priceOrder === option.name))
              ? "solid"
              : "bordered"
          }
          color="default"
          onClick={() => handleOptionSelection(option)}
          className="m-1 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {option.icon}
              <span className="ml-1 truncate max-w-[150px] overflow-hidden" title={option.name}>
                {option.name}
              </span>
            </div>
            {((option.category === "Category" &&
              selectedCategoryState === option.id) ||
              (option.category !== "Category" &&
                (type === option.name || priceOrder === option.name))) && (
              <RiCheckLine className="ml-2" />
            )}
          </div>
        </Chip>
      ));
  };

  if (isMobile) {
    return (
      <>
        <Button
          onPress={onOpen}
          className="fixed bottom-4 right-4 z-50 bg-primary-500 text-white rounded-full shadow-lg"
          isIconOnly
        >
          <RiFilterLine className="text-xl" />
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={onClose}
          scrollBehavior="inside"
          size="full"
          placement="bottom"
          className="h-[90vh]"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">Filter</ModalHeader>
            <ModalBody>
              <FilterContent
                t={t}
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
                renderFilterOptions={renderFilterOptions}
                applyFilters={applyFilters}
                handleReset={handleReset}
                priceRanges={priceRanges}
                handlePriceRangeClick={handlePriceRangeClick}
                sliderValue={sliderValue}
                handleSliderChange={handleSliderChange}
                minPrice={minPrice}
                handleMinPriceChange={handleMinPriceChange}
                maxPrice={maxPrice}
                handleMaxPriceChange={handleMaxPriceChange}
                currency={currency}
                onClose={onClose}
                isMobile={true}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  }

  return (
    <div className="w-full max-w-xs">
      <FilterContent
        t={t}
        selectedKeys={selectedKeys}
        setSelectedKeys={setSelectedKeys}
        renderFilterOptions={renderFilterOptions}
        applyFilters={applyFilters}
        handleReset={handleReset}
        priceRanges={priceRanges}
        handlePriceRangeClick={handlePriceRangeClick}
        sliderValue={sliderValue}
        handleSliderChange={handleSliderChange}
        minPrice={minPrice}
        handleMinPriceChange={handleMinPriceChange}
        maxPrice={maxPrice}
        handleMaxPriceChange={handleMaxPriceChange}
        currency={currency}
        isMobile={false}
      />
    </div>
  );
};

export default Filter;
