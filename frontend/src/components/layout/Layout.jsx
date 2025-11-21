import { Flex, Box, useDisclosure, useColorModeValue, useBreakpointValue } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const { isOpen: sidebarOpen, onOpen, onClose } = useDisclosure();
  const { currentUser } = useAuthStore();
  const role = currentUser?.role || "guest";
  const location = useLocation();

  const sidebarWidth = collapsed ? "5rem" : "16rem";
  const bgMain = useColorModeValue("gray.50", "gray.900");

  // Detect if screen is desktop
  const isDesktop = useBreakpointValue({ base: false, md: true });

  // Auto-close sidebar on route change (for mobile)
  useEffect(() => {
    if (!isDesktop) onClose();
  }, [location.pathname, isDesktop]);

  return (
    <Flex minH="100vh" bg={bgMain} position="relative">
      {/* Mobile overlay */}
      {!isDesktop && sidebarOpen && (
        <Box
          position="fixed"
          inset="0"
          bg="blackAlpha.600"
          zIndex="overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      {isDesktop ? (
        // Desktop Sidebar
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          role={role}
          sidebarWidth={sidebarWidth}
        />
      ) : (
        // Mobile Sidebar
        <Sidebar
          sidebarOpen={sidebarOpen}
          onClose={onClose}
          role={role}
        />
      )}

      {/* Main content */}
      <Flex
        direction="column"
        flex="1"
        ml={isDesktop ? sidebarWidth : 0}
        transition="margin 0.25s ease"
        minH="100vh"
      >
        <Header collapsed={collapsed} sidebarOpen={sidebarOpen} onOpen={onOpen} />

        <Box mt="16" p="6" bg={bgMain} flex="1" overflowY="auto">
          {children || <Outlet />}
        </Box>
      </Flex>
    </Flex>
  );
}
