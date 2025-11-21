import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, Box, Flex, Text, Button } from "@chakra-ui/react";
import { LogOut, User } from "lucide-react";
import { useAuthStore } from "../store/auth";

const MotionBox = motion(Box);

// Capitalize each word in a string
const capitalizeWords = (str) =>
  str
    ? str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
    : "";

export default function ProfileAvatar({ imageUrl = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();

  const username = capitalizeWords(currentUser?.name || "Guest");
  const role = currentUser?.role || "Guest";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const navigateTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleSignout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Box position="relative" ref={menuRef}>
      {/* Avatar Button */}
      <MotionBox
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        cursor="pointer"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Profile menu"
      >
        <Avatar
          name={username} // This ensures initials are capitalized
          src={imageUrl}
          size="md"
          bg={role === "admin" ? "red.200" : "green.200"}
          color={role === "admin" ? "red.900" : "green.900"}
        />
      </MotionBox>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            position="absolute"
            right={0}
            mt={2}
            w="56"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            shadow="md"
            zIndex={50}
            role="menu"
          >
            {/* User info */}
            <Box px={4} py={3} borderBottom="1px solid" borderColor="gray.200">
              <Text fontWeight="bold">{username}</Text>
              <Text fontSize="sm" color="gray.500">{role.toUpperCase()}</Text>
            </Box>

            {/* Menu items */}
            <Flex direction="column">
              <Button
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<User size={18} />}
                onClick={() => navigateTo("/profile")}
                _hover={{ bg: "gray.100" }}
                size="sm"
              >
                Profile
              </Button>
              <Button
                variant="ghost"
                justifyContent="flex-start"
                leftIcon={<LogOut size={18} />}
                onClick={handleSignout}
                _hover={{ bg: "gray.100" }}
                color="red.600"
                size="sm"
              >
                Logout
              </Button>
            </Flex>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}
