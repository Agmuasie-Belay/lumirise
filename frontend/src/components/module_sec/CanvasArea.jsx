import { Box, Heading, Button, VStack, Divider } from "@chakra-ui/react";
import BlockRenderer from "./BlockRenderer";
const CanvasArea = ({
  block,
  onComplete,
  id,
  isCompleted,
  enrollmentId,
  lesson,
  progress,
}) => {
  const type = block.type;
  return (
    <Box
      flex="1"
      borderWidth="1px"
      borderRadius="xl"
      borderBottomRadius={0}
      p={0}
      bg="white"
      overflow="auto"
      // shadow="md"
      display="flex"
      flexDirection="column"
      transition="all 0.2s ease"
      _hover={{ cursor:"pointer"}}
    >
      {/* Content Area */}
      <Box flex="1" bg="gray.50" borderRadius="md" borderBottomRadius="sm">
        <BlockRenderer
          block={block}
          id={id}
          onComplete={onComplete}
          isCompleted={isCompleted}
          enrollmentId={enrollmentId}
          lesson={lesson}
          progress={progress }
        />
      </Box>

      {/* Mark as Complete Button */}
      {type !== "mcq" && type !== "task" && type !== "video" && (
        <Button
          m={4}
          size="md"
          bg={isCompleted ? "gray" : "blue.900"}
          color="white"
          variant={isCompleted ? "outline" : "solid"}
          onClick={onComplete}
          isDisabled={isCompleted}
          alignSelf="flex-start"
          px={4}
        >
          {isCompleted ? "✓ Completed" : "Mark as Complete"}
        </Button>
      )}
    </Box>
  );
};

export default CanvasArea;
