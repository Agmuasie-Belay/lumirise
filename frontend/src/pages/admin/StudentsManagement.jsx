import { useEffect, useState } from "react";
import { useModuleStore } from "../../store/module";
import { Table, Thead, Tbody, Tr, Th, Td, Text } from "@chakra-ui/react";

const StudentsManagement = () => {
  const { fetchModules, modules } = useModuleStore();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    const allStudents = modules.flatMap((m) => m.enrolledStudents || []);
    const uniqueStudents = [
      ...new Map(allStudents.map((s) => [s.email, { ...s, modulesCount: 0 }])).values(),
    ].map((s) => {
      s.modulesCount = modules.filter((m) => m.enrolledStudents?.some((e) => e.email === s.email)).length;
      return s;
    });
    setStudents(uniqueStudents);
  }, [modules]);

  return (
    <>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>Students</Text>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Enrolled Modules</Th>
          </Tr>
        </Thead>
        <Tbody>
          {students.map((s) => (
            <Tr key={s.email}>
              <Td>{s.name}</Td>
              <Td>{s.email}</Td>
              <Td>{s.modulesCount}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default StudentsManagement;
