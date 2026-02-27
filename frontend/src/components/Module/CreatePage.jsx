// import {
//   Input,
//   Container,
//   Heading,
//   Box,
//   Button,
//   VStack,
//   useColorModeValue,
//   useToast,
//   Textarea,
//   HStack,
//   IconButton,
//   Select,
//   Text,
// } from "@chakra-ui/react";
// import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
// import { useState, useEffect } from "react";
// import { useModuleStore } from "../../store/module";
// import { useNavigate } from "react-router-dom";

// const CreateModulePage = () => {
//   const [step, setStep] = useState(1);
//   const [newModule, setNewModule] = useState({
//     title: "",
//     description: "",
//     objectives: "",
//     difficulty: "beginner",
//     category: "",
//     tags: "",
//     lessons: [
//       { title: "", body: "", videoLinks: [""], readingFiles: [""], order: 1 },
//     ],
//     tasks: [{ title: "", description: "", required: true, lessonOrder: 1 }],
//     mcqBlocks: [
//       {
//         lessonOrder: 1,
//         title: "MCQ Block 1",
//         questions: [
//           {
//             questionText: "",
//             options: ["", ""],
//             correctAnswerIndex: 0,
//           },
//         ],
//       },
//     ],
//   });

//   const [loading, setLoading] = useState(false);
//   const toast = useToast();
//   const { createModule } = useModuleStore();
//   const navigate = useNavigate();

//   // Access control
//   useEffect(() => {
//     const role = JSON.parse(localStorage.getItem("role"));
//     if (role !== "tutor") {
//       toast({
//         title: "Access Denied",
//         description: "Only tutors can create modules",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       navigate("/");
//     }
//   }, [navigate, toast]);

//   // ===== Generic handlers =====
//   const handleChange = (key, value) =>
//     setNewModule({ ...newModule, [key]: value });

//   const handleArrayChange = (arrName, idx, key, value) => {
//     const arr = [...newModule[arrName]];
//     arr[idx][key] = value;
//     setNewModule({ ...newModule, [arrName]: arr });
//   };

//   const handleNestedArrayChange = (arrName, idx, field, fieldIdx, value) => {
//     const arr = [...newModule[arrName]];
//     arr[idx][field][fieldIdx] = value;
//     setNewModule({ ...newModule, [arrName]: arr });
//   };

//   const addArrayItem = (arrName, defaultItem) =>
//     setNewModule({
//       ...newModule,
//       [arrName]: [...newModule[arrName], defaultItem],
//     });
//   const removeArrayItem = (arrName, idx) => {
//     const arr = [...newModule[arrName]];
//     arr.splice(idx, 1);
//     setNewModule({ ...newModule, [arrName]: arr });
//   };
//   const addMcqQuestion = (blockIdx) => {
//     const blocks = [...newModule.mcqBlocks];
//     blocks[blockIdx].questions.push({
//       questionText: "",
//       options: ["", ""],
//       correctAnswerIndex: 0,
//     });
//     setNewModule({ ...newModule, mcqBlocks: blocks });
//   };

//   const addNestedArrayItem = (arrName, idx, field) => {
//     const arr = [...newModule[arrName]];
//     arr[idx][field].push("");
//     setNewModule({ ...newModule, [arrName]: arr });
//   };
//   const removeNestedArrayItem = (arrName, idx, field, fieldIdx) => {
//     const arr = [...newModule[arrName]];
//     arr[idx][field].splice(fieldIdx, 1);
//     setNewModule({ ...newModule, [arrName]: arr });
//   };

//   // Submission
//   const handleAddModule = async () => {
//     if (!newModule.title.trim() || !newModule.description.trim()) {
//       return toast({
//         title: "Validation Error",
//         description: "Title and Description are required",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     }

//     setLoading(true);

//     try {
//       const lessonsForBackend  = newModule.lessons.map((lesson, idx) => ({
//         ...lesson,
//         tasks: (newModule.tasks || []).filter(
//           (t) => Number(t.lessonOrder) === idx + 1,
//         ),
//         mcqBlocks: (newModule.mcqBlocks || []).filter(
//           (mb) => Number(mb.lessonOrder) === idx + 1,
//         ),
//       }));
      

//       const moduleToSend = {
//         title: newModule.title.trim(),
//         description: newModule.description.trim(),
//         objectives: (newModule.objectives || "")
//           .split(",")
//           .map((o) => o.trim())
//           .filter(Boolean),
//         tags: (newModule.tags || "")
//           .split(",")
//           .map((t) => t.trim())
//           .filter(Boolean),
//         difficulty: newModule.difficulty,
//         category: newModule.category,
//         lessons: lessonsForBackend,
//         bannerUrl: (newModule.bannerUrl || "").trim(),
//       };

//       const { success, message } = await createModule(moduleToSend);

//       toast({
//         title: success ? "Success" : "Error",
//         description: message,
//         status: success ? "success" : "error",
//         duration: 3000,
//         isClosable: true,
//       });

//       if (success) navigate("/tutor");
//     } catch (err) {
//       toast({
//         title: "Server Error",
//         description: "Failed to create module",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };
//   // Render Steps
//   const renderStep = () => {
//     switch (step) {
//       case 1: // Module Details
//         return (
//           <VStack spacing={4} align="stretch">
//             <Input
//               placeholder="Module Title"
//               value={newModule.title}
//               onChange={(e) => handleChange("title", e.target.value)}
//             />
//             <Textarea
//               placeholder="Module Description"
//               value={newModule.description}
//               onChange={(e) => handleChange("description", e.target.value)}
//             />
//             <Textarea
//               placeholder="Objectives (comma separated)"
//               value={newModule.objectives}
//               onChange={(e) => handleChange("objectives", e.target.value)}
//             />
//             <Select
//               value={newModule.difficulty}
//               onChange={(e) => handleChange("difficulty", e.target.value)}
//             >
//               <option value="beginner">Beginner</option>
//               <option value="intermediate">Intermediate</option>
//               <option value="advanced">Advanced</option>
//             </Select>
//             <Input
//               placeholder="Category"
//               value={newModule.category}
//               onChange={(e) => handleChange("category", e.target.value)}
//             />
//             <Input
//               placeholder="Tags (comma separated)"
//               value={newModule.tags}
//               onChange={(e) => handleChange("tags", e.target.value)}
//             />
//             <Input
//               placeholder="Module Banner URL"
//               value={newModule.bannerUrl}
//               onChange={(e) => handleChange("bannerUrl", e.target.value)}
//             />
//           </VStack>
//         );
//       case 2: // Lessons
//         return (
//           <VStack spacing={4} align="stretch">
//             {newModule.lessons.map((lesson, idx) => (
//               <Box key={idx} borderWidth={1} p={4} rounded="md">
//                 <HStack justify="space-between">
//                   <Heading size="sm">Lesson #{idx + 1}</Heading>
//                   <IconButton
//                     icon={<DeleteIcon />}
//                     onClick={() => removeArrayItem("lessons", idx)}
//                   />
//                 </HStack>
//                 <Input
//                   placeholder="Lesson Title"
//                   value={lesson.title}
//                   onChange={(e) =>
//                     handleArrayChange("lessons", idx, "title", e.target.value)
//                   }
//                 />
//                 <Textarea
//                   placeholder="Lesson Body"
//                   value={lesson.body}
//                   onChange={(e) =>
//                     handleArrayChange("lessons", idx, "body", e.target.value)
//                   }
//                 />

//                 {["videoLinks", "readingFiles"].map((field) => (
//                   <VStack key={field} spacing={2} align="stretch">
//                     {lesson[field].map((item, i) => (
//                       <HStack key={i}>
//                         <Input
//                           placeholder={`${field.slice(0, -1)} #${i + 1}`}
//                           value={item}
//                           onChange={(e) =>
//                             handleNestedArrayChange(
//                               "lessons",
//                               idx,
//                               field,
//                               i,
//                               e.target.value,
//                             )
//                           }
//                         />
//                         <IconButton
//                           icon={<DeleteIcon />}
//                           onClick={() =>
//                             removeNestedArrayItem("lessons", idx, field, i)
//                           }
//                         />
//                       </HStack>
//                     ))}
//                     <Button
//                       leftIcon={<AddIcon />}
//                       onClick={() => addNestedArrayItem("lessons", idx, field)}
//                     >
//                       Add {field === "videoLinks" ? "Video" : "Reading File"}
//                     </Button>
//                   </VStack>
//                 ))}
//               </Box>
//             ))}
//             <Button
//               leftIcon={<AddIcon />}
//               onClick={() =>
//                 addArrayItem("lessons", {
//                   title: "",
//                   body: "",
//                   videoLinks: [""],
//                   readingFiles: [""],
//                   order: newModule.lessons.length + 1,
//                 })
//               }
//             >
//               Add Lesson
//             </Button>
//           </VStack>
//         );
//       case 3: // Tasks
//         return (
//           <VStack spacing={4} align="stretch">
//             {newModule.tasks.map((task, idx) => (
//               <Box key={idx} borderWidth={1} p={4} rounded="md">
//                 <HStack justify="space-between">
//                   <Heading size="sm">Task #{idx + 1}</Heading>
//                   <IconButton
//                     icon={<DeleteIcon />}
//                     onClick={() => removeArrayItem("tasks", idx)}
//                   />
//                 </HStack>
//                 <VStack spacing={3} align="stretch">
//                   <Input
//                     placeholder="Task Title"
//                     value={task.title}
//                     onChange={(e) =>
//                       handleArrayChange("tasks", idx, "title", e.target.value)
//                     }
//                   />
//                   <Textarea
//                     placeholder="Task Description"
//                     value={task.description}
//                     onChange={(e) =>
//                       handleArrayChange(
//                         "tasks",
//                         idx,
//                         "description",
//                         e.target.value,
//                       )
//                     }
//                   />
//                   <Select
//                     value={task.lessonOrder}
//                     onChange={(e) =>
//                       handleArrayChange(
//                         "tasks",
//                         idx,
//                         "lessonOrder",
//                         Number(e.target.value),
//                       )
//                     }
//                   >
//                     {newModule.lessons.map((l, i) => (
//                       <option key={i} value={i + 1}>
//                         {l.title || `Lesson ${i + 1}`}
//                       </option>
//                     ))}
//                   </Select>
//                   <Select
//                     value={task.required ? "true" : "false"}
//                     onChange={(e) =>
//                       handleArrayChange(
//                         "tasks",
//                         idx,
//                         "required",
//                         e.target.value === "true",
//                       )
//                     }
//                   >
//                     <option value="true">Required</option>
//                     <option value="false">Optional</option>
//                   </Select>
//                 </VStack>
//               </Box>
//             ))}
//             <Button
//               leftIcon={<AddIcon />}
//               onClick={() =>
//                 addArrayItem("tasks", {
//                   title: "",
//                   description: "",
//                   required: true,
//                   lessonOrder: 1,
//                 })
//               }
//             >
//               Add Task
//             </Button>
//           </VStack>
//         );
//       // case 4: // MCQs
//       //   return (
//       //     <VStack spacing={4} align="stretch">
//       //       {newModule.mcqBlocks.map((block, idx) => (
//       //         <Box key={idx} borderWidth={1} p={4} rounded="md">
//       //           <HStack justify="space-between">
//       //             <Heading size="sm">
//       //               {block.title || `MCQ Block #${idx + 1}`}
//       //             </Heading>
//       //             <IconButton
//       //               icon={<DeleteIcon />}
//       //               onClick={() => removeArrayItem("mcqBlocks", idx)}
//       //             />
//       //           </HStack>
//       //           <Input
//       //             placeholder="Block Title"
//       //             value={block.title}
//       //             onChange={(e) =>
//       //               handleArrayChange("mcqBlocks", idx, "title", e.target.value)
//       //             }
//       //           />

//       //           {block.questions.map((q, qIdx) => (
//       //             <Box key={qIdx} mt={3} p={2} borderWidth={1} rounded="md">
//       //               <Input
//       //                 placeholder="Question"
//       //                 value={q.questionText}
//       //                 onChange={(e) =>
//       //                   handleNestedArrayChange(
//       //                     "mcqBlocks",
//       //                     idx,
//       //                     "questions",
//       //                     qIdx,
//       //                     {
//       //                       ...q,
//       //                       questionText: e.target.value,
//       //                     },
//       //                   )
//       //                 }
//       //               />
//       //               {q.options.map((opt, oIdx) => (
//       //                 <HStack key={oIdx} mt={2}>
//       //                   <Input
//       //                     placeholder={`Option #${oIdx + 1}`}
//       //                     value={opt}
//       //                     onChange={(e) => {
//       //                       const newOptions = [...q.options];
//       //                       newOptions[oIdx] = e.target.value;
//       //                       handleNestedArrayChange(
//       //                         "mcqBlocks",
//       //                         idx,
//       //                         "questions",
//       //                         qIdx,
//       //                         {
//       //                           ...q,
//       //                           options: newOptions,
//       //                         },
//       //                       );
//       //                     }}
//       //                   />
//       //                   <IconButton
//       //                     icon={<DeleteIcon />}
//       //                     onClick={() => {
//       //                       const newOptions = [...q.options];
//       //                       newOptions.splice(oIdx, 1);
//       //                       handleNestedArrayChange(
//       //                         "mcqBlocks",
//       //                         idx,
//       //                         "questions",
//       //                         qIdx,
//       //                         {
//       //                           ...q,
//       //                           options: newOptions,
//       //                         },
//       //                       );
//       //                     }}
//       //                   />
//       //                 </HStack>
//       //               ))}
//       //               <Button
//       //                 leftIcon={<AddIcon />}
//       //                 size="sm"
//       //                 mt={2}
//       //                 onClick={() => {
//       //                   const newOptions = [...q.options, ""];
//       //                   handleNestedArrayChange(
//       //                     "mcqBlocks",
//       //                     idx,
//       //                     "questions",
//       //                     qIdx,
//       //                     {
//       //                       ...q,
//       //                       options: newOptions,
//       //                     },
//       //                   );
//       //                 }}
//       //               >
//       //                 Add Option
//       //               </Button>
//       //               <Select
//       //                 mt={2}
//       //                 value={q.correctAnswerIndex}
//       //                 onChange={(e) =>
//       //                   handleNestedArrayChange(
//       //                     "mcqBlocks",
//       //                     idx,
//       //                     "questions",
//       //                     qIdx,
//       //                     {
//       //                       ...q,
//       //                       correctAnswerIndex: Number(e.target.value),
//       //                     },
//       //                   )
//       //                 }
//       //               >
//       //                 {q.options.map((_, i) => (
//       //                   <option key={i} value={i}>
//       //                     Option {i + 1}
//       //                   </option>
//       //                 ))}
//       //               </Select>
//       //             </Box>
//       //           ))}
//       //           <Button
//       //             leftIcon={<AddIcon />}
//       //             mt={3}
//       //             onClick={() => addMcqQuestion(idx)}
//       //           >
//       //             Add Question
//       //           </Button>
//       //         </Box>
//       //       ))}
//       //       <Button
//       //         leftIcon={<AddIcon />}
//       //         onClick={() =>
//       //           addArrayItem("mcqBlocks", {
//       //             lessonOrder: 1,
//       //             title: `MCQ Block ${newModule.mcqBlocks.length + 1}`,
//       //             questions: [
//       //               {
//       //                 questionText: "",
//       //                 options: ["", ""],
//       //                 correctAnswerIndex: 0,
//       //               },
//       //             ],
//       //           })
//       //         }
//       //       >
//       //         Add MCQ Block
//       //       </Button>
//       //     </VStack>
//       //   );

//       case 4: // MCQs
//         return (
//           <VStack spacing={4} align="stretch">
//             {newModule.mcqBlocks.map((block, idx) => (
//               <Box key={idx} borderWidth={1} p={4} rounded="md">
//                 <HStack justify="space-between">
//                   <Heading size="sm">
//                     {block.title || `MCQ Block #${idx + 1}`}
//                   </Heading>
//                   <IconButton
//                     icon={<DeleteIcon />}
//                     onClick={() => removeArrayItem("mcqBlocks", idx)}
//                   />
//                 </HStack>
//                 <Input
//                   placeholder="Block Title"
//                   value={block.title}
//                   onChange={(e) =>
//                     handleArrayChange("mcqBlocks", idx, "title", e.target.value)
//                   }
//                 />

//                 {/* Assign block to a lesson */}
//                 <Select
//                   mt={2}
//                   value={block.lessonOrder}
//                   onChange={(e) =>
//                     handleArrayChange(
//                       "mcqBlocks",
//                       idx,
//                       "lessonOrder",
//                       Number(e.target.value),
//                     )
//                   }
//                 >
//                   {newModule.lessons.map((l, i) => (
//                     <option key={i} value={i + 1}>
//                       {l.title || `Lesson ${i + 1}`}
//                     </option>
//                   ))}
//                 </Select>

//                 {block.questions.map((q, qIdx) => (
//                   <Box key={qIdx} mt={3} p={2} borderWidth={1} rounded="md">
//                     <Input
//                       placeholder="Question"
//                       value={q.questionText}
//                       onChange={(e) =>
//                         handleNestedArrayChange(
//                           "mcqBlocks",
//                           idx,
//                           "questions",
//                           qIdx,
//                           { ...q, questionText: e.target.value },
//                         )
//                       }
//                     />
//                     {q.options.map((opt, oIdx) => (
//                       <HStack key={oIdx} mt={2}>
//                         <Input
//                           placeholder={`Option #${oIdx + 1}`}
//                           value={opt}
//                           onChange={(e) => {
//                             const newOptions = [...q.options];
//                             newOptions[oIdx] = e.target.value;
//                             handleNestedArrayChange(
//                               "mcqBlocks",
//                               idx,
//                               "questions",
//                               qIdx,
//                               { ...q, options: newOptions },
//                             );
//                           }}
//                         />
//                         <IconButton
//                           icon={<DeleteIcon />}
//                           onClick={() => {
//                             const newOptions = [...q.options];
//                             newOptions.splice(oIdx, 1);
//                             handleNestedArrayChange(
//                               "mcqBlocks",
//                               idx,
//                               "questions",
//                               qIdx,
//                               { ...q, options: newOptions },
//                             );
//                           }}
//                         />
//                       </HStack>
//                     ))}
//                     <Button
//                       leftIcon={<AddIcon />}
//                       size="sm"
//                       mt={2}
//                       onClick={() => {
//                         const newOptions = [...q.options, ""];
//                         handleNestedArrayChange(
//                           "mcqBlocks",
//                           idx,
//                           "questions",
//                           qIdx,
//                           {
//                             ...q,
//                             options: newOptions,
//                           },
//                         );
//                       }}
//                     >
//                       Add Option
//                     </Button>
//                     <Select
//                       mt={2}
//                       value={q.correctAnswerIndex}
//                       onChange={(e) =>
//                         handleNestedArrayChange(
//                           "mcqBlocks",
//                           idx,
//                           "questions",
//                           qIdx,
//                           {
//                             ...q,
//                             correctAnswerIndex: Number(e.target.value),
//                           },
//                         )
//                       }
//                     >
//                       {q.options.map((_, i) => (
//                         <option key={i} value={i}>
//                           Option {i + 1}
//                         </option>
//                       ))}
//                     </Select>
//                   </Box>
//                 ))}
//                 <Button
//                   leftIcon={<AddIcon />}
//                   mt={3}
//                   onClick={() => addMcqQuestion(idx)}
//                 >
//                   Add Question
//                 </Button>
//               </Box>
//             ))}
//             <Button
//               leftIcon={<AddIcon />}
//               onClick={() =>
//                 addArrayItem("mcqBlocks", {
//                   lessonOrder: 1, // default to first lesson
//                   title: `MCQ Block ${newModule.mcqBlocks.length + 1}`,
//                   questions: [
//                     {
//                       questionText: "",
//                       options: ["", ""],
//                       correctAnswerIndex: 0,
//                     },
//                   ],
//                 })
//               }
//             >
//               Add MCQ Block
//             </Button>
//           </VStack>
//         );

//       case 5: // Review
//         return (
//           <VStack spacing={4} align="stretch">
//             <Heading size="md">Review Module</Heading>
//             <Text fontWeight="bold">Title: {newModule.title}</Text>
//             <Text fontWeight="bold">Description: {newModule.description}</Text>
//             <Text fontWeight="bold">Objectives: {newModule.objectives}</Text>
//             <Text fontWeight="bold">Difficulty: {newModule.difficulty}</Text>
//             <Text fontWeight="bold">Category: {newModule.category}</Text>
//             <Text fontWeight="bold">Tags: {newModule.tags}</Text>
//           </VStack>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <Container maxW="container.md" py={6}>
//       <VStack spacing={6}>
//         <Heading as="h1" size="xl" textAlign="center">
//           Create New Module
//         </Heading>
//         <Box
//           w="full"
//           bg={useColorModeValue("white", "gray.800")}
//           p={6}
//           rounded="lg"
//           shadow="md"
//         >
//           {renderStep()}
//           <HStack justify="space-between" mt={4}>
//             {step > 1 && (
//               <Button onClick={() => setStep(step - 1)}>Back</Button>
//             )}
//             {step < 5 && (
//               <Button colorScheme="blue" onClick={() => setStep(step + 1)}>
//                 Next
//               </Button>
//             )}
//             {step === 5 && (
//               <Button
//                 colorScheme="blue.900"
//                 onClick={handleAddModule}
//                 isLoading={loading}
//               >
//                 Create Module
//               </Button>
//             )}
//           </HStack>
//         </Box>
//       </VStack>
//     </Container>
//   );
// };

// export default CreateModulePage;
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

const blockTypes = ["video", "reading", "task", "mcq", "md"];

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
        body: "",
        contents: [
          { type: "video", content: "" },
          { type: "reading", content: "" },
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

  // ===== Handlers =====
  const handleChange = (key, value) =>
    setNewModule({ ...newModule, [key]: value });

  const handleLessonChange = (lessonIdx, key, value) => {
    const lessons = [...newModule.lessons];
    lessons[lessonIdx][key] = value;
    setNewModule({ ...newModule, lessons });
  };

  const handleContentChange = (lessonIdx, contentIdx, key, value) => {
    const lessons = [...newModule.lessons];
    lessons[lessonIdx].contents[contentIdx][key] = value;
    setNewModule({ ...newModule, lessons });
  };

  const handleMCQChoiceChange = (lessonIdx, contentIdx, questionIdx, choiceIdx, value) => {
    const lessons = [...newModule.lessons];
    const q = lessons[lessonIdx].contents[contentIdx].questions[questionIdx];
    q.choices[choiceIdx] = value;
    setNewModule({ ...newModule, lessons });
  };

  const addLesson = () => {
    setNewModule({
      ...newModule,
      lessons: [
        ...newModule.lessons,
        { title: "", body: "", contents: [{ type: "video", content: "" }] },
      ],
    });
  };

  const removeLesson = (idx) => {
    const lessons = [...newModule.lessons];
    lessons.splice(idx, 1);
    setNewModule({ ...newModule, lessons });
  };

  const addContentBlock = (lessonIdx, type) => {
    const lessons = [...newModule.lessons];
    if (type === "task") {
      lessons[lessonIdx].contents.push({ type, title: "", description: "" });
    } else if (type === "mcq") {
      lessons[lessonIdx].contents.push({
        type,
        title: "MCQ Block",
        questions: [
          { question: "", choices: ["", ""], correctAnswer: "" }, // default 1 question with 2 choices
        ],
      });
    } else if (type === "md") {
      lessons[lessonIdx].contents.push({ type, title: "", body: "" });
    } else {
      lessons[lessonIdx].contents.push({ type, content: "" });
    }
    setNewModule({ ...newModule, lessons });
  };

  const removeContentBlock = (lessonIdx, contentIdx) => {
    const lessons = [...newModule.lessons];
    lessons[lessonIdx].contents.splice(contentIdx, 1);
    setNewModule({ ...newModule, lessons });
  };

  const addMCQQuestion = (lessonIdx, contentIdx) => {
    const lessons = [...newModule.lessons];
    lessons[lessonIdx].contents[contentIdx].questions.push({
      question: "",
      choices: ["", ""],
      correctAnswer: "",
    });
    setNewModule({ ...newModule, lessons });
  };

  const addMCQChoice = (lessonIdx, contentIdx, questionIdx) => {
    const lessons = [...newModule.lessons];
    lessons[lessonIdx].contents[contentIdx].questions[questionIdx].choices.push("");
    setNewModule({ ...newModule, lessons });
  };

  const handleMCQChange = (lessonIdx, contentIdx, questionIdx, key, value) => {
    const lessons = [...newModule.lessons];
    lessons[lessonIdx].contents[contentIdx].questions[questionIdx][key] = value;
    setNewModule({ ...newModule, lessons });
  };

  // ===== Submission =====
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
      // Convert contents to backend-friendly structure
      const lessonsForBackend = newModule.lessons.map((lesson) => {
        const videoLinks = [];
        const readingFiles = [];
        const tasks = [];
        const mcqBlocks = [];
        const mdContents = [];

        lesson.contents.forEach((c) => {
          switch (c.type) {
            case "video":
              videoLinks.push(c.content);
              break;
            case "reading":
              readingFiles.push(c.content);
              break;
            case "task":
              tasks.push({ title: c.title, description: c.description });
              break;
            case "mcq":
              mcqBlocks.push({ title: c.title, questions: c.questions });
              break;
            case "md":
              mdContents.push({ title: c.title, body: c.body });
              break;
          }
        });

        return {
          ...lesson,
          videoLinks,
          readingFiles,
          tasks,
          mcqBlocks,
          mdContents,
        };
      });

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

  // ===== Render Steps =====
  const renderStep = () => {
    switch (step) {
      case 1: // Module details
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
              value={newModule.bannerUrl || ""}
              onChange={(e) => handleChange("bannerUrl", e.target.value)}
            />
          </VStack>
        );

      case 2: // Lessons with arbitrary content
        return (
          <VStack spacing={4} align="stretch">
            {newModule.lessons.map((lesson, idx) => (
              <Box key={idx} borderWidth={1} p={4} rounded="md">
                <HStack justify="space-between">
                  <Heading size="sm">Lesson #{idx + 1}</Heading>
                  <IconButton
                    icon={<DeleteIcon />}
                    onClick={() => removeLesson(idx)}
                  />
                </HStack>
                <Input
                  placeholder="Lesson Title"
                  value={lesson.title}
                  onChange={(e) => handleLessonChange(idx, "title", e.target.value)}
                />
                <Textarea
                  placeholder="Lesson Body"
                  value={lesson.body}
                  onChange={(e) => handleLessonChange(idx, "body", e.target.value)}
                />

                {lesson.contents.map((c, cIdx) => (
                  <Box key={cIdx} mt={2} p={2} borderWidth={1} rounded="md">
                    <HStack mb={2}>
                      <Select
                        value={c.type}
                        onChange={(e) => {
                          const lessons = [...newModule.lessons];
                          lessons[idx].contents[cIdx].type = e.target.value;
                          setNewModule({ ...newModule, lessons });
                        }}
                        width="120px"
                      >
                        {blockTypes.map((bt) => (
                          <option key={bt} value={bt}>
                            {bt.toUpperCase()}
                          </option>
                        ))}
                      </Select>
                      <IconButton
                        icon={<DeleteIcon />}
                        onClick={() => removeContentBlock(idx, cIdx)}
                      />
                    </HStack>

                    {/* Render content based on type */}
                    {["video", "reading"].includes(c.type) && (
                      <Input
                        placeholder="Content"
                        value={c.content}
                        onChange={(e) => handleContentChange(idx, cIdx, "content", e.target.value)}
                      />
                    )}
                    {c.type === "task" && (
                      <VStack spacing={2} align="stretch">
                        <Input
                          placeholder="Task Title"
                          value={c.title}
                          onChange={(e) => handleContentChange(idx, cIdx, "title", e.target.value)}
                        />
                        <Textarea
                          placeholder="Task Description"
                          value={c.description}
                          onChange={(e) => handleContentChange(idx, cIdx, "description", e.target.value)}
                        />
                      </VStack>
                    )}
                    {c.type === "md" && (
                      <VStack spacing={2} align="stretch">
                        <Input
                          placeholder="MD Title"
                          value={c.title}
                          onChange={(e) => handleContentChange(idx, cIdx, "title", e.target.value)}
                        />
                        <Textarea
                          placeholder="MD Body"
                          value={c.body}
                          onChange={(e) => handleContentChange(idx, cIdx, "body", e.target.value)}
                        />
                      </VStack>
                    )}
                    {c.type === "mcq" && (
                      <VStack spacing={2} align="stretch">
                        <Input
                          placeholder="MCQ Block Title"
                          value={c.title}
                          onChange={(e) => handleContentChange(idx, cIdx, "title", e.target.value)}
                        />
                        {c.questions?.map((q, qIdx) => (
                          <Box key={qIdx} p={2} borderWidth={1} rounded="md">
                            <Input
                              placeholder="Question"
                              value={q.question || ""}
                              onChange={(e) => handleMCQChange(idx, cIdx, qIdx, "question", e.target.value)}
                            />
                            <VStack spacing={1} mt={2}>
                              {q.choices?.map((choice, choiceIdx) => (
                                <HStack key={choiceIdx}>
                                  <Input
                                    placeholder={`Choice ${choiceIdx + 1}`}
                                    value={choice || ""}
                                    onChange={(e) =>
                                      handleMCQChoiceChange(idx, cIdx, qIdx, choiceIdx, e.target.value)
                                    }
                                  />
                                </HStack>
                              ))}
                              <Button
                                size="sm"
                                leftIcon={<AddIcon />}
                                onClick={() => addMCQChoice(idx, cIdx, qIdx)}
                              >
                                Add Option
                              </Button>
                            </VStack>
                            <Select
                              mt={2}
                              placeholder="Select Correct Answer"
                              value={q.correctAnswer || ""}
                              onChange={(e) => handleMCQChange(idx, cIdx, qIdx, "correctAnswer", e.target.value)}
                            >
                              {q.choices?.map((choice, i) => (
                                <option key={i} value={choice}>
                                  {choice || `Choice ${i + 1}`}
                                </option>
                              ))}
                            </Select>
                          </Box>
                        ))}
                        <Button
                          size="sm"
                          leftIcon={<AddIcon />}
                          mt={2}
                          onClick={() => addMCQQuestion(idx, cIdx)}
                        >
                          Add Question
                        </Button>
                      </VStack>
                    )}
                  </Box>
                ))}

                <HStack mt={2} spacing={2}>
                  {blockTypes.map((bt) => (
                    <Button key={bt} size="sm" onClick={() => addContentBlock(idx, bt)}>
                      Add {bt.toUpperCase()}
                    </Button>
                  ))}
                </HStack>
              </Box>
            ))}
            <Button leftIcon={<AddIcon />} onClick={addLesson}>
              Add Lesson
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
            {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
            {step < 5 && <Button colorScheme="blue" onClick={() => setStep(step + 1)}>Next</Button>}
            {step === 5 && (
              <Button colorScheme="blue.900" onClick={handleAddModule} isLoading={loading}>
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