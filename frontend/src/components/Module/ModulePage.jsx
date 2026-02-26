import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Spinner,
  Text,
  Button,
  useColorModeValue,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useModuleStore } from "../../store/module";
import { useEnrollmentStore } from "../../store/moduleEnrollment";
import LessonSidebar from "../module_sec/LessonsSidebar";
import CanvasArea from "../module_sec/CanvasArea";
import { ArrowLeftCircle, ArrowRightCircle, Menu } from "lucide-react";

const MotionFlex = motion(Flex);

const ModulePage = () => {
  const navigate = useNavigate();
  const { id: moduleId } = useParams();

  const { currentModule, fetchModuleById } = useModuleStore();
  const { recordActivity, fetchEnrollment } = useEnrollmentStore();

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [enrollment, setEnrollment] = useState(null);
  const [lessonSidebarCollapsed, setLessonSidebarCollapsed] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const sidebarWidth = lessonSidebarCollapsed ? "5rem" : "280px";

  const pageBg = useColorModeValue("gray.50", "blue.900");
  const sidebarBorder = useColorModeValue("gray.200", "gray.700");
  const sidebarBg = useColorModeValue("white", "gray.800");
  const contentBg = useColorModeValue("white", "gray.700");

  useEffect(() => {
    const loadModule = async () => {
      setLoading(true);
      try {
        const moduleData = await fetchModuleById(moduleId);
        const enrollmentData = await fetchEnrollment(moduleId);
        const enrollment = enrollmentData || null;

        setEnrollment(enrollment);
        setProgress(enrollment?.progressPercent || 0);

        if (moduleData?.lessons?.length) {
          let found = false;

          for (let l = 0; l < moduleData.lessons.length; l++) {
            const lesson = moduleData.lessons[l];

            for (let b = 0; b < lesson.blocks.length; b++) {
              const block = lesson.blocks[b];

              const isCompleted = enrollment?.completedBlocks?.some(
                (id) => id.toString() === block._id.toString(),
              );

              if (!isCompleted) {
                setCurrentLessonIndex(l);
                setCurrentBlockIndex(b);
                found = true;
                break;
              }
            }

            if (found) break;
          }

          if (!found) {
            const lastLessonIndex = moduleData.lessons.length - 1;
            const lastLesson = moduleData.lessons[lastLessonIndex];

            setCurrentLessonIndex(lastLessonIndex);
            setCurrentBlockIndex(lastLesson.blocks.length - 1);
          }
        }
      } catch (err) {
        console.error("Error loading module:", err);
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) loadModule();
  }, [moduleId]);

  if (loading)
    return (
      <Flex h="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );

  if (!currentModule?.lessons?.length)
    return (
      <Flex h="100vh" align="center" justify="center">
        <Text>No lessons available</Text>
      </Flex>
    );

  const lesson = currentModule.lessons[currentLessonIndex];
  const blocks = lesson.blocks || [];

  if (!blocks.length)
    return (
      <Flex h="100vh" align="center" justify="center">
        <Text>No blocks in this lesson yet</Text>
      </Flex>
    );

  const block = blocks[currentBlockIndex];

  const handleComplete = async () => {
    try {
      const blockId = block._id.toString();
      const res = await recordActivity(currentModule._id, blockId);
      if (!res.success) return;

      setProgress(res.progressPercent);

      setEnrollment((prev) => {
        if (!prev) return prev;

        const alreadyCompleted = prev.completedBlocks?.some(
          (id) => id.toString() === blockId,
        );

        return {
          ...prev,
          progressPercent: res.progressPercent,
          completedBlocks: alreadyCompleted
            ? prev.completedBlocks
            : [...(prev.completedBlocks || []), blockId],
        };
      });

      if (res.progressPercent === 100) {
        navigate(`/student/certifications/${currentModule._id}`);
      }
    } catch (err) {
      console.error("Completion error:", err);
    }
  };

  const handleNext = () => {
    if (currentBlockIndex < lesson.blocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
    } else if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setCurrentBlockIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
    } else if (currentLessonIndex > 0) {
      const prevLesson = currentModule.lessons[currentLessonIndex - 1];
      setCurrentLessonIndex(currentLessonIndex - 1);
      setCurrentBlockIndex(prevLesson.blocks.length - 1);
    }
  };

  const blockCompleted = enrollment?.completedBlocks?.some(
    (id) => id.toString() === block._id.toString(),
  );

  const sidebarProps = {
    lessons: currentModule.lessons,
    enrollment,
    currentLessonIndex,
    currentBlockIndex,
    setCurrentLessonIndex: (i) => {
      setCurrentLessonIndex(i);
      if (isMobile) onClose();
    },
    setCurrentBlockIndex: (i) => {
      setCurrentBlockIndex(i);
      if (isMobile) onClose();
    },
    collapsed: lessonSidebarCollapsed,
    setCollapsed: setLessonSidebarCollapsed,
    progress,
    currentModule,
  };

  return (
    <Flex flex="1" minH="0" direction="column" bg={pageBg} overflow="auto">
      {enrollment && (
        <Flex flex="1" minH="0" gap={4}>
          {/* Main Content */}
          <Box
            flex="1"
            minH="0"
            display="flex"
            flexDirection="column"
            bg={contentBg}
            borderRadius={isMobile ? "0" : "xl"}
            shadow="sm"
            position="relative"
          >
            {isMobile && (
              <Button
                leftIcon={<Menu />}
                onClick={onOpen}
                variant="ghost"
                justifyContent="flex-start"
                width="100%"
              >
                Lessons
              </Button>
            )}
            <Box
              flex="1"
              minH="0"
              overscrollBehavior="contain"
            >
              <CanvasArea
                block={block}
                onComplete={handleComplete}
                id={moduleId}
                isCompleted={blockCompleted}
                enrollmentId={enrollment.enrollmentId}
                lesson={lesson}
                progress={progress}
              />

              <Box>
                <Flex gap={4} px={6} py={3} justifyContent="space-between">
                  <Button
                    onClick={handlePrev}
                    colorScheme="gray"
                    isDisabled={
                      currentLessonIndex === 0 && currentBlockIndex === 0
                    }
                  >
                    <ArrowLeftCircle />
                  </Button>
                  <Button onClick={handleNext} colorScheme="blue">
                    <ArrowRightCircle />
                  </Button>
                </Flex>
              </Box>
            </Box>
          </Box>
          {/* Desktop Sidebar */}
          {!isMobile && (
            <Box
              w={sidebarWidth}
              bg={sidebarBg}
              borderRadius="xl"
              shadow="sm"
              border="1px solid"
              borderColor={sidebarBorder}
              minH="0"
              overflowY="auto"
            >
              <Box
                flex="1"
                minH="0"
                overscrollBehavior="contain"
              >
                <LessonSidebar {...sidebarProps} />
              </Box>
            </Box>
          )}

          {/* Mobile Drawer */}
          {isMobile && (
            <Drawer
              isOpen={isOpen}
              placement="left"
              onClose={onClose}
              trapFocus={false}
            >
              <DrawerOverlay bg="blackAlpha.300" />

              <DrawerContent
                bg={sidebarBg}
                boxShadow="none"
                borderRight="1px solid"
                borderColor={sidebarBorder}
                maxW="280px"
                overflow="hidden"
              >
                <Flex
                  align="center"
                  px={4}
                  py={3}
                  borderBottom="1px solid"
                  borderColor={sidebarBorder}
                >
                  <IconButton
                    icon={<ArrowLeftCircle size={20} />}
                    onClick={onClose}
                    variant="ghost"
                    aria-label="Close sidebar"
                  />
                </Flex>

                <DrawerBody
                  p={0}
                  overflowY="auto"
                  sx={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                  }}
                >
                  <LessonSidebar {...sidebarProps} />
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default ModulePage;
