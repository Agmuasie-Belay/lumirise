import {
  Box,
  Flex,
  Button,
  Text,
  Container,
  HStack,
  IconButton,
  useDisclosure,
  VStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  Divider,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  const links = [
    { label: "Explore", to: "/modules" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <Box
      bg="blue.900"
      borderBottom="1px solid"
      borderColor="blue.200"
      position="fixed"
      top="0"
      w="full"
      zIndex="50"
      backdropFilter="blur(10px)"
    >
      <Container maxW="1200px">
        <Flex h={16} align="center" justify="space-between" position="sticky">
          {/* LOGO */}
          <Text
            fontSize="xl"
            fontWeight="extrabold"
            letterSpacing="tight"
            bgGradient="linear(to-r, yellow.500, yellow.400)"
            bgClip="text"
          >
            <Link to="/">LumiRise</Link>
          </Text>

          {/* DESKTOP NAV */}
          <HStack spacing={10} display={{ base: "none", md: "flex" }}>
            {links.map((link) => {
              const isActive = location.pathname === link.to;

              return (
                <Box key={link.to} position="relative">
                  <Link to={link.to}>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={isActive ? "yellow.500" : "gray.300"}
                      _hover={{ color: "white" }}
                      transition="color 0.2s ease"
                    >
                      {link.label}
                    </Text>
                  </Link>

                  {/* Animated Underline */}
                  {isActive && (
                    <MotionBox
                      layoutId="navbar-underline"
                      position="absolute"
                      bottom="-6px"
                      left="0"
                      right="0"
                      height="2px"
                      bg="blue.500"
                      borderRadius="full"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </Box>
              );
            })}

            <Link to="/login">
              <Button
                size="sm"
                variant="solid"
                colorScheme="blue"
                borderRadius="full"
                px={6}
              >
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" colorScheme="yellow" borderRadius="full" px={6}>
                Sign up
              </Button>
            </Link>
          </HStack>

          {/* MOBILE MENU BUTTON */}
          <IconButton
            display={{ base: "flex", md: "none" }}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            color="white"
                      variant="ghost"
            onClick={isOpen ? onClose : onOpen}
            aria-label="Toggle Navigation"
          />
        </Flex>
      </Container>

      {/* MOBILE DRAWER */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody mt={10}>
            <VStack align="start" spacing={6}>
              {links.map((link) => (
                <Link key={link.to} to={link.to} onClick={onClose}>
                  <Text fontSize="lg">{link.label}</Text>
                </Link>
              ))}

              <Divider />

              <Link to="/login" onClick={onClose}>
                <Button variant="ghost" w="full">
                  Login
                </Button>
              </Link>
              <Link to="/signup" onClick={onClose}>
                <Button colorScheme="blue" w="full">
                  Signup
                </Button>
              </Link>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default Navbar;
