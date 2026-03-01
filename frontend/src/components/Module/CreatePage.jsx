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
    tags: "",
    lessons: [
      {
        title: "",
        blocks: [],
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { createModule } = useModuleStore();
  const navigate = useNavigate();

  // Access control
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

  // ===== Generic handlers =====
  const handleChange = (key, value) =>
    setNewModule({ ...newModule, [key]: value });

  const handleArrayChange = (arrName, idx, key, value) => {
    const arr = [...newModule[arrName]];
    arr[idx][key] = value;
    setNewModule({ ...newModule, [arrName]: arr });
  };

  const handleNestedArrayChange = (arrName, idx, field, fieldIdx, value) => {
    const arr = [...newModule[arrName]];
    arr[idx][field][fieldIdx] = value;
    setNewModule({ ...newModule, [arrName]: arr });
  };

  const addArrayItem = (arrName, defaultItem) =>
    setNewModule({
      ...newModule,
      [arrName]: [...newModule[arrName], defaultItem],
    });
  const removeArrayItem = (arrName, idx) => {
    const arr = [...newModule[arrName]];
    arr.splice(idx, 1);
    setNewModule({ ...newModule, [arrName]: arr });
  };
  const addMcqQuestion = (blockIdx) => {
    const blocks = [...newModule.mcqBlocks];
    blocks[blockIdx].questions.push({
      questionText: "",
      options: ["", ""],
      correctAnswerIndex: 0,
    });
    setNewModule({ ...newModule, mcqBlocks: blocks });
  };

  const addNestedArrayItem = (arrName, idx, field) => {
    const arr = [...newModule[arrName]];
    arr[idx][field].push("");
    setNewModule({ ...newModule, [arrName]: arr });
  };
  const removeNestedArrayItem = (arrName, idx, field, fieldIdx) => {
    const arr = [...newModule[arrName]];
    arr[idx][field].splice(fieldIdx, 1);
    setNewModule({ ...newModule, [arrName]: arr });
  };

  // Submission
  const handleAddModule = async () => {
    if (!newModule.title.trim() || !newModule.description.trim()) {
      return toast({
        title: "Validation Error",
        description: "Title and Description are required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setLoading(true);

    try {

      const moduleToSend = {
        title: newModule.title.trim(),
        description: newModule.description.trim(),
        objectives: (newModule.objectives || "")
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
        tags: (newModule.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        difficulty: newModule.difficulty,
        category: newModule.category,
        lessons: newModule.lessons,
        bannerUrl: (newModule.bannerUrl || "").trim(),
      };

      const { success, message } = await createModule(moduleToSend);

      toast({
        title: success ? "Success" : "Error",
        description: message,
        status: success ? "success" : "error",
        duration: 3000,
        isClosable: true,
      });

      if (success) navigate("/tutor");
    } catch (err) {
      toast({
        title: "Server Error",
        description: "Failed to create module",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const addBlockToLesson = (lessonIdx, type) => {
    const lessons = [...newModule.lessons];

    let newBlock = {
      type,
      order: lessons[lessonIdx].blocks.length + 1,
    };

    if (type === "markdown") {
      newBlock.title = "";
      newBlock.body = "";
    }

    if (type === "video" || type === "ppt") {
      newBlock.title = "";
      newBlock.url = "";
    }

    if (type === "task") {
      newBlock.title = "";
      newBlock.description = "";
    }

    if (type === "mcq") {
      newBlock = {
        type: "mcq",
        title: `Knowledge Check ${lessons[lessonIdx].blocks.length + 1}`,
        questions: [
          {
            questionText: "",
            options: ["", ""],
            correctAnswerIndex: 0,
          },
        ],
      };
    }

    lessons[lessonIdx].blocks.push(newBlock);
    setNewModule({ ...newModule, lessons });
  };
  // Render Steps
  const renderStep = () => {
    switch (step) {
      case 1: // Module Details
        return (
          <VStack spacing={4} align="stretch">
            <Input
              placeholder="Module Title"
              value={newModule.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            <Textarea
              placeholder="Module Description"
              value={newModule.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            <Textarea
              placeholder="Objectives (comma separated)"
              value={newModule.objectives}
              onChange={(e) => handleChange("objectives", e.target.value)}
            />
            <Select
              value={newModule.difficulty}
              onChange={(e) => handleChange("difficulty", e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
            <Input
              placeholder="Category"
              value={newModule.category}
              onChange={(e) => handleChange("category", e.target.value)}
            />
            <Input
              placeholder="Tags (comma separated)"
              value={newModule.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
            />
            <Input
              placeholder="Module Banner URL"
              value={newModule.bannerUrl}
              onChange={(e) => handleChange("bannerUrl", e.target.value)}
            />
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={4} align="stretch">
            {newModule.lessons.map((lesson, lessonIdx) => (
              <Box key={lessonIdx} borderWidth={1} p={4} rounded="md">
                <HStack justify="space-between">
                  <Heading size="sm">Lesson #{lessonIdx + 1}</Heading>
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => removeArrayItem("lessons", lessonIdx)}
                  />
                </HStack>

                <Input
                  placeholder="Lesson Title"
                  value={lesson.title}
                  onChange={(e) =>
                    handleArrayChange(
                      "lessons",
                      lessonIdx,
                      "title",
                      e.target.value,
                    )
                  }
                />

                {/* BLOCK ADD BUTTONS */}
                <HStack mt={3} spacing={2} wrap="wrap">
                  <Button
                    size="sm"
                    onClick={() => addBlockToLesson(lessonIdx, "markdown")}
                  >
                    Add Lesson Body
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addBlockToLesson(lessonIdx, "video")}
                  >
                    Add Video
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addBlockToLesson(lessonIdx, "ppt")}
                  >
                    Add Reading File
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addBlockToLesson(lessonIdx, "task")}
                  >
                    Add Task
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addBlockToLesson(lessonIdx, "mcq")}
                  >
                    Add MCQ
                  </Button>
                </HStack>

                {/* RENDER BLOCKS IN CREATION ORDER */}
                {(lesson.blocks || []).map((block, blockIdx) => (
                  <Box key={blockIdx} mt={4} p={3} borderWidth={1} rounded="md">
                    <HStack justify="space-between">
                      <Text fontWeight="bold">{block.type.toUpperCase()}</Text>
                      <IconButton
                        size="sm"
                        icon={<DeleteIcon />}
                        onClick={() => {
                          const lessonsCopy = [...newModule.lessons];
                          lessonsCopy[lessonIdx].blocks.splice(blockIdx, 1);
                          setNewModule({ ...newModule, lessons: lessonsCopy });
                        }}
                      />
                    </HStack>

                    {/* LESSON BODY */}
                    {block.type === "markdown" && (
                      <>
                        <Input
                          placeholder="Section Title"
                          value={block.title}
                          onChange={(e) => {
                            const lessonsCopy = [...newModule.lessons];
                            lessonsCopy[lessonIdx].blocks[blockIdx].title =
                              e.target.value;
                            setNewModule({
                              ...newModule,
                              lessons: lessonsCopy,
                            });
                          }}
                        />
                        <Textarea
                          mt={2}
                          placeholder="Markdown Body"
                          value={block.body}
                          onChange={(e) => {
                            const lessonsCopy = [...newModule.lessons];
                            lessonsCopy[lessonIdx].blocks[blockIdx].body =
                              e.target.value;
                            setNewModule({
                              ...newModule,
                              lessons: lessonsCopy,
                            });
                          }}
                        />
                      </>
                    )}

                    {/* VIDEO / READING */}
                    {(block.type === "video" || block.type === "ppt") && (
                      <>
                        <Input
                          placeholder="Title"
                          value={block.title}
                          onChange={(e) => {
                            const lessonsCopy = [...newModule.lessons];
                            lessonsCopy[lessonIdx].blocks[blockIdx].title =
                              e.target.value;
                            setNewModule({
                              ...newModule,
                              lessons: lessonsCopy,
                            });
                          }}
                        />
                        <Input
                          mt={2}
                          placeholder="URL"
                          value={block.url}
                          onChange={(e) => {
                            const lessonsCopy = [...newModule.lessons];
                            lessonsCopy[lessonIdx].blocks[blockIdx].url =
                              e.target.value;
                            setNewModule({
                              ...newModule,
                              lessons: lessonsCopy,
                            });
                          }}
                        />
                      </>
                    )}

                    {/* TASK */}
                    {block.type === "task" && (
                      <>
                        <Input
                          placeholder="Task Title"
                          value={block.title}
                          onChange={(e) => {
                            const lessonsCopy = [...newModule.lessons];
                            lessonsCopy[lessonIdx].blocks[blockIdx].title =
                              e.target.value;
                            setNewModule({
                              ...newModule,
                              lessons: lessonsCopy,
                            });
                          }}
                        />
                        <Textarea
                          mt={2}
                          placeholder="Task Description"
                          value={block.description}
                          onChange={(e) => {
                            const lessonsCopy = [...newModule.lessons];
                            lessonsCopy[lessonIdx].blocks[
                              blockIdx
                            ].description = e.target.value;
                            setNewModule({
                              ...newModule,
                              lessons: lessonsCopy,
                            });
                          }}
                        />
                      </>
                    )}

                    {/* MCQ */}
                    {block.type === "mcq" && (
                      <>
                        <Input
                          placeholder="Block Title"
                          value={block.title}
                          onChange={(e) => {
                            const lessonsCopy = [...newModule.lessons];
                            lessonsCopy[lessonIdx].blocks[blockIdx].title =
                              e.target.value;
                            setNewModule({
                              ...newModule,
                              lessons: lessonsCopy,
                            });
                          }}
                        />

                        {block.questions.map((q, qIdx) => (
                          <Box
                            key={qIdx}
                            mt={3}
                            p={2}
                            borderWidth={1}
                            rounded="md"
                          >
                            <Input
                              placeholder="Question"
                              value={q.questionText}
                              onChange={(e) => {
                                const lessonsCopy = [...newModule.lessons];
                                lessonsCopy[lessonIdx].blocks[
                                  blockIdx
                                ].questions[qIdx].questionText = e.target.value;
                                setNewModule({
                                  ...newModule,
                                  lessons: lessonsCopy,
                                });
                              }}
                            />

                            {q.options.map((opt, oIdx) => (
                              <HStack key={oIdx} mt={2}>
                                <Input
                                  placeholder={`Option #${oIdx + 1}`}
                                  value={opt}
                                  onChange={(e) => {
                                    const lessonsCopy = [...newModule.lessons];
                                    lessonsCopy[lessonIdx].blocks[
                                      blockIdx
                                    ].questions[qIdx].options[oIdx] =
                                      e.target.value;
                                    setNewModule({
                                      ...newModule,
                                      lessons: lessonsCopy,
                                    });
                                  }}
                                />
                                <IconButton
                                  icon={<DeleteIcon />}
                                  onClick={() => {
                                    const lessonsCopy = [...newModule.lessons];
                                    lessonsCopy[lessonIdx].blocks[
                                      blockIdx
                                    ].questions[qIdx].options.splice(oIdx, 1);
                                    setNewModule({
                                      ...newModule,
                                      lessons: lessonsCopy,
                                    });
                                  }}
                                />
                              </HStack>
                            ))}

                            <Button
                              leftIcon={<AddIcon />}
                              size="sm"
                              mt={2}
                              onClick={() => {
                                const lessonsCopy = [...newModule.lessons];
                                lessonsCopy[lessonIdx].blocks[
                                  blockIdx
                                ].questions[qIdx].options.push("");
                                setNewModule({
                                  ...newModule,
                                  lessons: lessonsCopy,
                                });
                              }}
                            >
                              Add Option
                            </Button>

                            <Select
                              mt={2}
                              value={q.correctAnswerIndex}
                              onChange={(e) => {
                                const lessonsCopy = [...newModule.lessons];
                                lessonsCopy[lessonIdx].blocks[
                                  blockIdx
                                ].questions[qIdx].correctAnswerIndex = Number(
                                  e.target.value,
                                );
                                setNewModule({
                                  ...newModule,
                                  lessons: lessonsCopy,
                                });
                              }}
                            >
                              {q.options.map((_, i) => (
                                <option key={i} value={i}>
                                  Option {i + 1}
                                </option>
                              ))}
                            </Select>
                          </Box>
                        ))}

                        <Button
                          leftIcon={<AddIcon />}
                          mt={3}
                          onClick={() => {
                            const lessonsCopy = [...newModule.lessons];
                            lessonsCopy[lessonIdx].blocks[
                              blockIdx
                            ].questions.push({
                              questionText: "",
                              options: ["", ""],
                              correctAnswerIndex: 0,
                            });
                            setNewModule({
                              ...newModule,
                              lessons: lessonsCopy,
                            });
                          }}
                        >
                          Add Question
                        </Button>
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            ))}

            <Button
              leftIcon={<AddIcon />}
              onClick={() =>
                addArrayItem("lessons", {
                  title: "",
                  blocks: [],
                })
              }
            >
              Add New Lesson
            </Button>
          </VStack>
        );

      case 3: // Review
        return (
          <VStack spacing={4} align="stretch">
            <Heading size="md">Review Module</Heading>
            <Text fontWeight="bold">Title: {newModule.title}</Text>
            <Text fontWeight="bold">Description: {newModule.description}</Text>
            <Text fontWeight="bold">Objectives: {newModule.objectives}</Text>
            <Text fontWeight="bold">Difficulty: {newModule.difficulty}</Text>
            <Text fontWeight="bold">Category: {newModule.category}</Text>
            <Text fontWeight="bold">Tags: {newModule.tags}</Text>
          </VStack>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxW="container.md" py={6}>
      <VStack spacing={6}>
        <Heading as="h1" size="xl" textAlign="center">
          Create New Module
        </Heading>
        <Box
          w="full"
          bg={useColorModeValue("white", "gray.800")}
          p={6}
          rounded="lg"
          shadow="md"
        >
          {renderStep()}
          <HStack justify="space-between" mt={4}>
            {step > 1 && (
              <Button onClick={() => setStep(step - 1)}>Back</Button>
            )}
            {step < 3 && (
              <Button colorScheme="blue" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            )}
            {step === 3 && (
              <Button
                colorScheme="blue"
                onClick={handleAddModule}
                isLoading={loading}
              >
                Create Module
              </Button>
            )}
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default CreateModulePage;