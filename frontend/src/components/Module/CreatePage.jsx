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
      { title: "", body: "", videoLinks: [""], readingFiles: [""], order: 1 },
    ],
    tasks: [{ title: "", description: "", required: true, lessonOrder: 1 }],
    mcqBlocks: [
      {
        lessonOrder: 1,
        title: "MCQ Block 1",
        questions: [
          {
            questionText: "",
            options: ["", ""],
            correctAnswerIndex: 0,
          },
        ],
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
      const lessonsWithContent = newModule.lessons.map((lesson, idx) => ({
        ...lesson,
        tasks: (newModule.tasks || []).filter(
          (t) => Number(t.lessonOrder) === idx + 1,
        ),
        mcqBlocks: (newModule.mcqBlocks || []).filter(
          (mb) => Number(mb.lessonOrder) === idx + 1,
        ),
      }));
      const lessonsForBackend = lessonsWithContent;

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
        lessons: lessonsForBackend,
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
      case 2: // Lessons
        return (
          <VStack spacing={4} align="stretch">
            {newModule.lessons.map((lesson, idx) => (
              <Box key={idx} borderWidth={1} p={4} rounded="md">
                <HStack justify="space-between">
                  <Heading size="sm">Lesson #{idx + 1}</Heading>
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => removeArrayItem("lessons", idx)}
                  />
                </HStack>
                <Input
                  placeholder="Lesson Title"
                  value={lesson.title}
                  onChange={(e) =>
                    handleArrayChange("lessons", idx, "title", e.target.value)
                  }
                />
                <Textarea
                  placeholder="Lesson Body"
                  value={lesson.body}
                  onChange={(e) =>
                    handleArrayChange("lessons", idx, "body", e.target.value)
                  }
                />

                {["videoLinks", "readingFiles"].map((field) => (
                  <VStack key={field} spacing={2} align="stretch">
                    {lesson[field].map((item, i) => (
                      <HStack key={i}>
                        <Input
                          placeholder={`${field.slice(0, -1)} #${i + 1}`}
                          value={item}
                          onChange={(e) =>
                            handleNestedArrayChange(
                              "lessons",
                              idx,
                              field,
                              i,
                              e.target.value,
                            )
                          }
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() =>
                            removeNestedArrayItem("lessons", idx, field, i)
                          }
                        />
                      </HStack>
                    ))}
                    <Button
                      leftIcon={<AddIcon />}
                      onClick={() => addNestedArrayItem("lessons", idx, field)}
                    >
                      Add {field === "videoLinks" ? "Video" : "Reading File"}
                    </Button>
                  </VStack>
                ))}
              </Box>
            ))}
            <Button
              leftIcon={<AddIcon />}
              onClick={() =>
                addArrayItem("lessons", {
                  title: "",
                  body: "",
                  videoLinks: [""],
                  readingFiles: [""],
                  order: newModule.lessons.length + 1,
                })
              }
            >
              Add Lesson
            </Button>
          </VStack>
        );
      case 3: // Tasks
        return (
          <VStack spacing={4} align="stretch">
            {newModule.tasks.map((task, idx) => (
              <Box key={idx} borderWidth={1} p={4} rounded="md">
                <HStack justify="space-between">
                  <Heading size="sm">Task #{idx + 1}</Heading>
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => removeArrayItem("tasks", idx)}
                  />
                </HStack>
                <VStack spacing={3} align="stretch">
                  <Input
                    placeholder="Task Title"
                    value={task.title}
                    onChange={(e) =>
                      handleArrayChange("tasks", idx, "title", e.target.value)
                    }
                  />
                  <Textarea
                    placeholder="Task Description"
                    value={task.description}
                    onChange={(e) =>
                      handleArrayChange(
                        "tasks",
                        idx,
                        "description",
                        e.target.value,
                      )
                    }
                  />
                  <Select
                    value={task.lessonOrder}
                    onChange={(e) =>
                      handleArrayChange(
                        "tasks",
                        idx,
                        "lessonOrder",
                        Number(e.target.value),
                      )
                    }
                  >
                    {newModule.lessons.map((l, i) => (
                      <option key={i} value={i + 1}>
                        {l.title || `Lesson ${i + 1}`}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={task.required ? "true" : "false"}
                    onChange={(e) =>
                      handleArrayChange(
                        "tasks",
                        idx,
                        "required",
                        e.target.value === "true",
                      )
                    }
                  >
                    <option value="true">Required</option>
                    <option value="false">Optional</option>
                  </Select>
                </VStack>
              </Box>
            ))}
            <Button
              leftIcon={<AddIcon />}
              onClick={() =>
                addArrayItem("tasks", {
                  title: "",
                  description: "",
                  required: true,
                  lessonOrder: 1,
                })
              }
            >
              Add Task
            </Button>
          </VStack>
        );
      // case 4: // MCQs
      //   return (
      //     <VStack spacing={4} align="stretch">
      //       {newModule.mcqBlocks.map((block, idx) => (
      //         <Box key={idx} borderWidth={1} p={4} rounded="md">
      //           <HStack justify="space-between">
      //             <Heading size="sm">
      //               {block.title || `MCQ Block #${idx + 1}`}
      //             </Heading>
      //             <IconButton
      //               icon={<DeleteIcon />}
      //               onClick={() => removeArrayItem("mcqBlocks", idx)}
      //             />
      //           </HStack>
      //           <Input
      //             placeholder="Block Title"
      //             value={block.title}
      //             onChange={(e) =>
      //               handleArrayChange("mcqBlocks", idx, "title", e.target.value)
      //             }
      //           />

      //           {block.questions.map((q, qIdx) => (
      //             <Box key={qIdx} mt={3} p={2} borderWidth={1} rounded="md">
      //               <Input
      //                 placeholder="Question"
      //                 value={q.questionText}
      //                 onChange={(e) =>
      //                   handleNestedArrayChange(
      //                     "mcqBlocks",
      //                     idx,
      //                     "questions",
      //                     qIdx,
      //                     {
      //                       ...q,
      //                       questionText: e.target.value,
      //                     },
      //                   )
      //                 }
      //               />
      //               {q.options.map((opt, oIdx) => (
      //                 <HStack key={oIdx} mt={2}>
      //                   <Input
      //                     placeholder={`Option #${oIdx + 1}`}
      //                     value={opt}
      //                     onChange={(e) => {
      //                       const newOptions = [...q.options];
      //                       newOptions[oIdx] = e.target.value;
      //                       handleNestedArrayChange(
      //                         "mcqBlocks",
      //                         idx,
      //                         "questions",
      //                         qIdx,
      //                         {
      //                           ...q,
      //                           options: newOptions,
      //                         },
      //                       );
      //                     }}
      //                   />
      //                   <IconButton
      //                     icon={<DeleteIcon />}
      //                     onClick={() => {
      //                       const newOptions = [...q.options];
      //                       newOptions.splice(oIdx, 1);
      //                       handleNestedArrayChange(
      //                         "mcqBlocks",
      //                         idx,
      //                         "questions",
      //                         qIdx,
      //                         {
      //                           ...q,
      //                           options: newOptions,
      //                         },
      //                       );
      //                     }}
      //                   />
      //                 </HStack>
      //               ))}
      //               <Button
      //                 leftIcon={<AddIcon />}
      //                 size="sm"
      //                 mt={2}
      //                 onClick={() => {
      //                   const newOptions = [...q.options, ""];
      //                   handleNestedArrayChange(
      //                     "mcqBlocks",
      //                     idx,
      //                     "questions",
      //                     qIdx,
      //                     {
      //                       ...q,
      //                       options: newOptions,
      //                     },
      //                   );
      //                 }}
      //               >
      //                 Add Option
      //               </Button>
      //               <Select
      //                 mt={2}
      //                 value={q.correctAnswerIndex}
      //                 onChange={(e) =>
      //                   handleNestedArrayChange(
      //                     "mcqBlocks",
      //                     idx,
      //                     "questions",
      //                     qIdx,
      //                     {
      //                       ...q,
      //                       correctAnswerIndex: Number(e.target.value),
      //                     },
      //                   )
      //                 }
      //               >
      //                 {q.options.map((_, i) => (
      //                   <option key={i} value={i}>
      //                     Option {i + 1}
      //                   </option>
      //                 ))}
      //               </Select>
      //             </Box>
      //           ))}
      //           <Button
      //             leftIcon={<AddIcon />}
      //             mt={3}
      //             onClick={() => addMcqQuestion(idx)}
      //           >
      //             Add Question
      //           </Button>
      //         </Box>
      //       ))}
      //       <Button
      //         leftIcon={<AddIcon />}
      //         onClick={() =>
      //           addArrayItem("mcqBlocks", {
      //             lessonOrder: 1,
      //             title: `MCQ Block ${newModule.mcqBlocks.length + 1}`,
      //             questions: [
      //               {
      //                 questionText: "",
      //                 options: ["", ""],
      //                 correctAnswerIndex: 0,
      //               },
      //             ],
      //           })
      //         }
      //       >
      //         Add MCQ Block
      //       </Button>
      //     </VStack>
      //   );

      case 4: // MCQs
        return (
          <VStack spacing={4} align="stretch">
            {newModule.mcqBlocks.map((block, idx) => (
              <Box key={idx} borderWidth={1} p={4} rounded="md">
                <HStack justify="space-between">
                  <Heading size="sm">
                    {block.title || `MCQ Block #${idx + 1}`}
                  </Heading>
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => removeArrayItem("mcqBlocks", idx)}
                  />
                </HStack>
                <Input
                  placeholder="Block Title"
                  value={block.title}
                  onChange={(e) =>
                    handleArrayChange("mcqBlocks", idx, "title", e.target.value)
                  }
                />

                {/* Assign block to a lesson */}
                <Select
                  mt={2}
                  value={block.lessonOrder}
                  onChange={(e) =>
                    handleArrayChange(
                      "mcqBlocks",
                      idx,
                      "lessonOrder",
                      Number(e.target.value),
                    )
                  }
                >
                  {newModule.lessons.map((l, i) => (
                    <option key={i} value={i + 1}>
                      {l.title || `Lesson ${i + 1}`}
                    </option>
                  ))}
                </Select>

                {block.questions.map((q, qIdx) => (
                  <Box key={qIdx} mt={3} p={2} borderWidth={1} rounded="md">
                    <Input
                      placeholder="Question"
                      value={q.questionText}
                      onChange={(e) =>
                        handleNestedArrayChange(
                          "mcqBlocks",
                          idx,
                          "questions",
                          qIdx,
                          { ...q, questionText: e.target.value },
                        )
                      }
                    />
                    {q.options.map((opt, oIdx) => (
                      <HStack key={oIdx} mt={2}>
                        <Input
                          placeholder={`Option #${oIdx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[oIdx] = e.target.value;
                            handleNestedArrayChange(
                              "mcqBlocks",
                              idx,
                              "questions",
                              qIdx,
                              { ...q, options: newOptions },
                            );
                          }}
                        />
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={() => {
                            const newOptions = [...q.options];
                            newOptions.splice(oIdx, 1);
                            handleNestedArrayChange(
                              "mcqBlocks",
                              idx,
                              "questions",
                              qIdx,
                              { ...q, options: newOptions },
                            );
                          }}
                        />
                      </HStack>
                    ))}
                    <Button
                      leftIcon={<AddIcon />}
                      size="sm"
                      mt={2}
                      onClick={() => {
                        const newOptions = [...q.options, ""];
                        handleNestedArrayChange(
                          "mcqBlocks",
                          idx,
                          "questions",
                          qIdx,
                          {
                            ...q,
                            options: newOptions,
                          },
                        );
                      }}
                    >
                      Add Option
                    </Button>
                    <Select
                      mt={2}
                      value={q.correctAnswerIndex}
                      onChange={(e) =>
                        handleNestedArrayChange(
                          "mcqBlocks",
                          idx,
                          "questions",
                          qIdx,
                          {
                            ...q,
                            correctAnswerIndex: Number(e.target.value),
                          },
                        )
                      }
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
                  onClick={() => addMcqQuestion(idx)}
                >
                  Add Question
                </Button>
              </Box>
            ))}
            <Button
              leftIcon={<AddIcon />}
              onClick={() =>
                addArrayItem("mcqBlocks", {
                  lessonOrder: 1, // default to first lesson
                  title: `MCQ Block ${newModule.mcqBlocks.length + 1}`,
                  questions: [
                    {
                      questionText: "",
                      options: ["", ""],
                      correctAnswerIndex: 0,
                    },
                  ],
                })
              }
            >
              Add MCQ Block
            </Button>
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
            {step < 5 && (
              <Button colorScheme="blue" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            )}
            {step === 5 && (
              <Button
                colorScheme="blue.900"
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
