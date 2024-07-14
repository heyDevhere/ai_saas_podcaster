'use client'
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { useDebounce } from "@/lib/useDebounce";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const debouncedValue=useDebounce(search,500);
// bhyi search value change hui h toh immedatly data fetch kerne mat lg jaa..
// thodi der ruk ja!

// as long as the user ,keep typing,it will not make  additional request, until the user keep typing !
  useEffect(() => {
    if(debouncedValue){
        router.push(`/discover?search=${debouncedValue}`)
    }
    else if(!debouncedValue && pathname=== '/discover'){
        router.push('/discover')
    }
  }, [router,pathname,debouncedValue])
  

  return (
    <div className="relative mt-8 block">
      <Input
        className="input-class py-6 pl-12 focus-visible:ring-offset-orange-1"
        placeholder="Search for podcasts"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onLoad={() => setSearch("")}
      />
    </div>
  );
};

export default SearchBar;
