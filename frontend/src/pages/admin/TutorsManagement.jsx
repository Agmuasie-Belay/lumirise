import { useEffect, useState } from "react";
import { useModuleStore } from "../../store/module";
import { Table, Thead, Tbody, Tr, Th, Td, Text } from "@chakra-ui/react";

const TutorsManagement = () => {
  const { fetchModules, modules } = useModuleStore();
  const [tutors, setTutors] = useState([]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    const uniqueTutors = [
      ...new Map(
        modules
          .filter((m) => m.tutor)
          .map((m) => [m.tutor.email, { ...m.tutor, modulesCount: 0 }])
      ).values(),
    ].map((tutor) => {
      tutor.modulesCount = modules.filter((m) => m.tutor?.email === tutor.email).length;
      return tutor;
    });
    setTutors(uniqueTutors);
  }, [modules]);

  return (
    <>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>Tutors</Text>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Modules Count</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tutors.map((t) => (
            <Tr key={t.email}>
              <Td>{t.name}</Td>
              <Td>{t.email}</Td>
              <Td>{t.modulesCount}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default TutorsManagement;
