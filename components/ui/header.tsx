import Image from "next/image";
import Link from "next/link";
import NavItems from "./nav-items";
import UserDropdown from "./user-dropdown";
import { searchStocks } from "@/lib/actions/finnhub.actions";

interface Props {
  user: User;
}

async function Header({ user }: Props) {
  const initialStocks = await searchStocks();
  return (
    <header className="sticky top-0 header">
      <div className="container header-wrapper">
        <Link href={"/"}>
          <Image
            src={"/assets/icons/logo.svg"}
            alt="Signalist logo"
            width={140}
            height={32}
            className="h-8 w-auto cursor-pointer"
          />
        </Link>

        <nav className="hidden sm:block ">
          <NavItems initialStocks={initialStocks} />
        </nav>

        <UserDropdown user={user} initialStocks={initialStocks} />
      </div>
    </header>
  );
}

export default Header;
