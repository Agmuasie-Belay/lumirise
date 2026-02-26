import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Divider,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  useToast,
  Progress,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@chakra-ui/react";
import { useState } from "react";
import { useEnrollmentStore } from "../../store/moduleEnrollment";

const TutorTaskReview = ({ task, enrollmentId, taskId }) => {
    console.log("Reviewing task:", { task, enrollmentId, taskId });
  const { reviewTask } = useEnrollmentStore();
  const toast = useToast();

  const [grade, setGrade] = useState(task?.score || "");
  const [feedback, setFeedback] = useState(task?.feedback || "");
  const [loading, setLoading] = useState(false);

  // Determine status color
  const statusColor =
    task?.status === "approved"
      ? "green"
      : task?.status === "rejected"
      ? "red"
      : "orange";

  const handleGrade = async () => {
    if (grade === "" || grade < 0 || grade > 100) {
      return toast({
        title: "Grade must be between 0–100",
        status: "error",
      });
    }

    setLoading(true);

    const payload = {
      status: Number(grade) >= 50 ? "approved" : "rejected",
      score: Number(grade),
      feedback,
    };

    const res = await reviewTask(enrollmentId, taskId, payload);

    setLoading(false);

    if (res.success) {
      toast({
        title: "Task graded successfully",
        status: "success",
      });

      // ✅ Update local task object instantly
      task.status = payload.status;
      task.score = payload.score;
      task.feedback = payload.feedback;
      task.reviewedAt = new Date();
    } else {
      toast({
        title: res.message,
        status: "error",
      });
    }
  };

  return (
    <Card shadow="md" borderRadius="xl">
      <CardHeader>
        <HStack justify="space-between">
          <Heading size="md">{task?.title || "Task Review"}</Heading>
          <Badge colorScheme={statusColor} fontSize="sm">
            {task?.status || "pending"}
          </Badge>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack align="stretch" spacing={4}>
          <Text fontSize="sm" color="gray.500">
            Attempts Used: {task?.attemptCount || 0}
          </Text>

          <Divider />

          <Box
            p={4}
            bg="gray.50"
            borderRadius="lg"
            border="1px solid"
            borderColor="gray.200"
            whiteSpace="pre-wrap"
          >
            {task?.submission?.text || task?.submission?.link || "No submission"}
          </Box>

          <FormControl>
            <FormLabel>Grade (0–100)</FormLabel>
            <Input
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              borderRadius="lg"
            />
            {grade !== "" && (
              <Progress
                mt={2}
                value={Number(grade)}
                borderRadius="lg"
                colorScheme={grade < 50 ? "red" : grade < 75 ? "yellow" : "green"}
                hasStripe
                isAnimated
              />
            )}
          </FormControl>

          <FormControl>
            <FormLabel>Feedback</FormLabel>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              borderRadius="lg"
            />
          </FormControl>
        </VStack>
      </CardBody>

      <CardFooter>
        <Button
          colorScheme="blue"
          width="full"
          borderRadius="xl"
          onClick={handleGrade}
          isLoading={loading}
        >
          Save Grade
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TutorTaskReview;