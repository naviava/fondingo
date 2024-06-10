import { router } from "../trpc";
import { contactUs } from "../actions/misc";

export const miscRouter = router({
  contactUs,
});
