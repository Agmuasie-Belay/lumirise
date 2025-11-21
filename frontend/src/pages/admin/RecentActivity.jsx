import { useEffect, useState } from "react";
import { useModuleStore } from "../../store/module";
import {
  Box,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Heading,
  Center,
} from "@chakra-ui/react";

const RecentActivity = () => {
  const { fetchModules, modules } = useModuleStore();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    const events = modules.flatMap((module) => {
      const baseEvents = [];

      // Pending Edits
      if (module.pendingEdit?.isRequested) {
        baseEvents.push({
          type: "Edited",
          module: module.title,
          from: "Tutor",
          date: module.pendingEdit.requestedAt,
        });
      }

      // Pending Deletes
      if (module.pendingDelete?.isRequested) {
        baseEvents.push({
          type: "Deleted",
          module: module.title,
          from: "Tutor",
          date: module.pendingDelete.requestedAt,
        });
      }

      // Feedback
      const feedbackEvents = (module.feedback || []).map((f) => ({
        type: "Feedback",
        module: module.title,
        from: f.studentName,
        date: f.date,
      }));

      // Enrollment
      const enrollmentEvents = (module.enrollments || []).map((e) => ({
        type: "Enrollment",
        module: module.title,
        from: e.studentName,
        date: e.date,
      }));

      // Progress
      const progressEvents = module.progress
        ? [
            {
              type: "Progress Update",
              module: module.title,
              from: "System",
              date: module.progress.updatedAt,
              details: `Progress: ${module.progress.completedTasks || 0}/${module.progress.totalTasks || 0}`,
            },
          ]
        : [];

      return [...baseEvents, ...feedbackEvents, ...enrollmentEvents, ...progressEvents];
    });

    // Sort descending by date
    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    setActivities(events);
  }, [modules]);

  const getBadgeColor = (type) => {
    switch (type) {
      case "Feedback":
        return "blue";
      case "Enrollment":
        return "green";
      case "Progress Update":
        return "purple";
      case "Edited":
        return "orange";
      case "Deleted":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Recent Activity
      </Heading>

      {activities.length === 0 ? (
        <Center p={10} bg="gray.50" rounded="md" shadow="sm">
          <Text fontSize="lg" color="gray.500">
            No recent activity yet.
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 1 }} spacing={6}>
          {activities.map((a, idx) => (
            <Box
              key={idx}
              p={4}
              bg="white"
              rounded="md"
              shadow="md"
              borderWidth="1px"
              borderColor="gray.200"
              _hover={{ shadow: "lg" }}
            >
              <HStack justify="space-between" mb={2}>
                <Badge colorScheme={getBadgeColor(a.type)}>{a.type}</Badge>
                <Text fontSize="sm" color="gray.500">
                  {new Date(a.date).toLocaleString()}
                </Text>
              </HStack>
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">{a.module}</Text>
                <Text>From: {a.from}</Text>
                {a.details && <Text fontSize="sm" color="gray.600">{a.details}</Text>}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default RecentActivity;
