import { useEnrollmentStore } from "../../store/moduleEnrollment";
import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  Heading,
  Radio,
  RadioGroup,
  Checkbox,
  Button,
  Badge,
} from "@chakra-ui/react";

const MCQBlock = ({ data, blockId, onBlockCompleted, enrollmentId , progress}) => {
  const { submitMCQ, fetchQuizState } = useEnrollmentStore();
  const [qstate, setQstate] = useState(useEnrollmentStore((state) => state.quizStates[blockId]));
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const questions = data.questions;
    // Initialize answer structure
    useEffect(() => {
      setAnswers(questions.map(() => []));
    }, [questions]);

  // Fetch quiz state & enrollment
  useEffect(() => {
    const loadState = async () => {
      try {
        const state = await fetchQuizState(enrollmentId, blockId);
        setQstate(state);
      } catch (err) {
        console.error("Error fetching quiz state");
      }
    };
    loadState();
  }, [blockId, enrollmentId, fetchQuizState, result]);

  if (!enrollmentId) return <Text>Please enroll to attempt this quiz.</Text>;
  if (!qstate) return <Text>Loading quiz...</Text>;

  const {
    highestScore,
    attemptsRemaining,
    isPassed,
    isLocked,
    attemptsUsed,
    lastScore,
  } = qstate;

  // Handle option selection
  const handleOptionChange = (qIndex, optionIndex, type) => {
    setAnswers((prev) => {
      const updated = [...prev];
      if (type === "mcq") {
        updated[qIndex] = [optionIndex];
      } else {
        const exists = updated[qIndex].includes(optionIndex);
        updated[qIndex] = exists
          ? updated[qIndex].filter((i) => i !== optionIndex)
          : [...updated[qIndex], optionIndex];
      }
      return updated;
    });
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (!enrollmentId) return alert("Enrollment not found.");

    const isAllAnswered = answers.every((a) => a && a.length > 0);
    if (!isAllAnswered)
      return alert("Please answer all questions before submitting.");

    const res = await submitMCQ(enrollmentId, blockId, answers);
    if (!res?.success) return alert(res?.message || "Submission failed");

    setResult(res);
    if (res.score >= 50) {
      if (onBlockCompleted) onBlockCompleted();
    }
    setAnswers(questions.map(() => []));
  };

  return (
    <Box
      p={6}
      mb={0}
      borderWidth="1px"
      borderRadius="xl"
      borderBottomRadius={0}
      boxShadow="sm"
      bg="white"
    >
      <Heading size="md" mb={6}>
        {data.title ? data.title : "Quiz Assessment"}
      </Heading>

      <VStack spacing={6} align="stretch">
        {questions.map((question, qIndex) => (
          <Box
            key={qIndex}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg="gray.50"
          >
            <Text fontWeight="semibold" mb={4}>
              {qIndex + 1}. {question.questionText}
            </Text>

            <VStack spacing={3} align="stretch">
              {question.type === "mcq" ? (
                <RadioGroup
                  value={answers[qIndex]?.[0]}
                  onChange={(val) =>
                    handleOptionChange(qIndex, Number(val), "mcq")
                  }
                >
                  <VStack align="stretch">
                    {question.options.map((opt, optIndex) => (
                      <Radio
                        key={optIndex}
                        value={optIndex}
                        isDisabled={attemptsRemaining === 0 || isLocked || progress == 100}
                        colorScheme="blue"
                      >
                        {opt.text}
                      </Radio>
                    ))}
                  </VStack>
                </RadioGroup>
              ) : (
                <VStack align="stretch">
                  {question.options.map((opt, optIndex) => (
                    <Checkbox
                      key={optIndex}
                      isChecked={answers[qIndex]?.includes(optIndex)}
                      onChange={() =>
                        handleOptionChange(qIndex, optIndex, "mcq")
                      }
                      isDisabled={attemptsRemaining === 0 || isLocked || progress == 100}
                      colorScheme="blue"
                    >
                      {opt.text}
                    </Checkbox>
                  ))}
                </VStack>
              )}
            </VStack>
          </Box>
        ))}
      </VStack>

      {attemptsRemaining > 0 && progress !== 100 && (
        <Box mt={6}>
          <Button
            w="full"
            bg="darkblue"
            color="white"
            size="md"
            onClick={handleSubmit}
            isDisabled={isLocked}
          >
            Submit Quiz
          </Button>

          {attemptsUsed > 0 && (
            <Box mt={5} p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
              <Text fontWeight="bold" mb={2}>
                Your Score: <Badge colorScheme="blue">{lastScore}%</Badge>
              </Text>
              <Text fontSize="sm">
                {lastScore >= 50 ? "✅ You Passed" : "❌ Try again"}
              </Text>
              <Text fontSize="sm">Attempts Remaining: {attemptsRemaining}</Text>
            </Box>
          )}
        </Box>
      )}

      {!attemptsRemaining && (
        <Box mt={6} p={4} borderWidth="1px" borderRadius="md" bg="gray.100">
          <Text fontWeight="semibold">
            Highest Score: <Badge colorScheme="green">{highestScore}%</Badge>
          </Text>
          {isPassed ? (
            <Text mt={2} color="green.600" fontWeight="semibold">
              ✅ You passed!
            </Text>
          ) : (
            <Text mt={2} color="red.500" fontWeight="semibold">
              ❌ You didn't pass
            </Text>
          )}
          <Text fontSize="sm" mt={2}>
            Max attempts reached.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default MCQBlock;
