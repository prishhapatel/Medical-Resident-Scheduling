import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";

export function SidebarUserCard({ name, email, imageUrl, status = "online" }) {
  const statusColors = {
    online: "bg-green-500",
    "be right back": "bg-yellow-400",
    offline: "bg-gray-400",
  };

  return (
    <div className="flex items-center bg-gray-200 dark:bg-gray-800 rounded-xl shadow p-3 w-full">
      <Avatar className="h-10 w-10">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div className="ml-3 flex-1">
        <div className="font-semibold text-sm dark:text-gray-200">{name}</div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <span className={`w-2 h-2 rounded-full mr-2 ${statusColors[status]}`} />
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
    </div>
  );
}