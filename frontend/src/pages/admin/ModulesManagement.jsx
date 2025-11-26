import { useEffect } from "react";
import { useModuleStore } from "../../store/module";
import { SimpleGrid, Text } from "@chakra-ui/react";
import ModuleCard from "../../components/Module/ModuleCard";

const ModulesManagement = () => {
  const { fetchModules, modules } = useModuleStore();

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return (
    <>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>All Modules</Text>
      {modules.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {modules.map((module) => (
            <ModuleCard key={module._id} module={module} />
          ))}
        </SimpleGrid>
      ) : (
        <Text>No modules found. 🚀</Text>
      )}
    </>
  );
};

export default ModulesManagement;
