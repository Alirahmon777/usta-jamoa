import type { ModelAlias } from "../model/types";
import styles from "./model-chip.module.css";

interface ModelChipProps {
  model: ModelAlias;
  effort?: string;
}

export function ModelChip({ model, effort }: ModelChipProps) {
  return (
    <span className={styles.chip}>
      <span className={styles.swatch} data-model={model} aria-hidden="true" />
      {model}
      {effort && <span className={styles.effort}>· {effort}</span>}
    </span>
  );
}
