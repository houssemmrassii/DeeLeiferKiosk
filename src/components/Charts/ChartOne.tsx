import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { db } from '../../FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

interface Commande {
  DatePAssCommande: { seconds: number };
  TotalAmount: number;
}

interface ChartOneState {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
}

const ChartOne: React.FC = () => {
  const [state, setState] = useState<ChartOneState>({
    series: [{ name: 'Total Revenue', data: [] }],
    categories: [],
  });

  const [selectedView, setSelectedView] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    const fetchData = async () => {
      const commandesSnapshot = await getDocs(collection(db, 'Commande'));
      const commandesData: Commande[] = commandesSnapshot.docs.map((doc) => doc.data() as Commande);

      const weeklyData: { [key: string]: number } = {};
      const monthlyData: { [key: string]: number } = {};

      commandesData.forEach((command) => {
        if (command.DatePAssCommande && command.DatePAssCommande.seconds) {
          const date = new Date(command.DatePAssCommande.seconds * 1000);
          const year = date.getFullYear();

          // Get week number
          const firstDayOfYear = new Date(year, 0, 1);
          const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24);
          const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          const weekKey = `Week ${weekNumber}, ${year}`;

          // Get month key as "YYYY-MM"
          const monthKey = `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

          // Accumulate revenue
          const amount = command.TotalAmount || 0;
          weeklyData[weekKey] = (weeklyData[weekKey] || 0) + amount;
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + amount;
        }
      });

      // **Sort weekly data correctly**
      const sortedWeeklyCategories = Object.keys(weeklyData).sort((a, b) => {
        const weekA = parseInt(a.split(' ')[1]); // Extract week number
        const weekB = parseInt(b.split(' ')[1]);
        return weekA - weekB;
      });

      const weeklyTotalPrices = sortedWeeklyCategories.map((week) => parseFloat(weeklyData[week].toFixed(2)));

      // **Sort months correctly based on actual time**
      const sortedMonthlyCategories = Object.keys(monthlyData)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Sort by date
        .map((monthKey) => {
          const [year, month] = monthKey.split('-');
          return `${new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' })} ${year}`;
        });

      const monthlyTotalPrices = Object.keys(monthlyData)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Sort by date
        .map((month) => parseFloat(monthlyData[month].toFixed(2)));

      if (selectedView === 'weekly') {
        setState({
          series: [{ name: 'Total Revenue', data: weeklyTotalPrices }],
          categories: sortedWeeklyCategories,
        });
      } else {
        setState({
          series: [{ name: 'Total Revenue', data: monthlyTotalPrices }],
          categories: sortedMonthlyCategories,
        });
      }
    };

    fetchData();
  }, [selectedView]);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'center',
      labels: { useSeriesColors: true },
    },
    colors: ['#3C50E0'],
    chart: {
      fontFamily: 'Satoshi, sans-serif',
      height: 335,
      type: 'area',
      dropShadow: {
        enabled: true,
        color: '#623CEA14',
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
      toolbar: { show: false },
    },
    stroke: {
      width: [2, 2],
      curve: 'smooth',
    },
    grid: {
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    markers: {
      size: 4,
      colors: '#fff',
      strokeColors: '#3056D3',
      strokeWidth: 3,
      strokeOpacity: 0.9,
      fillOpacity: 1,
      hover: { sizeOffset: 5 },
    },
    xaxis: {
      type: 'category',
      categories: state.categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: 'Total Revenue (€)', style: { fontSize: '12px' } },
      labels: { formatter: (value) => `€${value.toFixed(2)}` },
      min: 0,
      max: Math.max(...state.series[0].data, 100) * 1.2,
    },
    tooltip: {
      y: { formatter: (value) => `€${value.toFixed(2)}` },
    },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      {/* Filter Dropdown */}
      <div className="flex justify-between items-center mb-5">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Growth</h4>
        <select
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value as 'weekly' | 'monthly')}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-boxdark text-gray-800 dark:text-white py-2 px-4 rounded-md"
        >
          <option value="weekly">Weekly Growth</option>
          <option value="monthly">Monthly Growth</option>
        </select>
      </div>

      <div id="chartOne" className="-ml-5">
        <ReactApexChart options={options} series={state.series} type="area" height={350} />
      </div>
    </div>
  );
};

export default ChartOne;
