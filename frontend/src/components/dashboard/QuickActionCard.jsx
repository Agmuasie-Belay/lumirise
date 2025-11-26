import { Link } from "react-router-dom";

export default function QuickActionCard({ link, Icon, title, style }) {
  const role = localStorage.getItem("role");
  return (
    <Link to={link}>
      <div className={`p-4 border rounded-md cursor-pointer ${style}`}>
        <span className="flex justify-around">
          <Icon className="w-5" />
        </span>
        <span className="font-semibold">{title}</span>
      </div>
    </Link>
  );
}
