import logoImg from "../assets/blockmeet-logo.png";

export default function Logo({ size = 30, showText = true, textSize = "text-[17px]" }) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logoImg}
        alt="BlockMeet"
        style={{ height: size, width: "auto" }}
        className="object-contain"
      />
      {showText && (
        <span className={`font-display font-semibold text-white ${textSize} tracking-tight`}>
          BlockMeet
        </span>
      )}
    </div>
  );
}