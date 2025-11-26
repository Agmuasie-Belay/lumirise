// src/pages/EditModule.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useModuleStore } from "../../store/module";
import {
  VStack,
  Input,
  Button,
  Textarea,
  useToast,
  Heading,
  HStack,
  IconButton,
  Box,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

const EditModule = () => {
  const { id } = useParams();
  const { modules, updateModule, fetchModules } = useModuleStore();
  const module = modules.find((m) => m._id === id);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoLinks, setVideoLinks] = useState([]);
  const [readingLinks, setReadingLinks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (module) {
      setTitle(module.title);
      setDescription(module.description || "");
      setVideoLinks(module.videoLinks || []);
      setReadingLinks(module.readingLinks || []);
      setTasks(module.tasks || []);
      setMcqs(module.mcqs || []);
    }
  }, [module]);

  if (!module) return <p>Module not found</p>;

  const handleAdd = (setter, array) => setter([...array, ""]);
  const handleRemove = (setter, array, index) => setter(array.filter((_, i) => i !== index));
  const handleChange = (setter, array, index, value) =>
    setter(array.map((item, i) => (i === index ? value : item)));

  const handleMCQChange = (index, field, value) => {
    setMcqs(mcqs.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };

  const handleAddMCQ = () => setMcqs([...mcqs, { question: "", options: ["", ""], answer: "" }]);
  const handleRemoveMCQ = (index) => setMcqs(mcqs.filter((_, i) => i !== index));
  const handleOptionChange = (qIndex, optIndex, value) => {
    setMcqs(
      mcqs.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, oi) => (oi === optIndex ? value : o)) }
          : q
      )
    );
  };
  const handleAddOption = (qIndex) =>
    setMcqs(mcqs.map((q, i) => (i === qIndex ? { ...q, options: [...q.options, ""] } : q)));

  const handleSubmit = async () => {
    const result = await updateModule(id, {
      title,
      description,
      videoLinks,
      readingLinks,
      tasks,
      mcqs,
    });
    toast({
      title: result.success ? "Updated" : "Error",
      description: result.message,
      status: result.success ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });
    if (result.success) {
      fetchModules();
      navigate("/tutor-home");
    }
  };

  return (
    <VStack spacing={4} maxW="container.md" mx="auto" mt={10} align="start" bg="white" p={6} borderRadius="md" boxShadow="md">
      <Heading size="lg">Edit Module</Heading>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Module Title" />
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Module Description"
      />

      <Heading size="md" mt={4}>Video Links</Heading>
      {videoLinks.map((link, idx) => (
        <HStack key={idx}>
          <Input
            value={link}
            onChange={(e) => handleChange(setVideoLinks, videoLinks, idx, e.target.value)}
          />
          <IconButton
            icon={<DeleteIcon />}
            onClick={() => handleRemove(setVideoLinks, videoLinks, idx)}
          />
        </HStack>
      ))}
      <Button leftIcon={<AddIcon />} onClick={() => handleAdd(setVideoLinks, videoLinks)}>
        Add Video Link
      </Button>

      <Heading size="md" mt={4}>Reading Links</Heading>
      {readingLinks.map((link, idx) => (
        <HStack key={idx}>
          <Input
            value={link}
            onChange={(e) => handleChange(setReadingLinks, readingLinks, idx, e.target.value)}
          />
          <IconButton
            icon={<DeleteIcon />}
            onClick={() => handleRemove(setReadingLinks, readingLinks, idx)}
          />
        </HStack>
      ))}
      <Button leftIcon={<AddIcon />} onClick={() => handleAdd(setReadingLinks, readingLinks)}>
        Add Reading Link
      </Button>

      <Heading size="md" mt={4}>Tasks</Heading>
      {tasks.map((task, idx) => (
        <HStack key={idx}>
          <Input value={task} onChange={(e) => handleChange(setTasks, tasks, idx, e.target.value)} />
          <IconButton icon={<DeleteIcon />} onClick={() => handleRemove(setTasks, tasks, idx)} />
        </HStack>
      ))}
      <Button leftIcon={<AddIcon />} onClick={() => handleAdd(setTasks, tasks)}>
        Add Task
      </Button>

      <Heading size="md" mt={4}>MCQs</Heading>
      {mcqs.map((q, qIdx) => (
        <Box key={qIdx} borderWidth="1px" borderRadius="md" p={3} w="full">
          <Input
            placeholder="Question"
            value={q.question}
            onChange={(e) => handleMCQChange(qIdx, "question", e.target.value)}
          />
          {q.options.map((opt, oIdx) => (
            <HStack key={oIdx} mt={2}>
              <Input
                placeholder={`Option ${oIdx + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
              />
            </HStack>
          ))}
          <Button size="sm" mt={2} leftIcon={<AddIcon />} onClick={() => handleAddOption(qIdx)}>
            Add Option
          </Button>
          <Input
            placeholder="Answer"
            mt={2}
            value={q.answer}
            onChange={(e) => handleMCQChange(qIdx, "answer", e.target.value)}
          />
          <Button size="sm" mt={2} colorScheme="red" leftIcon={<DeleteIcon />} onClick={() => handleRemoveMCQ(qIdx)}>
            Remove MCQ
          </Button>
        </Box>
      ))}
      <Button leftIcon={<AddIcon />} onClick={handleAddMCQ}>Add MCQ</Button>

      <Button colorScheme="blue" mt={6} onClick={handleSubmit}>Save Changes</Button>
    </VStack>
  );
};

export default EditModule;
