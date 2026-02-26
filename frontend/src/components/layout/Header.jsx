import { Flex, Box, Text, IconButton, useColorModeValue } from "@chakra-ui/react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import ProfileAvatar from "../../pages/student/profile/ProfileAvatar";
import { useAuthStore } from "../../store/auth";

const MotionFlex = motion(Flex);

// Helper: capitalize each word
const capitalizeWords = (str) =>
  str
    ? str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
    : "";

export default function Header({ collapsed, sidebarOpen, onOpen }) {
  const sidebarWidth = collapsed ? "5rem" : "16rem";
  const { currentUser } = useAuthStore();

  // Capitalized full name
  const fullName = capitalizeWords(currentUser?.name || "User");
  // First name only
  const firstName = fullName.split(" ")[0];

  return (
    <MotionFlex
      position="fixed"
      top={0}
      left={{ base: 0, md: sidebarWidth }}
      w={{ base: "100%", md: `calc(100% - ${sidebarWidth})` }}
      h="16"
      bg={useColorModeValue("whiteAlpha.800", "gray.700")}
      borderBottom="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.600")}
      align="center"
      justify="space-between"
      px={4}
      backdropFilter="saturate(180%) blur(5px)"
      zIndex={30}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      
    >
      {/* Left: Mobile menu toggle + Logo */}
      <Flex align="center" gap={2}>
        <IconButton
          display={{ base: "flex", md: "none" }}
          icon={sidebarOpen ? <X /> : <Menu />}
          onClick={onOpen}
          aria-label="Toggle menu"
          size="sm"
          variant="ghost"
        />
        <Text
          fontSize="lg"
          fontWeight="bold"
          color="blue.700"
          display={{ base: "block", md: "none" }}
        >
          LumiRise
        </Text>
      </Flex>

      {/* Right: Welcome + Avatar */}
      <Flex align="center" gap={4}>
        <Text fontWeight="medium">
          Welcome, {firstName}
        </Text>
        <ProfileAvatar name={fullName} />
      </Flex>
    </MotionFlex>
  );
}
