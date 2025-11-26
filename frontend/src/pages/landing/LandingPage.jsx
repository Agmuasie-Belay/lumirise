import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Collapse,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import Testimonials from "./Testimonials";
import FeaturedModules from "./FeaturedModules";
import Navbar from "../../components/layout/Navbar";

// Motion wrapper
const MotionBox = motion(Box);

const LandingPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Track scroll progress
  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    setScrollProgress(progress);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const featuredModules = [
    { id: 1, title: "Web Development Bootcamp", description: "Learn HTML, CSS, JS & React" },
    { id: 2, title: "Machine Learning Basics", description: "Intro to ML with Python & TensorFlow" },
    { id: 3, title: "Embedded Systems", description: "Hands-on microcontroller projects" },
  ];




  return (
    <Box position="relative" overflowX="hidden" minH="100vh" display="flex" flexDirection="column">
      {/* Scroll Progress Bar */}
      <Navbar/>
      <Box
        position="fixed"
        top={0}
        left={0}
        width={`${scrollProgress}%`}
        height="5px"
        bg="blue.400"
        zIndex={50}
        transition="width 0.3s ease-out"
      />

      {/* Floating Sign Up / Login */}
      <Box position="fixed" top="20px" right="20px" zIndex={50}>
        <IconButton
          aria-label="Menu"
          icon={menuOpen ? <CloseIcon /> : <HamburgerIcon />}
          display={{ base: "inline-flex", md: "none" }}
          onClick={() => setMenuOpen(!menuOpen)}
        />
        <Collapse in={menuOpen} animateOpacity>
          <VStack
            spacing={2}
            align="end"
            bg="white"
            p={2}
            borderRadius="md"
            shadow="md"
            mt={2}
            display={{ base: "flex", md: "none" }}
          >
            <Link to="/login">
              <Button colorScheme="blue" size="sm">Login</Button>
            </Link>
            <Link to="/signup">
              <Button colorScheme="yellow" size="sm">Sign Up</Button>
            </Link>
          </VStack>
        </Collapse>
        <VStack spacing={2} align="end" display={{ base: "none", md: "flex" }}>
          <Link to="/login">
            <Button colorScheme="blue" size="sm">Login</Button>
          </Link>
          <Link to="/signup">
            <Button colorScheme="yellow" size="sm">Sign Up</Button>
          </Link>
        </VStack>
      </Box>

      {/* Hero Section */}
      <MotionBox
        bgGradient="linear(to-r, blue.500, cyan.400)"
        color="white"
        py={{ base: 20, md: 40 }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <Container maxW="container.xl">
          <VStack spacing={6} align="center" textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <Heading fontSize={{ base: "3xl", md: "5xl" }} fontWeight="extrabold">
                Ignite Your Potential with LumiRise
              </Heading>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <Text fontSize={{ base: "md", md: "xl" }} maxW="2xl">
                Empowering learners to master coding, machine learning, and embedded systems.
              </Text>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/signup">
                <Button colorScheme="yellow" size="lg" _hover={{ bg: "yellow.400" }}>
                  Get Started
                </Button>
              </Link>
            </MotionBox>
          </VStack>
        </Container>
      </MotionBox>

      {/* Featured Modules */}
      <FeaturedModules modules={featuredModules}  />

      {/* Testimonials Section */}
      <Box py={0} >
        <Testimonials />
      </Box>

      {/* Call-to-Action */}
      <MotionBox bgGradient="linear(to-r, blue.500, cyan.400)" py={20}>
        <Container maxW="container.lg">
          <VStack spacing={6} textAlign="center">
            <Heading fontSize="3xl">Ready to start your learning journey?</Heading>
            <Text maxW="2xl">
              Sign up today and explore modules that will take your skills to the next level.
            </Text>
            <Link to="/signup">
              <Button colorScheme="yellow" size="lg" _hover={{ bg: "yellow.400" }}>
                Join LumiRise
              </Button>
            </Link>
          </VStack>
        </Container>
      </MotionBox>

      {/* Footer */}
      <Box bg="gray.800" color="white" py={10} mt="auto">
        <Container maxW="container.xl">
          <VStack spacing={6}>
            <HStack spacing={8} wrap="wrap" justify="center">
              <Link to="/">
                <Text fontWeight="bold" fontSize="lg">LumiRise</Text>
              </Link>
              <Link to="/signup">
                <Text _hover={{ textDecoration: "underline" }}>Sign Up</Text>
              </Link>
              <Link to="/login">
                <Text _hover={{ textDecoration: "underline" }}>Login</Text>
              </Link>
              <Link to="/about">
                <Text _hover={{ textDecoration: "underline" }}>About</Text>
              </Link>
              <Link to="/contact">
                <Text _hover={{ textDecoration: "underline" }}>Contact</Text>
              </Link>
            </HStack>
            <Text fontSize="sm" color="gray.400" textAlign="center">
              &copy; {new Date().getFullYear()} LumiRise. All rights reserved.
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
