export interface Task {
  id: string;
  content: string;
  position: number;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  position: number;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}
