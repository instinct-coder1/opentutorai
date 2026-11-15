import tutorMark from "@/assets/tutor-mark.png";

export default function TutorAvatar({ size = 32 }: { size?: number }) {
  return (
    <img
      src={tutorMark}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full bg-accent p-0.5"
      style={{ width: size, height: size }}
    />
  );
}
