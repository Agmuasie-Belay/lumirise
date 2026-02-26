import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useEnrollmentStore } from "../../store/moduleEnrollment";
import {
  Container,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Spinner,
} from "@chakra-ui/react";

const ModuleStudents = () => {
  const { moduleId } = useParams();
  const { fetchTutorStudents } = useEnrollmentStore();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const allStudents = await fetchTutorStudents();

        const filtered = allStudents
          .map((s) => {
            const mod = s.modules.find((m) => m.moduleId === moduleId);
            return mod
              ? {
                  studentId: s._id,
                  name: s.name,
                  enrolledAt: mod.enrolledAt || null,
                  progress: mod.progressPercent || 0,
                  taskSubmissions: mod.taskSubmissions || [],
                  completedBlocks: mod.completedBlocks || [],
                  quizAttempts: mod.quizAttempts || [],
                  finalScore: mod.finalScore || null,
                  passed: mod.passed || false,
                  dailyJournals: mod.dailyJournals || [],
                }
              : null;
          })
          .filter(Boolean);

        setStudents(filtered);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [fetchTutorStudents, moduleId]);

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
          Students Enrolled in Module
        </Text>

        {loading ? (
          <Spinner size="lg" alignSelf="center" />
        ) : students.length === 0 ? (
          <Text fontSize="xl" color="gray.500" textAlign="center">
            No students enrolled in this module yet.
          </Text>
        ) : (
          <Table variant="striped" colorScheme="cyan">
            <Thead bg="blue.50">
              <Tr>
                <Th>No.</Th>
                <Th>Student Name</Th>
                <Th>Enrolled At</Th>
                <Th>Progress</Th>
              </Tr>
            </Thead>
            <Tbody>
              {students.map((s, idx) => (
                <Tr key={s.studentId}>
                  <Td>{idx + 1}</Td>
                  <Td>{s.name}</Td>
                  <Td>{s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString() : "-"}</Td>
                  <Td>
                    <Progress
                      value={s.progress}
                      size="sm"
                      colorScheme={
                        s.progress < 50
                          ? "yellow"
                          : s.progress <= 75
                          ? "blue"
                          : "green"
                      }
                      borderRadius="md"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </VStack>
    </Container>
  );
};

export default ModuleStudents;