import { EventEmitter } from "events";

type AsyncFunction = () => Promise<unknown>;

type Task = {
  id: number;
  fn: AsyncFunction;
};

export function createQueue(
  initialTasks: AsyncFunction[] = [],
  concurrency: number = 1
) {
  let taskId = 0;

  const events = new EventEmitter();

  let pendingTasks: Task[] = [];
  let processTasks: Task[] = [];

  const push = (fn: AsyncFunction) => {
    events.emit("addToPending", {
      id: ++taskId,
      fn,
    });
  };

  events.on("addToPending", (task: Task) => {
    pendingTasks.push(task);

    events.emit("runTask", task);
  });

  events.on("addToProcess", (task: Task) => {
    processTasks.push(task);

    events.emit("work", task);
  });

  events.on("removeFromPending", ({ id }: Task) => {
    pendingTasks = pendingTasks.filter((task) => task.id !== id);
  });

  events.on("removeFromProcess", ({ id }: Task) => {
    processTasks = processTasks.filter((task) => task.id !== id);
  });

  events.on("runTask", () => {
    if (processTasks.length < concurrency) {
      const task = pendingTasks[0];

      if (task) {
        events.emit("removeFromPending", task);
        events.emit("addToProcess", task);
      }
    }

    // console.table({
    //   pending: pendingTasks.map((i) => i.id),
    //   process: processTasks.map((i) => i.id),
    // });
  });

  events.on("work", async (task: Task) => {
    try {
      await task.fn();
    } catch (error) {
    } finally {
      events.emit("removeFromProcess", task);
      events.emit("runTask");
    }
  });

  initialTasks.forEach(push);

  return { push };
}

// function createAsyncFn(idx: number, ms: number) {
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

// const queue = createQueue1([], 1000);

// queue.push(createAsyncFn(1, 1000));
// queue.push(createAsyncFn(2, 3000));
// queue.push(createAsyncFn(3, 2000));

// queue.push(createAsyncFn(4, 1000));
// queue.push(createAsyncFn(5, 3000));
// queue.push(createAsyncFn(6, 2000));

// setTimeout(() => {
//   queue.push(createAsyncFn(7, 2000));
//   queue.push(createAsyncFn(8, 2000));
//   queue.push(createAsyncFn(9, 2000));
// }, 3000);

// setTimeout(() => {
//   for (let index = 10; index < 1000; index++) {
//     queue.push(createAsyncFn(index, randomRange(1000, 10000)));
//   }
// }, 5000);

// export function createQueue1(
//   initialTasks: AsyncFunction[] = [],
//   concurrency: number = 1
// ) {
//   let taskId = 0;

//   const push = createEvent<AsyncFunction>();

//   const addToPending = createEvent<Task>();
//   const addToProgress = createEvent<Task>();

//   forward({
//     from: push,
//     to: addToPending.prepend<AsyncFunction>((fn) => ({
//       id: ++taskId,
//       fn,
//     })),
//   });

//   const taskWorkerFx = createEffect<Task, void>(async (task) => {
//     await task.fn();
//   });

//   const $pendingTasks = createStore<Task[]>([])
//     .on(addToPending, (tasks, newTask) => [...tasks, newTask])
//     .on(addToProgress, (tasks, { id }) =>
//       tasks.filter((task) => task.id !== id)
//     );

//   const $progressTasks = createStore<Task[]>([])
//     .on(addToProgress, (tasks, newTask) => [...tasks, newTask])
//     .on(taskWorkerFx.finally, (tasks, { params }) =>
//       tasks.filter((task) => task.id !== params.id)
//     );

//   const nextPendingTask = $pendingTasks.map((tasks) => tasks[0]);
//   const hasPendingTasks = $pendingTasks.map((tasks) => tasks.length !== 0);

//   const countTaskProgress = $progressTasks.map((tasks) => tasks.length);

//   const needRunTask = guard({
//     source: countTaskProgress,
//     clock: nextPendingTask,
//     filter: (countTaskProgress) => countTaskProgress < concurrency,
//   });

//   const can2 = sample({
//     source: nextPendingTask,
//     clock: [needRunTask, taskWorkerFx.finally],
//     fn: (task) => task,
//   });

//   const can3 = guard({
//     source: can2,
//     filter: hasPendingTasks,
//   });

//   forward({
//     from: can3,
//     to: addToProgress,
//   });

//   forward({
//     from: addToProgress,
//     to: taskWorkerFx,
//   });

//   initialTasks.forEach(push);

//   return { push };
// }

// function createObservable<T, R>(
//   sourceUnit: Event<T> | Store<T>,
//   observe: (observable: Observable<T>) => Observable<R>
// ): [Event<R>, Observable<R>] {
//   const observable = new Observable<T>((subscriber) => {
//     sourceUnit.watch((data: any) => subscriber.next(data));
//   });

//   const source = observe(observable);

//   return [fromObservable<R>(source), source];
// }

// function takeUnit<T, R>(unit: Store<T>) {
//   return (source: Observable<R>) => {
//     return new Observable<T>((observer) => {
//       return source.subscribe({
//         next(value) {
//           const store = unit.getState();
//           observer.next(store);
//           // observer.next([value, store]);
//         },
//         error(err) {
//           observer.error(err);
//         },
//         complete() {
//           observer.complete();
//         },
//       });
//     });
//   };
// }

// function emitEvent<T, D>(event: Event<T> | Effect<T, D>) {
//   return (source: Observable<T>) => {
//     return source.pipe(
//       tap((data) => {
//         event(data);
//       })
//     );
//   };
// }
