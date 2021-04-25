import { removeSchedulerTaskByIdFx } from "./index";

import { scheduler } from "../../common/scheduler";

removeSchedulerTaskByIdFx.use((id) => {
  scheduler.remove(id);
});
