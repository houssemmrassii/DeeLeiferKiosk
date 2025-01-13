import { ApexOptions } from 'apexcharts';
import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import { db } from '../../FirebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

interface Commande {
  DatePAssCommande: { seconds: number };
  Status: string;
  user: { id: string };
  TotalAmount: number; // Make sure TotalAmount exists in your Firestore data
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
    series: [
      {
        name: 'Commands',
        data: [],
      },
    ],
    categories: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const commandesSnapshot = await getDocs(collection(db, 'Commande'));
      const commandesData: Commande[] = commandesSnapshot.docs.map((doc) => doc.data() as Commande);
    
      // Group data by day and month with total prices
      const dailyData: { [key: string]: number } = {};
      const monthlyData: { [key: string]: number } = {};
    
      commandesData.forEach((command) => {
        // Check if DatePAssCommande exists and is a valid timestamp
        if (command.DatePAssCommande && command.DatePAssCommande.seconds) {
          const date = new Date(command.DatePAssCommande.seconds * 1000);
          const dayKey = date.toLocaleDateString();
          const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
          // Add the totalAmount to the daily or monthly data
          const amount = command.TotalAmount || 0;
    
          // Accumulate the total amount for that day
          dailyData[dayKey] = (dailyData[dayKey] || 0) + amount;
    
          // Accumulate the total amount for that month
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + amount;
        } else {
          console.error('Missing DatePAssCommande timestamp in Commande data');
        }
      });
    
      // Prepare data for chart
      const dailyCategories = Object.keys(dailyData);
      const dailyTotalPrices = dailyCategories.map((day) => dailyData[day]);
    
      const monthlyCategories = Object.keys(monthlyData);
      const monthlyTotalPrices = monthlyCategories.map((month) => monthlyData[month]);
    
      // Set state with daily data initially
      setState({
        series: [
          {
            name: 'Total Revenue',
            data: dailyTotalPrices,
          },
        ],
        categories: dailyCategories,
      });
    
      // If you want to switch to monthly data, use the following:
      // setState({
      //   series: [
      //     {
      //       name: 'Total Revenue',
      //       data: monthlyTotalPrices,
      //     },
      //   ],
      //   categories: monthlyCategories,
      // });
    };
    
    fetchData();
  }, []);

  // Move options inside the component to access state
  const options: ApexOptions = {
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'center',
      labels: {
        useSeriesColors: true,
      },
    },
    colors: ['#3C50E0'], // Blue color for the total revenue
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
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: 'straight',
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: '#fff',
      strokeColors: '#3056D3',
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: 'category',
      categories: state.categories, // Categories will be the dates (daily or monthly)
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: 'Total Revenue (€)',
        style: {
          fontSize: '12px',
        },
      },
      min: 0,
      max: Math.max(...state.series[0].data) * 1.2, // Dynamically set max based on the data
    },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div id="chartOne" className="-ml-5">
        <ReactApexChart
          options={options}
          series={state.series}
          type="area"
          height={350}
        />
      </div>
    </div>
  );
};

export default ChartOne;
