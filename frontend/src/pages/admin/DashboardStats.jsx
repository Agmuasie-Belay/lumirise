import { useEffect } from "react";
import { useModuleStore } from "../../store/module";
import { useAuthStore } from "../../store/auth";
import {
  SimpleGrid,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Text,
  Box,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, FileText, CheckCircle } from "lucide-react";

const DashboardStats = () => {
  const { fetchModules, modules } = useModuleStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Compute stats
  const totalModules = modules.length;
  const pendingModules = modules.filter((m) => m.status === "Pending").length;
  const approvedModules = modules.filter((m) => m.status === "Published").length;
  const tutors = [...new Set(modules.map((m) => m.tutor?.id).filter(Boolean))].length;
  const students = [
    ...new Set(modules.flatMap((m) => (m.enrolledStudents || []).map((s) => s.id))),
  ].length;
  const avgProgress = modules.length
    ? Math.round(modules.reduce((sum, m) => sum + (m.progress || 0), 0) / modules.length)
    : 0;

  const bgCard = useColorModeValue("white", "gray.800");

  // Quick action cards, aligned visually with stat cards
  const quickActions = [
    { label: "View All Modules", icon: BookOpen, path: "/admin-home/modules", color: "blue.500" },
    { label: "Approve Pending Modules", icon: CheckCircle, path: "/admin-home/modules", color: "orange.400" },
    { label: "Manage Tutors", icon: Users, path: "/admin-home/tutors", color: "purple.500" },
    { label: "Manage Students", icon: Users, path: "/admin-home/students", color: "teal.500" },
    { label: "Generate Reports", icon: FileText, path: "/admin-home/reports", color: "pink.400" },
  ];

  // Capitalize each word in user name
  const displayName = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
    : "Admin";

  return (
    <VStack spacing={6} w="full" align="stretch">
      <Text fontSize="2xl" fontWeight="bold">
        Welcome back, {displayName} 👋
      </Text>

      {/* Stats grid */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={5} w="full">
        <Stat bg={bgCard} p={4} borderRadius="xl" shadow="sm">
          <StatLabel>Total Modules Created</StatLabel>
          <StatNumber color="blue.500">{totalModules}</StatNumber>
        </Stat>
        <Stat bg={bgCard} p={4} borderRadius="xl" shadow="sm">
          <StatLabel>Modules Approved</StatLabel>
          <StatNumber color="green.500">{approvedModules}</StatNumber>
        </Stat>
        <Stat bg={bgCard} p={4} borderRadius="xl" shadow="sm">
          <StatLabel>Modules Pending Approval</StatLabel>
          <StatNumber color="orange.500">{pendingModules}</StatNumber>
          <StatHelpText fontSize="xs">Needs your review</StatHelpText>
        </Stat>
        <Stat bg={bgCard} p={4} borderRadius="xl" shadow="sm">
          <StatLabel>Active Tutors</StatLabel>
          <StatNumber color="purple.500">{tutors}</StatNumber>
        </Stat>
        <Stat bg={bgCard} p={4} borderRadius="xl" shadow="sm">
          <StatLabel>Enrolled Students</StatLabel>
          <StatNumber color="teal.500">{students}</StatNumber>
        </Stat>
        <Stat bg={bgCard} p={4} borderRadius="xl" shadow="sm">
          <StatLabel>Average Module Completion</StatLabel>
          <StatNumber color="pink.500">{avgProgress}%</StatNumber>
        </Stat>
      </SimpleGrid>

      {/* Quick Action Cards */}
      <Text fontSize="xl" fontWeight="bold" pt={6}>
        Quick Actions
      </Text>
      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={5} w="full">
        {quickActions.map((action) => (
          <Box
            key={action.label}
            p={4}
            borderRadius="xl"
            shadow="md"
            bg={bgCard}
            cursor="pointer"
            _hover={{
              bg: useColorModeValue("gray.100", "gray.700"),
              transform: "scale(1.05)",
            }}
            transition="all 0.2s ease-in-out"
            onClick={() => navigate(action.path)}
            textAlign="center"
          >
            <Icon as={action.icon} w={8} h={8} color={action.color} mb={2} />
            <Text fontWeight="semibold">{action.label}</Text>
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  );
};

export default DashboardStats;
