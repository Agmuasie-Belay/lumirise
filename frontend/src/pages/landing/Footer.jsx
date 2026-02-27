import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Footer = () => {
 return (
    <Box
      position="relative" top="16"
      overflow="hidden"
      minH="0"
      display="flex"
      flexDirection="column"
      sx={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge legacy
        "&::-webkit-scrollbar": {
          display: "none", // Chrome, Safari
        },
      }}
    >
      <Box bg="gray.900" color="gray.400" py={12}>
        <Container maxW="container.lg">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <VStack align="start">
              <Heading size="md" color="white">
                LumiRise
              </Heading>
              <Text>Empowering learners with digital confidence.</Text>
            </VStack>

            <VStack align="start">
              <Heading size="sm" color="white">
                Platform
              </Heading>
              <Link _hover={{ textDecoration: "underline" }}>Modules</Link>
              <Link to="/signup">
                <Text _hover={{ textDecoration: "underline" }}>Sign Up</Text>
              </Link>
              <Link to="/login">
                <Text _hover={{ textDecoration: "underline" }}>Login</Text>
              </Link>
              <Link to="/about">
                <Text _hover={{ textDecoration: "underline" }}>About</Text>
              </Link>
            </VStack>

            <VStack align="start">
              <Heading size="sm" color="white">
                Support
              </Heading>
              <Link _hover={{ textDecoration: "underline" }}>Contact</Link>
              <Link _hover={{ textDecoration: "underline" }}>
                Privacy Policy
              </Link>
              <Link _hover={{ textDecoration: "underline" }}>Terms</Link>
            </VStack>
          </SimpleGrid>

          <Text mt={10} fontSize="sm" textAlign="center">
            © {new Date().getFullYear()} LumiRise. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
