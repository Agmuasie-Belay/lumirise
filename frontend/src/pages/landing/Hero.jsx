import { Box, Button, Container, Heading, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Hero = () => {
  // Color mode adjustments
  const glassBg = useColorModeValue("rgba(255,255,255,0.08)", "rgba(255,255,255,0.04)");
  const glassBorder = useColorModeValue("rgba(255,255,255,0.25)", "rgba(255,255,255,0.12)");
  const gradientBg = useColorModeValue(
    "linear(to-br, #0f172a, #1e3a8a, #0f172a)",
    "linear(to-br, #020617, #0f172a, #1e293b)"
  );

  return (
    <Box position="relative" top="16">
      {/* Hero Section */}
      <MotionBox
        position="relative"
        bgGradient={gradientBg}
        backgroundSize="200% 200%"
        //animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        //transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        py={{ base: 24, md: 40 }}
        overflow="hidden"
         initial={{ opacity: 0, y: -50, scale: 1.05 }} // start slightly up and smaller
        animate={{ opacity: 1, y: 0, scale: 1 }} // slide down to normal
        transition={{ duration: 1, ease: "easeOut" }}
       
      >
        {/* Subtle Floating Particles */}
        <Box position="absolute" inset={0} zIndex={0} pointerEvents="none">
          {[...Array(25)].map((_, i) => (
            <MotionBox
              key={i}
              position="absolute"
              w="9px"
              h="9px"
              borderRadius="full"
              bg="rgba(255,255,255,0.4)"
              top={`${Math.random() * 100}%`}
              left={`${Math.random() * 100}%`}
              animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </Box>

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <Box
            backdropFilter="blur(20px)"
            bg={glassBg}
            border="1px solid"
            borderColor={glassBorder}
            borderRadius="2xl"
            p={{ base: 8, md: 12 }}
            boxShadow="0 20px 60px rgba(0,0,0,0.35)"
          >
            <VStack spacing={6} align="center" textAlign="center">
              {/* Heading with Radial Glow */}
              <Box position="relative" display="inline-block">
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  w="500px"
                  h="500px"
                  bg="radial-gradient(circle, rgba(255,215,0,0.25) 0%, rgba(255,215,0,0.08) 40%, transparent 70%)"
                  filter="blur(60px)"
                  zIndex={0}
                />
                <Heading
                  position="relative"
                  zIndex={1}
                  fontSize={{ base: "3xl", md: "5xl" }}
                  fontWeight="extrabold"
                  letterSpacing="tight"
                  color="white"
                >
                  Bridge the gap. Rise beyond.
                </Heading>
              </Box>

              {/* Subtitle */}
              <Text fontSize={{ base: "md", md: "xl" }} maxW="2xl" color="white">
                Raising standards and equipping Ethiopian learners with practical digital mastery and career-ready confidence.
              </Text>

              {/* Call to Action */}
              <MotionBox initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
                <Link to="/signup">
                  <Button colorScheme="yellow" size="lg" _hover={{ bg: "yellow.400" }}>
                    Get Started
                  </Button>
                </Link>
              </MotionBox>
            </VStack>
          </Box>
        </Container>
      </MotionBox>
    </Box>
  );
};

export default Hero;