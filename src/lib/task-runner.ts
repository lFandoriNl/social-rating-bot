import * as fs from "fs/promises";

type Task<T> = {
  id: number;
  key: T;
  data: any;
  timer: number;
  time: number;
  startTime: number;
};

type SavedTask<T> = {
  key: T;
  data: any;
  timeLeft: number;
};

let taskId = 0;

function creatTask<T>(key: T, fn: Function, data: any, ms: number) {
  const startTime = Date.now();
  const timer = setTimeout(fn, ms, data);

  return {
    id: ++taskId,
    key,
    data,
    timer,
    time: ms,
    startTime,
  };
}

type TaskRunnerOptions<T extends string> = {
  tasks: {
    [key in T]: (...args: any[]) => void;
  };
  filepath: string;
};

export function createTaskRunner<T extends string>({
  tasks: configTasks,
  filepath,
}: TaskRunnerOptions<T>) {
  let tasks: Task<T>[] = [];

  const getTasks = () => tasks;

  const create = ({
    task: key,
    data,
    timeout,
  }: {
    task: T;
    data: any;
    timeout: number;
  }) => {
    const fn = configTasks[key];
    const task = creatTask(key, fn, data, timeout);

    tasks.push(task);

    return task.id;
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

  const save = async () => {
    try {
      const savedTasks: SavedTask<T>[] = tasks
        .filter((task) => {
          // @ts-ignore
          return task.timer._destroyed === false;
        })
        .map(({ key, data, time, startTime }) => {
          const timeLeft = Math.abs(Date.now() - startTime - time);

          return {
            key,
            data,
            timeLeft,
          };
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
      const restoreTasks: SavedTask<T>[] = JSON.parse(raw.toString());
      restoreTasks.forEach((task) =>
        create({
          task: task.key,
          data: task.data,
          timeout: task.timeLeft,
        })
      );

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

  return { getTasks, create, remove, save };
}
