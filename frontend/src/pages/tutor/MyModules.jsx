import { useEffect } from "react";
import { useModuleStore } from "../../store/module";
import {
  SimpleGrid,
  Container,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import ModuleCard from "../../components/ModuleCard";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MotionText = motion(Text);
const MotionBox = motion(Container);

const MyModules = () => {
  const { fetchModules, modules } = useModuleStore();
  const tutorId = localStorage.getItem("userId");
console.log("Tutor ID from localStorage:", tutorId);
  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const bgCard = useColorModeValue("white", "gray.800");

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="center">
        {/* Header */}
        <Text
          fontSize="30"
          fontWeight="bold"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
          textAlign="center"
        >
          My Modules
        </Text>

        

        {/* My Modules List */}
        {modules.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} w="full">
            {modules.map((module) => (
              <ModuleCard key={module._id} module={module} />
            ))}
          </SimpleGrid>
        ) : (
          <Text fontSize="xl" color="gray.500" textAlign="center">
            You haven't created any modules yet. Start inspiring learners today! ✨
          </Text>
        )}
      </VStack>
    </Container>
  );
};

export default MyModules;
