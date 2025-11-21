import { Flex, Text, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const MotionNav = motion(NavLink);

export default function NavItem({ to, icon, label, collapsed, onClick }) {
  return (
    <MotionNav to={to} onClick={onClick} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <Flex
          align="center"
          justify={collapsed ? "center" : "flex-start"}
          gap={collapsed ? 0 : 2}
          p="2"
          pl="3"
          rounded="md"
          bg={isActive ? "blue.100" : "transparent"}
          color={isActive ? "blue.900" : "gray.700"}
          position="relative"
          cursor="pointer"
          _hover={{ bg: "gray.100" }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isActive ? 5 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
          {!collapsed && <Text fontSize="sm">{label}</Text>}

          {isActive && (
            <Box
              position="absolute"
              insetY={1}
              left={0}
              w={1}
              roundedRight="md"
              bg="blue.400"
            />
          )}
        </Flex>
      )}
    </MotionNav>
  );
}
