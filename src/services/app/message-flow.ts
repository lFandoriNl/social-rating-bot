import { forward } from "effector";

import { messageStickerSocial } from "./message-events";
import { removeMessageAfterTimeoutFx } from "./remove-message";

forward({
  from: messageStickerSocial,
  to: removeMessageAfterTimeoutFx,
});
