import {
  Flex,
  Text,
  IconButton,
  useColorModeValue,
  useBreakpointValue,
  Button,Box,
} from "@chakra-ui/react";
import { Menu, X, ChevronDown,Feather } from "lucide-react";
import { motion } from "framer-motion";
import ProfileAvatar from "../../pages/student/profile/ProfileAvatar";
import { useAuthStore } from "../../store/auth";

const MotionFlex = motion(Flex);

// Helper
const capitalizeWords = (str) =>
  str
    ? str
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ")
    : "";

export default function Header({
  variant = "layout", // "layout" | "module"
  collapsed = false,
  sidebar = {},
  lessons = {},
}) {
  const { currentUser } = useAuthStore();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const sidebarWidth = collapsed ? "5rem" : "16rem";

  const { isOpen: sidebarOpen, onToggle: toggleSidebar } = sidebar;
  const { isOpen: lessonOpen, onToggle: toggleLessons } = lessons;

  const fullName = capitalizeWords(currentUser?.name || "User");
  const firstName = fullName.split(" ")[0];

  return (
    <MotionFlex
      position="fixed"
      top={0}
      left={variant === "layout" ? { base: 0, md: sidebarWidth } : 0}
      w={
        variant === "layout"
          ? { base: "100%", md: `calc(100% - ${sidebarWidth})` }
          : "100%"
      }
      h="16"
      bg={useColorModeValue("whiteAlpha.900", "gray.800")}
      borderBottom="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      align="center"
      justify="space-between"
      px={4}
      backdropFilter="saturate(180%) blur(6px)"
      zIndex={30}
      initial={{ y: -15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* LEFT SECTION */}
      <Flex align="center" gap={3}>
        {/* Layout sidebar toggle (mobile only) */}
        {variant === "layout" && (
          <IconButton
            display={{ base: "flex", md: "none" }}
            icon={sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            size="sm"
            variant="ghost"
          />
        )}


       {!isMobile &&variant === "module"&& (
          <Flex h="16" align="center" justify="center" borderBottom="1px solid" borderColor="gray.100" fontWeight="bold" fontSize="xl">
            {!collapsed ? "LumiRise" : <Feather size={22} />}
          </Flex>
        )}

        {/* Module lessons toggle (mobile only) */}
        {variant === "module" && isMobile && (
          <Button
            rightIcon={<ChevronDown size={16} />}
            onClick={toggleLessons}
            size="sm"
            bg="blue.600"
            color="yellow"
            _hover={{ bg: "blue.700" }}
          >
            Lessons
          </Button>
        )}

        {/* Logo (desktop layout only) */}
         {/* {variant === "layout" && !isMobile && (
          <Text fontSize="lg" fontWeight="bold" color="blue.700" zIndex="1000">
            Lumi<span style={{ color: "#D4AF37" }}>Rise</span>
          </Text>
        )}  */}
      </Flex>

      {/* RIGHT SECTION */}
      <Flex align="center" gap={4}>
        {!isMobile && (
          <Text fontWeight="medium" >
            Welcome, {firstName}
          </Text>
        )}

        <ProfileAvatar name={fullName} />
      </Flex>
    </MotionFlex>
  );
}