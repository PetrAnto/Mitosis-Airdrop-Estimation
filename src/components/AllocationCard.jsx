export default function AllocationCard({ title, value }) {
  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between">
      <h2 className="text-lg font-medium text-gray-300">{title}</h2>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}