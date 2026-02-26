import { useEffect, useState } from "react";
import {
  Box,
  Text,
  Textarea,
  Input,
  Button,
  VStack,
  Heading,
  Divider,
  Link,
  FormControl,
  FormLabel,
  useToast,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { useEnrollmentStore } from "../../store/moduleEnrollment";

const MAX_ATTEMPTS = 3;

import { useAuthStore } from "../../store/auth";

const TaskBlock = ({ data, enrollmentId, taskId }) => {
  const { currentUser } = useAuthStore();
  const { fetchTask, submitTask, reviewTask } = useEnrollmentStore();

  const [taskSubmission, setTaskSubmission] = useState(null);
  const role = currentUser?.role || "guest";

  const toast = useToast();
  const [answer, setAnswer] = useState(taskSubmission?.submission?.value || "");
  const [grade, setGrade] = useState(taskSubmission?.score || "");
  const [feedback, setFeedback] = useState(taskSubmission?.feedback || "");
  const [loading, setLoading] = useState(false);

  const attemptsUsed = taskSubmission?.attemptCount || 0;
  const submissionType = data?.submissionType;
  const status = taskSubmission?.status;
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const isPending = status === "pending";
  const isFirstAttempt = !status;

  const maxAttemptsReached = attemptsUsed >= MAX_ATTEMPTS;

  const canSubmit =
    role === "student" && (isFirstAttempt || isRejected) && !maxAttemptsReached;

  const loadTask = async () => {
    const res = await fetchTask(enrollmentId, taskId);
    setTaskSubmission(res?.taskSubmissions || null);
  };
  useEffect(() => {
    loadTask();
  }, []);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      return toast({
        title: "Submission cannot be empty",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    if (maxAttemptsReached) {
      return toast({
        title: "Maximum attempts reached",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setLoading(true);

    const res = await submitTask(enrollmentId, taskId, answer, submissionType);

    setLoading(false);

    if (res.success) {
      toast({
        title: "Task submitted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadTask(); // Refresh task data after submission
      // Clear input after submission
      setAnswer("");
    } else {
      toast({
        title: res.message || "Submission failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  /* ------------------ TUTOR GRADE ------------------ */

  const handleGrade = async () => {
    if (grade === "" || grade < 0 || grade > 100) {
      return toast({
        title: "Grade must be between 0 and 100",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setLoading(true);

    const res = await reviewTask(enrollmentId, taskId, {
      status: Number(grade) >= 50 ? "approved" : "rejected",
      score: Number(grade),
      feedback,
    });

    setLoading(false);

    if (res.success) {
      toast({
        title: "Task graded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: res.message || "Grading failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderBottomRadius={0}
      p={6}
      mt={0}
      shadow="sm"
    >
      <VStack align="stretch" spacing={4}>
        <Heading size="md">{}</Heading>
        {role === "student" && (
          <>
            <Box mb={4}>
              <Text fontWeight="bold">Instructions:</Text>
              <Text>{data.instructions}</Text>
            </Box>

            <FormControl isRequired={data.required}>
              <FormLabel>Submission</FormLabel>

              {submissionType === "text" && (
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  isDisabled={!canSubmit}
                />
              )}

              {submissionType === "link" && (
                <Input
                  type="url"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter submission link"
                  isDisabled={!canSubmit}
                />
              )}
            </FormControl>

            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              isDisabled={!canSubmit}
            >
              Submit Task
            </Button>
            {isPending && (
              <Text fontSize="sm" color="orange.500">
                Your submission is under review. Please wait for tutor feedback.
              </Text>
            )}
            <HStack justify="space-between">
              <Text fontSize="sm" color="gray.500">
                Attempts: {attemptsUsed} / {MAX_ATTEMPTS}
              </Text>

              {isApproved && <Badge colorScheme="green">Approved</Badge>}
              {taskSubmission?.status === "rejected" && !isApproved && (
                <Badge colorScheme="red">Rejected</Badge>
              )}
            </HStack>
            {maxAttemptsReached && !isApproved && (
              <Text color="red.500" fontSize="sm">
                Maximum attempts reached. Please contact your tutor.
              </Text>
            )}
            {taskSubmission?.score && (
              <Text fontSize="sm" color="gray.500">
                Score: {taskSubmission?.score}
              </Text>
            )}
            {taskSubmission?.feedback && (
              <Box mt={3}>
                <Text fontWeight="bold">Feedback:</Text>
                <Text>{taskSubmission.feedback}</Text>
              </Box>
            )}
          </>
        )}

        {/* ================= TUTOR / ADMIN VIEW ================= */}
        {(role === "tutor" || role === "admin") && (
          <>
            <Divider />
            <Heading size="sm">Student Submission</Heading>

            <Text fontSize="sm" color="gray.500">
              Attempts Used: {attemptsUsed}
            </Text>

            {taskSubmission.submission?.type === "text" ? (
              <Box p={3} bg="gray.50" borderRadius="md" whiteSpace="pre-wrap">
                {taskSubmission.submission.text ||
                  taskSubmission.submission.link}
              </Box>
            ) : (
              <Link
                href={taskSubmission.submission?.value}
                isExternal
                color="blue.500"
              >
                View Submission Link
              </Link>
            )}

            <FormControl mt={4}>
              <FormLabel>Grade (0–100)</FormLabel>
              <Input
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </FormControl>

            <FormControl mt={3}>
              <FormLabel>Feedback (optional)</FormLabel>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </FormControl>

            <Button
              colorScheme="green"
              onClick={handleGrade}
              isLoading={loading}
              mt={2}
            >
              Grade Task
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default TaskBlock;
