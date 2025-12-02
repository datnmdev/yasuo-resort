import StatisticsChart from './components/StatisticsChart';

export default function DashboardPage() {
  return (
    <div className='p-4'>
      <h3 className='text-[1.6rem] font-[700]'>Revenue Statistics</h3>
      <div>
        <StatisticsChart />
      </div>
    </div>
  );
}
