"use client";

import { AutocompleteRoot, SearchIcon } from "@yamada-ui/react";
import { COLORS } from "./ui";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  items: string[];
  placeholder?: string;
};

/**
 * Wardrobe search built on Yamada UI's Autocomplete: it suggests piece names
 * and categories while staying a free-text filter.
 */
export function SearchBar({ value, onChange, items, placeholder = "Search your wardrobe..." }: SearchBarProps) {
  return (
    <AutocompleteRoot
      items={items.map((item) => ({ label: item, value: item, query: item }))}
      value={value}
      inputValue={value}
      onChange={onChange}
      onInputChange={onChange}
      allowCustomValue
      clearable
      placeholder={placeholder}
      bg={COLORS.paper}
      borderWidth="1px"
      borderColor={COLORS.line}
      rounded="0"
      minH="52px"
      px="3"
      py="2"
      icon={<SearchIcon style={{ width: 18, height: 18, color: COLORS.orange }} />}
      inputProps={{
        "aria-label": "Search my wardrobe",
        bg: "transparent",
        border: "0",
        px: "0",
        py: "2",
        height: "auto",
        fontSize: "13px",
        color: COLORS.ink,
        _focus: { outline: "none", boxShadow: "none" },
      }}
      contentProps={{
        bg: COLORS.paper,
        borderWidth: "1px",
        borderColor: COLORS.line,
        rounded: "8px",
        boxShadow: "0 18px 44px rgba(23,22,21,.16)",
        p: "1.5",
      }}
      optionProps={{ fontSize: "13px", px: "2.5", py: "2", rounded: "6px" }}
      emptyMessage="No matching pieces"
    />
  );
}

