import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar";

export function SidebarUserCard({ name, email, imageUrl, status = "online" }) {
  const statusColors = {
    online: "bg-green-500",
    "be right back": "bg-yellow-400",
    offline: "bg-gray-400",
  };

  return (
    <div className="flex items-center bg-gray-200 rounded-xl shadow p-3 w-full">
      <Avatar className="h-10 w-10">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div className="ml-3 flex-1">
        <div className="font-semibold text-sm">{name}</div>
        <div className="flex items-center text-xs text-gray-500">
          <span className={`w-2 h-2 rounded-full mr-2 ${statusColors[status]}`} />
          {email}
        </div>
      </div>
      <button className="ml-2 text-gray-400 hover:text-gray-600">
        <svg width="16" height="16" fill="none" viewBox="0 0 20 20">
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}