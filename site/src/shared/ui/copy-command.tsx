import { useState } from "react";

import styles from "./copy-command.module.css";

interface CopyCommandProps {
  command: string;
}

export function CopyCommand({ command }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={styles.root}>
      <span className={styles.prompt} aria-hidden="true">
        ›
      </span>
      <code className={styles.code}>{command}</code>
      <button type="button" className={styles.button} onClick={handleCopy}>
        {copied ? "Nusxalandi" : "Nusxa"}
      </button>
    </div>
  );
}
