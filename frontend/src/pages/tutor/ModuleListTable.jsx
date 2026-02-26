import { useEffect, useState } from "react";
import { useModuleStore } from "../../store/module";
import { useEnrollmentStore } from "../../store/moduleEnrollment";
import {
  Container,
  Text,
  VStack,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Progress,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const ModuleListTable = () => {
  const navigate = useNavigate();
  const { fetchModules, modules } = useModuleStore();
  const { fetchTutorStudents } = useEnrollmentStore();

  const [studentsByModule, setStudentsByModule] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch modules and students
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Fetch modules
      await fetchModules();

      // Fetch all enrollments for the tutor
      const enrollments = await fetchTutorStudents();
      const byModule = {};

      // Group students by module
      enrollments.forEach((enroll) => {
        enroll.modules.forEach((mod) => {
          const moduleId = mod.moduleId;
          if (!byModule[moduleId]) byModule[moduleId] = [];
          byModule[moduleId].push({
            studentId: enroll._id,
            name: enroll.name,
            progressPercent: mod.progressPercent || 0,
          });
        });
      });

      setStudentsByModule(byModule);
      setLoading(false);
    };

    loadData();
  }, [fetchModules, fetchTutorStudents]);

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={6} align="stretch">
        {/* Heading */}
        <Text
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="bold"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
          textAlign="center"
        >
          My Modules
        </Text>

        {/* Loading */}
        {loading && <Spinner size="lg" alignSelf="center" />}

        {/* No modules */}
        {!loading && modules.length === 0 && (
          <Text fontSize="xl" color="gray.500" textAlign="center">
            You haven't created any modules yet. Start inspiring learners today!
            ✨
          </Text>
        )}

        {/* Modules table */}
        {!loading && modules.length > 0 && (
          <Box overflowX="auto" borderRadius="lg">
            <Table variant="striped" colorScheme="cyan" minW="600px">
              <Thead bg="blue.50">
                <Tr>
                  <Th>Module Name</Th>
                  <Th>Enrolled Students</Th>
                  <Th>Average Progress</Th>
                </Tr>
              </Thead>
              <Tbody>
                {modules.map((module) => {
                  const students = studentsByModule[module._id] || [];
                  const avgProgress =
                    students.length > 0
                      ? Math.round(
                          students.reduce(
                            (sum, s) => sum + Number(s.progressPercent || 0),
                            0,
                          ) / students.length,
                        )
                      : 0;

                  return (
                    <Tr key={module._id}>
                      <Td fontWeight="medium">{module.title}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() =>
                            navigate(`/tutor/module/${module._id}/students`)
                          }
                        >
                          View Students ({students.length})
                        </Button>
                      </Td>
                      <Td>
                        <Progress
                          value={avgProgress}
                          size="sm"
                          colorScheme={
                            avgProgress < 50
                              ? "yellow"
                              : avgProgress <= 75
                                ? "blue"
                                : "green"
                          }
                          borderRadius="md"
                        />
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default ModuleListTable;
