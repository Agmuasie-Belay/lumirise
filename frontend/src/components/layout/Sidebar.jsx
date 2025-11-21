import { forwardRef } from "react";
import { Box, Flex, Button, IconButton, useColorModeValue } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid, Calendar, BookOpen, Users, LayoutDashboard, Activity,
  ChevronLeft, ChevronRight, FileText, Users2, Feather, X,
} from "lucide-react";
import NavItem from "./NavItem";
import { useLocation } from "react-router-dom";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const Sidebar = forwardRef(
  ({ collapsed, setCollapsed, sidebarOpen, onClose, role, sidebarWidth }, ref) => {
    const location = useLocation();

    const bg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("gray.200", "gray.700");
    const highlight = useColorModeValue("blue.50", "gray.700");
    const hover = useColorModeValue("blue.100", "gray.600");

    const menuItems = {
      student: [
        { to: "/student/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
        { to: "/student/modules", icon: <Grid size={20} />, label: "My Modules" },
        { to: "/student/journal", icon: <BookOpen size={20} />, label: "Daily Journal" },
      ],
      tutor: [
        { to: "/tutor/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
        { to: "/tutor/modules", icon: <Grid size={20} />, label: "My Modules" },
        { to: "/tutor/students", icon: <Users size={20} />, label: "Students" },
        { to: "/tutor/journals", icon: <Calendar size={20} />, label: "Student Journals" },
      ],
      admin: [
        { to: "/admin/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
        { to: "/admin/modules", icon: <Grid size={20} />, label: "Modules" },
        { to: "/admin/tutors", icon: <BookOpen size={20} />, label: "Tutors" },
        { to: "/admin/students", icon: <Users2 size={20} />, label: "Students" },
        { to: "/admin/activity", icon: <Activity size={20} />, label: "Recent Activity" },
        { to: "/admin/reports", icon: <FileText size={20} />, label: "Reports" },
      ],
    };

    const sidebarVariants = {
      open: { width: "16rem" },
      collapsed: { width: "5rem" },
    };

    const renderNavItem = (item) => (
      <Box
        key={item.to}
        bg={location.pathname === item.to ? highlight : "transparent"}
        rounded="md"
        transition="0.2s ease"
        _hover={{ bg: hover }}
        onClick={onClose}
      >
        <NavItem {...item} collapsed={collapsed} />
      </Box>
    );

    // **Desktop Sidebar**
    if (sidebarWidth) {
      return (
        <MotionBox
          ref={ref}
          display={{ base: "none", md: "block" }}
          position="fixed"
          top="0"
          left="0"
          h="100vh"
          bg={bg}
          borderRight="1px solid"
          borderColor={border}
          shadow="md"
          variants={sidebarVariants}
          animate={collapsed ? "collapsed" : "open"}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          zIndex="docked"
        >
          <Flex h="16" align="center" justify="center" borderBottom="1px solid" borderColor={border} fontWeight="bold" fontSize="xl">
            {!collapsed ? "LumiRise" : <Feather size={22} />}
          </Flex>

          <Box mt="4" px="2" overflowY="auto" maxH="calc(100vh - 6rem)">
            {menuItems[role]?.map(renderNavItem)}
          </Box>

          <Flex h="14" borderTop="1px solid" borderColor={border} align="center" justify="center" position="absolute" bottom="0" w="full" bg={bg}>
            <MotionButton onClick={() => setCollapsed(!collapsed)} variant="ghost" size="sm" whileHover={{ scale: 1.15 }} aria-label="Collapse sidebar">
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </MotionButton>
          </Flex>
        </MotionBox>
      );
    }

    // **Mobile Sidebar**
    return (
      <AnimatePresence>
        {sidebarOpen && (
          <MotionBox
            display={{ base: "block", md: "none" }}
            position="fixed"
            top="0"
            left="0"
            h="100vh"
            w="16rem"
            bg={bg}
            borderRight="1px solid"
            borderColor={border}
            shadow="2xl"
            zIndex="popover"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
          >
            <IconButton
              icon={<X size={20} />}
              aria-label="Close sidebar"
              variant="ghost"
              size="sm"
              position="absolute"
              top="4"
              right="4"
              onClick={onClose}
            />

            <Flex h="16" align="center" justify="center" borderBottom="1px solid" borderColor={border} fontWeight="bold" fontSize="xl">
              LumiRise
            </Flex>

            <Box mt="4" px="2" overflowY="auto" maxH="calc(100vh - 6rem)">
              {menuItems[role]?.map(renderNavItem)}
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>
    );
  }
);

export default Sidebar;
