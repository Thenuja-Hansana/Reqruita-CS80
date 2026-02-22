export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Left Column: Stats & Tables */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <div>
          <p className="text-gray-500">Thursday, November 20</p>
          <h1 className="text-3xl font-bold">Good day, Bob!</h1>
        </div>

        {/* Interviews Card */}
        <div className="bg-white rounded-2xl border p-6 min-h-[200px]">
          <h2 className="text-xl font-bold mb-4">Assigned Interviews</h2>
          <div className="flex gap-6 border-b text-sm font-medium mb-10">
            <button className="pb-2 border-b-2 border-purple-600">
              Upcoming
            </button>
            <button className="pb-2 text-gray-400">Overdue</button>
            <button className="pb-2 text-gray-400">Completed</button>
          </div>
          <div className="text-center py-10 text-gray-400">
            No Interviews Assigned
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              Job Application Form Submissions
            </h2>
            <button className="text-blue-600 text-sm">View All &gt;</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 border-b">
                <th className="py-3 font-medium">Date</th>
                <th className="py-3 font-medium">Job Role</th>
                <th className="py-3 font-medium">Name</th>
                <th className="py-3 font-medium">Email</th>
                <th className="py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-4">July 16, 2025</td>
                  <td className="py-4">Software Engineer</td>
                  <td className="py-4">John</td>
                  <td className="py-4">john@email.com</td>
                  <td className="py-4">
                    <button className="bg-[#5D20B3] text-white px-3 py-1 rounded text-xs">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Calendar & Tasks */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="bg-[#5D20B3] rounded-2xl p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold">Create Task</h3>
            <p className="text-xs opacity-70">Create a new task</p>
          </div>
          <button className="bg-white text-[#5D20B3] w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl">
            +
          </button>
        </div>

        {/* Simplified Calendar Placeholder */}
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-bold mb-4">April 11, 2021</h3>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-gray-400">
                {d}
              </div>
            ))}
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="py-1">
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Events */}
        <div className="space-y-4">
          <div className="bg-[#5D20B3] rounded-2xl p-4 text-white">
            <div className="flex justify-between text-xs mb-2">
              <span>Daily Standup Call</span>
              <span>9:00 AM</span>
            </div>
            <p className="text-[10px] opacity-70">
              Discuss team tasks for the day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
