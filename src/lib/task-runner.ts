import * as fs from "fs/promises";

type Task<T> = {
  id: number;
  type: "task";
  name: T;
  data: any;
  timer: NodeJS.Timeout;
  time: number;
  startTime: number;
};

type Note = {
  id: number;
  type: "note";
  name: string;
  data: any;
  timer: NodeJS.Timeout;
  time: number;
  startTime: number;
};

type SavedTask<T> = {
  type: Task<T>["type"];
  name: Task<T>["name"];
  data: any;
  timeLeft: number;
};

type SavedNote = {
  type: Note["type"];
  name: Note["name"];
  data: any;
  timeLeft: number;
};

type CreateTask<T> = {
  task: T;
  data: any;
  timeout: number;
};

type CreateNote = {
  note: string;
  data: any;
  timeout: number;
};

let taskId = 0;

function createTaskLocal<T>(
  name: T,
  fn: Function,
  data: any,
  ms: number
): Task<T> {
  const startTime = Date.now();
  const timer = setTimeout(() => fn(data), ms);

  return {
    id: ++taskId,
    type: "task",
    name,
    data,
    timer,
    time: ms,
    startTime,
  };
}

function createNoteLocal(name: string, data: any, ms: number): Note {
  const startTime = Date.now();
  const timer = setTimeout(() => {}, ms);

  return {
    id: ++taskId,
    type: "note",
    name,
    data,
    timer,
    time: ms,
    startTime,
  };
}

type TaskRunnerOptions<T extends string> = {
  tasks: {
    [key in T]: (data: any) => any;
  };
  filepath: string;
};

export function createTaskRunner<T extends string>({
  tasks: configTasks,
  filepath,
}: TaskRunnerOptions<T>) {
  let tasks: (Task<T> | Note)[] = [];

  const getTasks = () => tasks;

  const isExistTask = (id: number) => {
    return Boolean(getTasks().find((task) => task.id === id));
  };

  const createTask = ({ task: name, data, timeout }: CreateTask<T>) => {
    const fn = configTasks[name];
    const task = createTaskLocal(name, fn, data, timeout);

    tasks.push(task);

    return task.id;
  };

  const createNote = ({ note: name, data, timeout }: CreateNote) => {
    const note = createNoteLocal(name, data, timeout);

    tasks.push(note);

    return note.id;
  };

  const remove = (id: number) => {
    tasks = tasks.filter((task) => {
      if (task.id === id) {
        clearTimeout(task.timer);
        return false;
      }

      return true;
    });
  };

  const find = (
    fn: (
      task: Task<T> | Note,
      index: number,
      tasks: (Task<T> | Note)[]
    ) => boolean | undefined
  ): Task<T> | Note | undefined => {
    return getTasks().find(fn);
  };

  const save = async () => {
    try {
      const savedTasks = tasks
        .filter((task) => {
          // @ts-ignore
          return task.timer._destroyed === false;
        })
        .map((task) => {
          const timeLeft = Math.abs(Date.now() - task.startTime - task.time);
          if (task.type === "task") {
            return {
              type: task.type,
              name: task.name,
              data: task.data,
              timeLeft,
            };
          }

          if (task.type === "note") {
            return {
              type: task.type,
              name: task.name,
              data: task.data,
              timeLeft,
            };
          }
        });

      const raw = JSON.stringify(savedTasks, null, 2);
      await fs.writeFile(filepath, raw, "utf8");
    } catch (error) {
      console.error(error);
    }
  };

  const restore = async () => {
    try {
      const raw = await fs.readFile(filepath);
      const restoreTasks: (SavedTask<T> | SavedNote)[] = JSON.parse(
        raw.toString()
      );

      restoreTasks.forEach((task) => {
        if (task.type === "task") {
          return createTask({
            task: task.name,
            data: task.data,
            timeout: task.timeLeft,
          });
        }

        if (task.type === "note") {
          return createNote({
            note: task.name,
            data: task.data,
            timeout: task.timeLeft,
          });
        }
      });

      if (restoreTasks.length) {
        console.log("Restore tasks", restoreTasks.length);

        console.log(
          restoreTasks.map(({ timeLeft }) => {
            const milliseconds = Math.floor((timeLeft % 1000) / 100);
            const seconds = Math.floor((timeLeft / 1000) % 60);
            const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);

            return `${minutes}m ${seconds}s ${milliseconds}ms`;
          })
        );
      }
    } catch (error) {}
  };

  restore();

  return {
    getTasks,
    isExistTask,
    createTask,
    createNote,
    remove,
    find,
    save,
  };
}
