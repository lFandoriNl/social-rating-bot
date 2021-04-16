type Task = () => Promise<unknown> | void;
type AsyncTask = () => Promise<unknown>;

export function createQueue(initialTasks?: Task[]) {
  let isProcessing = false;

  let tasks: AsyncTask[] = [];

  if (initialTasks) {
    tasks = initialTasks.map((task) => thenable(task));
  }

  function push(task: Task) {
    tasks.push(thenable(task));

    if (isProcessing === false) {
      runTask();
    }
  }

  function runTask() {
    const currentTask = tasks.shift();

    if (!currentTask) {
      isProcessing = false;
      return;
    }

    isProcessing = true;

    currentTask()
      .then(() => runTask())
      .catch(() => runTask());
  }

  runTask();

  return { push };
}

function thenable(task: Task) {
  return () =>
    new Promise((resolve) => {
      resolve(task());
    });
}

// function createTest(idx, ms) {
//   return () =>
//     new Promise((resolve) =>
//       setTimeout(() => {
//         console.log(idx);
//         resolve(1);
//       }, ms)
//     );
// }

// const queue = createQueue([
//   createTest(1, 100),
//   createTest(2, 300),
//   createTest(3, 200),
// ]);

// queue.push(createTest(4, 100));
// queue.push(createTest(5, 300));
// queue.push(createTest(6, 200));

// setTimeout(() => {
//   queue.push(createTest(7, 200));
//   queue.push(createTest(8, 200));
//   queue.push(createTest(9, 200));
// }, 3000);
