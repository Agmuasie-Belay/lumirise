import { useEffect } from "react";
import { useModuleStore } from "../../store/module";
import {
  SimpleGrid,
  Container,
  Text,
  VStack,
  Button,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from "@chakra-ui/react";
import ModuleCard from "../../components/Module/ModuleCard";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionText = motion(Text);
const MotionBox = motion(Container);

const TutorDashboard = () => {
  const { fetchModules, modules } = useModuleStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Compute quick tutor insights
  const totalModules = modules.length;
  const approvedModules = modules.filter((m) => m.status === "Published").length;
  const pendingModules = modules.filter((m) => m.status === "Pending").length;
  const rejectedModules = modules.filter((m) => m.status === "Rejected").length;

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
          Manage Your Modules
        </Text>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5} w="full">
          <Stat bg={bgCard} p={4} borderRadius="xl" shadow="sm">
            <StatLabel fontWeight="medium">Total Modules</StatLabel>
            <StatNumber color="blue.500">{totalModules}</StatNumber>
          </Stat>
          <Stat bg={bgCard} p={4} borderRadius="xl" shadow="sm">
            <StatLabel fontWeight="medium">Approved</StatLabel>
            <StatNumber color="green.500">{approvedModules}</StatNumber>
          </Stat>
          <Stat bg={bgCard} p={4} borderRadius="xl" shadow="sm">
            <StatLabel fontWeight="medium">Pending</StatLabel>
            <StatNumber color="orange.500">{pendingModules}</StatNumber>
            <StatHelpText fontSize="xs">Awaiting admin approval</StatHelpText>
          </Stat>
          <Stat bg={bgCard} p={4} borderRadius="xl" shadow="sm">
            <StatLabel fontWeight="medium">Rejected</StatLabel>
            <StatNumber color="red.500">{rejectedModules}</StatNumber>
          </Stat>
        </SimpleGrid>

        {/* Action Buttons */}
        <HStack spacing={4}>
          <Link to="/create-module">
            <Button colorScheme="green">Create New Module</Button>
          </Link>
          <Button colorScheme="gray" onClick={() => navigate("/feedback")}>
            View Feedback
          </Button>
        </HStack>

        {/* Modules List */}
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

export default TutorDashboard;
