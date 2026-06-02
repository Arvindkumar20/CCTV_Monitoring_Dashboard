import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";

export const GuardianAvatar = ({ name, photo }) => {
  const initials =
    name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "G";

  const colors = [
    "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700",
    "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700",
    "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700",
    "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700",
    "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700",
    "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700",
    "bg-gradient-to-br from-rose-100 to-rose-200 text-rose-700",
    "bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-700",
  ];

  const colorIndex = name
    ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length
    : 0;

  return (
    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
      {photo ? (
        <AvatarImage src={photo} alt={name} />
      ) : (
        <AvatarFallback className={`${colors[colorIndex]} font-semibold`}>
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
};