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
  Image,
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
  {
    id: 1,
    title: "Digital Productivity Mastery",
    description: "Build essential digital skills to organize, create, and submit work like a professional.",
  },
  {
    id: 2,
    title: "Job Readiness Accelerator",
    description: "Craft standout CVs, ace interviews, and step confidently into your dream career.",
  },
  {
    id: 3,
    title: "Data Analytics for Impact",
    description: "Turn data into insights and make decisions that drive real-world results.",
  },
];

  return (
    <Box
      position="relative"
      overflowX="hidden"
      minH="100vh"
      display="flex"
      flexDirection="column"
    >
      {/* Scroll Progress Bar */}
      <Navbar />
      <Box
        position="fixed"
        top={0}
        left={0}
        width={`${scrollProgress}%`}
        height="5px"
        bg="yellow.400"
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
              <Button colorScheme="blue" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button colorScheme="yellow" size="sm">
                Sign Up
              </Button>
            </Link>
          </VStack>
        </Collapse>
        <VStack spacing={2} align="end" display={{ base: "none", md: "flex" }}>
          <Link to="/login">
            <Button colorScheme="blue" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button colorScheme="yellow" size="sm">
              Sign Up
            </Button>
          </Link>
        </VStack>
      </Box>

      {/* Hero Section */}
      <MotionBox
        bgGradient="linear(to-r, blue.500, yellow.500)"
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
              <Heading
                fontSize={{ base: "3xl", md: "5xl" }}
                fontWeight="extrabold"
              >
                Bridge the gap. Rise beyond.
              </Heading>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <Text fontSize={{ base: "md", md: "xl" }} maxW="2xl">
                Raising standards and equipping Ethiopian learners with
                practical digital mastery and career-ready confidence.
              </Text>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/signup">
                <Button
                  colorScheme="yellow"
                  size="lg"
                  _hover={{ bg: "yellow.400" }}
                >
                  Get Started
                </Button>
              </Link>
            </MotionBox>
          </VStack>
        </Container>
      </MotionBox>

      {/* Featured Modules */}
      <FeaturedModules modules={featuredModules} />

      {/* Testimonials Section */}
      <Box py={0}>
        <Testimonials />
      </Box>

      {/* Call-to-Action */}
      <MotionBox bgGradient="linear(to-r, blue.500, cyan.400)" py={20}>
        <Container maxW="container.lg">
          <VStack spacing={6} textAlign="center">
            <Heading fontSize="3xl">
              Ready to start your learning journey?
            </Heading>
            <Text maxW="2xl">
              Sign up today and explore modules that will take your skills to
              the next level.
            </Text>
            <Link to="/signup">
              <Button
                colorScheme="yellow"
                size="lg"
                _hover={{ bg: "yellow.400" }}
              >
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
                <HStack
                  direction={{ base: "column", md: "row" }} spacing="0.5rem" 
                  align="center"
                >
                  <Image
                    src="public/logo2.png" 
                    alt="LumiRise Logo"
                    boxSize={{ base: "2rem", md: "2.5rem" }} 
                    objectFit="contain"
                  />
                  <Text
                    fontWeight="bold"
                    fontSize={{ base: "1rem", md: "1.25rem" }} // 16px mobile, 20px desktop
                  >
                    LumiRise
                  </Text>
                </HStack>
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
// import {
//   Box,
//   Button,
//   Container,
//   Heading,
//   Text,
//   VStack,
//   HStack,
//   SimpleGrid,
//   useColorModeValue,
// } from "@chakra-ui/react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useState, useEffect } from "react";
// import Navbar from "../../components/layout/Navbar";
// import FeaturedModules from "./FeaturedModules";
// import Testimonials from "./Testimonials";

// const MotionBox = motion(Box);

// const LandingPage = () => {
//   const [scrollProgress, setScrollProgress] = useState(0);
//   const bgLight = useColorModeValue("gray.50", "gray.900");
//   const bgDark = useColorModeValue("gray.900", "gray.800");

//   // Scroll progress
//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollTop = window.scrollY;
//       const scrollHeight =
//         document.documentElement.scrollHeight - window.innerHeight;
//       setScrollProgress((scrollTop / scrollHeight) * 100);
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const featuredModules = [
//     {
//       id: 1,
//       title: "Digital Productivity Mastery",
//       description:
//         "Build essential digital skills to operate like a high-performing professional.",
//     },
//     {
//       id: 2,
//       title: "Job Readiness Accelerator",
//       description:
//         "Craft standout CVs, ace interviews, and enter the workforce confidently.",
//     },
//     {
//       id: 3,
//       title: "Data Analytics for Impact",
//       description:
//         "Turn raw data into meaningful insights that drive decisions.",
//     },
//   ];

//   return (
//     <Box overflowX="hidden">

//       {/* NAVBAR */}
//       <Navbar />

//       {/* SCROLL PROGRESS BAR */}
//       <Box
//         position="fixed"
//         top={0}
//         left={0}
//         height="3px"
//         width={`${scrollProgress}%`}
//         bg="yellow.400"
//         zIndex={100}
//         transition="width 0.2s ease"
//       />

//       {/* HERO SECTION */}
//       <MotionBox
//         bgGradient="linear(to-r, blue.700, yellow.400)"
//         color="white"
//         py={{ base: 24, md: 36 }}
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1 }}
//       >
//         <Container maxW="container.xl">
//           <VStack spacing={8} textAlign="center">

//             <Heading
//               fontSize={{ base: "3xl", md: "5xl" }}
//               fontWeight="900"
//               lineHeight="1.2"
//               maxW="3xl"
//             >
//               From Learning to Employment — Accelerated.
//             </Heading>

//             <Text fontSize={{ base: "md", md: "xl" }} maxW="2xl" opacity={0.95}>
//               LumiRise equips ambitious learners with practical digital mastery,
//               real-world projects, and career-ready confidence.
//             </Text>

//             <HStack spacing={4} flexWrap="wrap" justify="center">
//               <Link to="/signup">
//                 <Button
//                   size="lg"
//                   bg="yellow.400"
//                   color="black"
//                   _hover={{ transform: "scale(1.05)" }}
//                 >
//                   Get Started
//                 </Button>
//               </Link>

//               <Link to="/about">
//                 <Button
//                   size="lg"
//                   variant="outline"
//                   borderColor="white"
//                   color="white"
//                   _hover={{ bg: "whiteAlpha.200" }}
//                 >
//                   Explore Programs
//                 </Button>
//               </Link>
//             </HStack>

//             {/* TRUST METRICS */}
//             <HStack spacing={12} pt={8} flexWrap="wrap" justify="center">
//               <VStack spacing={0}>
//                 <Heading size="md">1,200+</Heading>
//                 <Text fontSize="sm" opacity={0.9}>Learners</Text>
//               </VStack>
//               <VStack spacing={0}>
//                 <Heading size="md">85%</Heading>
//                 <Text fontSize="sm" opacity={0.9}>Career Placement</Text>
//               </VStack>
//               <VStack spacing={0}>
//                 <Heading size="md">20+</Heading>
//                 <Text fontSize="sm" opacity={0.9}>Industry Mentors</Text>
//               </VStack>
//             </HStack>

//           </VStack>
//         </Container>
//       </MotionBox>

//       {/* FEATURED MODULES */}
//       <Box bg={bgLight} py={24}>
//         <Container maxW="container.xl">
//           <VStack spacing={12}>
//             <Heading textAlign="center" color="blue.700">
//               Designed for Real Career Outcomes
//             </Heading>

//             <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
//               {featuredModules.map((module) => (
//                 <Box
//                   key={module.id}
//                   bg="white"
//                   p={8}
//                   borderRadius="2xl"
//                   boxShadow="md"
//                   _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
//                   transition="0.3s"
//                 >
//                   <Heading size="md" mb={4} color="blue.700">
//                     {module.title}
//                   </Heading>
//                   <Text color="gray.600">{module.description}</Text>
//                 </Box>
//               ))}
//             </SimpleGrid>
//           </VStack>
//         </Container>
//       </Box>

//       {/* TESTIMONIALS */}
//       <Box bg={bgDark} py={24}>
//         <Container maxW="container.xl">
//           <VStack spacing={12}>
//             <Heading textAlign="center" color="yellow.400">
//               What Our Learners Say
//             </Heading>
//             <Testimonials />
//           </VStack>
//         </Container>
//       </Box>

//       {/* FINAL CTA */}
//       <Box bg="blue.700" py={24} color="white">
//         <Container maxW="container.lg">
//           <VStack spacing={6} textAlign="center">
//             <Heading fontSize="3xl">
//               Your Career Upgrade Starts Today.
//             </Heading>
//             <Text maxW="2xl" opacity={0.9}>
//               Join LumiRise and gain the skills, mentorship, and confidence
//               needed to thrive in the modern workforce.
//             </Text>
//             <Link to="/signup">
//               <Button
//                 size="lg"
//                 bg="yellow.400"
//                 color="black"
//                 _hover={{ transform: "scale(1.05)" }}
//               >
//                 Join LumiRise
//               </Button>
//             </Link>
//           </VStack>
//         </Container>
//       </Box>

//       {/* FOOTER */}
//       <Box bg="gray.900" color="white" py={12}>
//         <Container maxW="container.xl">
//           <VStack spacing={6} textAlign="center">
//             <Heading size="md" color="yellow.400">
//               LumiRise
//             </Heading>
//             <Text maxW="2xl" color="gray.400">
//               A career accelerator empowering learners with digital mastery,
//               industry mentorship, and employment-focused training.
//             </Text>

//             <HStack spacing={8} flexWrap="wrap" justify="center">
//               <Link to="/about">About</Link>
//               <Link to="/signup">Sign Up</Link>
//               <Link to="/login">Login</Link>
//             </HStack>

//             <Text fontSize="sm" color="gray.500">
//               © {new Date().getFullYear()} LumiRise. All rights reserved.
//             </Text>
//           </VStack>
//         </Container>
//       </Box>
//     </Box>
//   );
// };

// export default LandingPage;