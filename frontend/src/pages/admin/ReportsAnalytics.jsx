import { useEffect, useState } from "react";
import { useModuleStore } from "../../store/module";
import { VStack, Text } from "@chakra-ui/react";
// You can import chart libraries like recharts, chart.js, etc.
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const ReportsAnalytics = () => {
  const { fetchModules, modules } = useModuleStore();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    const data = modules.map((m) => ({
      title: m.title,
      enrolled: m.enrolledStudents?.length || 0,
      completed: m.progress || 0,
      tutor: m.tutor?.name || "N/A",
    }));
    setChartData(data);
  }, [modules]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <VStack spacing={6} w="full">
      <Text fontSize="2xl" fontWeight="bold">Reports & Analytics</Text>
      <LineChart width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="title" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="enrolled" stroke="#8884d8" />
        <Line type="monotone" dataKey="completed" stroke="#82ca9d" />
      </LineChart>
      <BarChart width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="title" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="completed" fill="#8884d8" />
        <Bar dataKey="enrolled" fill="#82ca9d" />
      </BarChart>
      <PieChart width={400} height={400}>
        <Pie
          data={chartData}
          dataKey="enrolled"
          nameKey="tutor"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </VStack>
  );
};

export default ReportsAnalytics;
