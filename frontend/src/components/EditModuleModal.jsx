// src/components/EditModuleModal.jsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  IconButton,
  Select,
  Heading,
  Box,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { useModuleStore } from "../store/module";

const EditModuleModal = ({ isOpen, onClose, moduleId }) => {
  const { modules, updateModule, fetchModules } = useModuleStore();
  const module = modules.find((m) => m._id === moduleId);
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [editedModule, setEditedModule] = useState({
    title: "",
    description: "",
    objectives: [],
    difficulty: "beginner",
    category: "",
    tags: [],
    lessons: [],
    tasks: [],
    mcqs: [],
  });

  // Prefill module data
  useEffect(() => {
    if (module) {
      setEditedModule({
        title: module.title || "",
        description: module.description || "",
        objectives: module.objectives || [],
        difficulty: module.difficulty || "beginner",
        category: module.category || "",
        tags: module.tags || [],
        lessons:
          module.lessons?.map((l, idx) => ({
            title: l.title || "",
            body: l.body || "",
            videoLinks: l.videoLinks?.length ? l.videoLinks : [""],
            readingFiles: l.readingFiles?.length ? l.readingFiles : [""],
            order: l.order || idx + 1,
          })) || [{ title: "", body: "", videoLinks: [""], readingFiles: [""], order: 1 }],
        tasks:
          module.tasks?.length
            ? module.tasks
            : [{ title: "", description: "", required: true }],
        mcqs:
          module.mcqs?.map((q) => ({
            question: q.question || "",
            options: q.options?.length ? q.options : ["", ""],
            answer: q.answer || q.correctAnswer || "",
            lessonOrder: q.lessonOrder || "",
          })) || [{ question: "", options: ["", ""], answer: "", lessonOrder: "" }],
      });
    }
  }, [module]);

  if (!module) return null;

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (key, value) =>
    setEditedModule({ ...editedModule, [key]: value });

  // Lessons
  const handleLessonChange = (idx, key, value) => {
    const updated = [...editedModule.lessons];
    updated[idx][key] = value;
    setEditedModule({ ...editedModule, lessons: updated });
  };

  const handleLessonArrayChange = (lessonIdx, field, idx, value) => {
    const updated = [...editedModule.lessons];
    updated[lessonIdx][field][idx] = value;
    setEditedModule({ ...editedModule, lessons: updated });
  };

  const addLessonArray = (lessonIdx, field) => {
    const updated = [...editedModule.lessons];
    updated[lessonIdx][field].push("");
    setEditedModule({ ...editedModule, lessons: updated });
  };

  const removeLessonArray = (lessonIdx, field, idx) => {
    const updated = [...editedModule.lessons];
    if (updated[lessonIdx][field].length > 1) {
      updated[lessonIdx][field].splice(idx, 1);
      setEditedModule({ ...editedModule, lessons: updated });
    }
  };

  const addLesson = () =>
    setEditedModule({
      ...editedModule,
      lessons: [
        ...editedModule.lessons,
        { title: "", body: "", videoLinks: [""], readingFiles: [""], order: editedModule.lessons.length + 1 },
      ],
    });

  const removeLesson = (idx) => {
    const updated = [...editedModule.lessons];
    updated.splice(idx, 1);
    setEditedModule({ ...editedModule, lessons: updated });
  };

  // Tasks
  const handleTaskChange = (idx, key, value) => {
    const updated = [...editedModule.tasks];
    updated[idx][key] = value;
    setEditedModule({ ...editedModule, tasks: updated });
  };

  const addTask = () =>
    setEditedModule({
      ...editedModule,
      tasks: [...editedModule.tasks, { title: "", description: "", required: true }],
    });

  const removeTask = (idx) => {
    const updated = [...editedModule.tasks];
    updated.splice(idx, 1);
    setEditedModule({ ...editedModule, tasks: updated });
  };

  // MCQs
  const handleMCQChange = (idx, key, value) => {
    const updated = [...editedModule.mcqs];
    updated[idx][key] = value;
    setEditedModule({ ...editedModule, mcqs: updated });
  };

  const handleMCQOptionChange = (mcqIdx, optIdx, value) => {
    const updated = [...editedModule.mcqs];
    updated[mcqIdx].options[optIdx] = value;
    setEditedModule({ ...editedModule, mcqs: updated });
  };

  const addMCQ = () =>
    setEditedModule({
      ...editedModule,
      mcqs: [...editedModule.mcqs, { question: "", options: ["", ""], answer: "", lessonOrder: "" }],
    });

  const removeMCQ = (idx) => {
    const updated = [...editedModule.mcqs];
    updated.splice(idx, 1);
    setEditedModule({ ...editedModule, mcqs: updated });
  };

  const addMCQOption = (mcqIdx) => {
    const updated = [...editedModule.mcqs];
    updated[mcqIdx].options.push("");
    setEditedModule({ ...editedModule, mcqs: updated });
  };

  const handleSubmit = async () => {
    // Clean up payload before sending
    const payload = {
      ...editedModule,
      objectives: editedModule.objectives.map((o) => o.trim()).filter(Boolean),
      tags: editedModule.tags.map((t) => t.trim()).filter(Boolean),
      lessons: editedModule.lessons.map((l) => ({
        ...l,
        videoLinks: l.videoLinks.filter((v) => v.trim() !== ""),
        readingFiles: l.readingFiles.filter((r) => r.trim() !== ""),
      })),
      tasks: editedModule.tasks.map((t) => ({
        title: t.title.trim() || "Untitled Task",
        description: t.description.trim() || t.title.trim() || "No description",
        required: t.required ?? true,
      })),
      mcqs: editedModule.mcqs.map((m) => ({
        question: m.question.trim(),
        options: m.options.filter((o) => o.trim() !== ""),
        correctAnswer: m.answer.trim(),
        lessonOrder: m.lessonOrder || null,
      })),
    };

    const result = await updateModule(moduleId, payload);

    toast({
      title: result.success ? "Updated" : "Error",
      description: result.message,
      status: result.success ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });

    if (result.success) {
      fetchModules();
      onClose();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <VStack spacing={4} align="stretch">
            <Input placeholder="Module Title" value={editedModule.title} onChange={(e) => handleChange("title", e.target.value)} />
            <Textarea placeholder="Description" value={editedModule.description} onChange={(e) => handleChange("description", e.target.value)} />
            <Textarea placeholder="Objectives (comma separated)" value={editedModule.objectives.join(", ")} onChange={(e) => handleChange("objectives", e.target.value.split(",").map(o => o.trim()))} />
            <Select value={editedModule.difficulty} onChange={(e) => handleChange("difficulty", e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
            <Input placeholder="Category" value={editedModule.category} onChange={(e) => handleChange("category", e.target.value)} />
            <Input placeholder="Tags (comma separated)" value={editedModule.tags.join(",")} onChange={(e) => handleChange("tags", e.target.value.split(",").map(t => t.trim()))} />
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={4} align="stretch">
            {editedModule.lessons.map((lesson, idx) => (
              <Box key={idx} borderWidth={1} p={4} rounded="md">
                <HStack justify="space-between">
                  <Heading size="sm">Lesson #{idx + 1}</Heading>
                  <IconButton icon={<DeleteIcon />} onClick={() => removeLesson(idx)} />
                </HStack>
                <Input placeholder="Title" value={lesson.title} onChange={(e) => handleLessonChange(idx, "title", e.target.value)} />
                <Textarea placeholder="Body" value={lesson.body} onChange={(e) => handleLessonChange(idx, "body", e.target.value)} />
                {lesson.videoLinks.map((v, vIdx) => (
                  <HStack key={vIdx}>
                    <Input placeholder={`Video #${vIdx + 1}`} value={v} onChange={(e) => handleLessonArrayChange(idx, "videoLinks", vIdx, e.target.value)} />
                    <IconButton icon={<DeleteIcon />} onClick={() => removeLessonArray(idx, "videoLinks", vIdx)} />
                  </HStack>
                ))}
                <Button leftIcon={<AddIcon />} onClick={() => addLessonArray(idx, "videoLinks")}>Add Video</Button>

                {lesson.readingFiles.map((r, rIdx) => (
                  <HStack key={rIdx}>
                    <Input placeholder={`Reading #${rIdx + 1}`} value={r} onChange={(e) => handleLessonArrayChange(idx, "readingFiles", rIdx, e.target.value)} />
                    <IconButton icon={<DeleteIcon />} onClick={() => removeLessonArray(idx, "readingFiles", rIdx)} />
                  </HStack>
                ))}
                <Button leftIcon={<AddIcon />} onClick={() => addLessonArray(idx, "readingFiles")}>Add Reading</Button>
              </Box>
            ))}
            <Button leftIcon={<AddIcon />} onClick={addLesson}>Add Lesson</Button>
          </VStack>
        );
      case 3:
        return (
          <VStack spacing={4} align="stretch">
            {editedModule.tasks.map((task, idx) => (
              <HStack key={idx}>
                <Input placeholder="Task Title" value={task.title} onChange={(e) => handleTaskChange(idx, "title", e.target.value)} />
                <Input placeholder="Task Description" value={task.description} onChange={(e) => handleTaskChange(idx, "description", e.target.value)} />
                <IconButton icon={<DeleteIcon />} onClick={() => removeTask(idx)} />
              </HStack>
            ))}
            <Button leftIcon={<AddIcon />} onClick={addTask}>Add Task</Button>
          </VStack>
        );
      case 4:
        return (
          <VStack spacing={4} align="stretch">
            {editedModule.mcqs.map((mcq, idx) => (
              <Box key={idx} borderWidth={1} p={4} rounded="md">
                <HStack justify="space-between">
                  <Heading size="sm">MCQ #{idx + 1}</Heading>
                  <IconButton icon={<DeleteIcon />} onClick={() => removeMCQ(idx)} />
                </HStack>
                <Input placeholder="Question" value={mcq.question} onChange={(e) => handleMCQChange(idx, "question", e.target.value)} />
                {mcq.options.map((opt, oIdx) => (
                  <HStack key={oIdx}>
                    <Input placeholder={`Option ${oIdx + 1}`} value={opt} onChange={(e) => handleMCQOptionChange(idx, oIdx, e.target.value)} />
                  </HStack>
                ))}
                <Button leftIcon={<AddIcon />} onClick={() => addMCQOption(idx)}>Add Option</Button>
                <Select placeholder="Answer" value={mcq.answer} onChange={(e) => handleMCQChange(idx, "answer", e.target.value)}>
                  {mcq.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </Select>
                <Select placeholder="Assign to Lesson" value={mcq.lessonOrder} onChange={(e) => handleMCQChange(idx, "lessonOrder", e.target.value)}>
                  {editedModule.lessons.map((l) => <option key={l.order} value={l.order}>{l.title}</option>)}
                </Select>
              </Box>
            ))}
            <Button leftIcon={<AddIcon />} onClick={addMCQ}>Add MCQ</Button>
          </VStack>
        );
      case 5:
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="md">Review Module</Heading>
            <Box>
              <p><strong>Title:</strong> {editedModule.title}</p>
              <p><strong>Description:</strong> {editedModule.description}</p>
              <p><strong>Objectives:</strong> {editedModule.objectives.join(", ")}</p>
              <p><strong>Difficulty:</strong> {editedModule.difficulty}</p>
              <p><strong>Category:</strong> {editedModule.category}</p>
              <p><strong>Tags:</strong> {editedModule.tags.join(", ")}</p>
            </Box>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Module</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{renderStep()}</ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            {step > 1 && <Button onClick={prevStep}>Back</Button>}
            {step < 5 && <Button colorScheme="blue" onClick={nextStep}>Next</Button>}
            {step === 5 && <Button colorScheme="green" onClick={handleSubmit}>Save Changes</Button>}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditModuleModal;
