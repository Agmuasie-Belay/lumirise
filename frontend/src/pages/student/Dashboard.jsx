import { useEffect } from "react";
import { useModuleStore } from "../../store/module";
import { useAuthStore } from "../../store/auth";
import {
  SimpleGrid,
  Container,
  Text,
  VStack,
  Box,
  Button,
} from "@chakra-ui/react";
import ModuleCard from "../../components/Module/ModuleCard";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
const MotionText = motion(Text);
const MotionBox = motion(Box);

const StudentHome = () => {
  const { fetchModules, modules } = useModuleStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return (
    <Container maxW="container.lg" py={4}>
      <VStack spacing={10} align="center">
        {/* Vision Statement Section */}
        {currentUser?.visionStatement && (
          <MotionBox
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            bgGradient="linear(to-r, teal.100, blue.50)"
            p={6}
            rounded="2xl"
            shadow="lg"
            w="full"
            textAlign="center"
            position="relative"
            overflow="hidden"
          >
            {/* Animated glow effect */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="radial(cyan.200, transparent)"
              opacity={0.2}
              filter="blur(20px)"
            />
            <MotionText
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="semibold"
              color="blue.700"
              textAlign="center"
              lineHeight="tall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.8,
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              “{currentUser.visionStatement}”
            </MotionText>
            <Text mt={3} fontSize="md" color="gray.600" fontStyle="italic">
              — My Vision, My Light ✨
            </Text>
            <>
              {/* existing MotionBox vision */}
              <Link to="/journal">
                <Button colorScheme="blue" mt={4} size="md">
                  Reflect & Grow 🌿
                </Button>
              </Link>
            </>
          </MotionBox>
        )}

        {/* Available Modules Section */}
        <Text
          fontSize="30"
          fontWeight="bold"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
          textAlign="center"
        >
          Available Modules
        </Text>

        {modules.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            {modules.map((module) => (
              <ModuleCard key={module._id} module={module} />
            ))}
          </SimpleGrid>
        ) : (
          <Text fontSize="xl" color="gray.500" textAlign="center">
            No modules available yet. Keep shining and stay curious!
          </Text>
        )}
      </VStack>
    </Container>
  );
};

export default StudentHome;
