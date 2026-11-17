import { DESK_HEIGHT, OFFICE_AGENTS, OFFICE_PROPS } from "../model/constants";
import styles from "./office-props.module.css";

const DESKS = Object.entries(OFFICE_AGENTS).filter(([, agent]) => agent.roams);

export function OfficeProps() {
  return (
    <>
      {OFFICE_PROPS.map((prop) => (
        <img
          key={prop.name}
          className={styles.prop}
          src={`/office/props/${prop.name}.webp`}
          alt=""
          draggable={false}
          style={{
            left: `${prop.x}%`,
            top: `${prop.y}%`,
            height: `${prop.height}cqw`,
            zIndex: prop.flat ? 1 : Math.round(prop.y)
          }}
        />
      ))}
      {DESKS.map(([role, agent]) => (
        <img
          key={role}
          className={styles.prop}
          data-desk={role}
          data-occupied="false"
          src="/office/props/desk.webp"
          alt=""
          draggable={false}
          style={{
            left: `${agent.desk.x}%`,
            top: `${agent.desk.y}%`,
            height: `${DESK_HEIGHT}cqw`,
            zIndex: agent.desk.y
          }}
        />
      ))}
    </>
  );
}
