import type { StartupDemo } from "./types";
import { FALL_2026 } from "./archive/fall-2026";
import { SUMMER_2026 } from "./archive/summer-2026";
import { SPRING_2026 } from "./archive/spring-2026";

export const ARCHIVE_DEMOS: StartupDemo[] = [...FALL_2026, ...SUMMER_2026, ...SPRING_2026];
