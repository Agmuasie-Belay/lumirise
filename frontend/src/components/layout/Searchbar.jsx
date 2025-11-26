import { Box, Input, InputGroup, InputLeftElement, List, ListItem } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useState } from "react";

const Searchbar = () => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Example data
  const items = ["Apple", "Apricot", "Banana", "Blackberry", "Cherry", "Date", "Elderberry"];

  // Filtered results
  const filtered = items.filter(item =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Box w="300px" m="4" position="relative">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search fruits..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 100)} // small delay to allow click
        />
      </InputGroup>

      {showDropdown && filtered.length > 0 && (
        <List
          position="absolute"
          top="100%"
          left="0"
          right="0"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          maxH="150px"
          overflowY="auto"
          zIndex={10}
        >
          {filtered.map((item, index) => (
            <ListItem
              key={index}
              px="4"
              py="2"
              _hover={{ bg: "gray.100", cursor: "pointer" }}
              onMouseDown={() => {
                setQuery(item);
                setShowDropdown(false);
              }}
            >
              {item}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default Searchbar;
