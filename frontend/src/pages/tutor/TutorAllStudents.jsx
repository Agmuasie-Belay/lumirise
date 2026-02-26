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
  Progress,
  Badge,
  Button,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Input,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  HStack,
} from "@chakra-ui/react";

import { useEffect, useState, useMemo } from "react";
import { useEnrollmentStore } from "../../store/moduleEnrollment";
import TutorTaskReview from "./TutorTaskReview";

const ITEMS_PER_PAGE = 10;
const REFRESH_INTERVAL = 30000; // 30 sec auto refresh

const TutorAllStudents = () => {
  const { fetchTutorStudents } = useEnrollmentStore();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);

  // ===============================
  // LOAD STUDENTS + REAL TIME REFRESH
  // ===============================
  const loadStudents = async () => {
    setLoading(true);
    const data = await fetchTutorStudents();

    const grouped = data.map((student) => ({
      studentId: student._id,
      name: student.name,
      modules: student.modules || [],
    }));

    setStudents(grouped);
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
    const interval = setInterval(loadStudents, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // ===============================
  // STATUS LOGIC
  // ===============================
  const getReviewStatus = (tasks = {}) => {
    const statuses = Object.values(tasks).map((t) => t.status);

    if (statuses.length === 0) return "No Tasks";
    if (statuses.includes("pending")) return "Waiting";
    if (statuses.includes("rejected")) return "Needs Attention";
    if (statuses.every((s) => s === "approved")) return "Reviewed";

    return "In Progress";
  };

  const getCompletionPercent = (tasks = {}) => {
    const values = Object.values(tasks);
    if (values.length === 0) return 0;

    const approved = values.filter((t) => t.status === "approved").length;
    return Math.round((approved / values.length) * 100);
  };

  // ===============================
  // FILTERING
  // ===============================
  const filtered = useMemo(() => {
    return students
      .map((student) => ({
        ...student,
        modules: student.modules.filter(
          (module) =>
            student.name.toLowerCase().includes(search.toLowerCase()) ||
            module.title?.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((student) => student.modules.length > 0);
  }, [students, search]);

  // ===============================
  // SORTING
  // ===============================
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);

      if (sortBy === "progress") {
        const avgA =
          a.modules.reduce((sum, m) => sum + (m.progressPercent || 0), 0) /
          a.modules.length;

        const avgB =
          b.modules.reduce((sum, m) => sum + (m.progressPercent || 0), 0) /
          b.modules.length;

        return avgB - avgA;
      }

      return 0;
    });
  }, [filtered, sortBy]);

  // ===============================
  // PAGINATION
  // ===============================
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // ===============================
  // SUMMARY STATS
  // ===============================
  const stats = useMemo(() => {
    let reviewed = 0;
    let waiting = 0;
    let attention = 0;

    students.forEach((student) =>
      student.modules.forEach((module) => {
        const status = getReviewStatus(module.taskSubmissions);
        if (status === "Reviewed") reviewed++;
        if (status === "Waiting") waiting++;
        if (status === "Needs Attention") attention++;
      })
    );

    return {
      totalStudents: students.length,
      reviewed,
      waiting,
      attention,
    };
  }, [students]);

  // ===============================
  // EXPORT CSV
  // ===============================
  const exportCSV = () => {
    let rows = [["Student", "Module", "Progress", "Status", "Completion %"]];

    students.forEach((student) =>
      student.modules.forEach((module) => {
        rows.push([
          student.name,
          module.title,
          module.progressPercent,
          getReviewStatus(module.taskSubmissions),
          getCompletionPercent(module.taskSubmissions),
        ]);
      })
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "tutor_dashboard.csv";
    link.click();
  };

  // ===============================
  // UI
  // ===============================
  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={6} align="stretch">
        <Text
          fontSize="3xl"
          fontWeight="bold"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
          textAlign="center"
        >
          Student Submissions
        </Text>

        {/* SUMMARY */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Stat bg="gray.50" p={4} borderRadius="md">
            <StatLabel>Total Students</StatLabel>
            <StatNumber>{stats.totalStudents}</StatNumber>
          </Stat>
          <Stat bg="green.50" p={4} borderRadius="md">
            <StatLabel>Reviewed</StatLabel>
            <StatNumber>{stats.reviewed}</StatNumber>
          </Stat>
          <Stat bg="yellow.50" p={4} borderRadius="md">
            <StatLabel>Waiting</StatLabel>
            <StatNumber>{stats.waiting}</StatNumber>
          </Stat>
          <Stat bg="red.50" p={4} borderRadius="md">
            <StatLabel>Needs Attention</StatLabel>
            <StatNumber>{stats.attention}</StatNumber>
          </Stat>
        </SimpleGrid>

        {/* CONTROLS */}
        <HStack justify="space-between" flexWrap="wrap">
          <Input
            placeholder="Search student or module..."
            maxW="300px"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            maxW="200px"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="progress">Sort by Progress</option>
          </Select>

          <Button colorScheme="blue" onClick={exportCSV}>
            Export CSV
          </Button>
        </HStack>

        {loading && <Spinner alignSelf="center" />}

        {!loading && (
          <Box overflowX="auto">
            <Table variant="striped" colorScheme="cyan">
              <Thead>
                <Tr>
                  <Th>Student</Th>
                  <Th>Module</Th>
                  <Th>Progress</Th>
                  <Th>Status</Th>
                  <Th>Completion</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginated.map((student) =>
                  student.modules.map((module, index) => (
                    <Tr key={module.enrollmentId}>
                      {index === 0 && (
                        <Td rowSpan={student.modules.length} fontWeight="bold">
                          {student.name}
                        </Td>
                      )}

                      <Td>
                        <Badge colorScheme="purple">
                          {module.title}
                        </Badge>
                      </Td>

                      <Td>
                        <Progress value={module.progressPercent || 0} />
                      </Td>

                      <Td>
                        <Badge
                          colorScheme={
                            getReviewStatus(module.taskSubmissions) ===
                            "Reviewed"
                              ? "green"
                              : getReviewStatus(module.taskSubmissions) ===
                                "Waiting"
                              ? "yellow"
                              : "red"
                          }
                        >
                          {getReviewStatus(module.taskSubmissions)}
                        </Badge>
                      </Td>

                      <Td>
                        <Badge colorScheme="blue">
                          {getCompletionPercent(
                            module.taskSubmissions
                          )}
                          %
                        </Badge>
                      </Td>

                      <Td>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedStudent({
                              name: student.name,
                              enrollmentId: module.enrollmentId,
                              taskSubmissions: module.taskSubmissions,
                            });
                            setIsModalOpen(true);
                          }}
                        >
                          Review
                        </Button>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* PAGINATION */}
        <HStack justify="center">
          <Button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            isDisabled={page === 1}
          >
            Prev
          </Button>

          <Text>
            Page {page} of {totalPages}
          </Text>

          <Button
            onClick={() =>
              setPage((p) => Math.min(p + 1, totalPages))
            }
            isDisabled={page === totalPages}
          >
            Next
          </Button>
        </HStack>

        {/* MODAL */}
        {selectedStudent && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            size="xl"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {selectedStudent.name}'s Submissions
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Accordion allowToggle>
                  {Object.entries(
                    selectedStudent.taskSubmissions || {}
                  ).map(([taskId, task]) => (
                    <AccordionItem key={taskId}>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          {task.title || taskId}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel>
                        <TutorTaskReview
                          task={task}
                          enrollmentId={selectedStudent.enrollmentId}
                          taskId={taskId}
                        />
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </VStack>
    </Container>
  );
};

export default TutorAllStudents;