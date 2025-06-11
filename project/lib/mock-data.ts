export const generateMockData = () => {
  // Generate last 7 days of visit data
  const visitsByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      visits: Math.floor(Math.random() * 50) + 10,
    };
  }).reverse();

  // Generate last 6 months of points data
  const pointsByMonth = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toISOString().slice(0, 7),
      points: Math.floor(Math.random() * 5000) + 1000,
    };
  }).reverse();

  return {
    totalCustomers: 1234,
    totalPoints: 45678,
    totalRewards: 15,
    averageSpend: 75.50,
    visitsByDay,
    pointsByMonth,
    topCustomers: [
      { name: 'John Doe', points: 2500, visits: 25 },
      { name: 'Jane Smith', points: 2100, visits: 21 },
      { name: 'Bob Johnson', points: 1800, visits: 18 },
      { name: 'Alice Brown', points: 1500, visits: 15 },
      { name: 'Mike Wilson', points: 1200, visits: 12 },
    ]
  };
};