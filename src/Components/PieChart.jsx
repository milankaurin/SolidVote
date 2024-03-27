import React from 'react';
import { PieChart as RechartsPieChart, Pie, Legend, Cell } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const PieChart = ({ series, width, height }) => {
  return (
    <Paper elevation={3} sx={{ width: width, height: height, p: 2 }}>
      <Typography variant="h6" gutterBottom align="center">
        Pie Chart
      </Typography>
      <Box sx={{ width: '100%', height: '100%' }}>
        <RechartsPieChart width={width} height={height}>
          <Pie
            data={series[0].data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {series[0].data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
            ))}
          </Pie>
          <Legend />
        </RechartsPieChart>
      </Box>
    </Paper>
  );
};

export default PieChart;
