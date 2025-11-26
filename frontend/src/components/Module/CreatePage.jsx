import {
  Input,
  Container,
  Heading,
  Box,
  Button,
  VStack,
  useColorModeValue,
  useToast,
  Textarea,
  HStack,
  IconButton,
  Select,
  Text,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { useModuleStore } from "../../store/module";
import { useNavigate } from "react-router-dom";

const CreateModulePage = () => {
  const [step, setStep] = useState(1);
  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    objectives: "",
    difficulty: "beginner",
    category: "",
    tags: [],
    lessons: [
      { title: "", body: "", videoLinks: [""], readingFiles: [""], order: 1 },
    ],
    tasks: [{ title: "", description: "", required: true }],
    mcqs: [{ question: "", options: ["", ""], answer: "", lessonOrder: "" }],
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { createModule } = useModuleStore();
  const navigate = useNavigate();

  // Access check
  useEffect(() => {
    const role = JSON.parse(localStorage.getItem("role"));
    if (role !== "tutor") {
      toast({
        title: "Access Denied",
        description: "Only tutors can create modules",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    }
  }, [navigate, toast]);

  // Step navigation
  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Generic change handlers
  const handleChange = (key, value) => setNewModule({ ...newModule, [key]: value });

  // ===== Lessons =====
  const handleLessonChange = (idx, key, value) => {
    const updated = [...newModule.lessons];
    updated[idx][key] = value;
    setNewModule({ ...newModule, lessons: updated });
  };

  const handleLessonArrayChange = (lessonIdx, field, idx, value) => {
    const updated = [...newModule.lessons];
    updated[lessonIdx][field][idx] = value;
    setNewModule({ ...newModule, lessons: updated });
  };

  const addLessonArray = (lessonIdx, field) => {
    const updated = [...newModule.lessons];
    updated[lessonIdx][field].push("");
    setNewModule({ ...newModule, lessons: updated });
  };

  const removeLessonArray = (lessonIdx, field, idx) => {
    const updated = [...newModule.lessons];
    updated[lessonIdx][field].splice(idx, 1);
    setNewModule({ ...newModule, lessons: updated });
  };

  const addLesson = () => {
    setNewModule({
      ...newModule,
      lessons: [
        ...newModule.lessons,
        { title: "", body: "", videoLinks: [""], readingFiles: [""], order: newModule.lessons.length + 1 },
      ],
    });
  };

  const removeLesson = (idx) => {
    const updated = [...newModule.lessons];
    updated.splice(idx, 1);
    setNewModule({ ...newModule, lessons: updated });
  };

  // ===== Tasks =====
  const handleTaskChange = (idx, key, value) => {
    const updated = [...newModule.tasks];
    updated[idx][key] = value;
    setNewModule({ ...newModule, tasks: updated });
  };

  const addTask = () => setNewModule({ ...newModule, tasks: [...newModule.tasks, { title: "", description: "", required: true }] });
  const removeTask = (idx) => {
    const updated = [...newModule.tasks];
    updated.splice(idx, 1);
    setNewModule({ ...newModule, tasks: updated });
  };

  // ===== MCQs =====
  const handleMCQChange = (idx, key, value) => {
    const updated = [...newModule.mcqs];
    updated[idx][key] = value;
    setNewModule({ ...newModule, mcqs: updated });
  };

  const handleMCQOptionChange = (mcqIdx, optIdx, value) => {
    const updated = [...newModule.mcqs];
    updated[mcqIdx].options[optIdx] = value;
    setNewModule({ ...newModule, mcqs: updated });
  };

  const addMCQ = () => setNewModule({ ...newModule, mcqs: [...newModule.mcqs, { question: "", options: ["", ""], answer: "", lessonOrder: "" }] });
  const removeMCQ = (idx) => {
    const updated = [...newModule.mcqs];
    updated.splice(idx, 1);
    setNewModule({ ...newModule, mcqs: updated });
  };
  const addMCQOption = (mcqIdx) => {
    const updated = [...newModule.mcqs];
    updated[mcqIdx].options.push("");
    setNewModule({ ...newModule, mcqs: updated });
  };
  const removeMCQOption = (mcqIdx, optIdx) => {
    const updated = [...newModule.mcqs];
    updated[mcqIdx].options.splice(optIdx, 1);
    setNewModule({ ...newModule, mcqs: updated });
  };

  // ===== Submit =====
  const handleAddModule = async () => {
    if (!newModule.title.trim() || !newModule.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Title and Description are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    const moduleToSend = {
      ...newModule,
      objectives: newModule.objectives.split(",").map(o => o.trim()).filter(Boolean),
      tags: newModule.tags.map(t => t).filter(Boolean),
      lessons: newModule.lessons.map(l => ({
        ...l,
        videoLinks: l.videoLinks.filter(v => v.trim() !== ""),
        readingFiles: l.readingFiles.filter(r => r.trim() !== ""),
      })),
      tasks: newModule.tasks.map(t => ({
        title: t.title.trim() || "Untitled Task",
        description: t.description.trim() || t.title.trim() || "No description",
        required: t.required ?? true,
      })),
      mcqs: newModule.mcqs.map(m => ({
        question: m.question.trim(),
        options: m.options.filter(o => o.trim() !== ""),
        correctAnswer: m.answer.trim(),
        lessonOrder: m.lessonOrder || null,
      })),
      status: "Draft",
    };

    const { success, message } = await createModule(moduleToSend);

    toast({
      title: success ? "Success" : "Error",
      description: message,
      status: success ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });

    setLoading(false);
    if (success) navigate("/modules");
  };

  // ===== Render Steps =====
  const renderStep = () => {
    switch (step) {
      case 1: // Module Details
        return (
          <VStack spacing={4} align="stretch">
            <Input placeholder="Module Title" value={newModule.title} onChange={(e) => handleChange("title", e.target.value)} />
            <Textarea placeholder="Module Description" value={newModule.description} onChange={(e) => handleChange("description", e.target.value)} />
            <Textarea placeholder="Objectives (comma separated)" value={newModule.objectives} onChange={(e) => handleChange("objectives", e.target.value)} />
            <Select value={newModule.difficulty} onChange={(e) => handleChange("difficulty", e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
            <Input placeholder="Category" value={newModule.category} onChange={(e) => handleChange("category", e.target.value)} />
            <Input placeholder="Tags (comma separated)" value={newModule.tags.join(",")} onChange={(e) => handleChange("tags", e.target.value.split(",").map(t => t))} />
          </VStack>
        );
      case 2: // Lessons
        return (
          <VStack spacing={4} align="stretch">
            {newModule.lessons.map((lesson, idx) => (
              <Box key={idx} borderWidth={1} p={4} rounded="md">
                <HStack justify="space-between">
                  <Heading size="sm">Lesson #{idx + 1}</Heading>
                  <IconButton icon={<DeleteIcon />} onClick={() => removeLesson(idx)} />
                </HStack>
                <Input placeholder="Lesson Title" value={lesson.title} onChange={(e) => handleLessonChange(idx, "title", e.target.value)} />
                <Textarea placeholder="Lesson Body" value={lesson.body} onChange={(e) => handleLessonChange(idx, "body", e.target.value)} />

                {lesson.videoLinks.map((v, vIdx) => (
                  <HStack key={vIdx}>
                    <Input placeholder={`Video Link #${vIdx + 1}`} value={v} onChange={(e) => handleLessonArrayChange(idx, "videoLinks", vIdx, e.target.value)} />
                    <IconButton icon={<DeleteIcon />} onClick={() => removeLessonArray(idx, "videoLinks", vIdx)} />
                  </HStack>
                ))}
                <Button leftIcon={<AddIcon />} onClick={() => addLessonArray(idx, "videoLinks")}>Add Video</Button>

                {lesson.readingFiles.map((r, rIdx) => (
                  <HStack key={rIdx}>
                    <Input placeholder={`Reading File #${rIdx + 1}`} value={r} onChange={(e) => handleLessonArrayChange(idx, "readingFiles", rIdx, e.target.value)} />
                    <IconButton icon={<DeleteIcon />} onClick={() => removeLessonArray(idx, "readingFiles", rIdx)} />
                  </HStack>
                ))}
                <Button leftIcon={<AddIcon />} onClick={() => addLessonArray(idx, "readingFiles")}>Add Reading File</Button>
              </Box>
            ))}
            <Button leftIcon={<AddIcon />} onClick={addLesson}>Add Lesson</Button>
          </VStack>
        );
      case 3: // Tasks
        return (
          <VStack spacing={4} align="stretch">
            {newModule.tasks.map((task, idx) => (
              <HStack key={idx}>
                <Input placeholder="Task Title" value={task.title} onChange={(e) => handleTaskChange(idx, "title", e.target.value)} />
                <Input placeholder="Task Description" value={task.description} onChange={(e) => handleTaskChange(idx, "description", e.target.value)} />
                <IconButton icon={<DeleteIcon />} onClick={() => removeTask(idx)} />
              </HStack>
            ))}
            <Button leftIcon={<AddIcon />} onClick={addTask}>Add Task</Button>
          </VStack>
        );
      case 4: // MCQs
        return (
          <VStack spacing={4} align="stretch">
            {newModule.mcqs.map((mcq, idx) => (
              <Box key={idx} borderWidth={1} p={4} rounded="md">
                <HStack justify="space-between">
                  <Heading size="sm">MCQ #{idx + 1}</Heading>
                  <IconButton icon={<DeleteIcon />} onClick={() => removeMCQ(idx)} />
                </HStack>
                <Input placeholder="Question" value={mcq.question} onChange={(e) => handleMCQChange(idx, "question", e.target.value)} />
                {mcq.options.map((opt, optIdx) => (
                  <HStack key={optIdx}>
                    <Input placeholder={`Option #${optIdx + 1}`} value={opt} onChange={(e) => handleMCQOptionChange(idx, optIdx, e.target.value)} />
                    <IconButton icon={<DeleteIcon />} onClick={() => removeMCQOption(idx, optIdx)} />
                  </HStack>
                ))}
                <Button leftIcon={<AddIcon />} onClick={() => addMCQOption(idx)}>Add Option</Button>

                <Select placeholder="Select Correct Answer" value={mcq.answer} onChange={(e) => handleMCQChange(idx, "answer", e.target.value)}>
                  {mcq.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </Select>

                <Select placeholder="Assign to lesson" value={mcq.lessonOrder} onChange={(e) => handleMCQChange(idx, "lessonOrder", e.target.value)}>
                  {newModule.lessons.map((l) => <option key={l.order} value={l.order}>{l.title}</option>)}
                </Select>
              </Box>
            ))}
            <Button leftIcon={<AddIcon />} onClick={addMCQ}>Add MCQ</Button>
          </VStack>
        );
      case 5: // Review
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="md">Review Module</Heading>
            <Text fontWeight="bold">Title: {newModule.title}</Text>
            <Text fontWeight="bold">Description: {newModule.description}</Text>
            <Text fontWeight="bold">Objectives: {newModule.objectives}</Text>
            <Text fontWeight="bold">Difficulty: {newModule.difficulty}</Text>
            <Text fontWeight="bold">Category: {newModule.category}</Text>
            <Text fontWeight="bold">Tags: {newModule.tags.join(", ")}</Text>

            {newModule.lessons.map((l) => (
              <Box key={l.order} borderWidth={1} p={2} rounded="md">
                <Text fontWeight="bold">Lesson: {l.title}</Text>
                <Text>{l.body}</Text>
                <Text>Videos: {l.videoLinks.join(", ")}</Text>
                <Text>Readings: {l.readingFiles.join(", ")}</Text>
              </Box>
            ))}

            {newModule.tasks.map((t, i) => <Text key={i}>Task: {t.title} | {t.description}</Text>)}

            {newModule.mcqs.map((q, i) => <Text key={i}>MCQ: {q.question} | Answer: {q.answer} | Lesson: {q.lessonOrder}</Text>)}
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxW="container.md" py={6}>
      <VStack spacing={6}>
        <Heading as="h1" size="xl" textAlign="center">Create New Module</Heading>
        <Box w="full" bg={useColorModeValue("white", "gray.800")} p={6} rounded="lg" shadow="md">
          {renderStep()}
          <HStack justify="space-between" mt={4}>
            {step > 1 && <Button onClick={prevStep}>Back</Button>}
            {step < 5 && <Button colorScheme="blue" onClick={nextStep}>Next</Button>}
            {step === 5 && <Button colorScheme="green" onClick={handleAddModule} isLoading={loading}>Create Module</Button>}
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreateModulePage;
