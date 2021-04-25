import * as fs from "fs/promises";
import { nanoid } from "nanoid";

type Task<T> = {
  id: string;
  type: "task";
  name: T;
  data: any;
  timer: NodeJS.Timeout;
  time: number;
  startTime: number;
};

type Note = {
  id: string;
  type: "note";
  name: string;
  data: any;
  timer: NodeJS.Timeout;
  time: number;
  startTime: number;
};

type SavedTask<T> = {
  id: string;
  type: Task<T>["type"];
  name: Task<T>["name"];
  data: any;
  timeLeft: number;
};

type SavedNote = {
  id: string;
  type: Note["type"];
  name: Note["name"];
  data: any;
  timeLeft: number;
};

type CreateTask<T> = {
  id?: string;
  task: T;
  data: any;
  timeout: number;
};

type CreateNote = {
  id?: string;
  note: string;
  data: any;
  timeout: number;
};

function createTaskLocal<T>(
  name: T,
  fn: Function,
  data: any,
  ms: number,
  onEnd: (id: Task<T>["id"]) => void,
  mainId?: string
): Task<T> {
  const id = mainId || nanoid();
  const startTime = Date.now();

  const timer = setTimeout(() => {
    fn(data);
    onEnd(id);
  }, ms);

  return {
    id,
    type: "task",
    name,
    data,
    timer,
    time: ms,
    startTime,
  };
}

function createNoteLocal(
  name: string,
  data: any,
  ms: number,
  onEnd: (id: Note["id"]) => void,
  mainId?: string
): Note {
  const id = mainId || nanoid();
  const startTime = Date.now();

  const timer = setTimeout(() => {
    onEnd(id);
  }, ms);

  return {
    id,
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

export function createScheduler<T extends string>({
  tasks: configTasks,
  filepath,
}: TaskRunnerOptions<T>) {
  let tasks: (Task<T> | Note)[] = [];

  const getTasks = () => tasks;

  const isExistTask = (id: string) => {
    return Boolean(getTasks().find((task) => task.id === id));
  };

  const createTask = ({ id, task: name, data, timeout }: CreateTask<T>) => {
    const fn = configTasks[name];
    const task = createTaskLocal(name, fn, data, timeout, remove, id);

    tasks.push(task);

    return task.id;
  };

  const createNote = ({ id, note: name, data, timeout }: CreateNote) => {
    const note = createNoteLocal(name, data, timeout, remove, id);

    tasks.push(note);

    return note.id;
  };

  const remove = (id: string) => {
    tasks = getTasks().filter((task) => {
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
              id: task.id,
              type: task.type,
              name: task.name,
              data: task.data,
              timeLeft,
            };
          }

          if (task.type === "note") {
            return {
              id: task.id,
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
            id: task.id,
            task: task.name,
            data: task.data,
            timeout: task.timeLeft,
          });
        }

        if (task.type === "note") {
          return createNote({
            id: task.id,
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
