import {
  createEvent,
  createEffect,
  createStore,
  forward,
  sample,
  guard,
  combine,
} from "effector";

// const currentTask = guard({
//   source: combine(
//     $tasks.map((tasks) => tasks[0]),
//     countWorkers
//   ),
//   filter: ([_, countWorkers]) => countWorkers < 1,
// }).map(([task]) => task);

// const countWorkers = taskWorkerFx.inFlight;

type Task = () => Promise<unknown>;

export function createQueue(initialTasks: Task[] = []) {
  const push = createEvent<Task>();

  const taskWorkerFx = createEffect<Task, void>(async (task) => {
    await task();
  });

  const $tasks = createStore<Task[]>([])
    .on(push, (tasks, newTask) => [...tasks, newTask])
    .on(taskWorkerFx.finally, (tasks) => tasks.slice(1));

  const currentTask = $tasks.map((tasks) => tasks[0]);

  const hasTasks = $tasks.map((tasks) => tasks.length !== 0);

  forward({
    from: guard({
      source: currentTask,
      filter: hasTasks,
    }),
    to: taskWorkerFx,
  });

  initialTasks.forEach(push);

  return { push };
}

// function createAsyncFn(idx, ms) {
//   const task = () =>
//     new Promise((resolve) =>
//       setTimeout(() => {
//         console.log(`Task ${idx} finished`);
//         resolve(1);
//       }, ms)
//     );

//   task.funcName = `Task ${idx}`;

//   return task;
// }

// const queue = createQueue([
//   createAsyncFn(1, 100),
//   createAsyncFn(2, 300),
//   createAsyncFn(3, 200),
// ]);

// queue.push(createAsyncFn(4, 100));
// queue.push(createAsyncFn(5, 300));
// queue.push(createAsyncFn(6, 200));

// setTimeout(() => {
//   queue.push(createAsyncFn(7, 200));
//   queue.push(createAsyncFn(8, 200));
//   queue.push(createAsyncFn(9, 200));
// }, 3000);
