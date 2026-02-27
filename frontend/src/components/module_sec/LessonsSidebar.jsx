import { forwardRef, useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  Text,
  Collapse,
  useColorModeValue,
  Icon,
  Flex,
  Progress,
  Divider,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  Video,
  FileText,
  Edit2,
  CheckSquare,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
const MotionBox = motion(Box);

const LessonsSidebar = forwardRef(
  (
    {
      lessons = [],
      currentLessonIndex,
      currentBlockIndex,
      setCurrentLessonIndex,
      setCurrentBlockIndex,
      enrollment,
      collapsed,
      setCollapsed,
      progress,
      currentModule,
    },
    ref,
  ) => {
    const hoverBg = useColorModeValue("gray.100", "gray.700");
    const activeBg = useColorModeValue("blue.50", "blue.900");
    const activeBorder = useColorModeValue("blue.500", "blue.300");
    const blockActiveBg = useColorModeValue("blue.100", "blue.800");
    const bg = useColorModeValue("white", "gray.800");
    const border = useColorModeValue("gray.200", "gray.700");

    const [openLesson, setOpenLesson] = useState(currentLessonIndex);
    const lessonRefs = useRef({});

    useEffect(() => {
      const lessonEl = lessonRefs.current[currentLessonIndex];
      if (lessonEl)
        lessonEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [currentLessonIndex]);

    const blockIcon = (type) => {
      switch (type) {
        case "video":
          return Video;
        case "ppt":
        case "reading":
        case "markdown":
          return FileText;
        case "task":
          return Edit2;
        case "mcq":
          return CheckSquare;
        default:
          return FileText;
      }
    };

    const sidebarVariants = {
      open: { width: "280px" },
      collapsed: { width: "60px" },
    };

    return (
      <MotionBox
        ref={ref}
        position="fixed"
top="16"
bottom="0"
overflowY="auto"
        display="flex"
        flexDirection="column"
        bg={bg}
        borderRight="1px solid"
        borderColor={border}
        variants={sidebarVariants}
        animate={collapsed ? "collapsed" : "open"}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        sx={{
  scrollbarWidth: "none",       // Firefox
  msOverflowStyle: "none",      // IE/Edge legacy
  "&::-webkit-scrollbar": {
    display: "none",            // Chrome, Safari
  },
}}
      >
        {/* HEADER */}
        <Box
          position="sticky"
          top="0"
          bg={bg}
          p={4}
          borderBottom="1px solid"
          borderColor={activeBg}
        >
          <Flex direction="column">
            <Box>
              <Text fontWeight="bold" fontSize="lg">
                {currentModule.title}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Lesson {currentLessonIndex + 1} of{" "}
                {currentModule.lessons.length}
              </Text>
              <Progress
                value={progress}
                size="sm"
                borderRadius="full"
                colorScheme={
                  progress < 50 ? "yellow" : progress <= 75 ? "blue" : "green"
                }
                bg="gray.100"
              />
              <Text mt={1} fontSize="xs" color="gray.500" textAlign="right">
                {Math.floor(progress)}% completed
              </Text>
            </Box>
          </Flex>
        </Box>
        <Divider />
        <Box flex="1" minH={0} px={collapsed ? 2 : 4} py={4}>
          <VStack align="stretch" spacing={2}>
            {lessons.map((lesson, lIndex) => {
              const isLessonActive = lIndex === currentLessonIndex;
              const isOpen = openLesson === lIndex;

              // Count completed blocks based on enrollment.completedBlocks
              const completedBlocks =
                lesson.blocks?.filter((b) =>
                  enrollment?.completedBlocks?.includes(b._id.toString()),
                ).length || 0;

              const totalBlocks = lesson.blocks?.length || 0;
              const lessonCompleted = completedBlocks === totalBlocks;
              return (
                <Box key={lesson._id}>
                  {/* LESSON TITLE */}
                  <Box
                    ref={(el) => (lessonRefs.current[lIndex] = el)}
                    p={collapsed ? 2 : 3}
                    borderRadius="md"
                    cursor="pointer"
                    bg={isLessonActive ? activeBg : "transparent"}
                    // borderRight="4px solid"
                    borderColor={isLessonActive ? activeBorder : "transparent"}
                    _hover={{ bg: hoverBg }}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => {
                      setCurrentLessonIndex(lIndex);
                      setCurrentBlockIndex(0);
                      setOpenLesson(isOpen ? null : lIndex);
                    }}
                  >
                    <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                      {collapsed ? lesson.title?.[0] : lesson.title}
                    </Text>
                    {!collapsed && lessonCompleted && (
                      <Check size={16} color="blue" />
                    )}
                  </Box>

                  {/* BLOCKS */}
                  {!collapsed && (
                    <Collapse in={isOpen} animateOpacity>
                      <VStack align="stretch" pl={4} mt={2} spacing={1}>
                        {lesson.blocks?.map((block, bIndex) => {
                          const isBlockActive =
                            lIndex === currentLessonIndex &&
                            bIndex === currentBlockIndex;

                          const IconComponent = blockIcon(block.type);

                          const blockCompleted =
                            enrollment?.completedBlocks?.some(
                              (id) => id.toString() === block._id.toString(),
                            );

                          return (
                            <Flex
                              key={block._id}
                              p={2}
                              borderRadius="md"
                              cursor="pointer"
                              align="center"
                              justify="space-between"
                              bg={isBlockActive ? blockActiveBg : "transparent"}
                              // borderLeft="3px solid"
                              borderColor={
                                isBlockActive ? activeBorder : "transparent"
                              }
                              _hover={{ bg: hoverBg }}
                              onClick={() => {
                                setCurrentLessonIndex(lIndex);
                                setCurrentBlockIndex(bIndex);
                              }}
                            >
                              <Flex align="center">
                                <Icon as={IconComponent} boxSize={4} mr={2} />
                                <Text fontSize="xs" noOfLines={1}>
                                  {block.title}
                                </Text>
                              </Flex>
                              {blockCompleted && (
                                <Check size={16} color="blue" />
                              )}
                            </Flex>
                          );
                        })}
                      </VStack>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </VStack>
        </Box>
      </MotionBox>
    );
  },
);

export default LessonsSidebar;
