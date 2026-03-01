import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
// Motion wrapper
const MotionBox = motion(Box);

const CTA = () => {
    const gradientBg = useColorModeValue(
    "linear(to-br, #0A66C2, #0056A0, #0A66C2)",
    "linear(to-br, #0a3a66, #0056A0, #0A66C2)"
  );

  return (
    <Box
      position="relative"
      overflow="hidden"
      display="flex"
      flexDirection="column" top="16"
      >

      {/* Call-to-Action */}
      <MotionBox bgGradient={gradientBg} color="yellow.200" py={20}>
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
    </Box>
  );
};

export default CTA;
