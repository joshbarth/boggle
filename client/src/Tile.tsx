interface TileProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function Tile(props: TileProps) {
  const { label, isActive = false, onClick } = props;
  const isEmpty = label === "";
  const isMulti = label.length > 1;

  return (
    <div className={[
      "tile",
      isEmpty && "tile--empty",
      isActive && "tile--active",
    ].filter(Boolean).join(" ")}
    onClick={onClick}>
      <span className={[
        "tile-label",
        isMulti && "tile-label--multi"
      ].filter(Boolean).join(" ")}>
        {label}
      </span>
    </div>
  );
}

