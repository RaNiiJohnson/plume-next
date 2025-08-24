// Board statistics and utility functions

export const getBoardStats = (board: any) => {
  const totalTasks = board.columns.reduce(
    (acc: number, column: any) => acc + column._count.tasks,
    0
  );

  const lastColumn = board.columns[board.columns.length - 1];
  const completedTasks = lastColumn ? lastColumn._count.tasks : 0;

  const pendingTasks = totalTasks - completedTasks;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let lastActivity = new Date(board.createdAt).getTime();

  board.columns.forEach((column: any) => {
    column.tasks.forEach((task: any) => {
      const taskTime = new Date(task.createdAt).getTime();
      if (taskTime > lastActivity) {
        lastActivity = taskTime;
      }
    });
  });

  const daysSinceActivity = Math.floor(
    (Date.now() - lastActivity) / (1000 * 60 * 60 * 24)
  );

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionRate,
    daysSinceActivity,
  };
};

export const getActivityText = (days: number) => {
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

export const getProgressColor = (rate: number) => {
  if (rate >= 80) return "bg-green-500";
  if (rate >= 50) return "bg-yellow-500";
  if (rate >= 20) return "bg-orange-500";
  return "bg-red-500";
};

export const getBoardColor = (index: number) => {
  const colors = [
    {
      gradient: "from-blue-400/20 to-blue-600/20",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      hoverIconBg: "group-hover:bg-blue-500",
      hoverIconColor: "group-hover:text-white",
    },
    {
      gradient: "from-purple-400/20 to-purple-600/20",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
      hoverIconBg: "group-hover:bg-purple-500",
      hoverIconColor: "group-hover:text-white",
    },
    {
      gradient: "from-green-400/20 to-green-600/20",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600",
      hoverIconBg: "group-hover:bg-green-500",
      hoverIconColor: "group-hover:text-white",
    },
    {
      gradient: "from-orange-400/20 to-orange-600/20",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600",
      hoverIconBg: "group-hover:bg-orange-500",
      hoverIconColor: "group-hover:text-white",
    },
    {
      gradient: "from-pink-400/20 to-pink-600/20",
      iconBg: "bg-pink-500/10",
      iconColor: "text-pink-600",
      hoverIconBg: "group-hover:bg-pink-500",
      hoverIconColor: "group-hover:text-white",
    },
    {
      gradient: "from-indigo-400/20 to-indigo-600/20",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-600",
      hoverIconBg: "group-hover:bg-indigo-500",
      hoverIconColor: "group-hover:text-white",
    },
  ];
  return colors[index % colors.length];
};

export const calculateBoardsStats = (boards: any[]) => {
  return [
    {
      title: "Total Tasks",
      value: boards.reduce(
        (acc, board) => acc + getBoardStats(board).totalTasks,
        0
      ),
    },
    {
      title: "Completed",
      value: boards.reduce(
        (acc, board) => acc + getBoardStats(board).completedTasks,
        0
      ),
    },
    {
      title: "Active Boards",
      value: boards.length,
    },
  ];
};
