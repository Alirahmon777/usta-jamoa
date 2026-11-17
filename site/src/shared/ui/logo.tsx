import styles from "./logo.module.css";

interface LogoProps {
  size?: number;
}

/** Brand mark (code brackets + chisel) with the "usta" wordmark. `size` is the mark height. */
export function Logo({ size = 28 }: LogoProps) {
  return (
    <span className={styles.logo}>
      <svg height={size} viewBox="110 185 502 360" aria-hidden="true">
        <g fill="var(--text)">
          <path d="M250 280C260 273 270 274 277 284C285 295 281 310 270 320L180 383L242 430C253 438 253 447 247 457L232 480L132 406C116 395 116 374 132 362Z" />
          <path d="M495 290L589 361C606 374 606 393 589 407L477 489C466 497 455 494 448 484C440 473 442 460 452 451L541 383L482 339C471 331 470 321 478 311Z" />
        </g>
        <g fill="var(--accent)">
          <path d="M366 325C376 298 400 253 419 219C431 197 454 189 475 198C501 208 511 237 495 260C475 287 444 327 416 355Z" />
          <path d="M341 338C347 329 358 328 367 333L407 356C417 362 420 372 413 383C408 391 399 394 389 388L348 365C338 360 335 347 341 338Z" />
          <path d="M349 371L381 390C366 410 352 436 360 460C361 462 361 464 359 467L318 536C317 538 316 539 313 539H219C217 539 216 538 217 536L287 425C288 423 289 422 292 422C313 418 325 410 332 398Z" />
        </g>
      </svg>
      <span className={styles.word}>usta</span>
    </span>
  );
}
