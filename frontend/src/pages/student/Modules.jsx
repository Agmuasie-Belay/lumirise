import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useModuleStore } from "../../store/module";
import { useEnrollmentStore } from "../../store/moduleEnrollment";
import { useAuthStore } from "../../store/auth";
import {
  Container,
  Text,
  VStack,
  Button,
  Progress,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";

// --- Individual Module Row ---
const ModuleRow = ({ module, enrollment, onNavigate }) => {
  const progress = enrollment?.progressPercent ?? 0;
  const isCompleted = Math.round(progress) >= 100;
  const completedBlocks = enrollment?.completedBlocks?.length ?? 0;
  const totalBlocks = module.blocks?.length ?? 0;

  const quizAttempts = enrollment?.quizAttempts ?? {};
  const highestScores = Object.values(quizAttempts).map((attempts) =>
    attempts.length ? attempts[attempts.length - 1].score : 0,
  );
  const totalHighestScore =
    highestScores.length > 0
      ? Math.round(
          highestScores.reduce((a, b) => a + b, 0) / highestScores.length,
        )
      : 0;

  return (
    <Tr>
      <Td>
        <VStack align="start" spacing={2}>
          <Text fontWeight="medium" fontSize={{ base: "sm", md: "md" }}>
            {module.title}
          </Text>
          <Button
            size="sm"
            colorScheme="blue"
            isDisabled={isCompleted}
            onClick={() => onNavigate(module._id)}
            aria-label={`Continue learning ${module.title}`}
          >
            Continue Learning
          </Button>
        </VStack>
      </Td>
      <Td>
        <Badge
          colorScheme={isCompleted ? "green" : "yellow"}
          aria-label={`Module status: ${isCompleted ? "Completed" : "In Progress"}`}
        >
          {isCompleted ? "Completed" : "In Progress"}
        </Badge>
      </Td>
      <Td>
        <Tooltip label={`${progress}% completed`} placement="top">
          <Progress
            value={progress}
            size="sm"
            colorScheme={
              progress < 50 ? "yellow" : progress <= 75 ? "blue" : "green"
            }
            borderRadius="md"
            aria-label={`Module progress: ${progress}%`}
          />
        </Tooltip>
      </Td>
      {/* <Td>
        {completedBlocks}/{totalBlocks}
      </Td>
      <Td>{Object.keys(quizAttempts).length}</Td>
      <Td>{totalHighestScore}%</Td> */}
    </Tr>
  );
};

// --- Main Component ---
const StudentModules = () => {
  const navigate = useNavigate();

  // --- Stores & Hooks at top level ---
  const { modules, fetchModules, isLoading: modulesLoading } = useModuleStore();
  const {
    enrollments,
    fetchStudentEnrollments,
    isLoading: enrollmentsLoading,
  } = useEnrollmentStore();
  const { currentUser } = useAuthStore();
  const [isFetching, setIsFetching] = useState(true);

  // --- Fetch data on mount ---
  useEffect(() => {
    const loadData = async () => {
      setIsFetching(true);
      await Promise.all([fetchModules(), fetchStudentEnrollments()]);
      setIsFetching(false);
    };
    loadData();
  }, [fetchModules, fetchStudentEnrollments]);

  // --- Derived data safely ---
  const currentUserId = currentUser?.id ?? null;
  const enrollmentMap = useMemo(() => {
    const map = new Map();
    enrollments.data?.forEach((e) => {
      map.set(String(e.moduleId), e); // just map moduleId -> enrollment
    });
    return map;
  }, [enrollments.data]);
  const enrolledModules = useMemo(
    () => modules.filter((m) => enrollmentMap.has(String(m._id))),
    [modules, enrollmentMap],
  );

  // --- Loading or not logged in states ---
  if (!currentUser) {
    return (
      <Container maxW="container.md" py={10}>
        <Text fontSize="xl" textAlign="center">
          Please log in to see your modules.
        </Text>
      </Container>
    );
  }

  if (isFetching || modulesLoading || enrollmentsLoading) {
    return (
      <Container maxW="container.md" py={10} textAlign="center">
        <Spinner size="xl" role="status" aria-label="Loading modules" />
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={6} align="stretch">
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
          textAlign="center"
        >
          My Enrolled Modules
        </Text>

        {enrolledModules.length > 0 ? (
          <Box
            overflowX="auto"
            borderRadius="lg"
            role="region"
            aria-label="Enrolled modules table"
          >
            <Table variant="striped" colorScheme="cyan" minW="600px">
              <Thead bg="blue.50">
                <Tr>
                  <Th scope="col">Module</Th>
                  <Th scope="col">Status</Th>
                  <Th scope="col">Progress</Th>
                  {/* <Th scope="col">Completed Blocks</Th>
                  <Th scope="col">Quizzes</Th>
                  <Th scope="col">Score</Th> */}
                </Tr>
              </Thead>
              <Tbody>
                {enrolledModules.map((module) => (
                  <ModuleRow
                    key={module._id}
                    module={module}
                    enrollment={enrollmentMap.get(String(module._id))}
                    onNavigate={(id) => navigate(`/student/modulepage/${id}`)}
                  />
                ))}
              </Tbody>
            </Table>
          </Box>
        ) : (
          <VStack spacing={4} textAlign="center">
            <Text fontSize="xl" color="gray.500">
              You are not enrolled in any modules yet.
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => navigate("/modules")}
              aria-label="Browse available modules"
            >
              Browse Available Modules
            </Button>
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default StudentModules;
